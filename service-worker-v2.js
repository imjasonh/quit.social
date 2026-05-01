var CACHE_NAME = "quit-social-v2-20260501-5";
var ASSETS = [
  "./",
  "./index.html",
  "./fake.html",
  "./v2.css",
  "./v2.js",
  "./fake.js",
  "./icons/x.png",
  "./icons/facebook.png",
  "./icons/tiktok.png",
  "./icons/slack.png",
  "./icons/youtube.png",
  "./icons/linkedin.png",
  "./icons/instagram.png",
  "./icons/reddit.png",
  "./icons/threads.png",
  "./icons/snapchat.png",
  "./icons/discord.png",
  "./icons/pinterest.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return Promise.resolve();
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, copy);
          });
          return response;
        })
        .catch(function () {
          return caches.match(event.request).then(function (cached) {
            return cached || caches.match("./index.html");
          });
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) {
        return cached;
      }
      return fetch(event.request);
    })
  );
});
