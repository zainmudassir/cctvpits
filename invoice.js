// Invoice PDF for CCTV PITS, drawn in the black-and-red design (A4, slanted bars, logo top left).
// Used by checkout.html, invoice.html and admin.html. Needs the jsPDF script tag (window.jspdf).
//
// makePdf(inv) takes:
//   { number, date, notes,
//     customer: { name, phone, email, address, city },
//     site: { type, areaValue, areaUnit },                      (optional, shown under the phone number)
//     items: [{ name, desc, quantity, unitPrice }],              (unitPrice is optional)
//     installationPrice }                                        (total, used when items have no prices)
export const money = n => "Rs. " + Number(n || 0).toLocaleString("en-US");
const signed = n => n < 0 ? "-" + money(-n) : money(n);

const SITE = Object.assign({ name: "CCTV PITS", phone: "+92 305 3871991", email: "contact@cctvpits.store", domain: "www.cctvpits.store" }, (typeof window !== "undefined" && window.SITE) || {});
const DARK = [42, 42, 40], RED = [214, 0, 0], BAND = [216, 14, 14], SHADE = [243, 243, 244], SOFT = [95, 95, 95];
const W = 595.28, H = 841.89, LEFT = 49.1, RIGHT = 546.3;

// the logo is a PNG already placed on the dark header colour, so it needs no transparency
let logoCache;
async function logo() {
  if (logoCache !== undefined) return logoCache;
  try {
    const blob = await (await fetch(new URL("assets/images/invoice-logo.png", import.meta.url))).blob();
    logoCache = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(blob); });
  } catch (e) { logoCache = ""; }
  return logoCache;
}

const poly = (doc, pts, color) => {
  doc.setFillColor(...color);
  doc.lines(pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]), pts[0][0], pts[0][1], [1, 1], "F", true);
};
// shrinks the font until the text fits in maxW (used for long invoice numbers and amounts)
const fit = (doc, text, maxW, size, min = 6.5) => { let s = size; doc.setFontSize(s); while (s > min && doc.getTextWidth(text) > maxW) { s -= 0.5; doc.setFontSize(s); } return s; };

function buildRows(inv) {
  const items = inv.items || [], priced = items.some(i => Number(i.unitPrice) > 0);
  const rows = items.map(i => {
    const qty = Number(i.quantity ?? i.qty ?? 1) || 1, unit = priced ? Number(i.unitPrice) || 0 : null;
    return { name: String(i.name || ""), desc: String(i.desc || ""), qty, unit, total: unit === null ? null : unit * qty };
  });
  const charge = Number(inv.installationPrice) || 0;
  if (!priced) {                         // older invoices: items without prices plus one installation charge
    if (charge > 0) rows.push({ name: "Installation charges", desc: "", qty: 1, unit: charge, total: charge });
    return { rows, total: charge };
  }
  const sum = rows.reduce((s, r) => s + r.total, 0), diff = Math.round(charge - sum);
  if (charge > 0 && Math.abs(diff) >= 1) {   // the admin changed the total: show the difference as its own line
    rows.push({ name: diff > 0 ? "Installation and other charges" : "Discount", desc: "", qty: 1, unit: diff, total: diff });
    return { rows, total: charge };
  }
  return { rows, total: sum };
}

function tableHead(doc, t) {
  const h = 26.9;
  poly(doc, [[LEFT, t], [322.0, t], [298.3, t + h], [LEFT, t + h]], DARK);
  poly(doc, [[329.2, t], [389.8, t], [366.0, t + h], [305.4, t + h]], RED);
  poly(doc, [[396.4, t], [468.8, t], [445.0, t + h], [372.6, t + h]], RED);
  poly(doc, [[476.5, t], [RIGHT, t], [RIGHT, t + h], [452.7, t + h]], RED);
  doc.setTextColor(255); doc.setFont("helvetica", "normal"); doc.setFontSize(10.7);
  const by = t + 16;
  doc.text("No", 60, by); doc.text("Date", 99, by); doc.text("Service Description", 179.2, by);
  doc.text("Qty", 337.8, by); doc.text("Unit Price", 397.1, by); doc.text("Total Price", 480.4, by);
  return t + h;
}

function footer(doc) {
  doc.setFillColor(...DARK); doc.rect(297.7, 806.2, W - 297.7, H - 806.2, "F");
  poly(doc, [[0, 788], [292.3, 788], [340, H], [0, H]], RED);
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); fit(doc, SITE.email, 250, 19.6, 12);
  doc.text(SITE.email, 35.6, 819.9);
  doc.setFont("helvetica", "normal"); doc.setFontSize(10.7); doc.text(SITE.domain, 397.2, 826.1);
}

