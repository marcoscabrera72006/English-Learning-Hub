/* ==========================================================================
   sentence-builder.js
   "Construye tu frase": eliges sujeto, verbo, tipo de frase y expresión de
   tiempo, y la frase se monta sola con bloques de colores y explicaciones.
   Funciona con cualquier tiempo verbal que tenga "builder" y plantillas.
   ========================================================================== */

(function () {
  const { escapeHtml } = ELH.core.utils;
  const grammar = ELH.core.grammar;
  const icon = ELH.core.icon;

  const FORMS = [
    { id: 'affirmative', label: 'Afirmativa' },
    { id: 'negative', label: 'Negativa' },
    { id: 'question', label: 'Pregunta' },
  ];

  function templateFor(tense, verb, form) {
    const override = tense.structure.verbOverrides?.[verb];
    return override?.[form] || tense.structure.forms[form]?.template || '';
  }

  function tipFor(formData, subject) {
    const tips = formData?.tips || {};
    return tips[subject.id] || (subject.third ? tips.third : tips.nonThird) || tips.default || '';
  }

  /** Notas automáticas sobre la ortografía o los verbos irregulares. */
  function automaticNotes(template, verb, subject) {
    const notes = [];
    const irregular = grammar.findIrregular(verb);

    if (template.includes('{s}') && subject.third) {
      const form = grammar.thirdPerson(verb);
      if (form !== `${verb}s`) notes.push(`Ortografía: ${verb} → <strong>${escapeHtml(form)}</strong>.`);
    }
    if (template.includes('{ing}')) {
      const form = grammar.ingForm(verb);
      if (form !== `${verb}ing`) notes.push(`Ortografía de la forma -ing: ${verb} → <strong>${escapeHtml(form)}</strong>.`);
    }
    if (template.includes('{past}') || template.includes('{participle}')) {
      if (irregular) {
        notes.push(`<strong>${escapeHtml(verb)}</strong> es un verbo irregular: ${escapeHtml(irregular.infinitive)} → ${escapeHtml(irregular.past)} → ${escapeHtml(irregular.participle || '----------')}. <a href="#/verbs?q=${encodeURIComponent(verb)}">Ver en la lista</a>.`);
      } else {
        const form = grammar.regularPast(verb);
        notes.push(form === `${verb}ed`
          ? `${escapeHtml(verb)} es regular: añade -ed → <strong>${escapeHtml(form)}</strong>.`
          : `${escapeHtml(verb)} es regular, pero ojo con la ortografía: <strong>${escapeHtml(form)}</strong>.`);
      }
    }
    return notes;
  }

  function mount(container, tense) {
    const builder = tense.builder;
    if (!builder || !builder.verbs?.length) {
      container.innerHTML = '';
      return;
    }

    const state = {
      subject: 'she',
      verb: builder.defaultVerb || builder.verbs[0].base,
      form: 'affirmative',
      time: '',
    };

    container.innerHTML = `
      <section class="card builder" aria-labelledby="builder-title-${tense.id}">
        <div class="card-header">
          <div>
            <h3 class="card-title" id="builder-title-${tense.id}">Construye tu propia frase</h3>
            <p class="card-subtitle">Elige las piezas y mira cómo cambia la frase. Prueba con he / she / it.</p>
          </div>
          <span class="card-icon">${icon('puzzle')}</span>
        </div>

        <div class="builder-controls">
          <div class="field">
            <span class="field-label" id="builder-subject-${tense.id}">Sujeto</span>
            <div class="segmented" role="group" aria-labelledby="builder-subject-${tense.id}">
              ${grammar.SUBJECTS.map((subject) => `<button type="button" data-subject="${subject.id}" aria-pressed="${subject.id === state.subject}" title="${escapeHtml(subject.es)}">${subject.text}</button>`).join('')}
            </div>
          </div>
          <div class="builder-row">
            <label class="field">
              <span class="field-label">Verbo</span>
              <select class="select" data-builder="verb">
                ${builder.verbs.map((verb) => `<option value="${escapeHtml(verb.base)}" ${verb.base === state.verb ? 'selected' : ''}>${escapeHtml(verb.base)} (${escapeHtml(verb.es)})</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span class="field-label">Expresión de tiempo</span>
              <select class="select" data-builder="time">
                <option value="">Sin expresión de tiempo</option>
                ${(builder.times || []).map((time) => `<option value="${escapeHtml(time)}">${escapeHtml(time)}</option>`).join('')}
              </select>
            </label>
          </div>
          <div class="field">
            <span class="field-label" id="builder-form-${tense.id}">Tipo de frase</span>
            <div class="segmented" role="group" aria-labelledby="builder-form-${tense.id}">
              ${FORMS.map((form) => `<button type="button" data-form="${form.id}" aria-pressed="${form.id === state.form}">${form.label}</button>`).join('')}
            </div>
          </div>
        </div>

        <div class="builder-output" aria-live="polite"></div>
        <div class="builder-legend">${ELH.blocks.legend()}</div>
      </section>`;

    const output = container.querySelector('.builder-output');

    function update() {
      const verbData = builder.verbs.find((verb) => verb.base === state.verb) || builder.verbs[0];
      const subject = grammar.SUBJECTS.find((item) => item.id === state.subject);
      const template = templateFor(tense, verbData.base, state.form);
      const result = grammar.build(template, {
        subjectId: state.subject,
        verb: verbData.base,
        complement: verbData.complement,
        time: state.time,
        form: state.form,
      });

      const override = tense.structure.verbOverrides?.[verbData.base];
      const tips = [];
      if (override?.note) tips.push(escapeHtml(override.note));
      else {
        const tip = tipFor(tense.structure.forms[state.form], subject);
        if (tip) tips.push(escapeHtml(tip));
      }
      if (!override) tips.push(...automaticNotes(template, verbData.base, subject));

      output.innerHTML = `
        <div class="builder-sentence">
          ${ELH.blocks.sentence(result.tokens, { size: 'lg', animated: true, punctuation: result.punctuation })}
          ${ELH.speech.button(result.text)}
        </div>
        ${result.short ? `<p class="builder-short"><span class="muted">Forma corta:</span> <span class="en">${escapeHtml(result.short)}</span></p>` : ''}
        ${tips.length ? `<ul class="builder-tips">${tips.map((tip) => `<li>${icon('lightbulb', { size: 16 })}<span>${tip}</span></li>`).join('')}</ul>` : ''}`;
    }

    container.addEventListener('click', (event) => {
      const subjectButton = event.target.closest('[data-subject]');
      const formButton = event.target.closest('[data-form]');
      if (subjectButton) {
        state.subject = subjectButton.dataset.subject;
        container.querySelectorAll('[data-subject]').forEach((b) => b.setAttribute('aria-pressed', String(b === subjectButton)));
        update();
      }
      if (formButton) {
        state.form = formButton.dataset.form;
        container.querySelectorAll('[data-form]').forEach((b) => b.setAttribute('aria-pressed', String(b === formButton)));
        update();
      }
    });

    container.addEventListener('change', (event) => {
      const key = event.target.dataset.builder;
      if (!key) return;
      state[key] = event.target.value;
      update();
    });

    update();
  }

  ELH.sentenceBuilder = { mount, templateFor };
})();
