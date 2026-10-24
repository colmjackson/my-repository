const FORMATS = {
  square:   { w: 1080, h: 1080, ar: '1 / 1',   arn: 1,      bottom: 0.05 },
  portrait: { w: 1080, h: 1350, ar: '4 / 5',   arn: 0.8,    bottom: 0.05 },
  story:    { w: 1080, h: 1920, ar: '9 / 16',  arn: 0.5625, bottom: 0.12 },
};
const FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const $ = id => document.getElementById(id);
const stage = $('stage'), video = $('video'), preview = $('preview');
const state = { src: null, srcId: 0, base: null, look: 'lager', stream: null, takenAt: null, file: null, timer: null };

// exp/sat/con are multipliers; shadow/high tint the dark and bright ends; fade lifts the blacks.
const LOOKS = {
  stout:  { name: 'Stout',       exp: 0.95, sat: 0.85, con: 1.25, shadow: [0.02, 0.01, 0],     high: [0.03, 0.01, -0.02],  fade: 0.02, vig: 0.45, grain: 0.03 },
  lager:  { name: 'Lager',       exp: 1.08, sat: 1.2,  con: 1.08, shadow: [0, 0, -0.02],       high: [0.05, 0.03, -0.03],  fade: 0,    vig: 0.15, grain: 0 },
  pale:   { name: 'Pale',        exp: 1.03, sat: 0.9,  con: 0.9,  shadow: [-0.01, 0.02, 0.02], high: [0.01, 0.02, -0.01],  fade: 0.06, vig: 0.2,  grain: 0.02 },
  last:   { name: 'Last Orders', exp: 1,    sat: 0,    con: 1.35, shadow: [0, 0, 0],           high: [0, 0, 0],            fade: 0.03, vig: 0.5,  grain: 0.06 },
  snug:   { name: 'Snug',        exp: 1,    sat: 1.05, con: 0.95, shadow: [0.03, 0, -0.03],    high: [0.07, 0.02, -0.06],  fade: 0.03, vig: 0.5,  grain: 0.02 },
};

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
};

function currentFormat() {
  return FORMATS[document.querySelector('input[name=fmt]:checked').value];
}

