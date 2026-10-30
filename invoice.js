// Shared invoice helpers used by admin.html and invoice.html
// Needs the jsPDF script tag (cdnjs jspdf 2.5.1) loaded on the page before this module runs.
export const money = n => "Rs. " + Number(n || 0).toLocaleString("en-US");

export async function makePdf(inv) {
  const jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
  if (!jsPDF) throw new Error("PDF library did not load. Check your internet connection and reload.");
  const d = new jsPDF({ unit: "mm", format: "a4" });
  const c = inv.customer || {};
  const W = 210, M = 15;
  let y = 20;

  // header
  d.setFont("helvetica", "bold"); d.setFontSize(22); d.setTextColor(17, 17, 17);
  d.text("CCTV PITS", M, y);
  d.setFont("helvetica", "normal"); d.setFontSize(10); d.setTextColor(110);
  d.text("Control from Anywhere", M, y + 6);
  d.setFont("helvetica", "bold"); d.setFontSize(16); d.setTextColor(17, 17, 17);
  d.text("INVOICE", W - M, y, { align: "right" });
  d.setFont("helvetica", "normal"); d.setFontSize(10); d.setTextColor(80);
  d.text(String(inv.number || ""), W - M, y + 6, { align: "right" });
  d.text(String(inv.date || ""), W - M, y + 11, { align: "right" });
  y += 20;
  d.setDrawColor(210); d.line(M, y, W - M, y); y += 9;

  // customer
  d.setFont("helvetica", "bold"); d.setFontSize(10); d.setTextColor(110); d.text("BILL TO", M, y); y += 6;
  d.setFont("helvetica", "bold"); d.setFontSize(12); d.setTextColor(17, 17, 17); d.text(String(c.name || ""), M, y); y += 6;
  d.setFont("helvetica", "normal"); d.setFontSize(10); d.setTextColor(60);
  [c.phone, c.email, [c.address, c.city].filter(Boolean).join(", ")].filter(Boolean).forEach(t => {
    d.splitTextToSize(String(t), W - 2 * M).forEach(line => { d.text(line, M, y); y += 5; });
  });
  y += 6;

  // items table
  d.setFillColor(240, 240, 240); d.rect(M, y - 5, W - 2 * M, 8, "F");
  d.setFont("helvetica", "bold"); d.setTextColor(17, 17, 17);
  d.text("Installed item", M + 2, y); d.text("Qty", W - M - 2, y, { align: "right" }); y += 8;
  d.setFont("helvetica", "normal");
  (inv.items || []).forEach(i => {
    const lines = d.splitTextToSize(String(i.name || ""), W - 2 * M - 30);
    if (y + lines.length * 5 > 270) { d.addPage(); y = 20; }
    lines.forEach((l, k) => { d.text(l, M + 2, y); if (k === 0) d.text(String(i.quantity ?? ""), W - M - 2, y, { align: "right" }); y += 5; });
    d.setDrawColor(230); d.line(M, y - 2, W - M, y - 2); y += 2;
  });

  // total
  y += 4;
  if (y > 255) { d.addPage(); y = 20; }
  d.setFont("helvetica", "bold"); d.setFontSize(12);
  d.text("Installation charges", M + 2, y);
  d.text(money(inv.installationPrice), W - M - 2, y, { align: "right" }); y += 10;

  if (inv.notes) {
    d.setFont("helvetica", "normal"); d.setFontSize(10); d.setTextColor(80);
    d.splitTextToSize(String(inv.notes), W - 2 * M).forEach(l => { d.text(l, M, y); y += 5; });
  }
  d.setFontSize(9); d.setTextColor(140);
  d.text("Thank you for choosing CCTV PITS.", W / 2, 285, { align: "center" });
  return d;
}
