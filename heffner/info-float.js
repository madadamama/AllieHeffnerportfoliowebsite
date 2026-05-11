(function () {
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
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