function priceText() {
  if (!$('priceOn').checked) return '';
  const n = parseFloat($('price').value.replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? $('cur').value + n.toFixed(2) : '';
}

function mainLine() {
  return [$('venue').value.trim(), $('tag').value.trim()].filter(Boolean).join(' · ');
}

function stamp(date) {
  return date.toLocaleString('en-IE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fit(ctx, text, maxW, size, min, weight) {
  let s = size;
  ctx.font = `${weight} ${s}px ${FONT}`;
  while (ctx.measureText(text).width > maxW && s > min) {
    s -= 1;
    ctx.font = `${weight} ${s}px ${FONT}`;
  }
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t.trimEnd() + '…';
}

// Shrink the whole line first; if it still overflows, cut the venue and keep the text after it.
function fitLine(ctx, maxW, size, min) {
  const venue = $('venue').value.trim(), tag = $('tag').value.trim();
  const full = mainLine();
  const shrunk = fit(ctx, full, maxW, size, min, 600);
  if (shrunk === full || !venue || !tag) return shrunk;
  const suffix = ' · ' + tag;
  let v = venue;
  while (v.length > 1 && ctx.measureText(v.trimEnd() + '…' + suffix).width > maxW) v = v.slice(0, -1);
  return v.trimEnd() + '…' + suffix;
}

function applyLook(ctx, w, h, look) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data;
  const cx = w / 2, cy = h / 2, maxd = Math.hypot(cx, cy);
  const px = [0, 0, 0];

  // Pub photos run dark. Lift dim ones towards a mid exposure before the look is applied.
  let sum = 0, n = 0;
  for (let i = 0; i < d.length; i += 64) { sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; }
  const gain = Math.min(1.6, Math.max(1, 0.4 / Math.max(sum / n / 255, 0.01)));
  const exp = look.exp * gain;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      px[0] = d[i] / 255 * exp; px[1] = d[i + 1] / 255 * exp; px[2] = d[i + 2] / 255 * exp;
      const l = 0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2];
      const v = 1 - look.vig * Math.pow(Math.hypot(x - cx, y - cy) / maxd, 2.2);
      const n = look.grain ? (Math.random() - 0.5) * look.grain : 0;
      for (let c = 0; c < 3; c++) {
        let u = l + (px[c] - l) * look.sat;
        u = (u - 0.5) * look.con + 0.5;
        u += look.shadow[c] * (1 - l) + look.high[c] * l;
        u = look.fade + u * (1 - look.fade);
        u = u * v + n;
        d[i + c] = u < 0 ? 0 : u > 1 ? 255 : u * 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

// The cropped, graded photo is cached so typing in the text fields doesn't redo the pixel work.
function baseLayer(f) {
  const key = [f.w, f.h, state.look, state.srcId].join('|');
  if (state.base?.key === key) return state.base.canvas;
  const c = document.createElement('canvas');
  c.width = f.w;
  c.height = f.h;
  const ctx = c.getContext('2d');
  const sw = state.src.width, sh = state.src.height;
  const scale = Math.max(f.w / sw, f.h / sh);
  const dw = sw * scale, dh = sh * scale;
  ctx.drawImage(state.src, (f.w - dw) / 2, (f.h - dh) / 2, dw, dh);
  if (LOOKS[state.look]) applyLook(ctx, f.w, f.h, LOOKS[state.look]);
  state.base = { key, canvas: c };
  return c;
}

function render() {
  if (!state.src) return;
  const f = currentFormat();
  preview.width = f.w;
  preview.height = f.h;
  const ctx = preview.getContext('2d');
  ctx.drawImage(baseLayer(f), 0, 0);

  const line = mainLine();
  const price = priceText();
  const when = stamp(state.takenAt);
  const m = f.w * 0.05;
  const base = f.h - Math.max(m, f.h * f.bottom);

  const scrimH = f.h * (f.bottom > 0.05 ? 0.3 : 0.2);
  const g = ctx.createLinearGradient(0, f.h - scrimH, 0, f.h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = g;
  ctx.fillRect(0, f.h - scrimH, f.w, scrimH);

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  let pillW = 0;
  if (price) {
    ctx.font = `600 ${f.w * 0.05}px ${FONT}`;
    const padX = f.w * 0.025, padY = f.w * 0.014, size = f.w * 0.05;
    pillW = ctx.measureText(price).width + padX * 2;
    const pillH = size + padY * 2;
    const x = f.w - m - pillW, y = base - pillH + padY * 0.6;
    ctx.fillStyle = '#ffc400';
    // Drawn with arcs: the built in rounded rectangle call needs iOS 16, and the app supports iOS 15.
    const rad = pillH / 2;
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + pillW - rad, y);
    ctx.arc(x + pillW - rad, y + rad, rad, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + rad, y + pillH);
    ctx.arc(x + rad, y + rad, rad, Math.PI / 2, Math.PI * 3 / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#1b3a57';
    ctx.textBaseline = 'middle';
    ctx.fillText(price, x + padX, y + pillH / 2 + size * 0.03);
    ctx.textBaseline = 'alphabetic';
  }

  const maxW = f.w - m * 2 - (pillW ? pillW + m * 0.6 : 0);
  ctx.shadowColor = 'rgba(0,0,0,.5)';
  ctx.shadowBlur = f.w * 0.01;
  ctx.fillStyle = '#fff';

  if (line) ctx.fillText(fitLine(ctx, maxW, f.w * 0.05, f.w * 0.03), m, base - f.w * 0.04);
  ctx.fillStyle = 'rgba(255,255,255,.82)';
  ctx.fillText(fit(ctx, when, maxW, f.w * 0.03, f.w * 0.022, 500), m, base);

  ctx.shadowColor = 'transparent';
  preview.setAttribute('aria-label', 'Your picture: ' + ([line, price].filter(Boolean).join(', ') || 'no text added'));
  scheduleFile();
}

function scheduleFile() {
  state.file = null;
  clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    preview.toBlob(b => {
      if (b) state.file = new File([b], 'wish-you-were-beer.jpg', { type: 'image/jpeg' });
    }, 'image/jpeg', 0.92);
  }, 250);
}

function say(msg) { $('status').textContent = msg; }

function applyFormat() {
  const f = currentFormat();
  stage.style.setProperty('--ar', f.ar);
  stage.style.setProperty('--arn', f.arn);
  render();
}

function showMsg(text) {
  $('stageMsg').textContent = text;
  $('stageMsg').hidden = !text;
}

async function startCamera() {
  stopCamera();
  if (!navigator.mediaDevices?.getUserMedia) {
    showMsg('Camera not available here. Use Choose photo instead.');
    return;
  }
  try {
    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1920 } },
      audio: false,
    });
    video.srcObject = state.stream;
    await video.play();
    showMsg('');
  } catch {
    showMsg('Camera blocked. Allow camera access, or use Choose photo.');
  }
}

