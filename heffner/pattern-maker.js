(function () {
  var canvas = null;
  var shell = null;
  var selectedEl = null;
  var placementColor = '#ffeb3b';

  var sizes = {
    circle: { w: 48, h: 48 },
    rect: { w: 28, h: 56 },
    square: { w: 44, h: 44 },
    line: { w: 56, h: 14 }
  };

  function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
  }

  function normalizeHex(c) {
    if (!c) return '#ffeb3b';
    c = String(c).trim().toLowerCase();
    if (c[0] !== '#') c = '#' + c;
    if (c.length === 4) {
      return '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    }
    return c;
  }

  function shapeInnerClass(type) {
    return 'pattern-on-canvas-inner pattern-shape-' + type;
  }

  function setSelected(el) {
    if (selectedEl) selectedEl.classList.remove('is-selected');
    selectedEl = el;
    if (selectedEl) selectedEl.classList.add('is-selected');
    var del = document.getElementById('pattern-delete-btn');
    if (del) del.disabled = !selectedEl;
  }

  function applyColorToShape(el, hex) {
    var h = normalizeHex(hex);
    el.dataset.fill = h;
    el.style.setProperty('--shape-color', h);
  }

  function syncSwatches(hex) {
    var target = normalizeHex(hex);
    document.querySelectorAll('.pattern-color-swatch').forEach(function (b) {
      var match = normalizeHex(b.getAttribute('data-fill')) === target;
      b.classList.toggle('is-active', match);
    });
  }

  function setPlacementColor(hex) {
    placementColor = normalizeHex(hex);
    var maker = document.querySelector('.pattern-maker');
    if (maker) maker.style.setProperty('--placement-color', placementColor);
    var custom = document.getElementById('pattern-color-custom');
    if (custom) custom.value = placementColor;
    syncSwatches(placementColor);
    if (selectedEl) applyColorToShape(selectedEl, placementColor);
  }

  function clampShapesInCanvas() {
    if (!canvas) return;
    canvas.querySelectorAll('.pattern-on-canvas').forEach(function (el) {
      var w = el.offsetWidth;
      var h = el.offsetHeight;
      var cw = canvas.clientWidth;
      var ch = canvas.clientHeight;
      var left = parseFloat(el.style.left) || 0;
      var top = parseFloat(el.style.top) || 0;
      el.style.left = clamp(left, 0, Math.max(0, cw - w)) + 'px';
      el.style.top = clamp(top, 0, Math.max(0, ch - h)) + 'px';
    });
  }

  function stampFileName() {
    var d = new Date();
    function pad(n) {
      return n < 10 ? '0' + n : String(n);
    }
    return (
      d.getFullYear() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      '-' +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  function savePattern() {
    if (!canvas) return;
    var dpr = window.devicePixelRatio || 1;
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    var out = document.createElement('canvas');
    out.width = Math.round(w * dpr);
    out.height = Math.round(h * dpr);
    var ctx = out.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = 2;

    canvas.querySelectorAll('.pattern-on-canvas').forEach(function (el) {
      var type = el.dataset.shape;
      var fill = normalizeHex(el.dataset.fill) || '#ffeb3b';
      var x = parseFloat(el.style.left) || 0;
      var y = parseFloat(el.style.top) || 0;
      var ew = el.offsetWidth;
      var eh = el.offsetHeight;

      if (type === 'circle') {
        var cx = x + ew / 2;
        var cy = y + eh / 2;
        var r = Math.min(ew, eh) / 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
      } else if (type === 'rect' || type === 'square') {
        ctx.fillStyle = fill;
        ctx.fillRect(x, y, ew, eh);
      } else if (type === 'line') {
        ctx.strokeStyle = fill;
        ctx.lineWidth = 2;
        ctx.beginPath();
        var pad = 6;
        var ym = y + eh / 2;
        ctx.moveTo(x + pad, ym);
        ctx.lineTo(x + ew - pad, ym);
        ctx.stroke();
      }
    });

    out.toBlob(
      function (blob) {
        if (!blob) return;
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'pattern-' + stampFileName() + '.png';
        a.click();
        URL.revokeObjectURL(url);
      },
      'image/png',
      1
    );
  }

  function createGhost(type) {
    var g = document.createElement('div');
    g.className = 'pattern-drag-ghost';
    g.style.width = sizes[type].w + 'px';
    g.style.height = sizes[type].h + 'px';
    g.style.setProperty('--shape-color', placementColor);
    var inner = document.createElement('div');
    inner.className = shapeInnerClass(type);
    g.appendChild(inner);
    g.style.position = 'fixed';
    g.style.pointerEvents = 'none';
    g.style.zIndex = '10000';
    g.style.left = '0';
    g.style.top = '0';
    return g;
  }

  function placeShapeOnCanvas(type, clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    var sz = sizes[type];
    var left = clientX - rect.left - sz.w / 2;
    var top = clientY - rect.top - sz.h / 2;
    left = clamp(left, 0, canvas.clientWidth - sz.w);
    top = clamp(top, 0, canvas.clientHeight - sz.h);
    var wrap = document.createElement('div');
    wrap.className = 'pattern-on-canvas';
    wrap.dataset.shape = type;
    wrap.style.left = left + 'px';
    wrap.style.top = top + 'px';
    wrap.style.width = sz.w + 'px';
    wrap.style.height = sz.h + 'px';
    var inner = document.createElement('div');
    inner.className = shapeInnerClass(type);
    wrap.appendChild(inner);
    applyColorToShape(wrap, placementColor);
    canvas.appendChild(wrap);
    bringToFront(wrap);
    setSelected(wrap);
  }

  function duplicateShape(el) {
    var type = el.dataset.shape;
    if (!type || !sizes[type]) return;
    var sz = sizes[type];
    var clone = el.cloneNode(true);
    clone.classList.remove('is-selected');
    var left = parseFloat(el.style.left) || 0;
    var top = parseFloat(el.style.top) || 0;
    clone.style.left = clamp(left + 14, 0, canvas.clientWidth - sz.w) + 'px';
    clone.style.top = clamp(top + 14, 0, canvas.clientHeight - sz.h) + 'px';
    clone.style.zIndex = '';
    canvas.appendChild(clone);
    bringToFront(clone);
    setSelected(clone);
  }

  function bringToFront(el) {
    var siblings = canvas.querySelectorAll('.pattern-on-canvas');
    var max = 0;
    siblings.forEach(function (s) {
      var z = parseInt(s.style.zIndex, 10) || 1;
      if (z > max) max = z;
    });
    el.style.zIndex = String(max + 1);
  }

  function bindPaletteTool(tool) {
    tool.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      var type = tool.getAttribute('data-shape');
      if (!type || !sizes[type]) return;
      var ghost = createGhost(type);
      document.body.appendChild(ghost);
      var sz = sizes[type];

      function positionGhost(ev) {
        ghost.style.left = ev.clientX - sz.w / 2 + 'px';
        ghost.style.top = ev.clientY - sz.h / 2 + 'px';
      }

      positionGhost(e);

      function move(ev) {
        positionGhost(ev);
      }

      function up(ev) {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        var r = canvas.getBoundingClientRect();
        if (
          ev.clientX >= r.left &&
          ev.clientX <= r.right &&
          ev.clientY >= r.top &&
          ev.clientY <= r.bottom
        ) {
          placeShapeOnCanvas(type, ev.clientX, ev.clientY);
        }
        ghost.remove();
      }

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  function bindCanvasInteractions() {
    canvas.addEventListener('pointerdown', function (e) {
      if (e.target === canvas) {
        setSelected(null);
        return;
      }
      if (e.target.closest('.pattern-canvas-resize')) return;
      var el = e.target.closest('.pattern-on-canvas');
      if (!el || el.parentNode !== canvas) return;
      if (e.button !== 0) return;
      e.preventDefault();
      bringToFront(el);
      var elRect = el.getBoundingClientRect();
      var offsetX = e.clientX - elRect.left;
      var offsetY = e.clientY - elRect.top;
      var startCX = e.clientX;
      var startCY = e.clientY;
      var dragging = false;
      var pid = e.pointerId;
      try {
        el.setPointerCapture(pid);
      } catch (err) {}

      function move(ev) {
        if (!dragging) {
          if (Math.hypot(ev.clientX - startCX, ev.clientY - startCY) < 5) return;
          dragging = true;
        }
        var r = canvas.getBoundingClientRect();
        var w = el.offsetWidth;
        var h = el.offsetHeight;
        var left = ev.clientX - r.left - offsetX;
        var top = ev.clientY - r.top - offsetY;
        left = clamp(left, 0, canvas.clientWidth - w);
        top = clamp(top, 0, canvas.clientHeight - h);
        el.style.left = left + 'px';
        el.style.top = top + 'px';
      }

      function up() {
        try {
          el.releasePointerCapture(pid);
        } catch (err2) {}
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerup', up);
        el.removeEventListener('pointercancel', up);
        setSelected(el);
      }

      el.addEventListener('pointermove', move);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
    });

    canvas.addEventListener('dblclick', function (e) {
      var el = e.target.closest('.pattern-on-canvas');
      if (!el || el.parentNode !== canvas) return;
      e.preventDefault();
      duplicateShape(el);
    });
  }

  function bindCanvasResize() {
    var handle = shell.querySelector('.pattern-canvas-resize');
    if (!handle) return;

    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.button !== 0) return;

      var sr = shell.getBoundingClientRect();
      var startW = sr.width;
      var startH = sr.height;
      var startX = e.clientX;
      var startY = e.clientY;
      var parentW = shell.parentElement.getBoundingClientRect().width;
      var maxW = Math.min(640, parentW);
      var maxH = 520;

      shell.style.width = startW + 'px';
      shell.style.height = startH + 'px';
      shell.style.boxSizing = 'border-box';

      function move(ev) {
        var dw = ev.clientX - startX;
        var dh = ev.clientY - startY;
        var newW = clamp(startW + dw, 160, maxW);
        var newH = clamp(startH + dh, 120, maxH);
        shell.style.width = newW + 'px';
        shell.style.height = newH + 'px';
      }

      function up() {
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
        clampShapesInCanvas();
      }

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  function bindColorBar() {
    document.querySelectorAll('.pattern-color-swatch').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setPlacementColor(btn.getAttribute('data-fill'));
      });
    });
    var custom = document.getElementById('pattern-color-custom');
    if (custom) {
      custom.addEventListener('input', function () {
        setPlacementColor(custom.value);
      });
    }
  }

  function bindDelete() {
    var del = document.getElementById('pattern-delete-btn');
    if (!del) return;
    del.disabled = true;
    del.addEventListener('click', function () {
      if (!selectedEl) return;
      var toRemove = selectedEl;
      setSelected(null);
      toRemove.remove();
    });
  }

  function init() {
    canvas = document.getElementById('pattern-canvas');
    shell = document.getElementById('pattern-canvas-shell');
    if (!canvas || !shell) return;
    setPlacementColor(placementColor);
    bindColorBar();
    bindDelete();
    bindCanvasResize();
    bindCanvasInteractions();
    document.querySelectorAll('.pattern-tool[data-shape]').forEach(bindPaletteTool);
    var saveBtn = document.getElementById('pattern-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', savePattern);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
