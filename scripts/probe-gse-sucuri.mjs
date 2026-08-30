const sites = [
  "https://www.gcbbank.com.gh/downloadable-reports/437-2024-annual-report/file",
  "https://www.mtn.com.gh/",
  "https://www.ghana.ecobank.com/",
  "https://www.calbank.net/",
];

for (const url of sites) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0", Accept: "*/*" },
    });
    const buf = Buffer.from(await res.arrayBuffer());
    const head = buf.toString("utf-8", 0, Math.min(buf.length, 3000));
    const sucuri = head.includes("sucuri_cloudproxy");
    console.log(url);
    console.log(`  status=${res.status} bytes=${buf.length} sucuri=${sucuri} type=${res.headers.get("content-type")}`);
  } catch (e) {
    console.log(url, "ERROR", e instanceof Error ? e.message : e);
  }
}
