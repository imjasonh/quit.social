self.addEventListener('install', function(e) {
  e.waitUntil(caches.open('quit.social').then(function(cache) {
    return cache.addAll([
        '/',
        '/style.css',
        '/antisocial.js',

        '/facebook',
        '/facebook.png',
        '/facebook_manifest.json',

        '/twitter',
        '/twitter.png',
        '/twitter_manifest.json',

        '/instagram',
        '/instagram.png',
        '/instagram_manifest.json',
    ]);
  }));
});


self.addEventListener('fetch', function(event) {
  console.log(event.request.url);
  event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      }));
});