export async function makePdf(inv) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const c = inv.customer || {}, site = inv.site || null, { rows, total } = buildRows(inv);

  // ----- header: dark slanted block with the logo, red band with the invoice number -----
  doc.setFillColor(...BAND); doc.rect(253.5, 59.6, W - 253.5, 60, "F");
  poly(doc, [[0, 0], [235.6, 0], [341.5, 119.5], [0, 119.5]], DARK);
  const img = await logo();
  if (img) doc.addImage(img, "PNG", 17.8, 23.2, 224.3, 75);
  else { doc.setFillColor(237, 29, 36); doc.circle(48, 52, 17, "F"); doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(34); doc.text(SITE.name, 74, 64); }
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(27); doc.text("INVOICE", 337.8, 97.4);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.text("INVOICE NO.", 546.5, 82.5, { align: "right" });
  doc.setFont("helvetica", "bold"); fit(doc, String(inv.number || ""), 94, 13.5, 8); doc.text(String(inv.number || ""), 546.5, 101.2, { align: "right" });

  // ----- customer block -----
  doc.setTextColor(0); doc.setFont("helvetica", "bold"); doc.setFontSize(10.7);
  doc.text("CUSTOMER", 338, 149); doc.text(":", 413.5, 149);
  const nm = String(c.name || "").toUpperCase(); fit(doc, nm, 134, 10.7, 8);
  const nameLines = doc.splitTextToSize(nm, 134); let by = 149;
  nameLines.forEach((l, i) => { doc.text(l, 426, by + i * 13.5); }); by += (nameLines.length - 1) * 13.5;
  doc.setFont("helvetica", "normal"); doc.setFontSize(10.7);
  const addr = [c.address, c.city].filter(Boolean).join(", ");
  if (addr) { by += 19; const al = doc.splitTextToSize(addr, 232).slice(0, 3); al.forEach((l, i) => doc.text(l, 338, by + i * 13.5)); by += (al.length - 1) * 13.5; }
  if (c.phone) { by += 19; doc.text(String(c.phone), 338, by); }
  if (c.email) { by += 15; doc.setFontSize(9.5); doc.text(String(c.email), 338, by); doc.setFontSize(10.7); }
  if (site && (site.type || site.areaValue)) {
    by += 17; doc.setFont("helvetica", "bold"); doc.text("Site:", 338, by); doc.setFont("helvetica", "normal");
    doc.text([site.type, site.areaValue ? site.areaValue + " " + site.areaUnit : ""].filter(Boolean).join(", "), 338 + doc.getTextWidth("Site:  "), by);
  }
  doc.setFillColor(...DARK); doc.rect(304.5, 139.8, 0.8, Math.max(51.3, by - 140), "F");

  // ----- service details table -----
  const tableTop = Math.max(228.9, by + 14);
  doc.setTextColor(...DARK); doc.setFont("helvetica", "bold"); doc.setFontSize(14); doc.text("SERVICE DETAILS", LEFT, tableTop - 10.6);
  let y = tableHead(doc, tableTop), pageNo = 1;
  rows.forEach((r, i) => {
    doc.setFont("helvetica", "normal"); doc.setFontSize(10.7);
    const nl = doc.splitTextToSize(r.name, 148), dl = r.desc ? (doc.setFontSize(8.3), doc.splitTextToSize(r.desc, 148).slice(0, 2)) : [];
    const rh = Math.max(31, 15 + nl.length * 12.6 + dl.length * 10.4);
    if (y + rh > 680) {                                         // continue on a new page
      footer(doc); doc.addPage(); pageNo++; y = tableHead(doc, 40);
    }
    if (i % 2) { doc.setFillColor(...SHADE); doc.rect(LEFT, y, RIGHT - LEFT, rh, "F"); }
    const mid = y + rh / 2 + 2.6, block = nl.length * 12.6 + dl.length * 10.4;
    let ty = y + (rh - block) / 2 + 9.4;
    doc.setTextColor(...DARK); doc.setFont("helvetica", "normal"); doc.setFontSize(10.7);
    doc.text(String(i + 1), 67, mid, { align: "center" }); doc.text(inv.date || "", 99, mid);
    nl.forEach((l, k) => doc.text(l, 179.2, ty + k * 12.6)); ty += nl.length * 12.6 - 2.4;
    if (dl.length) { doc.setFontSize(8.3); doc.setTextColor(...SOFT); dl.forEach((l, k) => doc.text(l, 179.2, ty + k * 10.4)); }
    doc.setTextColor(...DARK); doc.setFontSize(10.7);
    doc.text(String(r.qty), 344.7, mid, { align: "center" });
    const u = r.unit === null ? "-" : signed(r.unit), t = r.total === null ? "-" : signed(r.total);
    fit(doc, u, 80, 10.7, 7.5); doc.text(u, 386.7, mid); fit(doc, t, 64, 10.7, 7.5); doc.text(t, 477.9, mid);
    y += rh;
  });

  // ----- total due and payment notes -----
  let ty = Math.max(698.9, y + 18);
  if (ty + 80 > 786) { footer(doc); doc.addPage(); pageNo++; ty = 60; }
  poly(doc, [[357.2, ty], [457, ty], [432.5, ty + 27.7], [357.2, ty + 27.7]], DARK);
  poly(doc, [[468.6, ty + 0.9], [546.5, ty + 0.9], [546.5, ty + 28.6], [444, ty + 28.6]], RED);
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(10.7); doc.text("Total Due", 367.6, ty + 16.8);
  const tt = total > 0 ? signed(total) : "To be confirmed"; fit(doc, tt, 64, 10.7, 7.5); doc.text(tt, 478.7, ty + 16.8);
  doc.setTextColor(34); doc.setFont("helvetica", "normal"); doc.setFontSize(8); let py = ty + 34.2;
  doc.text("Payment Instructions", LEFT, py); doc.setFont("helvetica", "italic");
  const note = String(inv.notes || "").trim();
  [inv.date ? "Invoice date: " + inv.date : "",
   "Final equipment and price are confirmed with you before any work starts.",
   note ? doc.splitTextToSize("Note: " + note, 480)[0] : "Questions? WhatsApp or call " + SITE.phone + "."].filter(Boolean).forEach(l => { py += 14.3; doc.text(l, LEFT, py); });
  footer(doc);
  if (doc.setProperties) doc.setProperties({ title: "Invoice " + (inv.number || ""), author: SITE.name });
  return doc;
}
