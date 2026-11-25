/* ==========================================================================
   ui.js
   Piezas de interfaz pequeñas y reutilizables: barras y anillos de progreso,
   botón de favoritos, estados vacíos y datos compartidos de las lecciones.
   ========================================================================== */

(function () {
  const { escapeHtml, percent } = ELH.core.utils;
  const icon = ELH.core.icon;

  /** Los 8 apartados que tiene cada lección. */
  const LESSON_SECTIONS = [
    { id: 'what', title: '¿Qué es?', icon: 'lightbulb' },
    { id: 'uses', title: '¿Cuándo se utiliza?', icon: 'calendar' },
    { id: 'structure', title: 'Estructura', icon: 'grid' },
    { id: 'examples', title: 'Ejemplos', icon: 'message' },
    { id: 'keywords', title: 'Palabras clave', icon: 'key' },
    { id: 'mistakes', title: 'Errores frecuentes', icon: 'alert' },
    { id: 'comparison', title: 'Comparación', icon: 'swap' },
    { id: 'exercises', title: 'Ejercicios', icon: 'target' },
  ];

  function lessonProgress(tenseId) {
    const lesson = ELH.store.lessonState(tenseId);
    const read = LESSON_SECTIONS.filter((section) => lesson.sections?.[section.id]).length;
    return {
      read,
      total: LESSON_SECTIONS.length,
      percent: percent(read, LESSON_SECTIONS.length),
      studied: Boolean(lesson.studied),
      lastSection: lesson.lastSection || null,
      started: read > 0,
    };
  }

  function progressBar(value, { label = '', success = false, size = '' } = {}) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    return `<div class="progress ${size ? `progress-${size}` : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${safe}" ${label ? `aria-label="${escapeHtml(label)}"` : ''}>
      <div class="progress-bar ${success || safe === 100 ? 'is-success' : ''}" style="width:${safe}%"></div>
    </div>`;
  }

  /** Anillo de progreso (SVG). */
  function ring(value, { size = 104, stroke = 10, label = '', sublabel = '', success = false, ariaLabel = '' } = {}) {
    const safe = Math.max(0, Math.min(100, value));
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - safe / 100);
    return `<div class="ring" style="width:${size}px;height:${size}px" role="img" aria-label="${escapeHtml(ariaLabel || `${Math.round(safe)} %`)}">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
        <circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}"/>
        <circle class="ring-value ${success ? 'is-success' : ''}" cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
      </svg>
      <div class="ring-label"><strong>${escapeHtml(label)}</strong>${sublabel ? `<span>${escapeHtml(sublabel)}</span>` : ''}</div>
    </div>`;
  }

  /** Botón de estrella para guardar en favoritos (verbs | lessons | examples). */
  function favButton(kind, id, { label = 'favoritos', size = 18, className = '' } = {}) {
    const active = ELH.store.isFavorite(kind, id);
    return `<button type="button" class="btn btn-icon btn-sm fav-btn ${className}" data-fav-kind="${kind}" data-fav-id="${escapeHtml(id)}" aria-pressed="${active}" aria-label="${active ? 'Quitar de' : 'Añadir a'} ${escapeHtml(label)}" title="${active ? 'Quitar de favoritos' : 'Añadir a favoritos'}">
      ${icon('star', { size, filled: active })}
    </button>`;
  }

  function updateFavButton(button, active) {
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('title', active ? 'Quitar de favoritos' : 'Añadir a favoritos');
    const label = button.getAttribute('aria-label') || '';
    button.setAttribute('aria-label', label.replace(/^(Quitar de|Añadir a)/, active ? 'Quitar de' : 'Añadir a'));
    const svg = button.querySelector('svg');
    if (svg) svg.classList.toggle('icon-filled', active);
  }

  // Un único listener para todas las estrellas de favoritos
  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-fav-kind]');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const { favKind, favId } = button.dataset;
    const active = ELH.store.toggleFavorite(favKind, favId);
    document.querySelectorAll('[data-fav-kind]').forEach((other) => {
      if (other.dataset.favKind === favKind && other.dataset.favId === favId) updateFavButton(other, active);
    });
    ELH.toast(active ? 'Guardado en favoritos' : 'Quitado de favoritos', { icon: 'star' });
  }, true);

  function emptyState({ iconName = 'info', title, text = '', action = '' }) {
    return `<div class="empty-state">
      ${icon(iconName, { size: 30 })}
      <strong>${escapeHtml(title)}</strong>
      ${text ? `<p>${escapeHtml(text)}</p>` : ''}
      ${action}
    </div>`;
  }

  /** Celda con las variantes de un verbo ("burnt, burned") o la marca de "sin participio". */
  function verbFormHtml(value) {
    if (!value) return '<span class="subtle" title="No tiene participio">----------</span><span class="sr-only">No tiene participio</span>';
    return escapeHtml(value);
  }

  ELH.ui = {
    LESSON_SECTIONS,
    lessonProgress,
    progressBar,
    ring,
    favButton,
    emptyState,
    verbFormHtml,
  };
})();
