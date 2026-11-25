/* ==========================================================================
   verbs.js — Verbos irregulares
   #/verbs             → tabla con buscador, filtros, orden y modo estudio
   #/verbs/flashcards  → tarjetas de estudio con repetición espaciada

   Los verbos salen de data/irregular-verbs.js (82 verbos de la lista).
   ========================================================================== */

(function () {
  const { escapeHtml, normalizeSearch, plural, percent, shuffle, debounce } = ELH.core.utils;
  const icon = ELH.core.icon;
  const grammar = ELH.core.grammar;

  const FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'tolearn', label: 'Por aprender' },
    { id: 'learned', label: 'Aprendidos' },
    { id: 'due', label: 'Para repasar' },
    { id: 'favorites', label: 'Favoritos' },
  ];

  const PATTERNS = [
    { id: 'all', label: 'Todos los tipos' },
    { id: 'AAA', label: 'Tres formas iguales (cut, cut, cut)' },
    { id: 'ABB', label: 'Pasado = participio (buy, bought, bought)' },
    { id: 'ABA', label: 'Infinitivo = participio (come, came, come)' },
    { id: 'ABC', label: 'Tres formas distintas (go, went, gone)' },
    { id: 'variants', label: 'Con dos formas (learnt, learned)' },
    { id: 'special', label: 'Sin participio (can)' },
  ];

  const SORTS = [
    { id: 'list', label: 'Orden de la lista' },
    { id: 'az', label: 'Alfabético (A-Z)' },
    { id: 'za', label: 'Alfabético (Z-A)' },
  ];

  const HIDE_MODES = [
    { id: 'none', label: 'Ver todo' },
    { id: 'forms', label: 'Ocultar pasado y participio' },
    { id: 'meaning', label: 'Ocultar significado' },
  ];

  // Se conserva mientras la pestaña esté abierta
  const view = { q: '', filter: 'all', pattern: 'all', sort: 'list', hide: 'none' };

  function tabsHtml(current) {
    return `<nav class="tabs page-tabs" aria-label="Verbos irregulares">
      <a class="tab" href="#/verbs" ${current === 'list' ? 'aria-current="page"' : ''}>${icon('list', { size: 18 })} Lista de verbos</a>
      <a class="tab" href="#/verbs/flashcards" ${current === 'cards' ? 'aria-current="page"' : ''}>${icon('cards', { size: 18 })} Tarjetas de estudio</a>
    </nav>`;
  }

  function counts() {
    const verbs = ELH.data.irregularVerbs;
    const state = ELH.store.get();
    const learned = verbs.filter((verb) => state.verbs[verb.infinitive]?.learned).length;
    const due = verbs.filter((verb) => ELH.store.isVerbDue(verb.infinitive)).length;
    const unseen = verbs.filter((verb) => !state.verbs[verb.infinitive]?.seen && !state.verbs[verb.infinitive]?.learned).length;
    return { total: verbs.length, learned, due, unseen };
  }

  function statsHtml() {
    const c = counts();
    return `
      <div class="card verbs-progress">
        <div class="row-between"><span><strong>${c.learned}</strong> de ${c.total} verbos aprendidos</span><strong>${percent(c.learned, c.total)}%</strong></div>
        ${ELH.ui.progressBar(percent(c.learned, c.total), { size: 'lg', label: 'Verbos aprendidos' })}
        <p class="text-sm muted">Un verbo cuenta como aprendido cuando lo marcas tú o cuando aciertas su tarjeta ${ELH.store.LEARNED_BOX} veces seguidas.</p>
      </div>
      <a class="card card-link verbs-due ${c.due ? 'has-due' : ''}" href="#/verbs/flashcards?deck=${c.due ? 'due' : 'smart'}">
        <span class="stat-icon">${icon(c.due ? 'repeat' : 'cards', { size: 20 })}</span>
        <span>
          <strong>${c.due ? plural(c.due, 'verbo para repasar hoy', 'verbos para repasar hoy') : 'Nada pendiente de repasar'}</strong>
          <span class="text-sm muted">${c.due ? 'Repásalos ahora con las tarjetas.' : `Te quedan ${plural(c.unseen, 'verbo sin estudiar', 'verbos sin estudiar')}. Empieza con unas tarjetas.`}</span>
        </span>
        ${icon('chevronRight', { size: 18 })}
      </a>`;
  }

  /* ---------- Lista ---------- */

  function filteredVerbs() {
    const state = ELH.store.get();
    const q = normalizeSearch(view.q);
    let verbs = ELH.data.irregularVerbs.filter((verb) => {
      const verbState = state.verbs[verb.infinitive];
      if (view.filter === 'learned' && !verbState?.learned) return false;
      if (view.filter === 'tolearn' && verbState?.learned) return false;
      if (view.filter === 'due' && !ELH.store.isVerbDue(verb.infinitive)) return false;
      if (view.filter === 'favorites' && !ELH.store.isFavorite('verbs', verb.infinitive)) return false;
      if (view.pattern !== 'all' && grammar.verbPattern(verb) !== view.pattern) return false;
      if (q) {
        const haystack = normalizeSearch(`${verb.infinitive} ${verb.past} ${verb.participle || ''} ${verb.meaning}`);
        if (!q.split(/\s+/).every((term) => haystack.includes(term))) return false;
      }
      return true;
    });
    if (view.sort === 'az') verbs = verbs.slice().sort((a, b) => a.infinitive.localeCompare(b.infinitive, 'en'));
    if (view.sort === 'za') verbs = verbs.slice().sort((a, b) => b.infinitive.localeCompare(a.infinitive, 'en'));
    // En el orden de la lista, al buscar salen primero las coincidencias exactas ("ir" → go)
    if (q && view.sort === 'list') verbs = verbs.slice().sort((a, b) => searchScore(b, q) - searchScore(a, q));
    return verbs;
  }

  function searchScore(verb, q) {
    const forms = [verb.infinitive, ...grammar.splitForms(verb.past), ...grammar.splitForms(verb.participle)].map(normalizeSearch);
    if (forms.includes(q)) return 3;
    const meanings = normalizeSearch(verb.meaning).split(/\s*[\/,]\s*|\s+/);
    if (meanings.includes(q)) return 2;
    if (forms.some((form) => form.startsWith(q))) return 1;
    return 0;
  }

  function hiddenCell(value, label, verb) {
    return `<button type="button" class="reveal-cell" data-reveal aria-label="Mostrar ${label} de ${escapeHtml(verb.infinitive)}">${icon('eye', { size: 15 })} Ver</button><span class="cell-value" hidden>${value}</span>`;
  }

  function rowHtml(verb) {
    const state = ELH.store.verbState(verb.infinitive);
    const due = ELH.store.isVerbDue(verb.infinitive);
    const hideForms = view.hide === 'forms';
    const hideMeaning = view.hide === 'meaning';
    const past = escapeHtml(verb.past);
    const participle = ELH.ui.verbFormHtml(verb.participle);
    const meaning = escapeHtml(verb.meaning);
    const sayAll = [verb.infinitive, verb.past, verb.participle].filter(Boolean).join(', ');

    return `<tr class="${state.learned ? 'is-learned' : ''}" data-verb="${escapeHtml(verb.infinitive)}">
      <td class="verb-num" data-label="N.º">${verb.n}</td>
      <th scope="row" class="verb-inf en" data-label="Infinitive">
        <span>${escapeHtml(verb.infinitive)}</span>
        ${due ? '<span class="badge badge-warning">Repasar</span>' : ''}
      </th>
      <td class="en" data-label="Past Simple">${hideForms && verb.past ? hiddenCell(past, 'el Past Simple', verb) : past}</td>
      <td class="en" data-label="Past Participle">${hideForms && verb.participle ? hiddenCell(participle, 'el Past Participle', verb) : participle}</td>
      <td class="verb-meaning" data-label="Meaning">${hideMeaning ? hiddenCell(meaning, 'el significado', verb) : meaning}</td>
      <td class="verb-actions" data-label="Acciones">
        ${ELH.speech.button(sayAll, { label: 'Escuchar' })}
        ${ELH.ui.favButton('verbs', verb.infinitive, { label: `favoritos: ${verb.infinitive}` })}
        <button type="button" class="btn btn-sm learned-toggle ${state.learned ? 'is-on' : ''}" data-learned="${escapeHtml(verb.infinitive)}" aria-pressed="${state.learned}" title="${state.learned ? 'Quitar de aprendidos' : 'Marcar como aprendido'}">
          ${icon(state.learned ? 'checkCircle' : 'check', { size: 16 })}<span>${state.learned ? 'Aprendido' : 'Aprender'}</span>
        </button>
      </td>
    </tr>`;
  }

  function tableHtml(verbs) {
    if (!verbs.length) {
      return ELH.ui.emptyState({
        iconName: 'search',
        title: 'Ningún verbo coincide con la búsqueda',
        text: 'Prueba con otra palabra (en inglés o en español) o quita los filtros.',
        action: '<button type="button" class="btn btn-secondary" data-action="clear-filters">Quitar los filtros</button>',
      });
    }
    return `<div class="table-wrap verbs-table-wrap">
      <table class="table verbs-table ${view.hide !== 'none' ? 'is-study' : ''}">
        <caption class="sr-only">Lista de verbos irregulares</caption>
        <thead>
          <tr>
            <th scope="col" class="verb-num">N.º</th>
            <th scope="col">Infinitive</th>
            <th scope="col">Past Simple</th>
            <th scope="col">Past Participle</th>
            <th scope="col">Meaning</th>
            <th scope="col"><span class="sr-only">Acciones</span></th>
          </tr>
        </thead>
        <tbody>${verbs.map(rowHtml).join('')}</tbody>
      </table>
    </div>`;
  }

  function renderList({ el, query }) {
    view.q = query.q || ''; // la búsqueda siempre se refleja en la dirección (#/verbs?q=go)
    if (query.filter && FILTERS.some((f) => f.id === query.filter)) view.filter = query.filter;

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Verbos irregulares</h1>
          <p class="page-lead">Los ${ELH.data.irregularVerbs.length} verbos de la lista con su Past Simple, Past Participle y significado. Búscalos, ordénalos, ocúltalos para estudiar y márcalos cuando ya te los sepas.</p>
        </div>
      </header>
      ${tabsHtml('list')}
      <section class="grid verbs-stats" data-stats aria-label="Tu avance con los verbos">${statsHtml()}</section>

      <section class="card verbs-toolbar" aria-label="Buscar y filtrar">
        <div class="verbs-toolbar-row">
          <label class="field verbs-search">
            <span class="field-label">Buscar</span>
            <span class="input-with-icon">
              ${icon('search', { size: 18 })}
              <input class="input" type="search" data-verb-search value="${escapeHtml(view.q)}" placeholder="go, went, ir..." autocomplete="off" spellcheck="false">
            </span>
          </label>
          <label class="field">
            <span class="field-label">Tipo de verbo</span>
            <select class="select" data-select="pattern">${PATTERNS.map((p) => `<option value="${p.id}" ${view.pattern === p.id ? 'selected' : ''}>${escapeHtml(p.label)}</option>`).join('')}</select>
          </label>
          <label class="field">
            <span class="field-label">Ordenar</span>
            <select class="select" data-select="sort">${SORTS.map((s) => `<option value="${s.id}" ${view.sort === s.id ? 'selected' : ''}>${escapeHtml(s.label)}</option>`).join('')}</select>
          </label>
        </div>
        <div class="verbs-toolbar-row">
          <div class="field">
            <span class="field-label" id="verb-filter-label">Mostrar</span>
            <div class="segmented" role="group" aria-labelledby="verb-filter-label" data-group="filter">
              ${FILTERS.map((f) => `<button type="button" data-value="${f.id}" aria-pressed="${view.filter === f.id}">${f.label}</button>`).join('')}
            </div>
          </div>
          <div class="field">
            <span class="field-label" id="verb-hide-label">Modo estudio</span>
            <div class="segmented" role="group" aria-labelledby="verb-hide-label" data-group="hide">
              ${HIDE_MODES.map((h) => `<button type="button" data-value="${h.id}" aria-pressed="${view.hide === h.id}">${h.label}</button>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <div class="verbs-result-bar">
        <p class="muted" data-result-count aria-live="polite"></p>
        <button type="button" class="btn btn-ghost btn-sm" data-action="reveal-all" hidden>${icon('eye', { size: 16 })} Mostrar todas las respuestas</button>
      </div>
      <div data-table></div>`;

    const tableSlot = el.querySelector('[data-table]');
    const countEl = el.querySelector('[data-result-count]');
    const revealAll = el.querySelector('[data-action="reveal-all"]');
    const searchInput = el.querySelector('[data-verb-search]');

    function refreshTable() {
      const verbs = filteredVerbs();
      tableSlot.innerHTML = tableHtml(verbs);
      countEl.textContent = verbs.length === ELH.data.irregularVerbs.length
        ? `Mostrando los ${verbs.length} verbos.`
        : `Mostrando ${verbs.length} de ${ELH.data.irregularVerbs.length} verbos.`;
      revealAll.hidden = view.hide === 'none' || !verbs.length;
    }

    function refreshStats() {
      el.querySelector('[data-stats]').innerHTML = statsHtml();
    }

    function syncUrl() {
      const hash = view.q ? `#/verbs?q=${encodeURIComponent(view.q)}` : '#/verbs';
      if (window.location.hash !== hash) history.replaceState(null, '', hash);
    }

    const onSearch = debounce(() => {
      view.q = searchInput.value.trim();
      syncUrl();
      refreshTable();
    }, 120);
    searchInput.addEventListener('input', onSearch);

    el.addEventListener('change', (event) => {
      const key = event.target.dataset.select;
      if (!key) return;
      view[key] = event.target.value;
      refreshTable();
    });

    el.addEventListener('click', (event) => {
      const segment = event.target.closest('[data-group] [data-value]');
      if (segment) {
        const group = segment.closest('[data-group]');
        view[group.dataset.group] = segment.dataset.value;
        group.querySelectorAll('[data-value]').forEach((button) => button.setAttribute('aria-pressed', String(button === segment)));
        refreshTable();
        return;
      }

      const reveal = event.target.closest('[data-reveal]');
      if (reveal) {
        const value = reveal.nextElementSibling;
        value.hidden = false;
        reveal.remove();
        return;
      }

      const learnedButton = event.target.closest('[data-learned]');
      if (learnedButton) {
        const infinitive = learnedButton.dataset.learned;
        const learned = !ELH.store.verbState(infinitive).learned;
        ELH.store.setVerbLearned(infinitive, learned);
        const row = learnedButton.closest('tr');
        row.outerHTML = rowHtml(ELH.data.irregularVerbs.find((verb) => verb.infinitive === infinitive));
        const newButton = tableSlot.querySelector(`[data-learned="${CSS.escape(infinitive)}"]`);
        if (newButton) newButton.focus();
        refreshStats();
        if (learned) {
          ELH.store.logActivity({ type: 'verbs', icon: 'checkCircle', title: `Verbo aprendido: ${infinitive}`, route: `#/verbs?q=${encodeURIComponent(infinitive)}` });
          ELH.toast(`"${infinitive}" marcado como aprendido`, { type: 'success' });
        }
        return;
      }

      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'reveal-all') {
        tableSlot.querySelectorAll('[data-reveal]').forEach((button) => {
          button.nextElementSibling.hidden = false;
          button.remove();
        });
      }
      if (action === 'clear-filters') {
        Object.assign(view, { q: '', filter: 'all', pattern: 'all' });
        searchInput.value = '';
        el.querySelector('[data-select="pattern"]').value = 'all';
        el.querySelectorAll('[data-group="filter"] [data-value]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.value === 'all')));
        syncUrl();
        refreshTable();
      }
    });

    refreshTable();
    if (view.q) searchInput.focus();
  }

  /* ---------- Tarjetas ---------- */

  const DECKS = [
    { id: 'smart', label: 'Sesión recomendada', description: 'Primero los verbos que toca repasar y después verbos nuevos, en el orden de la lista.' },
    { id: 'due', label: 'Para repasar hoy', description: 'Solo los verbos que el sistema de repaso te pide hoy.' },
    { id: 'tolearn', label: 'Por aprender', description: 'Todos los verbos que todavía no tienes como aprendidos.' },
    { id: 'favorites', label: 'Mis favoritos', description: 'Los verbos que has marcado con la estrella.' },
    { id: 'learned', label: 'Ya aprendidos', description: 'Repasa los que ya sabes para no olvidarlos.' },
    { id: 'all', label: 'Todos los verbos', description: 'Los 82 verbos mezclados.' },
  ];

  const SIZES = [
    { id: '10', label: '10 tarjetas' },
    { id: '20', label: '20 tarjetas' },
    { id: 'all', label: 'Todas' },
  ];

  const cardOptions = { deck: 'smart', direction: 'en', mode: 'reveal', size: '10' };

  function deckVerbs(deckId) {
    const verbs = ELH.data.irregularVerbs;
    const state = ELH.store.get();
    const isLearned = (verb) => Boolean(state.verbs[verb.infinitive]?.learned);
    const due = verbs.filter((verb) => ELH.store.isVerbDue(verb.infinitive))
      .sort((a, b) => (state.verbs[a.infinitive].due || 0) - (state.verbs[b.infinitive].due || 0));
    switch (deckId) {
      case 'smart': {
        const fresh = verbs.filter((verb) => !isLearned(verb) && !state.verbs[verb.infinitive]?.seen);
        const list = [...due, ...fresh];
        return list.length ? list : shuffle(verbs.filter(isLearned));
      }
      case 'due': return due;
      case 'tolearn': return verbs.filter((verb) => !isLearned(verb));
      case 'favorites': return verbs.filter((verb) => ELH.store.isFavorite('verbs', verb.infinitive));
      case 'learned': return verbs.filter(isLearned);
      default: return verbs.slice();
    }
  }

  function buildSession() {
    const list = deckVerbs(cardOptions.deck);
    const ordered = cardOptions.deck === 'smart' ? list : shuffle(list);
    const size = cardOptions.size === 'all' ? ordered.length : Number(cardOptions.size);
    const chosen = ordered.slice(0, size);
    return cardOptions.deck === 'smart' ? shuffle(chosen) : chosen;
  }

  function boxSummary() {
    const state = ELH.store.get();
    const boxes = ELH.store.REVIEW_INTERVAL_DAYS.map(() => 0);
    ELH.data.irregularVerbs.forEach((verb) => {
      const verbState = state.verbs[verb.infinitive];
      if (verbState?.seen || verbState?.learned) boxes[verbState.box || 0] += 1;
    });
    return boxes;
  }

  function radioGroup(name, options, current, describe) {
    return options.map((option) => `
      <label class="choice-card ${option.disabled ? 'is-disabled' : ''}">
        <input type="radio" name="${name}" value="${option.id}" ${option.id === current ? 'checked' : ''} ${option.disabled ? 'disabled' : ''}>
        <span class="choice-card-body">
          <span class="choice-card-title">${escapeHtml(option.label)}${option.count !== undefined ? ` <span class="badge">${option.count}</span>` : ''}</span>
          ${describe && option.description ? `<span class="choice-card-text">${escapeHtml(option.description)}</span>` : ''}
        </span>
      </label>`).join('');
  }

  function renderFlashcards({ el, query }) {
    if (query.deck && DECKS.some((deck) => deck.id === query.deck)) cardOptions.deck = query.deck;
    let session = null;

    function setupHtml() {
      const decks = DECKS.map((deck) => {
        const count = deckVerbs(deck.id).length;
        return { ...deck, count, disabled: count === 0 };
      });
      if (decks.find((deck) => deck.id === cardOptions.deck)?.disabled) cardOptions.deck = 'smart';
      const boxes = boxSummary();
      const days = ELH.store.REVIEW_INTERVAL_DAYS;

      return `
        <div class="flashcards-layout">
          <form class="card flashcards-setup" data-setup>
            <fieldset class="setup-group">
              <legend class="field-label">Qué verbos quieres estudiar</legend>
              <div class="choice-grid">${radioGroup('deck', decks, cardOptions.deck, true)}</div>
            </fieldset>
            <fieldset class="setup-group">
              <legend class="field-label">Qué ves en la tarjeta</legend>
              <div class="choice-grid choice-grid-2">
                ${radioGroup('direction', [
                  { id: 'en', label: 'El verbo en inglés (GO)', description: 'Recuerdas el Past Simple y el Past Participle.' },
                  { id: 'es', label: 'El significado (ir)', description: 'Recuerdas las tres formas en inglés.' },
                ], cardOptions.direction, true)}
              </div>
            </fieldset>
            <fieldset class="setup-group">
              <legend class="field-label">Cómo respondes</legend>
              <div class="choice-grid choice-grid-2">
                ${radioGroup('mode', [
                  { id: 'reveal', label: 'Recordar y girar', description: 'Piensas la respuesta, giras la tarjeta y dices si la sabías.' },
                  { id: 'write', label: 'Escribir', description: 'Escribes las formas y se corrigen solas.' },
                ], cardOptions.mode, true)}
              </div>
            </fieldset>
            <fieldset class="setup-group">
              <legend class="field-label">Tamaño de la sesión</legend>
              <div class="segmented" role="radiogroup">
                ${SIZES.map((size) => `<label class="segmented-radio"><input type="radio" name="size" value="${size.id}" ${cardOptions.size === size.id ? 'checked' : ''}><span>${size.label}</span></label>`).join('')}
              </div>
            </fieldset>
            <div class="setup-footer">
              <p class="muted" data-setup-count></p>
              <button type="submit" class="btn btn-primary btn-lg">${icon('play', { size: 18 })} Empezar</button>
            </div>
          </form>

          <aside class="card leitner-card" aria-labelledby="leitner-title">
            <h2 class="card-title" id="leitner-title">Cómo funciona el repaso</h2>
            <p class="text-sm muted">Cada verbo pasa por cajas. Cuanto mejor te lo sabes, más tarde vuelve a salir.</p>
            <ul class="leitner-rules">
              <li><span class="rate-dot is-again" aria-hidden="true"></span><span><strong>No lo sabía:</strong> vuelve en esta misma sesión y a la caja 1.</span></li>
              <li><span class="rate-dot is-hard" aria-hidden="true"></span><span><strong>Dudé:</strong> se repasa mañana.</span></li>
              <li><span class="rate-dot is-good" aria-hidden="true"></span><span><strong>Lo sabía:</strong> sube de caja y tarda más en volver.</span></li>
            </ul>
            <ol class="leitner-boxes" aria-label="Verbos en cada caja">
              ${boxes.slice(1).map((count, index) => `
                <li class="leitner-box ${index + 1 >= ELH.store.LEARNED_BOX ? 'is-learned' : ''}">
                  <span class="leitner-box-count">${count}</span>
                  <span class="leitner-box-label">Caja ${index + 1}</span>
                  <span class="leitner-box-days">${days[index + 1] === 1 ? 'cada día' : `cada ${days[index + 1]} días`}</span>
                </li>`).join('')}
            </ol>
            <p class="text-sm muted">Desde la caja ${ELH.store.LEARNED_BOX} el verbo cuenta como aprendido. Si después fallas, vuelve a la caja 1.</p>
          </aside>
        </div>`;
    }

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Tarjetas de estudio</h1>
          <p class="page-lead">Mira el verbo, intenta recordar sus formas y gira la tarjeta. Los que fallas vuelven antes; los que sabes, cada vez más tarde.</p>
        </div>
      </header>
      ${tabsHtml('cards')}
      <div data-cards></div>`;

    const slot = el.querySelector('[data-cards]');

    function updateCount() {
      const counter = slot.querySelector('[data-setup-count]');
      if (!counter) return;
      const total = deckVerbs(cardOptions.deck).length;
      const size = cardOptions.size === 'all' ? total : Math.min(total, Number(cardOptions.size));
      counter.textContent = total ? `${plural(size, 'tarjeta', 'tarjetas')} en esta sesión.` : 'Este grupo no tiene verbos todavía.';
    }

    function showSetup() {
      if (session) session.destroy();
      session = null;
      slot.innerHTML = setupHtml();
      updateCount();
    }

    function start() {
      const verbs = buildSession();
      if (!verbs.length) {
        ELH.toast('Este grupo no tiene verbos. Elige otro.', { type: 'error' });
        return;
      }
      slot.innerHTML = `
        <div class="fc-bar">
          <p class="muted">${escapeHtml(DECKS.find((deck) => deck.id === cardOptions.deck).label)}</p>
          <button type="button" class="btn btn-ghost btn-sm" data-action="end-session">${icon('x', { size: 16 })} Terminar la sesión</button>
        </div>
        <div data-session></div>`;
      session = ELH.flashcards.mount(slot.querySelector('[data-session]'), {
        verbs,
        mode: cardOptions.mode,
        direction: cardOptions.direction,
        title: 'Tarjetas de verbos',
        onExit: () => ELH.router.go('/verbs'),
        onRestart: buildSession,
      });
    }

    slot.addEventListener('change', (event) => {
      const { name, value } = event.target;
      if (name in cardOptions) {
        cardOptions[name] = value;
        updateCount();
      }
    });

    slot.addEventListener('submit', (event) => {
      if (!event.target.matches('[data-setup]')) return;
      event.preventDefault();
      start();
    });

    slot.addEventListener('click', (event) => {
      if (event.target.closest('[data-action="end-session"]')) showSetup();
    });

    showSetup();
    return () => { if (session) session.destroy(); };
  }

  ELH.pages.verbs = {
    list: { title: 'Verbos irregulares', render: renderList },
    flashcards: { title: 'Tarjetas de verbos', render: renderFlashcards },
    deckVerbs,
  };
})();
