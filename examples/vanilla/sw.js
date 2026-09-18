const CACHE = "khm-safearea-demo-v1";
const ASSETS = ["./", "./index.html", "./styles.css"];
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)))
);
self.addEventListener("fetch", (event) =>
  event.respondWith(caches.match(event.request).then((hit) => hit || fetch(event.request)))
);
