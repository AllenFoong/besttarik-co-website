/* DepthCarousel — React Bits (JS-CSS variant), ported to plain JavaScript.
   Same props, same layout maths and GSAP tweening as the React component; React state is replaced by
   direct DOM updates. Needs window.gsap. Extra option `onChange(index, item)` drives the text panel.
   Usage: DepthCarousel(rootElement, { items, cardWidth, cardHeight, ... }) */
(function (global) {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const normalizeItem = it => (typeof it === 'string' ? { image: it, alt: '' } : it);
  const svgArrow = d => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  function DepthCarousel(root, options) {
    const o = Object.assign({
      items: [], cardWidth: 300, cardHeight: 380, radius: 18, tint: '#05060a', depth: 220, spread: 90, tilt: 22,
      tiltDirection: 'right', perspective: 1400, visibleCards: 4, falloff: 0.2, blur: 6, duration: 700,
      ease: 'power3.out', autoplay: false, autoplayDelay: 3200, loop: true, showControls: true, showIndicators: true,
      onChange: null, ariaLabel: 'Depth carousel', captureWheel: true
    }, options || {});
    const gsap = global.gsap;
    const data = (Array.isArray(o.items) ? o.items : []).map(normalizeItem);
    const count = data.length;
    const cfg = {
      count, depth: o.depth, spread: o.spread, tilt: o.tilt, tiltDirection: o.tiltDirection, visibleCards: o.visibleCards,
      falloff: o.falloff, blur: o.blur, duration: o.duration, ease: o.ease, loop: o.loop, cardWidth: o.cardWidth,
      autoplayDelay: o.autoplayDelay
    };
    let pos = 0, focus = 0, tween = null, scale = 1, drag = null, wheelTimer = null, autoTimer = null, active = 0;
    const reduced = !!(global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

    /* ---------- DOM (same markup and class names as the React component) ---------- */
    root.classList.add('depth-carousel');
    root.style.setProperty('--dc-perspective', `${o.perspective}px`);
    root.setAttribute('role', 'group');
    root.setAttribute('aria-roledescription', 'carousel');
    root.setAttribute('aria-label', o.ariaLabel);
    root.tabIndex = 0;
    const stage = document.createElement('div');
    stage.className = 'depth-carousel__stage';
    root.appendChild(stage);
    const cards = [], overlays = [], dots = [];
    data.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'depth-carousel__card';
      Object.assign(card.style, { width: o.cardWidth + 'px', height: o.cardHeight + 'px', borderRadius: o.radius + 'px' });
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', `${i + 1} of ${count}`);
      const img = document.createElement('img');
      img.className = 'depth-carousel__img';
      img.src = item.image; img.alt = item.alt || ''; img.draggable = false;
      if (item.position) img.style.objectPosition = item.position;
      const tint = document.createElement('span');
      tint.className = 'depth-carousel__tint';
      tint.style.background = o.tint;
      card.append(img, tint);
      card.addEventListener('click', () => onCardClick(i));
      stage.appendChild(card);
      cards.push(card); overlays.push(tint);
    });
    if (o.showControls && count > 1) {
      [['prev', 'Previous slide', 'M15 5l-7 7 7 7', -1], ['next', 'Next slide', 'M9 5l7 7-7 7', 1]].forEach(([k, label, d, step]) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = `depth-carousel__arrow depth-carousel__arrow--${k}`;
        b.setAttribute('aria-label', label); b.innerHTML = svgArrow(d);
        b.addEventListener('click', () => navigateBy(step));
        b.addEventListener('pointerdown', e => e.stopPropagation());
        root.appendChild(b);
      });
    }
    if (o.showIndicators && count > 1) {
      const wrap = document.createElement('div');
      wrap.className = 'depth-carousel__dots';
      wrap.setAttribute('role', 'tablist'); wrap.setAttribute('aria-label', 'Slides');
      data.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        b.className = 'depth-carousel__dot';
        b.addEventListener('click', () => setFocus(i, true));
        b.addEventListener('pointerdown', e => e.stopPropagation());
        wrap.appendChild(b); dots.push(b);
      });
      root.appendChild(wrap);
    }
    const paintActive = () => {
      cards.forEach((c, i) => c.setAttribute('aria-hidden', String(active !== i)));
      dots.forEach((d, i) => { d.classList.toggle('is-active', active === i); d.setAttribute('aria-selected', String(active === i)); });
    };

    /* ---------- layout (verbatim maths) ---------- */
    const layout = p => {
      const n = cfg.count;
      if (!n) return;
      const dir = cfg.tiltDirection === 'left' ? -1 : 1;
      const sc = scale;
      for (let i = 0; i < n; i++) {
        const el = cards[i];
        let d = i - p;
        if (cfg.loop && n > 1) { d = ((d % n) + n) % n; if (d > n / 2) d -= n; }
        const back = Math.max(0, d);
        const az = Math.abs(d);
        const shown = az <= cfg.visibleCards + 0.5;
        const tz = -cfg.depth * d;
        const tx = dir * cfg.spread * d;
        const ry = dir * cfg.tilt * clamp(d, 0, 1);
        let opacity = d < 0 ? Math.max(0, 1 + d) : 1;
        if (!shown) opacity = 0;
        const brightness = Math.max(0.15, 1 - back * cfg.falloff);
        const blurPx = cfg.blur > 0 ? Math.min(cfg.blur, (back / Math.max(1, cfg.visibleCards)) * cfg.blur) : 0;
        const zi = Math.round(2000 - d * 20);
        el.style.transform = `translate(-50%, -50%) scale(${sc}) translateX(${tx.toFixed(2)}px) translateZ(${tz.toFixed(2)}px) rotateY(${ry.toFixed(3)}deg)`;
        el.style.opacity = opacity.toFixed(3);
        el.style.filter = `brightness(${brightness.toFixed(3)}) blur(${blurPx.toFixed(2)}px)`;
        el.style.zIndex = String(zi);
        el.style.pointerEvents = shown && opacity > 0.05 ? 'auto' : 'none';
        overlays[i].style.opacity = clamp(back * cfg.falloff * 1.25, 0, 0.86).toFixed(3);
      }
    };
    const notify = idx => { active = idx; paintActive(); o.onChange && o.onChange(idx, data[idx]); };
    const tweenTo = (target, animate) => {
      tween && tween.kill();
      const proxy = { p: pos };
      const dur = animate && !reduced ? cfg.duration / 1000 : 0;
      tween = gsap.to(proxy, {
        p: target, duration: dur, ease: cfg.ease,
        onUpdate: () => { pos = proxy.p; layout(proxy.p); },
        onComplete: () => { const n = cfg.count; if (n > 0) pos = ((pos % n) + n) % n; layout(pos); }
      });
    };
    const setFocus = (rawIndex, animate = true) => {
      const n = cfg.count;
      if (!n) return;
      const idx = cfg.loop ? ((rawIndex % n) + n) % n : clamp(rawIndex, 0, n - 1);
      let delta = idx - pos;
      if (cfg.loop && n > 1) { delta = ((delta % n) + n) % n; if (delta > n / 2) delta -= n; }
      tweenTo(pos + delta, animate);
      if (idx !== focus) { focus = idx; notify(idx); }
    };
    const navigateBy = step => setFocus(focus + step, true);

    new ResizeObserver(entries => {
      const w = entries[0].contentRect.width;
      const needed = cfg.cardWidth + Math.abs(cfg.spread) * 2 + 120;
      scale = clamp(w / needed, 0.4, 1);
      layout(pos);
    }).observe(root);

    root.addEventListener('wheel', e => {
      if (cfg.count < 2) return;
      // captureWheel:false (site option) lets vertical wheel scroll the page; horizontal swipes still move the deck
      if (!o.captureWheel && Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      tween && tween.kill();
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const delta = e.deltaMode === 1 ? raw * 24 : raw;
      const step = clamp(delta / (cfg.cardWidth * 0.9), -0.6, 0.6);
      pos += step;
      layout(pos);
      if (wheelTimer) clearTimeout(wheelTimer);
      wheelTimer = setTimeout(() => setFocus(Math.round(pos), true), 130);
    }, { passive: false });

    root.addEventListener('pointerdown', e => {
      if (cfg.count < 2) return;
      tween && tween.kill();
      drag = { x: e.clientX, startPos: pos, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false, id: e.pointerId };
    });
    root.addEventListener('pointermove', e => {
      if (!drag) return;
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scale, 40);
      const dx = e.clientX - drag.x;
      if (!drag.moved && Math.abs(dx) > 4) { drag.moved = true; try { root.setPointerCapture(drag.id); } catch (err) {} }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(now - drag.lastT, 1);
      drag.v = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX; drag.lastT = now;
      pos = drag.startPos - dx / stepPx;
      layout(pos);
    });
    let justDragged = false;
    const onPointerEnd = () => {
      const d = drag;
      if (!d) return;
      drag = null;
      if (!d.moved) { // a press that never moved: settle back if a tween was interrupted
        if (Math.abs(pos - Math.round(pos)) > 0.001) setFocus(Math.round(pos), true);
        return;
      }
      justDragged = true; setTimeout(() => { justDragged = false; }, 0);
      const stepPx = Math.max(cfg.cardWidth * 0.55 * scale, 40);
      const projected = pos - (d.v * 180) / stepPx;
      setFocus(Math.round(projected), true);
    };
    root.addEventListener('pointerup', onPointerEnd);
    root.addEventListener('pointercancel', onPointerEnd);
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); navigateBy(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); navigateBy(1); }
    });
    const onCardClick = index => { if (justDragged) return; setFocus(index, true); };

    if (o.autoplay && !reduced && count > 1) {
      let hovered = false, focused = false;
      root.addEventListener('mouseenter', () => { hovered = true; });
      root.addEventListener('mouseleave', () => { hovered = false; });
      root.addEventListener('focusin', () => { focused = true; });
      root.addEventListener('focusout', () => { focused = false; });
      autoTimer = setInterval(() => { if (!hovered && !focused) navigateBy(1); }, Math.max(cfg.autoplayDelay, 600));
    }

    layout(pos);
    notify(0);
    return { setFocus, navigateBy };
  }

  global.DepthCarousel = DepthCarousel;
})(window);
