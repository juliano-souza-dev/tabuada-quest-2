const CACHE_VERSION = "tq2-dev-assets-20260926-external-assets-local-v1";
const CACHE_PREFIX = "tq2-dev-assets-";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => (key.startsWith("tq2-shell-") || key.startsWith(CACHE_PREFIX)) && key !== CACHE_VERSION)
        .map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const isStaticCode = event.request.mode === "navigate"
    || url.pathname.endsWith(".html")
    || url.pathname.endsWith(".js")
    || url.pathname.endsWith(".css")
    || url.pathname.endsWith(".json")
    || url.pathname.endsWith(".webmanifest");

  if (isStaticCode) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
    );
    return;
  }

  const isHeavyAsset = /\.(?:webp|png|jpg|jpeg|gif|svg|mp3|ogg|wav|mp4|webm|woff2?)$/i.test(url.pathname);
  if (!isHeavyAsset) {
    event.respondWith(fetch(event.request, { cache: "no-store" }));
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      try {
        const response = await fetch(event.request);
        if (response && response.ok && response.type !== "opaque") {
          event.waitUntil(cache.put(event.request, response.clone()));
        }
        return response;
      } catch (error) {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        throw error;
      }
    })
  );
});
