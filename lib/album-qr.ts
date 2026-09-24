import QRCode from "qrcode";

export async function albumQr(url: string) {
  const canvas = document.createElement("canvas");
  await QRCode.toCanvas(canvas, url, { width: 1000, margin: 4, errorCorrectionLevel: "H", color: { dark: "#15374b", light: "#ffffff" } });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("QR image could not be created.");
  const c = canvas.width / 2;
  const r = canvas.width * .085;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(c-r-9,c-r-9,2*r+18,2*r+18);
  const gold = ctx.createLinearGradient(c-r,c-r,c+r,c+r);
  gold.addColorStop(0,"#ead5a2"); gold.addColorStop(1,"#b79560");
  ctx.beginPath(); ctx.arc(c,c,r,0,Math.PI*2); ctx.fillStyle=gold; ctx.fill();
  ctx.strokeStyle="#f8ebc9"; ctx.lineWidth=5; ctx.stroke();
  ctx.fillStyle="#4a2438"; ctx.font="italic 57px Georgia"; ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillText("A&S",c,c+3);
  return canvas.toDataURL("image/png");
}
