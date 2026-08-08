"use client";

import { FormEvent, useEffect, useState } from "react";

const programme = [
  ["10:30 AM", "Guest arrival"], ["10:45 AM", "Wedding processional"],
  ["11:00 AM", "Opening prayer & worship"], ["11:15 AM", "Scripture reading & marriage charge"],
  ["11:30 AM", "Exchange of vows"], ["12:00 PM", "Signing of the register"],
  ["12:15 PM", "Refreshments & photography"], ["1:15 PM", "Reception & lunch"],
  ["2:30 PM", "Speeches & toasts"], ["3:30 PM", "Cake cutting"],
  ["3:45 PM", "Celebration"], ["6:00 PM", "Thank you & departure"],
];

const weddingPalette = ["#f7f4ec","#f1e4cf","#dbc7a7","#b7c7ac","#7e9271","#1f3b26","#38162e","#7a1230","#9c7594","#172863"];

const dressCode: [string, string][] = [
  ["#ede1d3", "Champagne"], ["#e3cfb4", "Sand"], ["#cbb49c", "Taupe"], ["#c7bfb4", "Stone"], ["#c08d53", "Camel"], ["#96745f", "Mocha"],
  ["#a7b08f", "Sage"], ["#7c7c4a", "Olive"], ["#b98b72", "Mocha Light"], ["#8b6a4f", "Soft Brown"], ["#e7dac7", "Cream"], ["#f1e9da", "Ivory"],
];

const milestones: [string | null, string][] = [
  ["2016", "Our paths crossed."],
  [null, "Friendship grew into love."],
  [null, "God entrusted us with our greatest blessings, Nyambura and Nia."],
  [null, "We chose forever."],
  ["17 Oct 2026", "Before God, family and friends… we become one."],
];

function Leaf({ className }: { className?: string }) {
  return <svg className={`leaf ${className ?? ""}`} viewBox="0 0 120 60" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
    <path d="M4 30 C 30 10, 90 10, 116 30" />
    <ellipse cx="20" cy="24" rx="9" ry="4" transform="rotate(-25 20 24)" />
    <ellipse cx="40" cy="16" rx="9" ry="4" transform="rotate(-15 40 16)" />
    <ellipse cx="60" cy="13" rx="9" ry="4" />
    <ellipse cx="80" cy="16" rx="9" ry="4" transform="rotate(15 80 16)" />
    <ellipse cx="100" cy="24" rx="9" ry="4" transform="rotate(25 100 24)" />
  </svg>;
}

function Countdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const update = () => {
      const distance = Math.max(0, new Date("2026-10-17T11:00:00+03:00").getTime() - Date.now());
      setTime({
        days: Math.floor(distance / 86400000),
        hours: Math.floor((distance / 3600000) % 24),
        minutes: Math.floor((distance / 60000) % 60),
        seconds: Math.floor((distance / 1000) % 60),
      });
    };
    update(); const timer = setInterval(update, 1000); return () => clearInterval(timer);
  }, []);
  return <div className="countdown" aria-label="Countdown to the wedding">
    {Object.entries(time).map(([label, value]) => <div key={label}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}
  </div>;
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [status, setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const [gateOpen, setGateOpen] = useState(false);
  const [gateClosing, setGateClosing] = useState(false);
  const [showTop, setShowTop] = useState(false);

  function openGate() {
    setGateClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => setGateOpen(true), 650);
  }

  useEffect(() => {
    document.body.style.overflow = gateOpen ? "" : "hidden";
  }, [gateOpen]);

  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  async function submitRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/rsvp", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(data) });
    setStatus(response.ok ? "done" : "error");
  }

  return <main>
    {!gateOpen && <div className={`gate ${gateClosing ? "closing" : ""}`} role="presentation">
      <p className="gate-monogram">A &amp; S</p>
      <button className="gate-seal" onClick={openGate} aria-label="Open our wedding invitation"><span>A&amp;S</span></button>
      <span className="gate-tap">Tap the seal to open</span>
      <p className="gate-line">Together with joyful hearts, we invite you in.</p>
    </div>}

    <header className="nav-wrap">
      <nav className="nav" aria-label="Main navigation">
        <a className="nav-brand" href="#home" aria-label="Allan and Shiphira home">A <i>&amp;</i> S</a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen}>Menu</button>
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <a href="#journey">Our journey</a><a href="#details">The wedding</a><a href="#style">Style guide</a><a href="#programme">Programme</a><a href="#gifts">Gifts</a>
          <button onClick={() => setRsvpOpen(true)}>RSVP</button>
        </div>
      </nav>
    </header>

    <section className="hero" id="home">
      <Leaf className="hero-leaf hero-leaf-left" />
      <Leaf className="hero-leaf hero-leaf-right" />
      <div className="hero-content">
        <p className="eyebrow">Together with joyful hearts</p>
        <p className="eyebrow hero-invite">we invite you to celebrate our wedding</p>
        <h1><span>Allan</span><i>&amp;</i><span>Shiphira</span></h1>
        <p className="hero-line">Our Journey. His Grace. Our Forever.</p>
        <div className="hero-meta">
          <strong>17 · 10 · 2026</strong>
          <span>Naipei Gardens, Limuru</span>
          <span className="hero-time">Guest arrival 10:30 AM &nbsp;|&nbsp; Ceremony begins 11:00 AM</span>
        </div>
        <blockquote className="hero-verse">“We love because He first loved us.” <cite>1 John 4:19</cite></blockquote>
        <button className="primary" onClick={() => setRsvpOpen(true)}>Kindly RSVP</button>
      </div>
      <a className="scroll" href="#journey" aria-label="Scroll to our journey">↓</a>
    </section>

    <section className="countdown-section">
      <p>Until we say “I do”</p>
      <Countdown />
      <p className="alt-verse">“He has made everything beautiful in its time.” <cite>— Ecclesiastes 3:11</cite></p>
    </section>

    <section className="journey section" id="journey">
      <div className="journey-copy reveal">
        <p className="eyebrow">Our journey</p>
        <h2>A forever kind<br/>of love.</h2>
        <p>From friendship to forever, God has written our story with grace. We can’t wait to begin this beautiful new chapter with you.</p>
      </div>
      <ol className="milestones reveal" aria-label="Our journey timeline">
        {milestones.map(([year, text]) => <li key={text}>{year && <span className="year">{year}</span>}<p>{text}</p></li>)}
      </ol>
    </section>

    <section className="details section" id="details">
      <p className="eyebrow centered">Wedding details</p><h2>Saturday, 17 October 2026</h2>
      <div className="detail-grid reveal">
        <article><span>01</span><h3>Ceremony</h3><p>Guest arrival from 10:30 AM<br/>Ceremony begins at 11:00 AM<br/>Celebration continues to 6:00 PM</p></article>
        <article><span>02</span><h3>Venue</h3><p>Naipei Gardens<br/>Limuru, Kenya</p><a className="secondary" href="https://www.google.com/maps/search/?api=1&query=Naipei+Gardens+Limuru" target="_blank" rel="noreferrer">View map ↗</a></article>
      </div>
    </section>

    <section className="style-guide section" id="style">
      <p className="eyebrow centered">Style guide</p><h2>Dressed for the garden</h2>
      <p className="style-intro">Garden Estate Formal — we invite you to dress in elegant garden attire. Think soft neutrals, earthy tones, sage, champagne, navy and muted jewel tones.</p>

      <div className="palette-block reveal">
        <h3>Our wedding palette</h3>
        <div className="palette" aria-label="Wedding colour palette">
          {weddingPalette.map((color) => <i key={color} style={{ background: color }} />)}
        </div>
      </div>

      <div className="dress-code-block reveal">
        <h3>Guest style inspiration — garden neutrals</h3>
        <div className="dress-palette" aria-label="Guest dress code palette">
          {dressCode.map(([color, name]) => <div className="swatch" key={name}><i style={{ background: color }} /><span>{name}</span></div>)}
        </div>
        <p className="palette-note">Kindly avoid white and ivory</p>
      </div>
    </section>

    <section className="programme section" id="programme">
      <p className="eyebrow centered">Order of celebration</p><h2>Our programme</h2>
      <div className="timeline reveal">{programme.map(([time,item]) => <div className="timeline-item" key={time}><time>{time}</time><span/><p>{item}</p></div>)}</div>
    </section>

    <section className="sharing" id="gifts">
      <article className="reveal"><p className="eyebrow">Photo sharing</p><h2>See our day through your eyes.</h2><p>Every smile, every laugh and every little moment matters to us. We’d love to relive our wedding through your photos and videos.</p><p className="scan-note">Simply scan the QR code below to share your memories with us.</p><div className="placeholder-qr">QR</div><strong>#AllanWedsShiphira</strong></article>
      <article className="gift-card reveal"><p className="eyebrow">With grateful hearts</p><h2>Celebrating with us is the greatest gift.</h2><p>Having you with us on our wedding day is truly the greatest blessing. Should you wish to bless us as we begin this new chapter together, a monetary gift would be deeply appreciated.</p><div className="gift-options"><span>M-PESA</span><span>QR Code</span><span>Bank details</span></div><small>Gift details will be shared with invited guests.</small></article>
    </section>

    <section className="families reveal" id="families">
      <Leaf className="families-leaf" />
      <p className="eyebrow">With gratitude</p>
      <h2>With Love From Our Families</h2>
      <div className="family-list">
        <p><strong>Bride</strong>Mr. &amp; Mrs. Mkamburi</p>
        <p><strong>Groom</strong>The [Surname] Family</p>
      </div>
    </section>

    <footer><div className="footer-monogram">A <i>&amp;</i> S</div><p>Thank you for visiting our wedding website. Your love, prayers and support mean more to us than words can express, and we cannot wait to celebrate this special day with you.</p><strong>With love, Allan &amp; Shiphira</strong><span>To God be the Glory.</span></footer>

    <button id="totop" className={showTop ? "show" : ""} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>

    {rsvpOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setRsvpOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-title"><button className="close" onClick={() => setRsvpOpen(false)} aria-label="Close RSVP form">×</button>
        {status === "done" ? <div className="success"><p className="eyebrow">Thank you</p><h2>Your RSVP is received.</h2><p>We can’t wait to celebrate with you.</p><button className="primary" onClick={() => setRsvpOpen(false)}>Close</button></div> : <>
          <p className="eyebrow">Kindly respond by 20 September 2026</p><h2 id="rsvp-title">Will you join us?</h2>
          <form onSubmit={submitRsvp}><label>Full name<input name="name" required autoFocus /></label><label>Email or phone<input name="contact" required /></label>
            <fieldset><legend>Attendance</legend><label><input type="radio" name="attendance" value="attending" required/> Joyfully accepts</label><label><input type="radio" name="attendance" value="declined"/> Regretfully declines</label></fieldset>
            <label>Number attending<input name="guestCount" type="number" min="1" max="10" defaultValue="1"/></label><label>Leave us a blessing<textarea name="blessing" rows={3}/></label><label>A song for the dance floor<input name="song"/></label>
            <button className="primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send RSVP"}</button>{status === "error" && <p className="form-error">We couldn’t save your response. Please try again.</p>}</form>
        </>}
      </div>
    </div>}
  </main>;
}
