/* Mobile menu — auto-injects a hamburger + fullscreen overlay on every page.
   Reads the existing nav.top links so it stays in sync with desktop nav.
   Only visible at <= 900px. Self-contained: no other JS or CSS needed. */
(function(){
  if (window.__mobileMenuInstalled) return;
  window.__mobileMenuInstalled = true;

  function init(){
    var nav = document.querySelector('nav.top');
    if (!nav) return;

    // Find the link container — could be .nav-links OR an inline <div> on speaking.html
    var linkBox = nav.querySelector('.nav-links');
    if (!linkBox) {
      // speaking.html: the second child div with inline links
      var divs = nav.querySelectorAll('div');
      for (var i=0;i<divs.length;i++){
        if (divs[i].querySelector('a')) { linkBox = divs[i]; break; }
      }
    }
    if (!linkBox) return;

    // Inject styles (scoped, !important to beat anything)
    var style = document.createElement('style');
    style.textContent = [
      '.mm-toggle{display:none;background:transparent;border:0;padding:8px;cursor:pointer;-webkit-tap-highlight-color:transparent;color:var(--ink,#1a1f2e);align-items:center;justify-content:center;border-radius:8px}',
      '.mm-toggle:focus-visible{outline:2px solid var(--accent,#b45309);outline-offset:2px}',
      '.mm-toggle svg{display:block;width:26px;height:26px}',
      '.mm-toggle .bar{stroke:currentColor;stroke-width:1.6;stroke-linecap:round;transition:transform .3s ease, opacity .2s ease}',
      'body.mm-open .mm-toggle .bar.b1{transform:translate(0,7px) rotate(45deg)}',
      'body.mm-open .mm-toggle .bar.b2{opacity:0}',
      'body.mm-open .mm-toggle .bar.b3{transform:translate(0,-7px) rotate(-45deg)}',
      '.mm-overlay{position:fixed;inset:0;z-index:9998;background:var(--paper,#f5f1ea);opacity:0;pointer-events:none;transition:opacity .35s ease;display:flex;flex-direction:column}',
      'body.mm-open .mm-overlay{opacity:1;pointer-events:auto}',
      '.mm-overlay-inner{flex:1;display:flex;flex-direction:column;justify-content:flex-start;padding:72px 32px 40px;max-width:520px;margin:0 auto;width:100%;box-sizing:border-box;overflow-y:auto;-webkit-overflow-scrolling:touch}',
      '.mm-eyebrow{font-family:Inter,system-ui,sans-serif;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft,#6b7280);margin-bottom:28px;display:flex;align-items:center;gap:12px}',
      '.mm-eyebrow::before{content:"";width:24px;height:1px;background:var(--accent,#b45309)}',
      '.mm-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column}',
      '.mm-list li{border-top:1px solid rgba(26,31,46,.12);overflow:hidden}',
      '.mm-list li:last-child{border-bottom:1px solid rgba(26,31,46,.12)}',
      '.mm-list a{display:flex;align-items:baseline;justify-content:space-between;gap:16px;padding:14px 4px;font-family:Fraunces,Georgia,serif;font-size:23px;font-weight:400;letter-spacing:-.01em;color:var(--ink,#1a1f2e);text-decoration:none;line-height:1.1;transform:translateY(20px);opacity:0;transition:transform .5s cubic-bezier(.2,.8,.2,1),opacity .4s ease,color .2s ease}',
      'body.mm-open .mm-list a{transform:translateY(0);opacity:1}',
      '.mm-list a .mm-arrow{font-family:Inter,system-ui,sans-serif;font-size:14px;color:var(--accent,#b45309);transform:translateX(-6px);opacity:0;transition:transform .3s ease, opacity .3s ease}',
      '.mm-list a:hover{color:var(--accent,#b45309)}',
      '.mm-list a:hover .mm-arrow{transform:translateX(0);opacity:1}',
      '.mm-cta{margin-top:24px;display:flex;flex-direction:column;gap:12px;flex-shrink:0}',
      '.mm-cta .btn{justify-content:center;font-size:15px;padding:16px 22px}',
      '.mm-foot{padding:24px 32px;display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-soft,#6b7280);border-top:1px solid rgba(26,31,46,.08)}',
      '.mm-foot a{color:inherit;text-decoration:none}',
      'body.mm-open{overflow:hidden}',
      '@media (max-width: 900px){',
      '  .mm-toggle{display:inline-flex}',
      '  nav.top > .nav-links, nav.top > div:not(.mm-toggle):not(.mm-mount){display:none !important}',
      '  nav.top > a.btn{display:none !important}',
      '}',
      // staggered entry for list items
      '.mm-list li:nth-child(1) a{transition-delay:.05s}',
      '.mm-list li:nth-child(2) a{transition-delay:.10s}',
      '.mm-list li:nth-child(3) a{transition-delay:.15s}',
      '.mm-list li:nth-child(4) a{transition-delay:.20s}',
      '.mm-list li:nth-child(5) a{transition-delay:.25s}',
      '.mm-list li:nth-child(6) a{transition-delay:.30s}',
      '.mm-list li:nth-child(7) a{transition-delay:.35s}',
      '.mm-list li:nth-child(8) a{transition-delay:.40s}'
    ].join('\n');
    document.head.appendChild(style);

    // Build the toggle button
    var btn = document.createElement('button');
    btn.className = 'mm-toggle';
    btn.setAttribute('aria-label','Open menu');
    btn.setAttribute('aria-expanded','false');
    btn.innerHTML = '<svg viewBox="0 0 26 26" fill="none" aria-hidden="true">'+
      '<line class="bar b1" x1="3" y1="7"  x2="23" y2="7"/>'+
      '<line class="bar b2" x1="3" y1="13" x2="23" y2="13"/>'+
      '<line class="bar b3" x1="3" y1="19" x2="23" y2="19"/>'+
      '</svg>';
    nav.appendChild(btn);

    // Collect links from existing nav (clone so we don't move them)
    var sourceLinks = linkBox.querySelectorAll('a');
    var ctaBtn = nav.querySelector('a.btn');

    // Build overlay
    var overlay = document.createElement('div');
    overlay.className = 'mm-overlay';
    overlay.setAttribute('aria-hidden','true');

    var inner = document.createElement('div');
    inner.className = 'mm-overlay-inner';

    var eyebrow = document.createElement('div');
    eyebrow.className = 'mm-eyebrow';
    eyebrow.textContent = 'Fallon Scott';
    inner.appendChild(eyebrow);

    var ul = document.createElement('ul');
    ul.className = 'mm-list';
    sourceLinks.forEach(function(a){
      var li = document.createElement('li');
      var na = document.createElement('a');
      na.href = a.getAttribute('href');
      // Strip any inline current-page marker for clarity
      var label = (a.textContent || '').trim();
      na.innerHTML = '<span>'+label+'</span><span class="mm-arrow">→</span>';
      // Close menu when a link is clicked
      na.addEventListener('click', closeMenu);
      li.appendChild(na);
      ul.appendChild(li);
    });
    inner.appendChild(ul);

    // CTA at bottom of menu — clone the nav's primary CTA
    if (ctaBtn) {
      var ctaWrap = document.createElement('div');
      ctaWrap.className = 'mm-cta';
      var ctaClone = ctaBtn.cloneNode(true);
      ctaClone.addEventListener('click', closeMenu);
      ctaWrap.appendChild(ctaClone);
      inner.appendChild(ctaWrap);
    }

    overlay.appendChild(inner);

    var foot = document.createElement('div');
    foot.className = 'mm-foot';
    foot.innerHTML = '<span>Find it. Fix it. Stay until it sticks.</span><a href="https://portal.f28agency.com/public/appointment-scheduler/5cbbff6daf73631c179eafad/schedule" target="_blank" rel="noopener">Contact →</a>';
    overlay.appendChild(foot);

    // Close X button in top-right of overlay
    var closeBtn = document.createElement('button');
    closeBtn.className = 'mm-close';
    closeBtn.setAttribute('aria-label','Close menu');
    closeBtn.innerHTML = '<svg viewBox="0 0 26 26" width="26" height="26" fill="none" aria-hidden="true"><line x1="6" y1="6" x2="20" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="20" y1="6" x2="6" y2="20" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    var closeStyle = document.createElement('style');
    closeStyle.textContent = '.mm-close{position:absolute;top:24px;right:24px;background:transparent;border:0;padding:10px;cursor:pointer;color:var(--ink,#1a1f2e);border-radius:8px;-webkit-tap-highlight-color:transparent;z-index:1}.mm-close:focus-visible{outline:2px solid var(--accent,#b45309);outline-offset:2px}';
    document.head.appendChild(closeStyle);
    closeBtn.addEventListener('click', closeMenu);
    overlay.appendChild(closeBtn);

    document.body.appendChild(overlay);

    function openMenu(){
      document.body.classList.add('mm-open');
      btn.setAttribute('aria-expanded','true');
      btn.setAttribute('aria-label','Close menu');
      overlay.setAttribute('aria-hidden','false');
    }
    function closeMenu(){
      document.body.classList.remove('mm-open');
      btn.setAttribute('aria-expanded','false');
      btn.setAttribute('aria-label','Open menu');
      overlay.setAttribute('aria-hidden','true');
    }
    function toggle(){
      if (document.body.classList.contains('mm-open')) closeMenu();
      else openMenu();
    }
    btn.addEventListener('click', toggle);
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && document.body.classList.contains('mm-open')) closeMenu();
    });
    // Close on resize past breakpoint
    window.addEventListener('resize', function(){
      if (window.innerWidth > 900 && document.body.classList.contains('mm-open')) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
