"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

const dressCode: [string, string][] = [
  ["#ede1d3", "Champagne"], ["#e3cfb4", "Sand"], ["#cbb49c", "Taupe"], ["#c7bfb4", "Stone"], ["#c08d53", "Camel"], ["#96745f", "Mocha"],
  ["#a7b08f", "Sage"], ["#7c7c4a", "Olive"], ["#b98b72", "Mocha Light"], ["#8b6a4f", "Soft Brown"], ["#e7dac7", "Cream"], ["#f1e9da", "Ivory"],
];

const GOOGLE_PHOTOS_ALBUM_URL = "https://photos.app.goo.gl/REPLACE_WITH_YOUR_ALBUM_LINK";

const milestones: [string | null, ReactNode][] = [
  ["December 2016", "Our first date."],
  [null, "Friendship grew into love."],
  [null, <>God entrusted us with our greatest blessings, <strong>Nyambura</strong> and <strong>Nia</strong>.</>],
  ["December 2022", "He proposed, and she said yes."],
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

function QuickLink({ icon, label, href, onClick }: { icon: ReactNode; label: string; href?: string; onClick?: () => void }) {
  const Tag = href ? "a" : "button";
  return <Tag className="quick-link" href={href} onClick={onClick}>
    <span className="quick-icon">{icon}</span>{label}
  </Tag>;
}

const icons = {
  pin: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 21s7-7.5 7-12a7 7 0 1 0-14 0c0 4.5 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" /></svg>,
  flower: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="2" /><circle cx="12" cy="6" r="2.4" /><circle cx="12" cy="18" r="2.4" /><circle cx="6" cy="12" r="2.4" /><circle cx="18" cy="12" r="2.4" /></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 9.5h16M8 3v4M16 3v4" /></svg>,
  gift: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="9" width="16" height="10" rx="1" /><path d="M4 9h16M12 9v10" /><path d="M9 9c-1.5 0-2.5-1-2-2.3C7.5 5.3 9 5 10 6c.7.8 1 1.8 1 3M15 9c1.5 0 2.5-1 2-2.3C16.5 5.3 15 5 14 6c-.7.8-1 1.8-1 3" /></svg>,
  envelope: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 7l9 6 9-6" /></svg>,
  upload: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 20s-7-4.3-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.7-9.5 9-9.5 9z" /></svg>,
  dove: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 11c2.5-3 6-3 8 0 1-3 4-6 10-5-3 1-5 3-6 6 3 .3 5 1.3 6 2-4 1.7-8 .7-10-1.3-1 2.7-4 4.3-8 3.3 2-1 3-2 3.5-3.3-1.7 0-2.7-.7-3.5-1.7z" /><circle cx="16" cy="8.5" r=".6" fill="currentColor" stroke="none" /></svg>,
  sprig: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 21V9" /><path d="M12 9c0-4 3-6 6-6-1 4-3 6-6 6z" /><path d="M12 13c0-3-2-5-5-5 1 3 2 5 5 5z" /></svg>,
  cross: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M12 3v18M7.5 8h9" /></svg>,
  bud: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M12 21c0-6 0-9 0-12" /><path d="M12 9c-3-1-4-4-3-7 3 0 5 2 5 5 0 1-.7 1.8-2 2z" /><path d="M12 13c2.3-.6 3-2.4 2.6-4.4-2 .2-3.4 1.6-3.4 3.4 0 .5.3 1 .8 1z" /></svg>,
  pen: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 20l4-1 10-10-3-3L5 16l-1 4z" /><path d="M14 6l3 3" /></svg>,
  cup: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M6 3h9v9a4.5 4.5 0 0 1-9 0V3z" /><path d="M15 6h2a2.5 2.5 0 0 1 0 5h-2" /><path d="M5 21h11" /></svg>,
  plate: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" /></svg>,
  toast: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3z" /><path d="M12 13v7M8 21h8" /></svg>,
  cake: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="12" width="16" height="9" rx="1" /><path d="M4 16.5c1.3 0 1.3-1.2 2.7-1.2s1.3 1.2 2.6 1.2 1.3-1.2 2.7-1.2 1.3 1.2 2.7 1.2 1.3-1.2 2.6-1.2 1.3 1.2 2.7 1.2" /><path d="M9 12V8a1 1 0 1 1 2 0M13 12V8a1 1 0 1 0 2 0" /></svg>,
  music: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></svg>,
  sparkle: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" /></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>,
  speaker: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 9v6h4l5 5V4L8 9H4z" /><path d="M16.5 9c1.5 1.5 1.5 5.5 0 7M19 6.5c3 3 3 8.5 0 11.5" /></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l5 5L19 7" /></svg>,
  alertCircle: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>,
};

const programme: [string, string, keyof typeof icons][] = [
  ["10:30 AM", "Guest arrival", "pin"],
  ["10:45 AM", "Wedding processional", "sprig"],
  ["11:00 AM", "Opening prayer & worship", "dove"],
  ["11:15 AM", "Scripture reading & marriage charge", "cross"],
  ["11:30 AM", "Exchange of vows", "heart"],
  ["12:00 PM", "Signing of the register", "pen"],
  ["12:15 PM", "Refreshments & photography", "cup"],
  ["1:15 PM", "Reception & lunch", "plate"],
  ["2:30 PM", "Speeches & toasts", "toast"],
  ["3:30 PM", "Cake cutting", "cake"],
  ["3:45 PM", "Celebration", "music"],
  ["6:00 PM", "Thank you & departure", "heart"],
];

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

/* A number input's `max` only blocks submission — the browser still happily lets
   someone type 9 into a field capped at 3. Clamp on every keystroke instead.
   An empty string is allowed through so the field can be cleared and retyped. */
function clampCount(raw: string, min: number, max: number): string {
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return "";
  return String(Math.min(max, Math.max(min, Number(digits))));
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [status, setStatus] = useState<"idle"|"sending"|"done"|"error">("idle");
  const [attendance, setAttendance] = useState<"attending"|"declined"|"">("");
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [gateOpen, setGateOpen] = useState(false);
  const [gateClosing, setGateClosing] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [guestStatus, setGuestStatus] = useState<"idle"|"sending"|"done"|"error">("idle");

  function openGate() {
    setGateClosing(true);
    document.body.style.overflow = "";
    setTimeout(() => setGateOpen(true), 950);
  }

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().then(() => setMusicOn(true)).catch(() => {});
    else { audio.pause(); setMusicOn(false); }
  }

  useEffect(() => {
    document.body.style.overflow = gateOpen ? "" : "hidden";
  }, [gateOpen]);

  useEffect(() => {
    const saved = localStorage.getItem("rsvp_response");
    if (!saved) return;
    try {
      const { attendance: savedAttendance, code } = JSON.parse(saved) as { attendance: "attending" | "declined"; code: string | null };
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time rehydration of a prior RSVP from localStorage, client-only
      setAttendance(savedAttendance);
      setStatus("done");
      if (savedAttendance === "attending" && code) {
        QRCode.toDataURL(`${window.location.origin}/invite/${code}`, { width: 320, margin: 2 }).then(setQrDataUrl).catch(() => {});
      }
    } catch {
      localStorage.removeItem("rsvp_response");
    }
  }, []);

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
    try {
      const response = await fetch("/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("RSVP request failed");
      const result = await response.json();
      if (data.attendance === "attending" && result.code) {
        const inviteUrl = `${window.location.origin}/invite/${result.code}`;
        setQrDataUrl(await QRCode.toDataURL(inviteUrl, { width: 320, margin: 2 }));
      } else {
        setQrDataUrl(null);
      }
      localStorage.setItem("rsvp_response", JSON.stringify({ attendance: data.attendance, code: result.code ?? null }));
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  async function submitGuestMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setGuestStatus("sending");
    // Hold onto the form: React clears event.currentTarget once the handler
    // yields at the first await, so reading it afterwards throws and made a
    // successful save look like a failure.
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch("/api/guestbook", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("Guestbook request failed");
      form.reset();
      setGuestStatus("done");
    } catch {
      setGuestStatus("error");
    }
  }

  return <main>
    {/* eslint-disable-next-line jsx-a11y/media-has-caption -- decorative instrumental background track, no speech content */}
    <audio ref={audioRef} src="/music.mp3" loop preload="none" />
    <button id="music-toggle" className={musicOn ? "playing" : ""} onClick={toggleMusic} aria-label={musicOn ? "Pause background music" : "Play background music"} aria-pressed={musicOn}>
      <span className="music-play-icon">{musicOn ? icons.pause : icons.play}</span>
      {icons.speaker}
    </button>

    {!gateOpen && <div className={`gate-backdrop ${gateClosing ? "closing" : ""}`} role="presentation">
      <div className="gate-card">
        <div className="gate-flap gate-flap-top" />
        <div className="gate-flap gate-flap-bottom" />
        <div className="gate-content">
          <div className="gate-top">
            <p className="gate-eyebrow">Wedding Invitation</p>
            <p className="gate-names">Allan <i>&amp;</i> Shiphira</p>
          </div>
          <div className="gate-middle">
            <button className="gate-seal" onClick={openGate} aria-label="Open our wedding invitation"><span>A<i>&amp;</i>S</span></button>
            <button className="gate-tap" onClick={openGate}>{icons.sprig}Tap seal to open</button>
          </div>
          <div className="gate-bottom">
            <p className="gate-line">Together with joyful hearts</p>
            <span className="gate-hashtag">#AllanWedsShiphira</span>
          </div>
        </div>
      </div>
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
        <button className="primary" onClick={() => setRsvpOpen(true)}>{icons.sparkle}Kindly RSVP</button>
        <p className="rsvp-deadline">Kindly respond by 20 September 2026</p>
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
        {milestones.map(([year, text], i) => <li key={year ?? i}>{year && <span className="year">{year}</span>}<p>{text}</p></li>)}
      </ol>
    </section>

    <section className="details section" id="details">
      <p className="eyebrow centered">Wedding details</p><h2>Saturday, 17 October 2026</h2>
      <div className="detail-grid reveal">
        <article className="ceremony-card"><span>01</span><h3>Ceremony</h3><p>Guest arrival from 10:30 AM<br/>Ceremony begins at 11:00 AM<br/>Celebration continues to 6:00 PM</p></article>
        <article className="venue-card"><span>02</span><h3>Venue</h3><p>Naipei Gardens<br/>Limuru, Kenya</p><a className="secondary" href="https://www.google.com/maps/search/?api=1&query=Naipei+Gardens+Limuru" target="_blank" rel="noreferrer">View map ↗</a></article>
      </div>
    </section>

    <section className="style-guide section" id="style">
      <p className="eyebrow centered">Style guide</p><h2>Dressed for the garden</h2>
      <p className="style-intro">Garden Estate Formal — we invite you to dress in elegant garden attire. Think soft neutrals, earthy tones, sage, champagne, navy and muted jewel tones.</p>

      <div className="dress-code-block reveal">
        <h3>Guest style inspiration — garden neutrals</h3>
        <div className="dress-palette" aria-label="Guest dress code palette">
          {dressCode.map(([color, name]) => <div className="swatch" key={name}><i style={{ background: color }} /><span>{name}</span></div>)}
        </div>
        <p className="palette-note">Kindly avoid <strong>white and ivory</strong>.</p>
      </div>
    </section>

    <section className="programme section" id="programme">
      <p className="eyebrow centered">Order of celebration</p><h2>Our programme</h2>
      <div className="timeline">
        {programme.map(([time, item, icon], i) => <div className={`timeline-item reveal ${i % 2 === 0 ? "left" : "right"}`} key={time}>
          <div className="timeline-marker">{icons[icon]}</div>
          <div className="timeline-card"><time>{time}</time><p>{item}</p></div>
        </div>)}
      </div>
    </section>

    <section className="sharing" id="gifts">
      <article className="reveal"><p className="eyebrow">Photo sharing</p><h2>See our day through your eyes.</h2><p>Every smile, every laugh and every little moment matters to us. We’d love to relive our wedding through your photos and videos.</p>
        {GOOGLE_PHOTOS_ALBUM_URL.includes("REPLACE_WITH")
          ? <><span className="upload-button is-pending" aria-disabled="true">{icons.upload}Add your photos</span>
              <p className="scan-note">The album opens closer to the day — we&rsquo;ll share the link and a QR code here.</p></>
          : <><a className="upload-button" href={GOOGLE_PHOTOS_ALBUM_URL} target="_blank" rel="noreferrer">{icons.upload}Add your photos</a>
              <p className="scan-note">Or simply scan the QR code below to open the album.</p><div className="placeholder-qr">QR</div></>}
        <strong>#AllanWedsShiphira</strong></article>
      <article className="gift-card reveal"><p className="eyebrow">With grateful hearts</p><h2>Celebrating with us is the greatest gift.</h2><p>Having you with us on our wedding day is truly the greatest blessing. Should you wish to bless us as we begin this new chapter together, a monetary gift would be deeply appreciated.</p>
        <div className="gift-details">
          <div className="gift-row"><span>Paybill</span><strong>880100</strong></div>
          <div className="gift-row"><span>Account Number</span><strong>5766050018</strong></div>
          <p className="gift-or"><span>or</span></p>
          <div className="gift-row"><span>Shiphira</span><strong>0707 740 754</strong></div>
          <div className="gift-row"><span>Allan</span><strong>0723 127 962</strong></div>
        </div>
      </article>
    </section>

    <section className="families reveal" id="families">
      <Leaf className="families-leaf" />
      <p className="eyebrow">With gratitude</p>
      <h2>With Love From Our Families</h2>
      <div className="family-list">
        <p className="family-heading">The Family of</p>
        <p className="family-name">Mr. Darius Kirangi &amp; Mrs. Priscilla Mwae Kirangi</p>
        <p className="family-and">&amp;</p>
        <p className="family-name">Mr. Edward Kagwi Waweru,<br/>Ms. Carol Gachiengo,<br/>Mrs. Carole Kagwi.</p>
      </div>
    </section>

    <section className="guestbook section reveal" id="guestbook">
      <p className="eyebrow centered">Leave us a note</p><h2>A blessing, a song request?</h2>
      {guestStatus === "done" ? <p className="guestbook-done">Thank you — we’ve received your message with so much love.</p> : <form className="guestbook-form" onSubmit={submitGuestMessage}>
        <label>Your name (optional)<input name="name" /></label>
        <label>Leave us a blessing<textarea name="blessing" rows={3} /></label>
        <label>A song for the dance floor<input name="song" /></label>
        <button className="primary" disabled={guestStatus === "sending"}>{guestStatus === "sending" ? "Sending…" : "Send"}</button>
        {guestStatus === "error" && <p className="form-error">We couldn’t save your message. Please try again.</p>}
      </form>}
    </section>

    <nav className="quick-links" aria-label="Quick links">
      <QuickLink icon={icons.pin} label="The Wedding" href="#details" />
      <QuickLink icon={icons.flower} label="Style Guide" href="#style" />
      <QuickLink icon={icons.calendar} label="Programme" href="#programme" />
      <QuickLink icon={icons.gift} label="Gifts" href="#gifts" />
      <QuickLink icon={icons.envelope} label="RSVP" onClick={() => setRsvpOpen(true)} />
    </nav>

    <div className="deadline-band"><p><strong>RSVP Deadline: 20th September 2026</strong> — kindly respond by this date so we can finalize plans.</p></div>

    <footer>
      <div className="footer-monogram">A <i>&amp;</i> S</div>
      <p className="footer-values">Faith · Hope · Love · Grace · Joy · Peace</p>
      <p>Thank you for being part of our story — your love, prayers and presence mean more to us than words can say as we begin this new chapter together.</p>
      <strong>With love, Allan &amp; Shiphira</strong>
      <span>To God be the Glory.</span>
    </footer>

    <button id="totop" className={showTop ? "show" : ""} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top">↑</button>

    {rsvpOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && setRsvpOpen(false)}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rsvp-title"><button className="close" onClick={() => setRsvpOpen(false)} aria-label="Close RSVP form">×</button>
        {status === "done" ? <div className="success"><p className="eyebrow">Thank you</p><h2>Your RSVP is received.</h2>
          <p>{attendance === "declined" ? "We're sorry you won't be able to join us, but thank you so much for letting us know." : "We can’t wait to celebrate with you."}</p>
          {qrDataUrl && <div className="qr-result">
            <img src={qrDataUrl} alt="Your personal check-in QR code" width={200} height={200} />
            <p className="qr-note">This is your entry QR code — take a screenshot now and show it at the entrance on the day.</p>
          </div>}
          <button className="primary" onClick={() => setRsvpOpen(false)}>Close</button></div> : <>
          <p className="eyebrow">Kindly respond by 20 September 2026</p><h2 id="rsvp-title">Will you join us?</h2>
          <form onSubmit={submitRsvp}>
            <label>Full name<input name="name" required /></label>
            <label>Email<input name="email" type="email" required /></label>
            <label>Phone (optional)<input name="phone" type="tel" /></label>
            <fieldset className="attendance-choice"><legend>Will you attend?</legend>
              <label className={`choice-yes ${attendance === "attending" ? "checked" : ""}`}><input type="radio" name="attendance" value="attending" required checked={attendance === "attending"} onChange={() => setAttendance("attending")}/>{icons.check}Yes, with pleasure!</label>
              <label className={`choice-no ${attendance === "declined" ? "checked" : ""}`}><input type="radio" name="attendance" value="declined" checked={attendance === "declined"} onChange={() => setAttendance("declined")}/>{icons.alertCircle}Regretfully decline</label>
            </fieldset>
            {attendance !== "declined" && <>
              <label>Adults<input name="adults" type="number" inputMode="numeric" min="1" max="4" value={adults} onChange={(e) => setAdults(clampCount(e.target.value, 1, 4))}/></label>
              <label>Children (ages 0–12)<input name="children" type="number" inputMode="numeric" min="0" max="3" value={children} onChange={(e) => setChildren(clampCount(e.target.value, 0, 3))}/></label>
            </>}
            <button className="primary" disabled={status === "sending"}>{status === "sending" ? "Sending…" : <>{icons.sparkle}Confirm Attendance</>}</button>{status === "error" && <p className="form-error">We couldn’t save your response. Please try again.</p>}</form>
        </>}
      </div>
    </div>}
  </main>;
}
