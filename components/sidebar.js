/* ==========================================================================
   sidebar.js
   Barra de navegación lateral. Los tiempos verbales aparecen solos: cuando
   añades una lección nueva en data/tenses/, también se añade aquí.
   ========================================================================== */

(function () {
  const { escapeHtml, percent } = ELH.core.utils;
  const icon = ELH.core.icon;

  const MAIN_LINKS = [
    { path: '/', label: 'Inicio', icon: 'home' },
    { path: '/grammar', label: 'Gramática', icon: 'book', children: 'tenses' },
    { path: '/verbs', label: 'Verbos irregulares', icon: 'layers', badge: 'due' },
    { path: '/practice', label: 'Práctica', icon: 'target' },
    { path: '/progress', label: 'Mi progreso', icon: 'chart' },
    { path: '/favorites', label: 'Favoritos', icon: 'star' },
  ];

  const FOOTER_LINKS = [
    { path: '/settings', label: 'Ajustes', icon: 'settings' },
    { path: '/about', label: 'Acerca del proyecto', icon: 'info' },
  ];

  function isActive(linkPath, currentPath) {
    if (linkPath === '/') return currentPath === '/';
    return currentPath === linkPath || currentPath.startsWith(`${linkPath}/`);
  }

  function dueVerbCount() {
    return ELH.data.irregularVerbs.filter((verb) => ELH.store.isVerbDue(verb.infinitive)).length;
  }

  function link(item, currentPath) {
    const current = item.path === '/'
      ? currentPath === '/'
      : (item.children ? currentPath === item.path : isActive(item.path, currentPath));
    const due = item.badge === 'due' ? dueVerbCount() : 0;
    return `<a class="nav-link" href="#${item.path}" ${current ? 'aria-current="page"' : ''}>
      ${icon(item.icon)}
      <span>${escapeHtml(item.label)}</span>
      ${due ? `<span class="nav-badge" title="Verbos para repasar hoy">${due}</span>` : ''}
    </a>`;
  }

  function tenseLinks(currentPath) {
    return `<div class="nav-sub">
      ${ELH.data.tenses.map((tense) => {
        const progress = ELH.ui.lessonProgress(tense.id);
        const status = progress.studied ? 'is-done' : progress.started ? 'is-started' : '';
        const statusText = progress.studied ? 'estudiada' : progress.started ? 'empezada' : 'sin empezar';
        const current = isActive(`/grammar/${tense.id}`, currentPath);
        return `<a class="nav-sublink" href="#/grammar/${tense.id}" ${current ? 'aria-current="page"' : ''}>
          <span class="nav-dot ${status}" aria-hidden="true"></span>
          <span>${escapeHtml(tense.name)}</span>
          <span class="sr-only">(${statusText})</span>
        </a>`;
      }).join('')}
    </div>`;
  }

  function render() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    const currentPath = ELH.router.current().path;
    const state = ELH.store.get();
    const goal = state.profile.dailyGoal || 20;
    const today = ELH.store.todayPoints();
    const streak = ELH.store.streak();

    sidebar.innerHTML = `
      <a class="brand" href="#/" aria-label="English Learning Hub, ir al inicio">
        ${ELH.core.logo(38)}
        <span>
          <span class="brand-name">English Learning Hub</span>
          <span class="brand-tagline">${escapeHtml(ELH.data.config.tagline || '')}</span>
        </span>
      </a>
      <nav class="nav-group" aria-label="Secciones">
        ${MAIN_LINKS.map((item) => `${link(item, currentPath)}${item.children === 'tenses' ? tenseLinks(currentPath) : ''}`).join('')}
      </nav>
      <div class="sidebar-footer">
        <nav class="nav-group" aria-label="Configuración">
          ${FOOTER_LINKS.map((item) => link(item, currentPath)).join('')}
        </nav>
        <a class="goal-mini" href="#/progress" aria-label="Objetivo diario: ${today} de ${goal} actividades">
          <div class="goal-mini-top"><span>Objetivo de hoy</span><strong>${Math.min(today, goal)} / ${goal}</strong></div>
          ${ELH.ui.progressBar(percent(today, goal), { size: 'sm', label: 'Objetivo diario' })}
          <div class="goal-mini-streak">${icon('flame', { size: 14 })} ${streak ? `${streak} ${streak === 1 ? 'día seguido' : 'días seguidos'}` : 'Empieza tu racha hoy'}</div>
        </a>
      </div>`;
  }

  function setOpen(open) {
    const app = document.getElementById('app');
    const backdrop = document.getElementById('sidebar-backdrop');
    app.classList.toggle('nav-open', open);
    backdrop.hidden = !open;
    const toggle = document.querySelector('[data-action="toggle-nav"]');
    if (toggle) toggle.setAttribute('aria-expanded', String(open));
    if (open) {
      const firstLink = document.querySelector('#sidebar a');
      if (firstLink) firstLink.focus();
    }
  }

  function init() {
    render();
    window.addEventListener('elh:route', () => {
      render();
      setOpen(false);
    });
    ELH.store.subscribe(ELH.core.utils.debounce(render, 50));
    document.getElementById('sidebar-backdrop').addEventListener('click', () => setOpen(false));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.getElementById('app').classList.contains('nav-open')) setOpen(false);
    });
  }

  ELH.sidebar = { init, render, setOpen };
})();
