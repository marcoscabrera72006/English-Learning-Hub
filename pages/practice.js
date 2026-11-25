/* ==========================================================================
   practice.js — Práctica
   Sesiones rápidas, repaso de errores, verbos irregulares y sesiones a medida
   con los 8 tipos de ejercicio y 3 niveles.
   ========================================================================== */

(function () {
  const { escapeHtml, plural, percent } = ELH.core.utils;
  const icon = ELH.core.icon;
  const bank = ELH.core.exercises;

  const COUNTS = [5, 10, 20];
  const custom = {
    types: Object.keys(bank.TYPES),
    level: 'all',
    tense: 'all',
    studiedOnly: false,
    count: 10,
  };

  function quickOptions() {
    const studied = bank.studiedTenseIds();
    return studied.length
      ? { level: 'all', studiedOnly: true, count: 10 }
      : { level: 'beginner', studiedOnly: false, count: 10 };
  }

  function typeCounts() {
    const counts = {};
    Object.keys(bank.TYPES).forEach((type) => {
      counts[type] = bank.countAvailable({ ...custom, types: [type] });
    });
    return counts;
  }

  function homeHtml() {
    const state = ELH.store.get();
    const studied = bank.studiedTenseIds();
    const review = bank.reviewItems();
    const accuracy = percent(state.exercises.correct, state.exercises.attempts);
    const available = bank.countAvailable(custom);
    const counts = typeCounts();
    const studiedNames = studied.map((id) => bank.tenseById(id)?.name).filter(Boolean);

    return `
      <header class="page-header">
        <div>
          <h1>Práctica</h1>
          <p class="page-lead">Ejercicios corregidos al momento. Después de cada respuesta verás la solución, por qué es así y qué te ha fallado.</p>
        </div>
        ${state.exercises.attempts ? `<p class="page-header-meta">${plural(state.exercises.attempts, 'respuesta', 'respuestas')}, ${accuracy}% de aciertos</p>` : ''}
      </header>

      <section class="grid grid-3 practice-quick" aria-label="Empezar rápido">
        <button type="button" class="card card-link practice-option is-primary" data-start="quick">
          <span class="card-icon">${icon('zap')}</span>
          <span class="practice-option-title">Práctica rápida</span>
          <span class="practice-option-text">${studied.length
            ? `10 preguntas de lo que has estudiado (${escapeHtml(studiedNames.join(', '))}), con prioridad para lo que fallas.`
            : '10 preguntas de nivel principiante. Cuando completes lecciones, se centrará en ellas.'}</span>
        </button>
        <button type="button" class="card card-link practice-option" data-start="review" ${review.length ? '' : 'disabled'}>
          <span class="card-icon">${icon('refresh')}</span>
          <span class="practice-option-title">Repasar mis errores ${review.length ? `<span class="badge badge-danger">${review.length}</span>` : ''}</span>
          <span class="practice-option-text">${review.length
            ? 'Las preguntas que fallaste y todavía no has vuelto a acertar.'
            : 'No tienes errores pendientes. Cuando falles una pregunta, aparecerá aquí.'}</span>
        </button>
        <button type="button" class="card card-link practice-option" data-start="irregular">
          <span class="card-icon">${icon('layers')}</span>
          <span class="practice-option-title">Verbos irregulares</span>
          <span class="practice-option-text">10 preguntas del pasado y el participio de los 82 verbos. Salen más los que fallas.</span>
        </button>
      </section>

      <section class="section" aria-labelledby="custom-title">
        <div class="section-title">
          <h2 id="custom-title">Crea tu sesión</h2>
        </div>
        <form class="card practice-custom" data-custom novalidate>
          <fieldset class="setup-group">
            <legend class="field-label">Tipos de ejercicio</legend>
            <div class="type-grid">
              ${Object.entries(bank.TYPES).map(([id, type]) => `
                <label class="type-card ${counts[id] ? '' : 'is-empty'}">
                  <input type="checkbox" name="types" value="${id}" ${custom.types.includes(id) ? 'checked' : ''}>
                  <span class="type-card-icon">${icon(type.icon, { size: 20 })}</span>
                  <span class="type-card-body">
                    <span class="type-card-title">${escapeHtml(type.label)}</span>
                    <span class="type-card-text">${escapeHtml(type.description)}</span>
                  </span>
                  <span class="type-card-count" title="Ejercicios disponibles con los filtros actuales">${counts[id]}</span>
                </label>`).join('')}
            </div>
            <div class="row type-grid-actions">
              <button type="button" class="btn btn-ghost btn-sm" data-action="all-types">Marcar todos</button>
              <button type="button" class="btn btn-ghost btn-sm" data-action="no-types">Desmarcar todos</button>
            </div>
          </fieldset>

          <div class="practice-filters">
            <div class="field">
              <span class="field-label" id="level-label">Nivel</span>
              <div class="segmented" role="radiogroup" aria-labelledby="level-label">
                ${[['all', 'Todos'], ...Object.entries(bank.LEVELS)].map(([id, label]) => `<label class="segmented-radio"><input type="radio" name="level" value="${id}" ${custom.level === id ? 'checked' : ''}><span>${label}</span></label>`).join('')}
              </div>
            </div>
            <label class="field">
              <span class="field-label">Tiempo verbal</span>
              <select class="select" name="tense">
                <option value="all" ${custom.tense === 'all' ? 'selected' : ''}>Todos los tiempos verbales</option>
                ${ELH.data.tenses.map((tense) => `<option value="${tense.id}" ${custom.tense === tense.id ? 'selected' : ''}>${escapeHtml(tense.name)}</option>`).join('')}
              </select>
            </label>
            <div class="field">
              <span class="field-label" id="count-label">Preguntas</span>
              <div class="segmented" role="radiogroup" aria-labelledby="count-label">
                ${COUNTS.map((count) => `<label class="segmented-radio"><input type="radio" name="count" value="${count}" ${custom.count === count ? 'checked' : ''}><span>${count}</span></label>`).join('')}
              </div>
            </div>
            <label class="switch">
              <input type="checkbox" name="studiedOnly" ${custom.studiedOnly ? 'checked' : ''} ${studied.length ? '' : 'disabled'}>
              <span class="switch-text">Solo lecciones que he estudiado${studied.length ? '' : ' <span class="subtle">(todavía ninguna)</span>'}</span>
            </label>
          </div>

          <div class="setup-footer">
            <p class="muted" aria-live="polite">${available
              ? `${plural(available, 'ejercicio disponible', 'ejercicios disponibles')} con estos filtros.`
              : 'No hay ejercicios con estos filtros. Prueba a marcar más tipos o a cambiar el nivel.'}</p>
            <button type="submit" class="btn btn-primary btn-lg" ${available ? '' : 'disabled'}>${icon('play', { size: 18 })} Empezar (${Math.min(custom.count, available)})</button>
          </div>
        </form>
      </section>

      <section class="section card practice-how" aria-labelledby="how-title">
        <h2 class="card-title" id="how-title">Cómo se eligen las preguntas</h2>
        <ul class="how-list">
          <li>${icon('sparkles', { size: 18 })}<span>Salen antes las preguntas que <strong>nunca has hecho</strong> y las que <strong>fallaste la última vez</strong>.</span></li>
          <li>${icon('checkCircle', { size: 18 })}<span>Las que ya has acertado varias veces aparecen menos.</span></li>
          <li>${icon('layers', { size: 18 })}<span>En los verbos irregulares, salen más los verbos que fallas. Con el nivel Todos, la dificultad depende de lo bien que conozcas cada verbo.</span></li>
          <li>${icon('flag', { size: 18 })}<span>Cada error se guarda en <a href="#/progress">Mi progreso</a> para que sepas qué tienes que repasar.</span></li>
        </ul>
      </section>`;
  }

  function render({ el, query }) {
    let runner = null;

    function clearQuery() {
      if (window.location.hash !== '#/practice') history.replaceState(null, '', '#/practice');
    }

    function showHome() {
      if (runner) runner.destroy();
      runner = null;
      clearQuery();
      el.innerHTML = homeHtml();
    }

    function start(items, title, makeMore) {
      if (!items.length) {
        ELH.toast('No hay ejercicios disponibles con esta selección.', { type: 'error' });
        return;
      }
      if (runner) runner.destroy();
      el.innerHTML = `
        <nav class="breadcrumb" aria-label="Estás aquí">
          <a href="#/practice" data-action="home">Práctica</a>${icon('chevronRight', { size: 14 })}<span aria-current="page">${escapeHtml(title)}</span>
        </nav>
        <div class="practice-session-head">
          <h1>${escapeHtml(title)}</h1>
          <button type="button" class="btn btn-ghost btn-sm" data-action="home">${icon('x', { size: 16 })} Terminar</button>
        </div>
        <div data-runner></div>`;
      runner = ELH.exerciseRunner.mount(el.querySelector('[data-runner]'), {
        items,
        title,
        route: '#/practice',
        exitLabel: 'Volver a Práctica',
        onExit: showHome,
        onRestart: makeMore,
      });
      window.scrollTo({ top: 0 });
    }

    const sessions = {
      quick: () => {
        const make = () => bank.pickSession(quickOptions());
        start(make(), 'Práctica rápida', make);
      },
      review: () => {
        const make = () => bank.reviewItems();
        start(make(), 'Repaso de errores', null);
      },
      irregular: () => {
        const make = () => bank.pickSession({ types: ['irregular'], level: 'all', tense: 'all', count: 10 });
        start(make(), 'Verbos irregulares', make);
      },
      custom: () => {
        const options = { ...custom, types: custom.types.slice() };
        const make = () => bank.pickSession(options);
        start(make(), 'Sesión personalizada', make);
      },
    };

    function readForm(form) {
      const data = new FormData(form);
      custom.types = data.getAll('types');
      custom.level = data.get('level') || 'all';
      custom.tense = data.get('tense') || 'all';
      custom.count = Number(data.get('count')) || 10;
      custom.studiedOnly = data.get('studiedOnly') === 'on';
    }

    function refreshHome() {
      const scroll = window.scrollY;
      const focusName = document.activeElement?.name;
      const focusValue = document.activeElement?.value;
      el.innerHTML = homeHtml();
      window.scrollTo({ top: scroll });
      if (focusName) {
        const target = Array.from(el.querySelectorAll(`[name="${focusName}"]`)).find((input) => input.value === focusValue || input.tagName === 'SELECT');
        if (target) target.focus({ preventScroll: true });
      }
    }

    function onClick(event) {
      const startButton = event.target.closest('[data-start]');
      if (startButton && !startButton.disabled) {
        sessions[startButton.dataset.start]();
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'home') {
        event.preventDefault();
        showHome();
      }
      if (action === 'all-types' || action === 'no-types') {
        custom.types = action === 'all-types' ? Object.keys(bank.TYPES) : [];
        refreshHome();
      }
    }

    function onChange(event) {
      const form = event.target.closest('[data-custom]');
      if (!form) return;
      readForm(form);
      refreshHome();
    }

    function onSubmit(event) {
      if (!event.target.matches('[data-custom]')) return;
      event.preventDefault();
      readForm(event.target);
      if (!custom.types.length) {
        ELH.toast('Marca al menos un tipo de ejercicio.', { type: 'error' });
        return;
      }
      sessions.custom();
    }

    el.addEventListener('click', onClick);
    el.addEventListener('change', onChange);
    el.addEventListener('submit', onSubmit);

    if (query.quick) sessions.quick();
    else if (query.irregular) sessions.irregular();
    else if (query.review && bank.reviewItems().length) sessions.review();
    else showHome();

    return () => {
      if (runner) runner.destroy();
      el.removeEventListener('click', onClick);
      el.removeEventListener('change', onChange);
      el.removeEventListener('submit', onSubmit);
    };
  }

  ELH.pages.practice = { title: 'Práctica', render };
})();
