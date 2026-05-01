(function () {
  var STORAGE_KEY = "quit.social.v2.config";
  var SHARE_LIMIT = 1700;
  var ITUNES_LIMIT = 10;
  var presets = [
    { id: "x", name: "X", icon: "icons/x.png" },
    { id: "facebook", name: "Facebook", icon: "icons/facebook.png" },
    { id: "tiktok", name: "TikTok", icon: "icons/tiktok.png" },
    { id: "slack", name: "Slack", icon: "icons/slack.png" },
    { id: "youtube", name: "YouTube", icon: "icons/youtube.png" },
    { id: "linkedin", name: "LinkedIn", icon: "icons/linkedin.png" },
    { id: "instagram", name: "Instagram", icon: "icons/instagram.png" },
    { id: "reddit", name: "Reddit", icon: "icons/reddit.png" },
    { id: "threads", name: "Threads", icon: "icons/threads.png" },
    { id: "snapchat", name: "Snapchat", icon: "icons/snapchat.png" },
    { id: "discord", name: "Discord", icon: "icons/discord.png" },
    { id: "pinterest", name: "Pinterest", icon: "icons/pinterest.png" }
  ];

  var presetGrid = document.getElementById("preset-grid");
  var searchInput = document.getElementById("search-input");
  var searchStatus = document.getElementById("search-status");
  var searchResults = document.getElementById("search-results");
  var customIconInput = document.getElementById("custom-icon");
  var customStatus = document.getElementById("custom-status");
  var customName = document.getElementById("custom-name");
  var customSubmit = document.getElementById("custom-submit");

  var customIconDataUrl = "";

  renderPresets();
  bindEvents();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker-v2.js").catch(function (err) {
      console.error("Service worker registration failed", err);
    });
  }

  function bindEvents() {
    searchInput.oninput = debounce(function () {
      var term = searchInput.value.trim();
      if (!term) {
        searchResults.innerHTML = "";
        searchStatus.textContent = "";
        return;
      }
      searchItunes(term);
    }, 300);

    customIconInput.onchange = function (evt) {
      var file = evt.target.files && evt.target.files[0];
      if (!file) {
        return;
      }
      if (file.type !== "image/png") {
        customStatus.textContent = "Please upload a PNG file.";
        customIconInput.value = "";
        customIconDataUrl = "";
        updateCustomSubmit();
        return;
      }
      if (file.size > 1024 * 1024) {
        customStatus.textContent = "Please keep the icon under 1 MB.";
        customIconInput.value = "";
        customIconDataUrl = "";
        updateCustomSubmit();
        return;
      }
      fileToDataUrl(file, function (err, dataUrl) {
        if (err) {
          customStatus.textContent = "Could not read that file. Try another PNG.";
          return;
        }
        validateImageSize(dataUrl, function (sizeErr) {
          if (sizeErr) {
            customStatus.textContent = sizeErr;
            return;
          }
          normalizeIcon(dataUrl, function (normalized) {
            customIconDataUrl = normalized || dataUrl;
            customStatus.textContent = "Icon ready.";
            updateCustomSubmit();
          });
        });
      });
    };

    customName.oninput = updateCustomSubmit;

    customSubmit.onclick = function () {
      var name = (customName.value || "").trim();
      if (!name || !customIconDataUrl) {
        return;
      }
      goToFake({
        source: "custom",
        appId: "custom",
        appName: name,
        iconDataUrl: customIconDataUrl,
        iconUrl: ""
      });
    };
  }

  function updateCustomSubmit() {
    var ready = !!((customName.value || "").trim() && customIconDataUrl);
    customSubmit.disabled = !ready;
  }

  function renderPresets() {
    var html = presets.map(function (preset) {
      return '' +
        '<button class="preset" data-id="' + escapeAttr(preset.id) + '" type="button">' +
        '<img src="' + escapeAttr(preset.icon) + '" alt="' + escapeAttr(preset.name) + ' icon">' +
        '<div>' + escapeHtml(preset.name) + '</div>' +
        "</button>";
    }).join("");
    presetGrid.innerHTML = html;

    Array.prototype.forEach.call(presetGrid.querySelectorAll(".preset"), function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-id");
        var preset = presets.find(function (p) { return p.id === id; });
        if (!preset) {
          return;
        }
        goToFake({
          source: "preset",
          appId: preset.id,
          appName: preset.name,
          iconUrl: preset.icon,
          iconDataUrl: ""
        });
      };
    });
  }

  function searchItunes(term) {
    searchStatus.textContent = "Searching...";
    searchResults.innerHTML = "";
    jsonp("https://itunes.apple.com/search?entity=software&country=US&limit=" + ITUNES_LIMIT + "&term=" + encodeURIComponent(term), function (err, body) {
      if (err) {
        searchStatus.textContent = "Search failed. You can still use a preset or upload a PNG.";
        return;
      }
      var results = (body && body.results) || [];
      if (!results.length) {
        searchStatus.textContent = "No app results for that search.";
        return;
      }
      searchStatus.textContent = "Pick an app:";
      searchResults.innerHTML = results.map(function (item, idx) {
        var icon = item.artworkUrl100 || "";
        var name = item.trackName || "App";
        return '' +
          '<button class="result" data-idx="' + idx + '" type="button">' +
          '<img src="' + escapeAttr(icon) + '" alt="App icon">' +
          '<div>' + escapeHtml(name) + "</div>" +
          "</button>";
      }).join("");
      Array.prototype.forEach.call(searchResults.querySelectorAll(".result"), function (btn) {
        btn.onclick = function () {
          var idx = parseInt(btn.getAttribute("data-idx"), 10);
          var selected = results[idx];
          if (!selected) {
            return;
          }
          btn.classList.add("active");
          searchStatus.textContent = "Opening...";
          var iconUrl = selected.artworkUrl100 || "";
          var name = cleanAppName(selected.trackName || "App");
          var appId = selected.trackId ? String(selected.trackId) : "itunes";
          urlToDataUrl(iconUrl, function (dataUrl) {
            if (dataUrl) {
              normalizeIcon(dataUrl, function (normalized) {
                goToFake({
                  source: "itunes",
                  appId: appId,
                  appName: name,
                  iconDataUrl: normalized || dataUrl,
                  iconUrl: ""
                });
              });
              return;
            }
            goToFake({
              source: "itunes",
              appId: appId,
              appName: name,
              iconDataUrl: "",
              iconUrl: iconUrl
            });
          });
        };
      });
    });
  }

  function goToFake(payload) {
    payload.appName = (payload.appName || "Mindful Pause").slice(0, 24);
    var encoded = encodeConfig(payload);
    if (encoded.length <= SHARE_LIMIT) {
      window.location.href = "fake.html#c=" + encoded;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // no-op
    }
    window.location.href = "fake.html#local=1";
  }

  function jsonp(url, cb) {
    var callbackName = "itunesCallback_" + Math.floor(Math.random() * 1e9);
    var script = document.createElement("script");
    var done = false;
    var timer = setTimeout(function () {
      cleanup();
      cb(new Error("timeout"));
    }, 8000);

    function cleanup() {
      if (done) {
        return;
      }
      done = true;
      clearTimeout(timer);
      try {
        delete window[callbackName];
      } catch (_) {
        window[callbackName] = undefined;
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = function (payload) {
      cleanup();
      cb(null, payload);
    };
    script.onerror = function () {
      cleanup();
      cb(new Error("load"));
    };
    script.src = url + "&callback=" + callbackName;
    document.body.appendChild(script);
  }

  function validateImageSize(dataUrl, cb) {
    var img = new Image();
    img.onload = function () {
      if (img.width < 180 || img.height < 180) {
        cb("Please upload a PNG at least 180x180.");
        return;
      }
      cb(null);
    };
    img.onerror = function () {
      cb("Could not decode that PNG.");
    };
    img.src = dataUrl;
  }

  function fileToDataUrl(file, cb) {
    var reader = new FileReader();
    reader.onload = function () { cb(null, String(reader.result || "")); };
    reader.onerror = function () { cb(reader.error || new Error("read failed")); };
    reader.readAsDataURL(file);
  }

  function urlToDataUrl(url, cb) {
    if (!url) {
      cb("");
      return;
    }
    fetch(url)
      .then(function (resp) {
        if (!resp.ok) {
          throw new Error("bad status");
        }
        return resp.blob();
      })
      .then(function (blob) {
        var reader = new FileReader();
        reader.onload = function () {
          cb(String(reader.result || ""));
        };
        reader.onerror = function () {
          cb("");
        };
        reader.readAsDataURL(blob);
      })
      .catch(function () {
        cb("");
      });
  }

  function normalizeIcon(dataUrl, cb) {
    var img = new Image();
    img.onload = function () {
      var side = 512;
      var canvas = document.createElement("canvas");
      canvas.width = side;
      canvas.height = side;
      var ctx = canvas.getContext("2d");
      if (!ctx) {
        cb("");
        return;
      }
      var srcSize = Math.min(img.width, img.height);
      var srcX = Math.floor((img.width - srcSize) / 2);
      var srcY = Math.floor((img.height - srcSize) / 2);
      ctx.clearRect(0, 0, side, side);
      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, side, side);
      cb(canvas.toDataURL("image/png"));
    };
    img.onerror = function () {
      cb("");
    };
    img.src = dataUrl;
  }

  function cleanAppName(name) {
    var value = String(name || "").trim();
    if (!value) {
      return "";
    }
    var separators = [" | ", "|", ":", " - ", " – ", " — ", " • "];
    var cut = -1;
    for (var i = 0; i < separators.length; i++) {
      var hit = value.indexOf(separators[i]);
      if (hit > 0 && (cut === -1 || hit < cut)) {
        cut = hit;
      }
    }
    return cut > 0 ? value.slice(0, cut).trim() : value;
  }

  function encodeConfig(config) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(config))));
  }

  function debounce(fn, ms) {
    var timer = null;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () { fn.apply(null, args); }, ms);
    };
  }

  function escapeHtml(input) {
    return String(input)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttr(input) {
    return escapeHtml(input);
  }
})();
