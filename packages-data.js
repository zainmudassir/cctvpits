// Package list used by checkout.html. Put your real prices in "price" (in Rs.).
// While price is 0 the invoice shows "To be confirmed" and you set the final price in the admin panel.
// workerUrl: your Cloudflare Worker for WhatsApp. Leave empty to skip the automatic send from checkout.
export const PACKAGES = {
  "4":  { name: "4 Camera Package",  cameras: 4,  price: 0, desc: "4 cameras, 4-channel recorder, installation and setup" },
  "8":  { name: "8 Camera Package",  cameras: 8,  price: 0, desc: "8 cameras, 8-channel recorder, installation and setup" },
  "16": { name: "16 Camera Package", cameras: 16, price: 0, desc: "16 cameras, 16-channel recorder, installation and setup" },
  "32": { name: "32 Camera Package", cameras: 32, price: 0, desc: "32 cameras, 32-channel recorder, installation and setup" }
};
export const WORKER_URL = "https://cctvpits-wa.zainmudassir15.workers.dev/";
export const BUSINESS_WA = "923053871991";