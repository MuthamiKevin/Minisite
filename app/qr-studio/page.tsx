"use client";
import { useEffect, useState } from "react";
import { PHOTO_ALBUM_URL } from "../../lib/photo-album";
import { albumQr } from "../../lib/album-qr";
import "./studio.css";

export default function Studio() {
  const [link, setLink] = useState(PHOTO_ALBUM_URL);
  const [qr, setQr] = useState("");
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState<[string, string]>(["", ""]);
  useEffect(() => {
    let active = true;
    setQr(""); setError("");
    try {
      const url = new URL(link);
      if (url.protocol !== "https:") throw new Error();
      albumQr(url.href).then(value => { if (active) setQr(value); }).catch(() => { if(active) setError("Unable to generate this QR code. Please try again."); });
    } catch { setError("Enter a complete album link beginning with https://"); }
    return () => { active = false; };
  }, [link]);
  function upload(file: File | undefined, index: number) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { setError("Please choose an image smaller than 10 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => setPhotos(previous => { const next: [string,string] = [...previous]; next[index] = String(reader.result); return next; });
    reader.readAsDataURL(file);
  }
  function downloadCards() {
    const sheet = document.querySelector(".studio-sheet");
    if (!sheet || !qr) return;
    // Embed the card markup and local styles; QR codes and portraits are data URLs.
    const styles = Array.from(document.styleSheets).flatMap(style => {
      try { return Array.from(style.cssRules).filter(rule => rule.type !== CSSRule.IMPORT_RULE).map(rule => rule.cssText); }
      catch { return []; } // External font sheets are optional; Georgia is the offline fallback.
    }).join("\n");
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Allan & Shiphira — Photo cards</title><style>${styles}</style><style>body{margin:0;padding:24px;background:#f4f0e8}.studio-sheet{max-width:760px;margin:0 auto}.card-names{font-family:Georgia,serif}@media print{body{padding:0}.studio-sheet{max-width:none}}</style></head><body>${sheet.outerHTML}</body></html>`;
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "allan-shiphira-photo-cards.html";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  return <main className="studio">
    <header className="studio-header"><a href="/">A<span>&</span>S <small>THE WEDDING</small></a><span>THE HOST’S DESK · 17 OCTOBER 2026</span></header>
    <div className="studio-workspace">
      <aside className="studio-controls"><p className="studio-kicker">A LITTLE KEEPSAKE. EVERY MEMORY.</p><h1>Photo card<br/><i>studio.</i></h1><p>Create something beautiful for the table. A scan, a memory, a little more of our story.</p>
      <label htmlFor="album-link">01 / SHARED ALBUM LINK</label><input id="album-link" type="url" value={link} onChange={event => setLink(event.target.value)} />
      <p className="studio-help">Cards update automatically. This changes your cards only; the wedding page uses your supplied album link.</p>
      <fieldset><legend>02 / YOUR CHILDHOOD PHOTOS · OPTIONAL</legend><div className="studio-upload"><label>Allan<input type="file" accept="image/*" onChange={event => upload(event.target.files?.[0],0)} /></label><label>Shiphira<input type="file" accept="image/*" onChange={event => upload(event.target.files?.[0],1)} /></label></div></fieldset>
      <p className="studio-help">Choose the original portraits to recreate the reference. Photos are included in your download and are not uploaded to a server.</p>
      {error && <p role="alert" className="studio-error">{error}</p>}
      <button className="studio-print" disabled={!qr} onClick={downloadCards}>Download cards ↓</button>
      <div className="studio-actions">{qr && <><a href={qr} download="allan-shiphira-album-qr.png">Download QR ↓</a><a href={link} target="_blank" rel="noreferrer">Open album ↗</a></>}</div>
      <p className="studio-help">Downloads all four cards as an HTML page with your photos and QR codes included. Open the saved file in any browser, even offline. Enable contributions in your album so guests can add photos.</p><p className="studio-help">Unlisted card-making tool. No sign-in is configured.</p>
      </aside>
      <section className="studio-preview" aria-label="Printable photo cards"><div className="studio-preview-label"><span>YOUR TABLE CARDS</span><span>A4 / FOUR PER SHEET</span></div><div className="studio-sheet">
      {[0,1,2,3].map(n => <div className="studio-cut" key={n}><article className="photo-card"><h2>KARIBU SANA</h2>
      {photos.every(Boolean) ? <div className="card-portraits"><img src={photos[0]} alt="Allan as a child"/><span>&</span><img src={photos[1]} alt="Shiphira as a child"/></div> : <div className="card-monogram">A<span>&</span>S</div>}
      <p>Before we knew one another,<br/>God was already writing<br/>our story.</p><p>Thank you for celebrating<br/>this beautiful new chapter with us.</p>
      {qr ? <img className="card-qr" src={qr} alt="Scan to upload photos to Allan and Shiphira’s album"/> : <div className="card-qr-placeholder">{error ? "Add a valid album link" : "Creating your QR…"}</div>}
      <p className="card-scan">Scan to share your photos and videos.</p><div className="card-heart">— &nbsp;♥&nbsp; —</div><p className="card-gift">Your presence, love and prayers<br/>are the greatest gift.<br/>Should you wish to bless us further:</p><p className="card-payment">M-Pesa Paybill: 880100<br/>Account: 5766050018</p><div className="card-names">Allan & Shiphira</div><p className="card-verse">1 John 4:19</p></article></div>)}
      </div></section>
    </div>
  </main>;
}
