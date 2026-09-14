const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// auto-stagger sourozenců
document.querySelectorAll('.board, .pgrid, .steps, .team, .stats').forEach(parent => {
  [...parent.children].forEach((el, i) => el.style.setProperty('--d', (i % 6) * 0.09 + 's'));
});

// scroll reveal
const io = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.matches('.stats')) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.rv, .ri').forEach(el => io.observe(el));

// count-up statistik
function countUp(scope) {
  scope.querySelectorAll('.cnt').forEach(el => {
    const target = +el.dataset.n;
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 1600;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

// filtr projektů (stránka Projekty)
const btns = document.querySelectorAll('.filter button');
btns.forEach(b => b.addEventListener('click', () => {
  btns.forEach(x => x.classList.remove('on'));
  b.classList.add('on');
  const f = b.dataset.f;
  document.querySelectorAll('.pi').forEach(p => {
    p.classList.toggle('hide', f !== 'all' && p.dataset.c !== f);
  });
}));
// předvolba filtru z URL (#rodinne / #rekreacni / #obcanska)
if (btns.length && location.hash) {
  const btn = document.querySelector(`.filter button[data-f="${location.hash.slice(1)}"]`);
  if (btn) btn.click();
}

// před / po slider
document.querySelectorAll('.ba-wrap').forEach(w => {
  w.querySelector('input').addEventListener('input', e => {
    w.style.setProperty('--p', e.target.value + '%');
  });
});

// mobilní menu
const burger = document.querySelector('.burger');
if (burger) burger.addEventListener('click', () => {
  document.body.classList.toggle('nav-open');
  document.querySelector('.mobile-nav').classList.toggle('open');
});
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', () => {
  document.body.classList.remove('nav-open');
  document.querySelector('.mobile-nav').classList.remove('open');
}));

// skrývání headeru při scrollu dolů
let lastY = 0, ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    document.querySelector('header').classList.toggle('hidden', y > 500 && y > lastY);
    lastY = y;
    ticking = false;
  });
}, { passive: true });

// akordeon (Služby) — otevřená vždy jen jedna položka
document.querySelectorAll('.acc-item > button').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.parentElement;
    const wasOpen = item.classList.contains('open');
    item.parentElement.querySelectorAll('.acc-item').forEach(i => {
      i.classList.remove('open');
      i.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) { item.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
});

// filtr reaguje i na změnu hashe (dropdown → projekty.html#kategorie)
addEventListener('hashchange', () => {
  const btn = document.querySelector(`.filter button[data-f="${location.hash.slice(1)}"]`);
  if (btn) btn.click();
});

