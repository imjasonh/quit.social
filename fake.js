(function () {
  var STORAGE_KEY = "quit.social.v2.config";
  var VISITS_KEY = "quit.social.v2.visits";
  var headline = document.getElementById("headline");
  var message = document.getElementById("message");
  var bumpIcon = document.getElementById("bump-icon");
  var counter = document.getElementById("counter");
  var reset = document.getElementById("reset");
  var installHint = document.getElementById("install-hint");
  var appleTouchIcon = document.getElementById("apple-touch-icon");
  var appleTitle = document.getElementById("apple-title");
  var manifestLink = document.getElementById("app-manifest");

  var bumpMoments = [
    { emoji: "🌿", tip: "Take one slow breath and unclench your shoulders." },
    { emoji: "🍃", tip: "Put the phone down for ten seconds and look around." },
    { emoji: "🧘", tip: "Try a short pause: inhale for 4, exhale for 6." },
    { emoji: "🌱", tip: "Pick one tiny alternative: water, stretch, or sunlight." },
    { emoji: "☁️", tip: "Give your mind a soft reset before deciding what to do next." },
    { emoji: "🫶", tip: "Send one kind message to a real person instead." }
  ];

  var config = readConfigFromLocation() || loadSavedConfig() || {
    appId: "default",
    appName: "Mindful Pause",
    iconUrl: "icons/instagram.png",
    iconDataUrl: ""
  };
  var appName = sanitizeName(config.appName);
  var icon = config.iconDataUrl || config.iconUrl || "icons/instagram.png";
  var appId = sanitizeId(config.appId || appName);

  document.title = appName;
  headline.textContent = "This isn't " + appName + ".";
  var bump = bumpMoments[Math.floor(Math.random() * bumpMoments.length)];
  message.textContent = bump.tip;
  bumpIcon.textContent = bump.emoji;

  appleTitle.setAttribute("content", appName);
  appleTouchIcon.setAttribute("href", icon);
  manifestLink.setAttribute("href", buildManifest(icon, appName));

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker-v2.js").catch(function (err) {
      console.error("Service worker registration failed", err);
    });
  }

  updateVisitCount(appId, appName);
  renderInstallHint();

  reset.onclick = function () {
    resetCount(appId, appName);
  };

  function renderInstallHint() {
    if (isStandalone()) {
      return;
    }
    var platform = detectPlatform();
    var html = "";
    if (platform === "ios") {
      html = "iOS: tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.";
    } else if (platform === "android") {
      html = "Android: open the browser menu, then <strong>Add to Home screen</strong> or <strong>Install app</strong>.";
    } else {
      html = "iOS: <strong>Share</strong> -> <strong>Add to Home Screen</strong>." +
        "<br>Android: browser menu -> <strong>Add to Home screen</strong>.";
    }
    installHint.innerHTML = html;
    installHint.hidden = false;
  }

  function isStandalone() {
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) {
      return true;
    }
    return navigator.standalone === true;
  }

  function detectPlatform() {
    var ua = navigator.userAgent || "";
    if (/Android/i.test(ua)) {
      return "android";
    }
    if (/iPad|iPhone|iPod/.test(ua)) {
      return "ios";
    }
    if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) {
      return "ios";
    }
    return "unknown";
  }

  function readConfigFromLocation() {
    var hash = window.location.hash.replace(/^#/, "");
    if (!hash) {
      return null;
    }
    var params = parseParams(hash);
    if (params.c) {
      var fromHash = decodeConfig(params.c);
      if (fromHash) {
        saveConfig(fromHash);
        return fromHash;
      }
    }
    if (params.local === "1") {
      return loadSavedConfig();
    }
    return null;
  }

  function parseParams(input) {
    var out = {};
    input.split("&").forEach(function (part) {
      var pieces = part.split("=");
      if (!pieces[0]) {
        return;
      }
      out[decodeURIComponent(pieces[0])] = decodeURIComponent(pieces.slice(1).join("=") || "");
    });
    return out;
  }

  function decodeConfig(encoded) {
    try {
      return JSON.parse(decodeURIComponent(escape(atob(encoded))));
    } catch (_) {
      return null;
    }
  }

  function loadSavedConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function saveConfig(next) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_) {
      // no-op
    }
  }

  function buildManifest(iconSrc, name) {
    var manifest = {
      name: name,
      short_name: name.slice(0, 12),
      display: "standalone",
      start_url: "fake.html#local=1",
      background_color: "#f4f8f2",
      theme_color: "#5f8b5a",
      icons: [
        { src: iconSrc, sizes: "192x192", type: "image/png" },
        { src: iconSrc, sizes: "512x512", type: "image/png" }
      ]
    };
    var blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
    return URL.createObjectURL(blob);
  }

  function updateVisitCount(key, name) {
    var store = loadVisitStore();
    var points = store[key] || [];
    var now = Date.now();
    var cutoff = now - 7 * 24 * 60 * 60 * 1000;
    points = points.filter(function (n) { return n > cutoff; });
    points.push(now);
    store[key] = points;
    saveVisitStore(store);
    renderCount(points.length, name);
  }

  function resetCount(key, name) {
    var store = loadVisitStore();
    store[key] = [];
    saveVisitStore(store);
    renderCount(0, name);
  }

  function renderCount(count, name) {
    if (count <= 0) {
      counter.textContent = "You have not opened " + name + " this week. Keep going.";
      return;
    }
    counter.textContent = "You opened " + name + " " + count + (count === 1 ? " time" : " times") + " this week.";
  }

  function loadVisitStore() {
    try {
      var raw = localStorage.getItem(VISITS_KEY);
      if (!raw) {
        return {};
      }
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveVisitStore(store) {
    try {
      localStorage.setItem(VISITS_KEY, JSON.stringify(store));
    } catch (_) {
      // no-op
    }
  }

  function sanitizeName(name) {
    var value = String(name || "").trim();
    if (!value) {
      return "Mindful Pause";
    }
    return value.slice(0, 24);
  }

  function sanitizeId(id) {
    return String(id || "default").toLowerCase().replace(/[^a-z0-9-]+/g, "-");
  }
})();