function stopCamera() {
  state.stream?.getTracks().forEach(t => t.stop());
  state.stream = null;
}

// The grid is a framing aid, so it only shows while the camera is live.
function paintGrid() {
  $('grid').hidden = !$('gridOn').checked || !preview.hidden;
}

function setMode(done) {
  video.hidden = done;
  preview.hidden = !done;
  $('shootRow').hidden = done;
  $('doneRow').hidden = !done;
  $('looks').hidden = !done;
  paintGrid();
  if (!done) { state.src = null; state.file = null; say(''); }
}

function take() {
  if (!video.videoWidth) { say('Camera is not ready yet.'); return; }
  const c = document.createElement('canvas');
  c.width = video.videoWidth;
  c.height = video.videoHeight;
  c.getContext('2d').drawImage(video, 0, 0);
  state.src = c;
  state.srcId++;
  state.takenAt = new Date();
  stopCamera();
  setMode(true);
  render();
}

async function loadFile(file) {
  if (!file) return;
  try {
    state.src = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    state.src = await new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = URL.createObjectURL(file);
    }).catch(() => null);
  }
  if (!state.src) { say('Could not read that photo.'); return; }
  state.srcId++;
  state.takenAt = new Date(file.lastModified || Date.now());
  stopCamera();
  setMode(true);
  render();
}

async function fileNow() {
  if (state.file) return state.file;
  const b = await new Promise(r => preview.toBlob(r, 'image/jpeg', 0.92));
  return new File([b], 'wish-you-were-beer.jpg', { type: 'image/jpeg' });
}

function download(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

$('shutter').onclick = take;
$('file').onchange = e => { loadFile(e.target.files[0]); e.target.value = ''; };
$('retake').onclick = () => { setMode(false); startCamera(); };

$('save').onclick = async () => { download(await fileNow()); say('Saved.'); };

// Inside the iPhone app the web share sheet cannot send files, so the native plugins do it.
const native = window.Capacitor?.isNativePlatform?.() ? window.Capacitor : null;

async function shareNative(file) {
  const Filesystem = native.registerPlugin('Filesystem');
  const Share = native.registerPlugin('Share');
  const data = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const { uri } = await Filesystem.writeFile({ path: file.name, data, directory: 'CACHE' });
  await Share.share({ files: [uri] });
}

if (native) $('save').hidden = true; // the share sheet already offers Save Image

$('share').onclick = async () => {
  const file = await fileNow();
  if (native) {
    try { await shareNative(file); }
    catch (e) { if (!/cancel/i.test(String(e?.message || e))) say('Sharing failed. Try again.'); }
  } else if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      if (e.name !== 'AbortError') say('Sharing failed. Try Save instead.');
    }
  } else {
    download(file);
    say('Sharing is not supported here, so the image was saved.');
  }
};

$('priceOn').onchange = () => { $('priceRow').hidden = !$('priceOn').checked; render(); if (!$('priceRow').hidden) $('price').focus(); };
$('gridOn').onchange = paintGrid;
document.querySelectorAll('input[name=fmt]').forEach(r => r.onchange = applyFormat);

['venue', 'tag', 'price'].forEach(id => {
  $(id).addEventListener('input', () => {
    if (id !== 'price') store.set('wywb.' + id, $(id).value);
    render();
  });
});
$('cur').onchange = () => { store.set('wywb.cur', $('cur').value); render(); };

function paintLooks() {
  document.querySelectorAll('#looks button').forEach(b =>
    b.setAttribute('aria-checked', String(b.dataset.look === state.look)));
}

Object.entries(LOOKS).forEach(([key, look]) => {
  const b = document.createElement('button');
  b.textContent = look.name;
  b.dataset.look = key;
  b.setAttribute('role', 'radio');
  b.onclick = () => {
    state.look = state.look === key ? '' : key;
    store.set('wywb.look', state.look);
    paintLooks();
    render();
  };
  $('looks').appendChild(b);
});

const savedLook = store.get('wywb.look');
if (savedLook !== null && (savedLook === '' || LOOKS[savedLook])) state.look = savedLook;
paintLooks();

$('venue').value = store.get('wywb.venue') || '';
$('tag').value = store.get('wywb.tag') ?? 'Wish you were beer';
$('cur').value = store.get('wywb.cur') || '€';

applyFormat();
startCamera();

// The watermark is drawn on a canvas, so redraw once Inter has loaded.
Promise.all([document.fonts.load('600 24px Inter'), document.fonts.load('400 24px Inter')]).then(render).catch(() => {});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