// ====== dynamická galerie (Projekty) ======
const grid = document.getElementById('pgrid');
if (grid && typeof pkmLoad === 'function') {
  const items = pkmLoad();

  // přepočítá šířky dlaždic tak, aby viditelné fotky vždy tvořily plné řádky
  function reflow() {
    const vis = [...grid.querySelectorAll('.pi:not(.hide)')];
    let n = vis.length, idx = 0, alt = 0;
    const put = (spans) => spans.forEach(s => {
      const el = vis[idx++];
      el.classList.remove('w4','w5','w6','w7','w12');
      el.classList.add('w' + s);
    });
    while (n > 0) {
      if (n === 1) { put([12]); n = 0; }
      else if (n === 2) { put([6, 6]); n = 0; }
      else if (n === 3) { put([4, 4, 4]); n = 0; }
      else if (alt % 2 === 0) { put(alt % 4 === 0 ? [7, 5] : [5, 7]); n -= 2; alt++; }
      else { put([4, 4, 4]); n -= 3; alt++; }
    }
  }

  let html = '';
  items.forEach((p, i) => {
    // slider "před/po" jako pevná druhá dlaždice
    if (i === 1) html += `
      <figure class="pi w5 ri ba" data-c="rodinne">
        <span class="tag">Realizace</span>
        <div class="ba-wrap">
          <img src="img/g-rek-po.jpg?v=4" alt="Rodinný dům po rekonstrukci" loading="lazy" />
          <div class="ba-top"><img src="img/g-rek-pred.jpg?v=4" alt="Rodinný dům před rekonstrukcí" loading="lazy" /></div>
          <div class="ba-line"></div>
          <span class="ba-lbl pred">Před</span>
          <span class="ba-lbl po-l">Po</span>
          <input type="range" min="2" max="98" value="50" aria-label="Porovnání před a po rekonstrukci" />
        </div>
        <figcaption class="cap">Rekonstrukce RD — přetáhněte</figcaption>
      </figure>`;
    const src = p.img.startsWith('data:') ? p.img : p.img + '?v=4';
    html += `
      <figure class="pi w4 ri" data-c="${p.cat}" data-i="${i}">
        <span class="tag${p.tag === 'Vizualizace' ? ' viz' : ''}">${p.tag}</span>
        <img src="${src}" alt="${p.title}" loading="lazy" />
        ${p.bp ? `<img class="bp" src="${p.bp}?v=4" alt="" loading="lazy" /><span class="bp-hint">Výkres ↔ dům</span>` : ''}
        <figcaption class="cap">${p.title}</figcaption>
      </figure>`;
  });
  grid.innerHTML = html;

  // reveal + stagger pro nově vytvořené prvky
  [...grid.children].forEach((el, i) => { el.style.setProperty('--d', (i % 6) * 0.09 + 's'); io.observe(el); });

  // filtr znovu napojit (tlačítka už existují) + přepočet rozložení
  document.querySelectorAll('.filter button').forEach(b => b.addEventListener('click', () => {
    const f = b.dataset.f;
    grid.querySelectorAll('.pi').forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.c !== f));
    reflow();
  }));

  // slider
  grid.querySelectorAll('.ba-wrap').forEach(w => {
    w.querySelector('input').addEventListener('input', e => w.style.setProperty('--p', e.target.value + '%'));
  });

  // znovu aplikovat filtr předvolený z URL (grid vznikl až teď)
  const preset = document.querySelector('.filter button.on');
  if (preset && preset.dataset.f !== 'all') {
    grid.querySelectorAll('.pi').forEach(p => p.classList.toggle('hide', p.dataset.c !== preset.dataset.f));
  }
  reflow();

  // ====== lightbox ======
  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('img');
  let cur = 0;
  const visible = () => [...grid.querySelectorAll('.pi[data-i]:not(.hide)')];

  function openLb(i) {
    const p = items[i];
    if (!p) return;
    cur = i;
    lbImg.src = p.img.startsWith('data:') ? p.img : p.img;
    lbImg.alt = p.title;
    lb.querySelector('.lb-meta').textContent = `${p.tag} · ${CAT_LABELS[p.cat] || ''}`;
    lb.querySelector('h3').textContent = p.title;
    lb.querySelector('p').textContent = p.desc || '';
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() { lb.classList.remove('open'); document.body.style.overflow = ''; }
  function stepLb(dir) {
    const vis = visible().map(el => +el.dataset.i);
    if (!vis.length) return;
    const pos = vis.indexOf(cur);
    openLb(vis[(pos + dir + vis.length) % vis.length]);
  }

  grid.querySelectorAll('.pi[data-i]').forEach(el => el.addEventListener('click', () => openLb(+el.dataset.i)));
  lb.querySelector('.lb-x').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', () => stepLb(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => stepLb(1));
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });
}

// ====== přepisy z administrace (DEMO — localStorage) ======
try {
  const teamData = JSON.parse(localStorage.getItem('pkm_team_v1'));
  if (teamData) document.querySelectorAll('.team .member').forEach((m, i) => {
    const t = teamData[i]; if (!t) return;
    const h3 = m.querySelector('h3'); if (h3) h3.textContent = t.name;
    const role = m.querySelector('.role'); if (role) role.textContent = t.role;
    if (t.photo) {
      const ph = m.querySelector('.ph');
      if (ph) ph.innerHTML = `<img src="${t.photo}" alt="${t.name}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover" />`;
    }
  });
  const c = JSON.parse(localStorage.getItem('pkm_contact_v1'));
  if (c) {
    const set = (k, fn) => document.querySelectorAll(`[data-pkm="${k}"]`).forEach(fn);
    if (c.tel) set('tel', el => { el.textContent = c.tel; if (el.tagName === 'A') el.href = 'tel:+420' + c.tel.replace(/\s/g, ''); });
    if (c.email) set('email', el => { el.textContent = c.email; if (el.tagName === 'A') el.href = 'mailto:' + c.email; });
    if (c.adresa) set('adresa', el => el.textContent = c.adresa);
    if (c.ico) set('ico', el => el.textContent = c.ico);
    if (c.fb) set('fb', el => { if (el.tagName === 'A') el.href = c.fb; });
  }
} catch (e) {}
