// Printable receipt with the CCTV PITS logo. Usage: printReceipt({ id, date, status, customer:{name,phone,address,city,note}, items:[{name,qty,price,includes}], total, payment:{bankName,accountTitle,accountNumber}, trxId })
const e = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rs = n => "Rs. " + Number(n || 0).toLocaleString("en-US");
const STATUS = { pending: "Payment pending verification", confirmed: "Payment confirmed", delivered: "Delivered", rejected: "Rejected" };
export function receiptHtml(o) {
  const c = o.customer || {}, p = o.payment || {}, d = o.date instanceof Date ? o.date : (o.date && o.date.toDate ? o.date.toDate() : new Date());
  const no = String(o.id || "").slice(0, 6).toUpperCase();
  const rows = (o.items || []).map(i => '<tr><td>' + e(i.name) + (i.includes ? '<div class="inc">Includes: ' + e(i.includes) + '</div>' : "") + '</td><td class="r">' + e(i.qty) + '</td><td class="r">' + rs(i.price) + '</td><td class="r">' + rs(i.price * i.qty) + '</td></tr>').join("");
  return '<!doctype html><html><head><meta charset="utf-8"><title>Receipt #' + no + ' | CCTV PITS</title><style>' +
    '*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0;padding:28px;max-width:760px;margin:0 auto;font-size:14px;line-height:1.45}' +
    '.top{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:3px solid #d4161c;padding-bottom:14px}.top img{height:84px;width:auto}' +
    '.top .t{text-align:right}.top h1{margin:0;font-size:24px;letter-spacing:1px}.top p{margin:2px 0 0;color:#444}' +
    '.st{display:inline-block;margin-top:6px;border:1.5px solid #111;border-radius:99px;padding:3px 12px;font-weight:700;font-size:12px}' +
    '.g{display:flex;gap:24px;margin:18px 0}.g>div{flex:1}.g h3{margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.8px;color:#555}' +
    'table{width:100%;border-collapse:collapse;margin-top:6px}th{background:#f1f5f9;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.5px}th,td{padding:9px 8px;border-bottom:1px solid #ddd;vertical-align:top}' +
    '.r{text-align:right;white-space:nowrap}.inc{font-size:12px;color:#555;margin-top:2px}.tot td{border:0;font-size:17px;font-weight:800;padding-top:12px}' +
    '.ft{margin-top:26px;border-top:1px solid #ccc;padding-top:12px;color:#444;font-size:12px;text-align:center}' +
    '@media print{body{padding:0}@page{margin:14mm}}</style></head><body>' +
    '<div class="top"><img src="' + location.origin + '/assets/images/logo.png" alt="CCTV PITS"><div class="t"><h1>RECEIPT</h1><p>Order #' + e(no) + '</p><p>' + e(d.toLocaleString()) + '</p><span class="st">' + e(STATUS[o.status] || STATUS.pending) + '</span></div></div>' +
    '<div class="g"><div><h3>Customer</h3><b>' + e(c.name) + '</b><br>' + e(c.phone) + '<br>' + e(c.address) + (c.city ? ", " + e(c.city) : "") + (c.note ? '<br><i>' + e(c.note) + '</i>' : "") + '</div>' +
    '<div><h3>Payment</h3>' + e(p.bankName) + '<br>' + e(p.accountTitle) + '<br>' + e(p.accountNumber) + '<br>Trx ID: <b>' + e(o.trxId) + '</b></div></div>' +
    '<table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Amount</th></tr></thead><tbody>' + rows + '<tr class="tot"><td colspan="3" class="r">Total</td><td class="r">' + rs(o.total) + '</td></tr></tbody></table>' +
    '<div class="ft">Orders are confirmed after payment is verified. Thank you for shopping with CCTV PITS.<br>https://cctvpits.store &middot; WhatsApp +92 305 3871991</div></body></html>';
}
export function printReceipt(o) {
  const f = document.createElement("iframe");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
  document.body.appendChild(f);
  const w = f.contentWindow; w.document.open(); w.document.write(receiptHtml(o)); w.document.close();
  let done = false; const go = () => { if (done) return; done = true; try { w.focus(); w.print(); } catch (x) {} setTimeout(() => f.remove(), 60000); };
  const img = w.document.querySelector("img");
  if (img && !img.complete) { img.onload = img.onerror = go; setTimeout(go, 3000); } else go();
}
