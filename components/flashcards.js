/* ==========================================================================
   flashcards.js
   Sesión de tarjetas de estudio para los verbos irregulares.

   - Modo "Recordar": ves el infinitivo (GO), intentas recordar las formas,
     giras la tarjeta y te valoras: No lo sabía / Dudé / Lo sabía.
   - Modo "Escribir": escribes las formas y la tarjeta se corrige sola.

   La valoración alimenta la repetición espaciada (ELH.store.rateVerb):
   lo que no sabes vuelve pronto; lo que sabes, cada vez más tarde.
   ========================================================================== */

(function () {
  const { escapeHtml, percent } = ELH.core.utils;
  const grammar = ELH.core.grammar;
  const answers = ELH.core.answers;
  const icon = ELH.core.icon;

  const RATINGS = [
    { id: 'again', label: 'No lo sabía', hint: 'Vuelve en esta sesión', key: '1' },
    { id: 'hard', label: 'Dudé', hint: 'Repaso mañana', key: '2' },
    { id: 'good', label: 'Lo sabía', hint: 'Repaso más adelante', key: '3' },
  ];

  function accepted(verb, column) {
    const forms = grammar.splitForms(verb[column]);
    const extra = verb.alsoAccepted?.[column] || [];
    const list = [...forms, ...extra];
    if (forms.length > 1) list.push(forms.join(' / '));
    return list;
  }

  function mount(container, { verbs, mode = 'reveal', direction = 'en', title = 'Tarjetas', onExit, onRestart }) {
    let queue = verbs.slice();
    let position = 0;
    let flipped = false;
    let checked = false;
    let writeResult = null;
    const requeued = {};
    const tally = { again: 0, hard: 0, good: 0 };
    const failed = new Set();
    let logged = false;

    function fieldsFor(verb) {
      const fields = [];
      if (direction === 'es') fields.push({ column: 'infinitive', label: 'Infinitive', answers: [verb.infinitive] });
      fields.push({ column: 'past', label: 'Past Simple', answers: accepted(verb, 'past') });
      if (verb.participle) fields.push({ column: 'participle', label: 'Past Participle', answers: accepted(verb, 'participle') });
      return fields;
    }

    function backFace(verb) {
      const results = writeResult?.perColumn || {};
      const cell = (column, label, value) => {
        const state = results[column] === undefined ? '' : results[column] ? 'is-correct' : 'is-wrong';
        return `<div class="form-cell ${state}">
          <span class="form-cell-label">${label}</span>
          <span class="form-cell-value en">${ELH.ui.verbFormHtml(value)}</span>
        </div>`;
      };
      const learned = ELH.store.verbState(verb.infinitive).learned;
      const sayAll = [verb.infinitive, verb.past, verb.participle].filter(Boolean).join(', ');
      return `
        <div class="forms-grid">
          ${cell('infinitive', 'Infinitive', verb.infinitive)}
          ${cell('past', 'Past Simple', verb.past)}
          ${cell('participle', 'Past Participle', verb.participle)}
        </div>
        <p class="muted">${escapeHtml(verb.meaning)}</p>
        <div class="row" style="justify-content:center">
          ${ELH.speech.button(sayAll, { label: 'Escuchar las tres formas' })}
          ${ELH.ui.favButton('verbs', verb.infinitive, { label: `favoritos: ${verb.infinitive}` })}
          <button type="button" class="btn btn-sm ${learned ? 'btn-success' : 'btn-secondary'}" data-action="toggle-learned" aria-pressed="${learned}">
            ${icon(learned ? 'checkCircle' : 'check', { size: 16 })} ${learned ? 'Aprendido' : 'Marcar como aprendido'}
          </button>
        </div>`;
    }

    function render() {
      const verb = queue[position];
      const front = direction === 'en'
        ? `<span class="badge">Infinitive</span>
           <p class="flashcard-word en">${escapeHtml(verb.infinitive.toUpperCase())}</p>
           <p class="flashcard-meaning">${escapeHtml(verb.meaning)}</p>`
        : `<span class="badge">Significado</span>
           <p class="flashcard-word" style="font-size:clamp(2rem,6vw,3rem)">${escapeHtml(verb.meaning)}</p>
           <p class="flashcard-meaning">¿Cuál es el verbo en inglés?</p>`;

      const prompt = mode === 'reveal'
        ? (direction === 'en' ? 'Intenta recordar el Past Simple y el Past Participle.' : 'Intenta recordar el infinitivo, el Past Simple y el Past Participle.')
        : 'Escribe las formas debajo de la tarjeta.';

      container.innerHTML = `
        <div class="fc-session">
          <div class="runner-top">
            <span>Tarjeta ${position + 1} de ${queue.length}</span>
            ${ELH.ui.progressBar(percent(position, queue.length), { label: 'Avance de la sesión' })}
            <span class="runner-score" title="Tarjetas que sabías">${icon('checkCircle', { size: 16 })} ${tally.good}</span>
          </div>
          <div class="flashcard">
            <div class="flashcard-inner">
              <div class="flashcard-face flashcard-front">
                ${front}
                <p class="flashcard-prompt">${prompt}</p>
              </div>
              <div class="flashcard-face flashcard-back" aria-hidden="true"></div>
            </div>
          </div>
          <div class="fc-controls-slot" aria-live="polite">${controlsHtml(verb)}</div>
        </div>`;
      focusControls();
    }

    function focusControls() {
      const focusTarget = container.querySelector('[data-field="0"]')
        || container.querySelector('[data-rate="good"]')
        || container.querySelector('[data-action="flip"]')
        || container.querySelector('[data-action="next"]');
      if (focusTarget) focusTarget.focus({ preventScroll: true });
    }

    /** Gira la tarjeta con animación y muestra la parte de atrás. */
    function showBack() {
      const verb = queue[position];
      flipped = true;
      const card = container.querySelector('.flashcard');
      const back = card.querySelector('.flashcard-back');
      back.innerHTML = backFace(verb);
      back.setAttribute('aria-hidden', 'false');
      card.querySelector('.flashcard-front').setAttribute('aria-hidden', 'true');
      void card.offsetWidth; // fuerza el cálculo del estilo para que el giro se anime
      card.classList.add('is-flipped');
      container.querySelector('.fc-controls-slot').innerHTML = controlsHtml(verb);
      focusControls();
    }

    function controlsHtml(verb) {
      const fields = fieldsFor(verb);
      return mode === 'reveal'
        ? (flipped
          ? `<div class="rate-actions" role="group" aria-label="¿Lo sabías?">
              ${RATINGS.map((rating) => `<button type="button" class="rate-btn is-${rating.id}" data-rate="${rating.id}">
                <span>${rating.label}</span><small>${rating.hint}. Tecla ${rating.key}</small></button>`).join('')}
            </div>`
          : `<div class="fc-controls"><button type="button" class="btn btn-primary btn-lg" data-action="flip">${icon('refresh', { size: 18 })} Mostrar respuesta <span class="kbd">Espacio</span></button></div>`)
        : (checked
          ? `<div class="fc-controls">
              <p class="fc-result ${writeResult.correct ? 'is-correct' : 'is-wrong'}">${icon(writeResult.correct ? 'checkCircle' : 'xCircle')} ${writeResult.correct ? '¡Correcto! Lo sabías.' : 'No pasa nada: esta tarjeta volverá a salir.'}</p>
              <button type="button" class="btn btn-primary btn-lg" data-action="next">Siguiente ${icon('arrowRight', { size: 18 })}</button>
            </div>`
          : `<form class="fc-write" novalidate>
              <div class="exercise-inputs is-multi">
                ${fields.map((field, i) => `<label class="field"><span class="field-label">${field.label}</span>
                  <input class="input" data-field="${i}" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"></label>`).join('')}
              </div>
              <div class="fc-controls">
                <button type="button" class="btn btn-ghost" data-action="dont-know">No lo sé</button>
                <button type="submit" class="btn btn-primary">Comprobar</button>
              </div>
            </form>`);
    }

    function rate(ratingId) {
      const verb = queue[position];
      const result = ELH.store.rateVerb(verb.infinitive, ratingId);
      tally[ratingId] += 1;
      if (ratingId === 'again') {
        failed.add(verb.infinitive);
        requeued[verb.infinitive] = (requeued[verb.infinitive] || 0) + 1;
        if (requeued[verb.infinitive] <= 2) queue.push(verb);
      }
      if (result.learnedNow) ELH.toast(`¡Has aprendido "${verb.infinitive}"!`, { type: 'success', icon: 'trophy' });
      if (result.forgotten) ELH.toast(`"${verb.infinitive}" vuelve a la lista de repaso`, { icon: 'refresh' });
      advance();
    }

    function advance() {
      flipped = false;
      checked = false;
      writeResult = null;
      if (position < queue.length - 1) {
        position += 1;
        render();
      } else {
        renderSummary();
      }
    }

    function checkWrite(skip = false) {
      const verb = queue[position];
      const fields = fieldsFor(verb);
      const values = fields.map((_, i) => container.querySelector(`[data-field="${i}"]`)?.value || '');
      const perColumn = {};
      fields.forEach((field, i) => { perColumn[field.column] = !skip && answers.matches(values[i], field.answers); });
      const correct = !skip && Object.values(perColumn).every(Boolean);
      writeResult = { correct, perColumn };
      checked = true;
      flipped = true;

      const rating = correct ? 'good' : 'again';
      const result = ELH.store.rateVerb(verb.infinitive, rating);
      tally[rating] += 1;
      if (!correct) {
        failed.add(verb.infinitive);
        requeued[verb.infinitive] = (requeued[verb.infinitive] || 0) + 1;
        if (requeued[verb.infinitive] <= 2) queue.push(verb);
      }
      if (result.learnedNow) ELH.toast(`¡Has aprendido "${verb.infinitive}"!`, { type: 'success', icon: 'trophy' });
      if (result.forgotten) ELH.toast(`"${verb.infinitive}" vuelve a la lista de repaso`, { icon: 'refresh' });
      showBack();
    }

    function renderSummary() {
      const reviewed = tally.again + tally.hard + tally.good;
      const failedVerbs = verbs.filter((verb) => failed.has(verb.infinitive));
      if (!logged) {
        logged = true;
        ELH.store.logActivity({
          type: 'flashcards',
          icon: 'cards',
          title,
          detail: `${reviewed} tarjetas: ${tally.good} sabidas, ${tally.again} por repasar`,
          route: '#/verbs/flashcards',
        });
      }
      container.innerHTML = `
        <section class="card">
          <div class="summary">
            ${ELH.ui.ring(percent(tally.good, reviewed), { size: 128, stroke: 12, label: `${tally.good}`, sublabel: 'sabidas', success: true, ariaLabel: `${tally.good} tarjetas sabidas de ${reviewed}` })}
            <div>
              <h2>Sesión de tarjetas terminada</h2>
              <p class="muted" style="margin-top:6px">Has repasado ${reviewed} tarjetas: ${tally.good} sabías, ${tally.hard} con dudas y ${tally.again} que no sabías.</p>
              <div class="summary-actions">
                ${failedVerbs.length ? `<button type="button" class="btn btn-primary" data-action="retry">${icon('refresh', { size: 18 })} Repasar los fallos (${failedVerbs.length})</button>` : ''}
                ${onRestart ? `<button type="button" class="btn ${failedVerbs.length ? 'btn-secondary' : 'btn-primary'}" data-action="restart">${icon('shuffle', { size: 18 })} Otra sesión</button>` : ''}
                ${onExit ? '<button type="button" class="btn btn-ghost" data-action="exit">Volver a la lista</button>' : ''}
              </div>
            </div>
          </div>
          ${failedVerbs.length ? `
            <h3 style="margin-top:26px">Verbos para repasar</h3>
            <div class="table-wrap" style="margin-top:12px">
              <table class="table">
                <thead><tr><th scope="col">Infinitive</th><th scope="col">Past Simple</th><th scope="col">Past Participle</th><th scope="col">Meaning</th></tr></thead>
                <tbody>${failedVerbs.map((verb) => `<tr><td class="en"><strong>${escapeHtml(verb.infinitive)}</strong></td><td class="en">${escapeHtml(verb.past)}</td><td class="en">${ELH.ui.verbFormHtml(verb.participle)}</td><td>${escapeHtml(verb.meaning)}</td></tr>`).join('')}</tbody>
              </table>
            </div>` : ''}
        </section>`;
      const firstButton = container.querySelector('.summary-actions button');
      if (firstButton) firstButton.focus({ preventScroll: true });
    }

    function restartWith(newVerbs) {
      queue = newVerbs.slice();
      position = 0;
      flipped = false;
      checked = false;
      writeResult = null;
      Object.keys(requeued).forEach((key) => delete requeued[key]);
      tally.again = 0;
      tally.hard = 0;
      tally.good = 0;
      failed.clear();
      logged = false;
      render();
    }

    function onClick(event) {
      const rateButton = event.target.closest('[data-rate]');
      if (rateButton) {
        rate(rateButton.dataset.rate);
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'flip' && !flipped) showBack();
      if (action === 'next') advance();
      if (action === 'dont-know') checkWrite(true);
      if (action === 'toggle-learned') {
        const verb = queue[position];
        const learned = !ELH.store.verbState(verb.infinitive).learned;
        ELH.store.setVerbLearned(verb.infinitive, learned);
        ELH.toast(learned ? `"${verb.infinitive}" marcado como aprendido` : `"${verb.infinitive}" vuelve a la lista de repaso`, { type: learned ? 'success' : 'info' });
        const button = event.target.closest('[data-action]');
        button.className = `btn btn-sm ${learned ? 'btn-success' : 'btn-secondary'}`;
        button.setAttribute('aria-pressed', String(learned));
        button.innerHTML = `${icon(learned ? 'checkCircle' : 'check', { size: 16 })} ${learned ? 'Aprendido' : 'Marcar como aprendido'}`;
      }
      if (action === 'retry') restartWith(verbs.filter((verb) => failed.has(verb.infinitive)));
      if (action === 'restart' && onRestart) {
        const fresh = onRestart();
        if (fresh && fresh.length) restartWith(fresh);
      }
      if (action === 'exit' && onExit) onExit();
    }

    function onSubmit(event) {
      event.preventDefault();
      const values = Array.from(container.querySelectorAll('[data-field]')).map((input) => input.value.trim());
      if (values.every((value) => !value)) {
        const input = container.querySelector('[data-field="0"]');
        if (input) input.focus();
        return;
      }
      checkWrite(false);
    }

    function onKeydown(event) {
      if (!container.isConnected || !container.querySelector('.flashcard')) return;
      if (event.target.matches('input, textarea, select')) return;
      if (mode === 'reveal' && !flipped && (event.key === ' ' || event.key === 'Enter') && !event.target.closest('button:not([data-action="flip"]), a')) {
        event.preventDefault();
        showBack();
        return;
      }
      if (mode === 'reveal' && flipped) {
        const rating = RATINGS.find((r) => r.key === event.key);
        if (rating) {
          event.preventDefault();
          rate(rating.id);
        }
      }
    }

    container.addEventListener('click', onClick);
    container.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKeydown);

    if (!queue.length) {
      container.innerHTML = ELH.ui.emptyState({ iconName: 'cards', title: 'No hay tarjetas en este mazo', text: 'Elige otro mazo o marca algún verbo como favorito.' });
    } else {
      render();
    }

    return {
      destroy() {
        container.removeEventListener('click', onClick);
        container.removeEventListener('submit', onSubmit);
        document.removeEventListener('keydown', onKeydown);
      },
    };
  }

  ELH.flashcards = { mount };
})();
