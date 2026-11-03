// Invoice helpers used by admin.html (and invoice.html): money() and makePdf(inv).
// Needs the jsPDF script tag that admin.html already loads (window.jspdf).
export const money = n => "Rs. " + Number(n || 0).toLocaleString("en-US");

export async function makePdf(inv) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let site = {};
  try { site = (await import("./config.js")).SITE || {}; } catch (e) {}
  const navy = [26, 35, 49], red = [237, 29, 36], grey = [95, 107, 122];
  const c = inv.customer || {};

  // header band
  doc.setFillColor(...navy); doc.rect(0, 0, 210, 34, "F");
  doc.setFillColor(...red); doc.rect(0, 34, 210, 2, "F");
  doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(21);
  doc.text(site.name || "CCTV PITS", 14, 17);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(195, 202, 212);
  doc.text(site.tagline || "Control from Anywhere", 14, 24);
  doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.setTextColor(255);
  doc.text("INVOICE", 196, 19, { align: "right" });

  // billed to + invoice details
  doc.setTextColor(...grey); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
  doc.text("BILLED TO", 14, 50); doc.text("INVOICE DETAILS", 130, 50);
  doc.setTextColor(33); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  let y = 57;
  [c.name, c.phone, c.email, c.address, c.city].filter(Boolean).forEach(t => {
    doc.splitTextToSize(String(t), 100).forEach(l => { doc.text(l, 14, y); y += 5.5; });
  });
  doc.text("No: " + (inv.number || ""), 130, 57);
  doc.text("Date: " + (inv.date || ""), 130, 63);

  // items table
  y = Math.max(y, 82) + 6;
  const head = () => {
    doc.setFillColor(243, 245, 248); doc.rect(14, y - 6, 182, 9, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...grey);
    doc.text("#", 17, y); doc.text("ITEM", 28, y); doc.text("QTY", 190, y, { align: "right" });
    y += 9; doc.setTextColor(33); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  };
  head();
  (inv.items || []).forEach((it, i) => {
    const lines = doc.splitTextToSize(String(it.name || ""), 140);
    if (y + lines.length * 5.5 > 265) { doc.addPage(); y = 20; head(); }
    doc.text(String(i + 1), 17, y); doc.text(lines, 28, y); doc.text(String(it.quantity ?? ""), 190, y, { align: "right" });
    y += lines.length * 5.5 + 2;
    doc.setDrawColor(221, 226, 232); doc.line(14, y - 4, 196, y - 4);
  });

  // totals
  if (y > 240) { doc.addPage(); y = 20; }
  y += 6;
  doc.setFont("helvetica", "normal"); doc.text("Installation charges", 120, y); doc.text(money(inv.installationPrice), 196, y, { align: "right" });
  y += 9; doc.setFillColor(...navy); doc.rect(116, y - 7, 80, 11, "F");
  doc.setFont("helvetica", "bold"); doc.setTextColor(255); doc.setFontSize(12);
  doc.text("TOTAL", 120, y); doc.text(money(inv.installationPrice), 192, y, { align: "right" });

  // notes + footer
  doc.setTextColor(33); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
  if (inv.notes) { y += 16; doc.setFont("helvetica", "bold"); doc.text("Notes", 14, y); doc.setFont("helvetica", "normal"); y += 6; doc.text(doc.splitTextToSize(inv.notes, 180), 14, y); }
  doc.setFontSize(9); doc.setTextColor(...grey);
  doc.text([site.phone, site.email, site.domain].filter(Boolean).join("   |   "), 105, 282, { align: "center" });
  doc.text("Thank you for choosing " + (site.name || "CCTV PITS") + ".", 105, 287, { align: "center" });
  return doc;
}
