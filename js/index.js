// Storage helpers
const setObj = (key, obj) => localStorage.setItem(key, JSON.stringify(obj));
const getObj = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

// about:blank launcher (cloaker)
function launchab() {
  const tab = window.open('about:blank', '_blank');
  if (!tab) {
    alert('Popup blocked. Please allow popups for this site.');
    return;
  }
  const iframe = tab.document.createElement('iframe');
  const stl = iframe.style;
  stl.border = 'none';
  stl.outline = 'none';
  stl.width = '100vw';
  stl.height = '100vh';
  stl.position = 'fixed';
  stl.left = stl.right = stl.top = stl.bottom = '0';
  iframe.src = self.location;
  tab.document.body.style.margin = '0';
  tab.document.body.appendChild(iframe);

  const panicUrl = localStorage.getItem('panicurl') || 'https://classroom.google.com/h';
  try {
    window.parent.window.location.replace(panicUrl);
  } catch (_) {
    window.location.replace(panicUrl);
  }
}

// Auto-open in about:blank if configured and inside an iframe
(function autoLaunchIfConfigured() {
  const launchPref = localStorage.getItem('launchblank');
  const inIframe = (() => {
    try { return window.self !== window.top; } catch { return true; }
  })();
  if (launchPref && inIframe) {
    launchab();
  }
})();

// Hide the button if already in about:blank context (self check is always false in same window)
(function hideLaunchButtonIfInBlank() {
  const btn = document.querySelector('#launchab');
  if (!btn) return;
  try {
    // When embedded deeply, this condition may differ; keep simple here
    if (window.self !== window.top) {
      // keep visible to allow manual launch from embed
      return;
    }
  } catch (_) {}
})();

// Panic key listener
window.addEventListener('keydown', (e) => {
  const panicKey = localStorage.getItem('panickey');
  if (panicKey && e.key === panicKey) {
    const panicUrl = localStorage.getItem('panicurl') || 'https://classroom.google.com/h';
    try {
      window.parent.window.location.replace(panicUrl);
    } catch (_) {
      window.location.replace(panicUrl);
    }
  }
});

// Minimal settings wiring
function initSettingsUI() {
  const panicKeyInput = document.querySelector('#panic-key');
  const panicUrlInput = document.querySelector('#panic-url');
  const launchBlankToggle = document.querySelector('#launch-blank');

  if (panicKeyInput) panicKeyInput.value = localStorage.getItem('panickey') || '';
  if (panicUrlInput) panicUrlInput.value = localStorage.getItem('panicurl') || '';
  if (launchBlankToggle) launchBlankToggle.checked = !!localStorage.getItem('launchblank');

  panicKeyInput?.addEventListener('input', () => localStorage.setItem('panickey', panicKeyInput.value));
  panicUrlInput?.addEventListener('input', () => localStorage.setItem('panicurl', panicUrlInput.value));
  launchBlankToggle?.addEventListener('change', () => {
    if (launchBlankToggle.checked) localStorage.setItem('launchblank', '1');
    else localStorage.removeItem('launchblank');
  });
}

document.addEventListener('DOMContentLoaded', initSettingsUI);

// Optional: custom apps/games helpers from provided snippet
function loadcustomapp() {
  if (!getObj('customapps')) setObj('customapps', []);
  const name = prompt('What should this app be named? (required)');
  const url = prompt("What's this app's url? (required)");
  const icon = prompt("What's this app's icon? (optional)");
  const description = prompt("What's this app's description? (optional)");

  if (!name || !url) return alert('All required fields must be filled in');
  if (name.length > 15) return alert('App name is too long (max 30 characters)');

  fetch('https://www.uuidtools.com/api/generate/v4')
    .then((r) => r.json())
    .then((data) => {
      const customapps = getObj('customapps') || [];
      customapps.push({
        title: `${name} (Custom app)`,
        url,
        id: data[0],
        image: icon,
        description,
      });
      setObj('customapps', customapps);
      window.location.href = self.location;
    });
}

function loadcustomgame() {
  if (!getObj('customgames')) setObj('customgames', []);
  const name = prompt('What should this game be named? (required)');
  const url = prompt("What's this game's url? (required)");
  const icon = prompt("What's this game's icon? (optional)");
  const description = prompt("What's this game's description? (optional)");

  if (!name || !url) return alert('All required fields must be filled in');
  if (name.length > 15) return alert('Game name is too long (max 30 characters)');

  fetch('https://www.uuidtools.com/api/generate/v4')
    .then((r) => r.json())
    .then((data) => {
      const customgames = getObj('customgames') || [];
      customgames.push({
        title: `${name} (Custom game)`,
        url,
        id: data[0],
        image: icon,
        description,
      });
      setObj('customgames', customgames);
    });
}

window.launchab = launchab;
window.loadcustomapp = loadcustomapp;
window.loadcustomgame = loadcustomgame;
