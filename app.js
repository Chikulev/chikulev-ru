/* ==========================================================================
   chikulev.ru — Quiet Tactile Interactions (Zero Dependencies)
   ========================================================================== */

(() => {
  'use strict';

  const root = document.documentElement;

  /* 1. Day / Night Paper Theme */
  function getInitialTheme() {
    try {
      const s = localStorage.getItem('chikulev_paper_theme');
      if (s === 'dark' || s === 'light') return s;
    } catch (_) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('chikulev_paper_theme', theme); } catch (_) {}
    document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
      btn.textContent = theme === 'dark' ? 'День' : 'Ночь';
      btn.setAttribute('aria-label', theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему');
    });
  }

  applyTheme(getInitialTheme());

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-theme-toggle]')) {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
  });

  /* 2. Quiet Inline Copy */
  async function copyQuietly(text, triggerEl) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        throw new Error('fallback');
      }
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (__) {}
      ta.remove();
    }

    if (triggerEl.classList.contains('inline-copy')) {
      triggerEl.classList.add('is-copied');
      setTimeout(() => triggerEl.classList.remove('is-copied'), 1600);
    } else {
      const prev = triggerEl.textContent;
      triggerEl.textContent = 'скопировано';
      setTimeout(() => { triggerEl.textContent = prev; }, 1500);
    }
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-copy]');
    if (!el) return;
    e.preventDefault();
    copyQuietly(el.getAttribute('data-copy'), el);
  });

  /* 3. Index Row Expand + Cursor-Following Hover Preview */
  let previewEl = null;
  let previewImg = null;
  const supportsHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function ensurePreview() {
    if (previewEl) return;
    previewEl = document.createElement('div');
    previewEl.className = 'hover-preview';
    previewEl.setAttribute('aria-hidden', 'true');
    previewImg = document.createElement('img');
    previewImg.alt = '';
    previewEl.appendChild(previewImg);
    document.body.appendChild(previewEl);
  }

  if (supportsHover) {
    document.addEventListener('pointermove', (e) => {
      if (!previewEl || !previewEl.classList.contains('is-visible')) return;
      const x = Math.min(window.innerWidth - 280, e.clientX + 22);
      const y = Math.min(window.innerHeight - 190, Math.max(16, e.clientY - 76));
      previewEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1)`;
    });

    document.addEventListener('pointerover', (e) => {
      const trigger = e.target.closest('[data-preview]');
      if (!trigger) return;
      const row = trigger.closest('.index-row');
      if (row && row.classList.contains('is-open')) return;
      ensurePreview();
      previewImg.src = trigger.getAttribute('data-preview');
      previewEl.classList.add('is-visible');
    });

    document.addEventListener('pointerout', (e) => {
      const trigger = e.target.closest('[data-preview]');
      if (!trigger || !previewEl) return;
      if (!trigger.contains(e.relatedTarget)) {
        previewEl.classList.remove('is-visible');
      }
    });
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-index-toggle]');
    if (!trigger) return;
    const row = trigger.closest('.index-row');
    if (!row) return;
    const wasOpen = row.classList.contains('is-open');
    const list = row.parentElement;
    if (list) {
      list.querySelectorAll('.index-row.is-open').forEach((r) => {
        if (r !== row) r.classList.remove('is-open');
      });
    }
    row.classList.toggle('is-open', !wasOpen);
    trigger.setAttribute('aria-expanded', String(!wasOpen));
    if (previewEl) previewEl.classList.remove('is-visible');
  });

  /* 4. Skvorling Interactive Micro-Demo */
  let skvorlingOn = true;
  document.addEventListener('click', (e) => {
    const toggleBtn = e.target.closest('[data-skvorling-toggle]');
    if (toggleBtn) {
      skvorlingOn = !skvorlingOn;
      toggleBtn.textContent = skvorlingOn ? 'Скворлинг: вкл' : 'Скворлинг: выкл';
      document.querySelectorAll('[data-sk-word]').forEach((el) => {
        const label = el.querySelector('.sk-label');
        if (label) label.textContent = skvorlingOn ? el.getAttribute('data-en') : el.getAttribute('data-ru');
        el.classList.toggle('is-off', !skvorlingOn);
        el.classList.remove('is-active');
      });
      return;
    }

    const word = e.target.closest('[data-sk-word]');
    if (word && !word.classList.contains('is-off')) {
      const wasActive = word.classList.contains('is-active');
      document.querySelectorAll('[data-sk-word].is-active').forEach((w) => w.classList.remove('is-active'));
      if (!wasActive) word.classList.add('is-active');
    } else {
      document.querySelectorAll('[data-sk-word].is-active').forEach((w) => w.classList.remove('is-active'));
    }
  });

  /* 5. Lightbox */
  let lbItems = [];
  let lbIndex = 0;

  function ensureLightbox() {
    let el = document.getElementById('site-lightbox');
    if (el) return el;
    el = document.createElement('div');
    el.id = 'site-lightbox';
    el.className = 'lightbox';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `
      <div class="lb-top">
        <span class="mono" id="lb-counter">1 / 1</span>
        <div class="lb-controls">
          <button type="button" class="lb-btn" id="lb-prev" aria-label="Предыдущее">← Назад</button>
          <button type="button" class="lb-btn" id="lb-next" aria-label="Следующее">Вперёд →</button>
          <button type="button" class="lb-btn" id="lb-close" aria-label="Закрыть">Закрыть</button>
        </div>
      </div>
      <img id="lb-img" class="lb-img" alt="">
      <p id="lb-cap" class="lb-cap"></p>
    `;
    document.body.appendChild(el);
    el.addEventListener('click', (e) => { if (e.target === el) closeLightbox(); });
    el.querySelector('#lb-close').addEventListener('click', closeLightbox);
    el.querySelector('#lb-prev').addEventListener('click', () => stepLightbox(-1));
    el.querySelector('#lb-next').addEventListener('click', () => stepLightbox(1));
    return el;
  }

  function renderLightbox() {
    const el = ensureLightbox();
    const item = lbItems[lbIndex];
    if (!item) return;
    el.querySelector('#lb-img').src = item.src;
    el.querySelector('#lb-img').alt = item.caption || '';
    el.querySelector('#lb-cap').textContent = item.caption || '';
    el.querySelector('#lb-counter').textContent = `${lbIndex + 1} / ${lbItems.length}`;
    el.querySelector('#lb-prev').style.display = lbItems.length > 1 ? '' : 'none';
    el.querySelector('#lb-next').style.display = lbItems.length > 1 ? '' : 'none';
  }

  function openLightbox(trigger) {
    const group = trigger.getAttribute('data-lb-group') || 'default';
    const all = Array.from(document.querySelectorAll(`[data-lightbox][data-lb-group="${group}"]`));
    lbItems = all.map((n) => ({
      src: n.getAttribute('data-lightbox'),
      caption: n.getAttribute('data-lb-caption') || n.querySelector('img')?.alt || ''
    }));
    lbIndex = Math.max(0, all.indexOf(trigger));
    const el = ensureLightbox();
    renderLightbox();
    el.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function stepLightbox(d) {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + d + lbItems.length) % lbItems.length;
    renderLightbox();
  }

  function closeLightbox() {
    const el = document.getElementById('site-lightbox');
    if (el) el.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-lightbox]');
    if (!t) return;
    e.preventDefault();
    openLightbox(t);
  });

  document.addEventListener('keydown', (e) => {
    const lb = document.getElementById('site-lightbox');
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });

  /* 6. vCard Download */
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-download-vcard]');
    if (!btn) return;
    e.preventDefault();
    const vcf = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:Чикулёв;Дмитрий;;;',
      'FN:Дмитрий Чикулёв',
      'TITLE:Веб-дизайнер и разработчик',
      'TEL;TYPE=CELL:+79117294090',
      'EMAIL;TYPE=PREF,INTERNET:chikulev@mail.ru',
      'EMAIL;TYPE=INTERNET:chikulev@icloud.com',
      'URL:https://chikulev.ru',
      'NOTE:Telegram: https://t.me/chikulev | Санкт-Петербург',
      'END:VCARD'
    ].join('\r\n');
    const blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Dmitry_Chikulev.vcf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
})();
