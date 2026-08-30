import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/probe-url.mjs <url>");
  process.exit(1);
}

const res = await fetch(url, {
  redirect: "follow",
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    Accept: "application/pdf,*/*",
  },
});

const buf = Buffer.from(await res.arrayBuffer());
console.log("status", res.status, res.url);
console.log("content-type", res.headers.get("content-type"));
console.log("bytes", buf.length);
console.log("magic", buf.subarray(0, 8).toString());
