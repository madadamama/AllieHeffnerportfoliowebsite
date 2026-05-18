(function () {
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function bindPanelDrag(panel) {
    var handle = panel.querySelector('h1');
    if (!handle) return;

    handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();

      var margin = 12;
      var rect = panel.getBoundingClientRect();
      var offsetX = e.clientX - rect.left;
      var offsetY = e.clientY - rect.top;
      var transform = panel.style.transform || '';

      panel.style.zIndex = '11';
      handle.style.cursor = 'grabbing';

      function move(ev) {
        var w = panel.offsetWidth;
        var h = panel.offsetHeight;
        var left = clamp(ev.clientX - offsetX, margin, window.innerWidth - w - margin);
        var top = clamp(ev.clientY - offsetY, margin, window.innerHeight - h - margin);
        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        if (transform) panel.style.transform = transform;
      }

      function up() {
        handle.style.cursor = '';
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
        document.removeEventListener('pointercancel', up);
      }

      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
      document.addEventListener('pointercancel', up);
    });
  }

  function placePop(el) {
    if (!el) return;
    var margin = 12;
    var rect = el.getBoundingClientRect();
    var w = rect.width || 280;
    var h = rect.height || 160;
    var maxL = Math.max(margin, window.innerWidth - w - margin);
    var maxT = Math.max(margin, window.innerHeight - h - margin);
    var spanL = Math.max(1, maxL - margin);
    var spanT = Math.max(1, maxT - margin);
    var left = margin + Math.random() * spanL;
    var top = margin + Math.random() * spanT;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    var angle = (Math.random() * 10 - 5).toFixed(2);
    el.style.transform = 'rotate(' + angle + 'deg)';
  }

  function hidePanel(panel) {
    panel.setAttribute('hidden', '');
    panel.setAttribute('aria-hidden', 'true');
  }

  function showPanel(panel) {
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        placePop(panel);
      });
    });
  }

  function init() {
    var triggers = document.querySelectorAll('[data-info-panel]');
    var panels = document.querySelectorAll('.info-floating-pop');
    if (!triggers.length || !panels.length) return;

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-info-panel');
        var panel = document.getElementById('info-panel-' + key);
        if (panel) showPanel(panel);
      });
    });

    document.querySelectorAll('.info-floating-close').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = btn.closest('.info-floating-pop');
        if (panel) hidePanel(panel);
      });
    });

    panels.forEach(function (panel) {
      bindPanelDrag(panel);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
