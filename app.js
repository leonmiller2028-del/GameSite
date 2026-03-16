(function () {
  'use strict';

  // ── Map base layers ──
  const tileSets = {
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attr: '&copy; <a href="https://carto.com/">CARTO</a>'
    },
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attr: '&copy; <a href="https://carto.com/">CARTO</a>'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri'
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attr: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
    }
  };

  // ── State ──
  let currentStyle = 'dark';
  let baseLayer = null;
  let radarLayers = [];
  let activeFrameIndex = 0;
  let isPlaying = false;
  let animInterval = null;
  let radarFrames = [];
  let radarOpacity = 0.7;
  let activeLayers = { radar: true, clouds: false, temp: false, wind: false, pressure: false };
  let owmLayers = {};

  // OpenWeatherMap free tile layers (appid=anonymous works for demo tiles)
  const OWM_TILE_BASE = 'https://tile.openweathermap.org/map';

  // ── Initialize map ──
  const map = L.map('map', {
    center: [39.8283, -98.5795],
    zoom: 5,
    zoomControl: true,
    attributionControl: false
  });

  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

  function setBaseLayer(style) {
    if (baseLayer) map.removeLayer(baseLayer);
    const t = tileSets[style];
    baseLayer = L.tileLayer(t.url, {
      attribution: t.attr,
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);
    currentStyle = style;
  }

  setBaseLayer('dark');

  // ── RainViewer API ──
  async function loadRainViewerData() {
    try {
      const resp = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      const data = await resp.json();
      radarFrames = [...data.radar.past, ...(data.radar.nowcast || [])];
      buildTimeline();
      showFrame(radarFrames.length > 2 ? radarFrames.length - 3 : 0);
    } catch (e) {
      console.warn('RainViewer API unavailable, using fallback display');
      document.getElementById('timeline-label').textContent = 'Radar unavailable';
    }
  }

  function clearRadarLayers() {
    radarLayers.forEach(l => map.removeLayer(l));
    radarLayers = [];
  }

  function showFrame(index) {
    if (!radarFrames.length) return;
    activeFrameIndex = Math.max(0, Math.min(index, radarFrames.length - 1));
    clearRadarLayers();

    if (activeLayers.radar) {
      const frame = radarFrames[activeFrameIndex];
      const layer = L.tileLayer(
        `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
        { opacity: radarOpacity, zIndex: 10 }
      ).addTo(map);
      radarLayers.push(layer);
    }

    updateTimelineUI();
    updateTimeLabel();
  }

  function buildTimeline() {
    const container = document.getElementById('timeline-frames');
    container.innerHTML = '';
    radarFrames.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'frame-dot';
      dot.style.left = `${(i / (radarFrames.length - 1)) * 100}%`;
      dot.addEventListener('click', () => {
        stopAnimation();
        showFrame(i);
      });
      container.appendChild(dot);
    });
  }

  function updateTimelineUI() {
    const dots = document.querySelectorAll('.frame-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === activeFrameIndex));
    const pct = radarFrames.length > 1 ? (activeFrameIndex / (radarFrames.length - 1)) * 100 : 0;
    document.getElementById('timeline-progress').style.width = `${pct}%`;
  }

  function updateTimeLabel() {
    if (!radarFrames.length) return;
    const frame = radarFrames[activeFrameIndex];
    const date = new Date(frame.time * 1000);
    const now = Date.now();
    const diff = Math.round((frame.time * 1000 - now) / 60000);
    let label;
    if (Math.abs(diff) < 2) {
      label = 'Now';
    } else if (diff > 0) {
      label = `+${diff} min (forecast)`;
    } else {
      label = `${diff} min ago`;
    }
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('timeline-label').textContent = `${timeStr} · ${label}`;
  }

  // ── Animation ──
  function startAnimation() {
    if (isPlaying) return;
    isPlaying = true;
    document.getElementById('play-icon').classList.add('hidden');
    document.getElementById('pause-icon').classList.remove('hidden');
    animInterval = setInterval(() => {
      const next = (activeFrameIndex + 1) % radarFrames.length;
      showFrame(next);
    }, 700);
  }

  function stopAnimation() {
    isPlaying = false;
    document.getElementById('play-icon').classList.remove('hidden');
    document.getElementById('pause-icon').classList.add('hidden');
    clearInterval(animInterval);
    animInterval = null;
  }

  document.getElementById('play-btn').addEventListener('click', () => {
    isPlaying ? stopAnimation() : startAnimation();
  });

  // ── Timeline track click ──
  document.getElementById('timeline-track').addEventListener('click', (e) => {
    if (e.target.classList.contains('frame-dot')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(pct * (radarFrames.length - 1));
    stopAnimation();
    showFrame(idx);
  });

  // ── OWM Overlay Layers ──
  function updateOWMLayers() {
    Object.keys(owmLayers).forEach(k => {
      map.removeLayer(owmLayers[k]);
      delete owmLayers[k];
    });

    const layerMap = {
      clouds: 'clouds_new',
      temp: 'temp_new',
      wind: 'wind_new',
      pressure: 'pressure_new'
    };

    Object.keys(layerMap).forEach(key => {
      if (activeLayers[key]) {
        // Using a demo-compatible URL pattern
        owmLayers[key] = L.tileLayer(
          `${OWM_TILE_BASE}/${layerMap[key]}/{z}/{x}/{y}.png?appid=b1b15e88fa797225412429c1c50c122a1`,
          { opacity: radarOpacity, zIndex: 8 }
        ).addTo(map);
      }
    });
  }

  // ── Layer toggles ──
  document.querySelectorAll('.layer-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      const layer = toggle.dataset.layer;
      activeLayers[layer] = toggle.classList.contains('active');
      if (layer === 'radar') {
        showFrame(activeFrameIndex);
      } else {
        updateOWMLayers();
      }
    });
  });

  // ── Opacity slider ──
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityValue = document.getElementById('opacity-value');

  opacitySlider.addEventListener('input', () => {
    radarOpacity = opacitySlider.value / 100;
    opacityValue.textContent = `${opacitySlider.value}%`;
    radarLayers.forEach(l => l.setOpacity(radarOpacity));
    Object.values(owmLayers).forEach(l => l.setOpacity(radarOpacity));
  });

  // ── Map style buttons ──
  document.querySelectorAll('.map-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.map-style-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      setBaseLayer(btn.dataset.style);
    });
  });

  // ── Sidebar toggle ──
  const sidebar = document.getElementById('sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');

  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // ── Location search (Nominatim) ──
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  let searchTimeout = null;

  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = searchInput.value.trim();
    if (q.length < 2) {
      searchResults.classList.add('hidden');
      return;
    }
    searchTimeout = setTimeout(() => searchLocation(q), 400);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchResults.classList.add('hidden');
      searchInput.blur();
    }
  });

  async function searchLocation(query) {
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await resp.json();
      searchResults.innerHTML = '';
      if (!results.length) {
        searchResults.classList.add('hidden');
        return;
      }
      results.forEach(r => {
        const div = document.createElement('div');
        div.className = 'search-result-item';
        div.textContent = r.display_name;
        div.addEventListener('click', () => {
          map.setView([parseFloat(r.lat), parseFloat(r.lon)], 8);
          searchResults.classList.add('hidden');
          searchInput.value = r.display_name.split(',')[0];
          fetchWeather(parseFloat(r.lat), parseFloat(r.lon), r.display_name.split(',')[0]);
        });
        searchResults.appendChild(div);
      });
      searchResults.classList.remove('hidden');
    } catch (e) {
      console.warn('Search failed:', e);
    }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      searchResults.classList.add('hidden');
    }
  });

  // ── Geolocation ──
  document.getElementById('locate-btn').addEventListener('click', () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 9);
        fetchWeather(latitude, longitude, 'My Location');
      },
      () => console.warn('Geolocation denied')
    );
  });

  // ── Map click → weather ──
  map.on('click', (e) => {
    fetchWeather(e.latlng.lat, e.latlng.lng);
  });

  // ── Fetch weather from Open-Meteo (free, no key) ──
  async function fetchWeather(lat, lon, name) {
    const panel = document.getElementById('weather-info');
    try {
      // Reverse geocode for name if not provided
      if (!name) {
        try {
          const geoResp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const geoData = await geoResp.json();
          name = geoData.address?.city || geoData.address?.town || geoData.address?.village ||
                 geoData.address?.county || geoData.display_name?.split(',')[0] || 'Unknown';
        } catch {
          name = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
        }
      }

      const resp = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,surface_pressure,wind_speed_10m,weather_code` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
      );
      const data = await resp.json();
      const c = data.current;

      document.getElementById('info-location').textContent = name;
      document.getElementById('info-temp').textContent = `${Math.round(c.temperature_2m)}°F`;
      document.getElementById('info-feels').textContent = `${Math.round(c.apparent_temperature)}°F`;
      document.getElementById('info-humidity').textContent = `${c.relative_humidity_2m}%`;
      document.getElementById('info-wind').textContent = `${Math.round(c.wind_speed_10m)} mph`;
      document.getElementById('info-pressure').textContent = `${Math.round(c.surface_pressure)} hPa`;
      document.getElementById('info-desc').textContent = weatherCodeToText(c.weather_code);

      panel.classList.remove('hidden');
    } catch (e) {
      console.warn('Weather fetch failed:', e);
    }
  }

  function weatherCodeToText(code) {
    const codes = {
      0: 'Clear Sky',
      1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Rime Fog',
      51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
      56: 'Freezing Drizzle', 57: 'Heavy Frzn Drizzle',
      61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
      66: 'Freezing Rain', 67: 'Heavy Frzn Rain',
      71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
      77: 'Snow Grains',
      80: 'Light Showers', 81: 'Showers', 82: 'Heavy Showers',
      85: 'Light Snow Shwrs', 86: 'Heavy Snow Shwrs',
      95: 'Thunderstorm',
      96: 'T-Storm w/ Hail', 99: 'T-Storm w/ Hvy Hail'
    };
    return codes[code] || 'Unknown';
  }

  // ── Close weather info ──
  document.getElementById('weather-info-close').addEventListener('click', () => {
    document.getElementById('weather-info').classList.add('hidden');
  });

  // ── Keyboard shortcuts ──
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        isPlaying ? stopAnimation() : startAnimation();
        break;
      case 'ArrowRight':
        stopAnimation();
        showFrame(activeFrameIndex + 1);
        break;
      case 'ArrowLeft':
        stopAnimation();
        showFrame(activeFrameIndex - 1);
        break;
      case '/':
        e.preventDefault();
        searchInput.focus();
        break;
    }
  });

  // ── Auto refresh radar data every 5 minutes ──
  loadRainViewerData();
  setInterval(loadRainViewerData, 300000);
})();
