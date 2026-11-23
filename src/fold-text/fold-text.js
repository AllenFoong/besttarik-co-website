/* FoldText — React Bits (JS-CSS variant), ported to plain JavaScript.
   Same props and the same GSAP animation as the React component (paper / blinds / flip, hinge, stagger,
   crease shading, mount / scroll / hover / loop triggers, hover re-fold). Needs window.gsap
   (and window.ScrollTrigger for trigger:'scroll').
   Extra for this site: the returned controller has setText(text), which folds the current text away
   and unfolds the new one, so one element can cycle through drink names.
   Usage: const fold = FoldText(spanElement, { text, splitBy, hinge, foldStyle, ... }); fold.setText('Next'); */
(function (global) {
  const HINGES = {
    top: { origin: '50% 0%', axis: 'rotateX', sign: -1 },
    bottom: { origin: '50% 100%', axis: 'rotateX', sign: 1 },
    left: { origin: '0% 50%', axis: 'rotateY', sign: 1 },
    right: { origin: '100% 50%', axis: 'rotateY', sign: -1 }
  };
  const SLATS = {
    rotateX: { origins: ['50% 25%', '50% 75%'], clips: ['inset(-40% -20% 50% -20%)', 'inset(50% -20% -40% -20%)'] },
    rotateY: { origins: ['25% 50%', '75% 50%'], clips: ['inset(-40% 50% -40% -20%)', 'inset(-40% -20% -40% 50%)'] }
  };
  const FOLD_STYLES = ['paper', 'blinds', 'flip'];
  const SLAT_DELAY = 0.24;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function FoldText(root, options) {
    const o = Object.assign({
      text: 'Design unfolds', splitBy: 'char', hinge: 'top', foldStyle: 'paper', duration: 0.65, stagger: 0.045,
      staggerFrom: 'start', foldAngle: 92, ease: 'power3.out', perspective: 700, creaseShading: 0.55, trigger: 'mount',
      loopDelay: 1.4, hoverRefold: false, refoldRadius: 140, refoldAngle: 45, fontSize: 80, fontWeight: 800,
      color: 'currentColor', className: ''
    }, options || {});
    const gsap = global.gsap;
    const safeHinge = HINGES[o.hinge] ? o.hinge : 'top';
    const hingeConfig = HINGES[safeHinge];
    const safeStyle = FOLD_STYLES.includes(o.foldStyle) ? o.foldStyle : 'paper';
    const safeCrease = clamp(o.creaseShading, 0, 1);
    const safeAngle = clamp(o.foldAngle, 0, 180);
    const safeStagger = Math.max(0, o.stagger);
    const safeDelay = Math.max(0, o.loopDelay);
    const safeRadius = Math.max(1, o.refoldRadius);
    const safeRefold = clamp(o.refoldAngle, 0, 180);
    const startsFolded = o.trigger !== 'hover';

    /* ---------- root element (same markup as the React component) ---------- */
    root.classList.add('fold-text');
    if (o.className) o.className.split(/\s+/).filter(Boolean).forEach(c => root.classList.add(c));
    if (o.fontSize != null) root.style.setProperty('--fold-text-font-size', typeof o.fontSize === 'number' ? `${o.fontSize}px` : o.fontSize);
    if (o.fontWeight != null) root.style.setProperty('--fold-text-font-weight', o.fontWeight);
    root.style.setProperty('--fold-text-color', o.color);
    root.style.setProperty('--fold-perspective', `${Math.max(120, o.perspective)}px`);
    root.textContent = '';
    const sr = document.createElement('span'); sr.className = 'fold-text-sr-only';
    const visual = document.createElement('span'); visual.className = 'fold-text-visual'; visual.setAttribute('aria-hidden', 'true');
    root.append(sr, visual);

    const make = (cls, text) => { const s = document.createElement('span'); if (cls) s.className = cls; if (text != null) s.textContent = text; return s; };
    const renderPiece = (content, isLine) => {
      const seg = make('fold-text-segment');
      if (isLine) seg.dataset.foldSplit = 'line';
      const piece = make('fold-text-piece');
      piece.dataset.foldHinge = safeHinge;
      piece.dataset.foldStyle = safeStyle;
      if (startsFolded) piece.style.opacity = '0';
      if (safeStyle === 'blinds') {
        const a = make('fold-text-slat', content); a.dataset.foldText = content;
        const b = make('fold-text-slat', content); b.dataset.foldSlat = 'b'; b.dataset.foldText = content;
        piece.append(a, b);
      } else {
        piece.dataset.foldText = content;
        piece.textContent = content;
      }
      seg.appendChild(piece);
      return seg;
    };
    const buildSegments = text => {
      visual.textContent = '';
      sr.textContent = text;
      if (o.splitBy === 'line') {
        text.split('\n').forEach(line => visual.appendChild(renderPiece(line || ' ', true)));
        return;
      }
      text.split(/(\s+)/).forEach(part => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          part.split('\n').forEach((spaces, lineIndex) => {
            if (lineIndex > 0) visual.appendChild(document.createElement('br'));
            if (spaces) visual.appendChild(document.createTextNode(spaces));
          });
          return;
        }
        if (o.splitBy === 'word') { visual.appendChild(renderPiece(part)); return; }
        const word = make('fold-text-word');
        Array.from(part).forEach(ch => word.appendChild(renderPiece(ch)));
        visual.appendChild(word);
      });
    };

    /* ---------- animation (verbatim logic from the React effect) ---------- */
    const reduceMotion = !!(global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    const { axis, sign, origin } = hingeConfig;
    const slats = SLATS[axis];
    const unfoldEase = gsap.parseEase(reduceMotion ? 'power1.out' : o.ease) || gsap.parseEase('power3.out');
    const foldEase = gsap.parseEase(reduceMotion ? 'power1.in' : 'power2.in');
    const angle = reduceMotion ? 0 : safeStyle === 'flip' ? 180 : safeAngle;
    const crease = reduceMotion ? 0 : safeCrease;
    const refold = o.hoverRefold && !reduceMotion ? safeRefold : 0;
    const lift = safeStyle === 'flip' && !reduceMotion ? 0.45 : 0;
    const unfoldDuration = reduceMotion ? Math.min(o.duration, 0.22) : o.duration;
    const staggerVars = { each: reduceMotion ? Math.min(safeStagger, 0.02) : safeStagger, from: o.staggerFrom };
    const shade = (progress, tilt) => String(crease * clamp(1 - progress + tilt / 90, 0, 1));

    let pieces = [];
    let pointer = null, centers = null, measured = null, relaxing = false;
    const collect = () => {
      pieces = Array.from(root.querySelectorAll('.fold-text-piece')).map(element => {
        const parts = safeStyle === 'blinds' ? Array.from(element.children) : [element];
        if (safeStyle === 'blinds') {
          element.style.opacity = '1';
          parts.forEach((part, index) => { part.style.transformOrigin = slats.origins[index]; if (index > 0) part.style.clipPath = slats.clips[index]; });
        } else {
          element.style.transformOrigin = safeStyle === 'flip' ? '50% 50%' : origin;
          element.style.backfaceVisibility = safeStyle === 'flip' ? 'visible' : '';
        }
        return { element, parts, t: startsFolded ? 0 : 1, f: 0, r: 0, aim: 0 };
      });
      centers = null;
    };

    const render = () => {
      pieces.forEach(piece => {
        const tilt = piece.r * refold;
        if (safeStyle === 'blinds') {
          let resting = tilt < 0.05;
          piece.parts.forEach((part, index) => {
            const offset = index * SLAT_DELAY;
            const open = unfoldEase(clamp((piece.t - offset) / (1 - SLAT_DELAY), 0, 1));
            const close = foldEase(clamp((piece.f - offset) / (1 - SLAT_DELAY), 0, 1));
            const progress = open * (1 - close);
            if (Math.abs(1 - progress) > 0.002) resting = false;
            part.style.transform = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`;
            part.style.opacity = String(clamp(progress, 0, 1));
            part.style.setProperty('--fold-crease', shade(progress, tilt));
          });
          piece.parts[0].style.clipPath = resting ? 'none' : slats.clips[0];
          piece.parts[1].style.visibility = resting ? 'hidden' : 'visible';
          return;
        }
        const progress = unfoldEase(piece.t) * (1 - foldEase(piece.f));
        const rise = lift * Math.sin(Math.PI * clamp(progress, 0, 1));
        const turn = `${axis}(${sign * ((1 - progress) * angle + tilt)}deg)`;
        piece.element.style.transform = rise > 0.001 ? `translateZ(${rise}em) ${turn}` : turn;
        piece.element.style.opacity = String(clamp(progress, 0, 1));
        piece.element.style.setProperty('--fold-crease', shade(progress, tilt));
      });
    };

    let timeline = null;
    const play = loop => {
      timeline && timeline.kill();
      timeline = gsap.timeline({ onUpdate: render, ...(loop ? { repeat: -1, repeatDelay: 0.35 } : {}) });
      timeline.fromTo(pieces, { t: 0, f: 0 }, { t: 1, duration: unfoldDuration, ease: 'none', stagger: staggerVars });
      if (loop) timeline.to(pieces, { f: 1, duration: unfoldDuration * 0.75, ease: 'none', stagger: staggerVars }, `+=${safeDelay}`);
      render();
    };
    const handleEnter = () => play(false);

    buildSegments(o.text);
    collect();
    if (o.trigger === 'hover') {
      render();
      root.addEventListener('mouseenter', handleEnter);
    } else if (o.trigger === 'scroll' && global.ScrollTrigger) {
      render();
      global.ScrollTrigger.create({ trigger: root, start: 'top 82%', once: true, onEnter: handleEnter });
    } else {
      play(o.trigger === 'loop');
    }

    /* ---------- hover re-fold (verbatim) ---------- */
    const measure = box => {
      centers = pieces.map(piece => {
        const rect = piece.element.parentElement.getBoundingClientRect();
        return { x: rect.left - box.left + rect.width / 2, y: rect.top - box.top + rect.height / 2 };
      });
      measured = { width: box.width, height: box.height };
    };
    const relax = (time, deltaTime) => {
      const step = Math.min(deltaTime, 64) / 1000;
      let moving = false;
      pieces.forEach(piece => {
        const rate = piece.aim > piece.r ? 14 : 6;
        piece.r += (piece.aim - piece.r) * (1 - Math.exp(-rate * step));
        if (Math.abs(piece.aim - piece.r) > 0.001) moving = true; else piece.r = piece.aim;
      });
      render();
      if (!moving) { gsap.ticker.remove(relax); relaxing = false; }
    };
    const aim = () => {
      const box = root.getBoundingClientRect();
      const near = pointer && pointer.x > box.left - safeRadius && pointer.x < box.right + safeRadius &&
        pointer.y > box.top - safeRadius && pointer.y < box.bottom + safeRadius;
      if (near && (!centers || Math.abs(box.width - measured.width) + Math.abs(box.height - measured.height) > 1)) measure(box);
      let changed = false;
      pieces.forEach((piece, index) => {
        let value = 0;
        if (near && centers && centers[index]) {
          const center = centers[index];
          const distance = Math.hypot(box.left + center.x - pointer.x, box.top + center.y - pointer.y) / safeRadius;
          if (distance < 1) value = 1 - distance * distance * (3 - 2 * distance);
        }
        if (value !== piece.aim) changed = true;
        piece.aim = value;
      });
      if (changed && !relaxing) { relaxing = true; gsap.ticker.add(relax); }
    };
    if (refold) {
      addEventListener('pointermove', e => { pointer = { x: e.clientX, y: e.clientY }; aim(); }, { passive: true });
      addEventListener('scroll', () => { if (pointer) aim(); }, { passive: true, capture: true });
      document.documentElement.addEventListener('pointerleave', () => { pointer = null; aim(); });
    }

    /* ---------- site extra: swap the text with a fold-out / fold-in ---------- */
    let pendingText = null, swapping = false;
    const setText = text => {
      if (text === sr.textContent && !swapping) return;
      pendingText = text;
      if (swapping) return;
      swapping = true;
      timeline && timeline.kill();
      const out = gsap.timeline({ onUpdate: render });
      out.to(pieces, { f: 1, duration: unfoldDuration * 0.6, ease: 'none', stagger: { each: staggerVars.each * 0.6, from: staggerVars.from } });
      out.eventCallback('onComplete', () => {
        const next = pendingText; pendingText = null;
        buildSegments(next);
        collect();
        swapping = false;
        play(false);
        if (pendingText !== null && pendingText !== next) setText(pendingText);
      });
    };

    return { setText, replay: () => play(false) };
  }

  global.FoldText = FoldText;
})(window);
