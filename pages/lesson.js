/* ==========================================================================
   lesson.js — Lección de un tiempo verbal
   Ruta: #/grammar/<id>/<apartado>

   Todo el contenido sale del archivo data/tenses/<id>.js. Esta página solo
   sabe CÓMO mostrarlo, así que sirve igual para cualquier tiempo verbal nuevo.
   ========================================================================== */

(function () {
  const { escapeHtml, richText, plainText, plural, percent, shuffle } = ELH.core.utils;
  const icon = ELH.core.icon;
  const grammar = ELH.core.grammar;
  const bank = ELH.core.exercises;
  const SECTIONS = ELH.ui.LESSON_SECTIONS;

  const FORMS = [
    { id: 'affirmative', label: 'Afirmativa', icon: 'checkCircle' },
    { id: 'negative', label: 'Negativa', icon: 'minusCircle' },
    { id: 'question', label: 'Pregunta', icon: 'help' },
  ];

  const EXAMPLE_FILTERS = [
    { id: 'all', label: 'Todas' },
    { id: 'affirmative', label: 'Afirmativas' },
    { id: 'negative', label: 'Negativas' },
    { id: 'question', label: 'Preguntas' },
  ];

  const LEVEL_FILTERS = [{ id: 'all', label: 'Todos los niveles' }, ...Object.entries(bank.LEVELS).map(([id, label]) => ({ id, label }))];

  /* ---------- Piezas comunes ---------- */

  /** Identificador de un ejemplo para guardarlo en favoritos. */
  function exampleId(tense, example) {
    return `${tense.id}::${plainText(example.en)}`;
  }

  function exampleHtml(example, { tense = null, fav = false, tag = '' } = {}) {
    return `<div class="example">
      <div class="example-body">
        <p class="example-en en">${richText(example.en)}</p>
        ${example.es ? `<p class="example-es">${escapeHtml(example.es)}</p>` : ''}
      </div>
      <div class="example-actions">
        ${tag}
        ${ELH.speech.button(plainText(example.en))}
        ${fav && tense ? ELH.ui.favButton('examples', exampleId(tense, example), { label: 'favoritos este ejemplo' }) : ''}
      </div>
    </div>`;
  }

  function exampleList(examples, options) {
    return `<div class="example-list">${examples.map((example) => exampleHtml(example, options)).join('')}</div>`;
  }

  function skillLink(skillId, currentTense, currentSection) {
    const skill = ELH.data.skills[skillId];
    if (!skill) return '';
    const tenseId = skill.tense || currentTense.id;
    if (skill.route) return `<a class="text-sm" href="${skill.route}">${icon('book', { size: 14 })} Repasar: ${escapeHtml(skill.label)}</a>`;
    if (!skill.section || (tenseId === currentTense.id && skill.section === currentSection)) return '';
    return `<a class="text-sm" href="#/grammar/${tenseId}/${skill.section}">${icon('book', { size: 14 })} Repasar: ${escapeHtml(skill.label)}</a>`;
  }

  /** Activa unas pestañas sencillas (role="tablist"). */
  function setupTabs(root, onChange) {
    root.querySelectorAll('[role="tablist"]').forEach((list) => {
      const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
      function select(tab) {
        tabs.forEach((other) => {
          const active = other === tab;
          other.setAttribute('aria-selected', String(active));
          other.tabIndex = active ? 0 : -1;
          const panel = root.querySelector(`#${other.getAttribute('aria-controls')}`);
          if (panel) panel.hidden = !active;
        });
        if (onChange) onChange(tab);
      }
      list.addEventListener('click', (event) => {
        const tab = event.target.closest('[role="tab"]');
        if (tab) select(tab);
      });
      list.addEventListener('keydown', (event) => {
        const index = tabs.indexOf(document.activeElement);
        if (index < 0) return;
        let next = null;
        if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
        if (event.key === 'ArrowLeft') next = tabs[(index - 1 + tabs.length) % tabs.length];
        if (event.key === 'Home') next = tabs[0];
        if (event.key === 'End') next = tabs[tabs.length - 1];
        if (next) {
          event.preventDefault();
          next.focus();
          select(next);
        }
      });
    });
  }

  /* ---------- 1. ¿Qué es? ---------- */

  function sectionWhat(tense) {
    const what = tense.what;
    const quick = (what.quickCheck || []).map((item) => ({ ...item, tense: tense.id }));
    return {
      html: `
        ${ELH.timeline.render(tense.timeline)}
        <div class="lesson-prose">${what.intro.map((paragraph) => `<p>${richText(paragraph)}</p>`).join('')}</div>
        <div class="grid grid-2 lesson-callouts">
          ${what.keyIdea ? `<div class="callout">${icon('lightbulb')}<div><span class="callout-title">La idea clave</span>${richText(what.keyIdea)}</div></div>` : ''}
          ${what.spanish ? `<div class="callout callout-plain">${icon('translate')}<div><span class="callout-title">Comparado con el español</span>${richText(what.spanish)}</div></div>` : ''}
        </div>
        ${what.examples?.length ? `<h3 class="lesson-h3">Ejemplos para empezar</h3>${exampleList(what.examples)}` : ''}
        ${quick.length ? `
          <h3 class="lesson-h3">Comprueba si lo has entendido</h3>
          <p class="muted lesson-h3-sub">${plural(quick.length, 'pregunta rápida', 'preguntas rápidas')} antes de seguir.</p>
          <div data-mount="quick"></div>` : ''}`,
      mount(root) {
        const slot = root.querySelector('[data-mount="quick"]');
        if (!slot) return null;
        const runner = ELH.exerciseRunner.mount(slot, {
          items: quick,
          title: `Comprobación rápida de ${tense.name}`,
          route: `#/grammar/${tense.id}/what`,
          onRestart: () => shuffle(quick),
        });
        return () => runner.destroy();
      },
    };
  }

  /* ---------- 2. ¿Cuándo se utiliza? ---------- */

  function sectionUses(tense) {
    return {
      html: `
        <div class="grid grid-2 uses-grid">
          ${tense.uses.map((use) => `
            <article class="card card-tight use-card">
              <h3 class="use-title">${escapeHtml(use.title)}</h3>
              <p class="muted">${richText(use.description)}</p>
              ${use.example ? exampleHtml(use.example) : ''}
            </article>`).join('')}
        </div>`,
    };
  }

  /* ---------- 3. Estructura ---------- */

  function conjugationTable(tense, verb) {
    const builderVerb = tense.builder?.verbs?.find((item) => item.base === verb) || { base: verb, complement: '' };
    const rows = grammar.SUBJECTS.map((subject) => {
      const cells = FORMS.map((form) => {
        const template = ELH.sentenceBuilder.templateFor(tense, builderVerb.base, form.id);
        if (!template) return `<td data-label="${form.label}">—</td>`;
        const result = grammar.build(template, { subjectId: subject.id, verb: builderVerb.base, complement: builderVerb.complement, form: form.id });
        const tokens = result.shortTokens || result.tokens;
        const html = tokens.map((token) => (['aux', 'verb', 'neg'].includes(token.role)
          ? `<strong class="conj-${token.role}">${escapeHtml(token.text)}</strong>`
          : escapeHtml(token.text))).join(' ') + escapeHtml(result.punctuation);
        return `<td data-label="${form.label}"><span class="en">${html}</span>${result.short ? `<span class="conj-full en">${escapeHtml(result.text)}</span>` : ''}</td>`;
      }).join('');
      return `<tr><th scope="row"><span class="en">${escapeHtml(subject.text)}</span> <span class="subtle">${escapeHtml(subject.es)}</span></th>${cells}</tr>`;
    }).join('');

    return `<div class="table-wrap">
      <table class="table conj-table">
        <caption class="sr-only">Conjugación de ${escapeHtml(verb)}</caption>
        <thead><tr><th scope="col">Sujeto</th>${FORMS.map((form) => `<th scope="col">${form.label}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
  }

  function sectionStructure(tense) {
    const structure = tense.structure;
    const forms = FORMS.filter((form) => structure.forms[form.id]);
    const builderVerbs = tense.builder?.verbs || [];
    const defaultVerb = tense.builder?.defaultVerb || builderVerbs[0]?.base;
    const overrides = Object.entries(structure.verbOverrides || {}).filter(([, value]) => value.note);

    const formPanels = forms.map((form, index) => {
      const data = structure.forms[form.id];
      return `<div class="form-panel" role="tabpanel" id="form-panel-${form.id}" aria-labelledby="form-tab-${form.id}" ${index ? 'hidden' : ''}>
        ${ELH.blocks.formula(data.formula)}
        <p class="form-explanation">${richText(data.explanation)}</p>
        ${data.examples?.length ? exampleList(data.examples) : ''}
      </div>`;
    }).join('');

    return {
      html: `
        <div class="card structure-card">
          <div class="tabs" role="tablist" aria-label="Tipo de frase">
            ${forms.map((form, index) => `<button type="button" class="tab" role="tab" id="form-tab-${form.id}" aria-controls="form-panel-${form.id}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}">${icon(form.icon, { size: 18 })} ${form.label}</button>`).join('')}
          </div>
          ${formPanels}
          <div class="structure-legend">${ELH.blocks.legend()}</div>
        </div>

        ${overrides.map(([verb, value]) => `
          <div class="callout callout-warning lesson-block">${icon('alert')}<div><span class="callout-title">Caso especial: ${escapeHtml(verb === 'be' ? 'el verbo to be' : verb)}</span>${richText(value.note)}</div></div>`).join('')}

        ${builderVerbs.length ? `
          <section class="lesson-block" aria-labelledby="conj-title">
            <div class="section-title">
              <h3 id="conj-title" class="lesson-h3">Conjugación completa</h3>
              <label class="field field-inline">
                <span class="field-label">Verbo</span>
                <select class="select" data-conj-verb>
                  ${builderVerbs.map((verb) => `<option value="${escapeHtml(verb.base)}" ${verb.base === defaultVerb ? 'selected' : ''}>${escapeHtml(verb.base)} (${escapeHtml(verb.es)})</option>`).join('')}
                </select>
              </label>
            </div>
            <p class="muted lesson-h3-sub">Las mismas frases con todos los sujetos. Debajo de cada forma corta tienes la forma completa.</p>
            <div data-conj>${conjugationTable(tense, defaultVerb)}</div>
          </section>
          <div class="lesson-block" data-mount="builder"></div>` : ''}

        ${structure.spelling ? `
          <section class="lesson-block card" aria-labelledby="spelling-title">
            <h3 class="card-title" id="spelling-title">${escapeHtml(structure.spelling.title)}</h3>
            <ul class="rule-list">
              ${structure.spelling.rules.map((rule) => `
                <li class="rule">
                  <p class="rule-text">${richText(rule.rule)}</p>
                  <div class="chip-group">${rule.examples.map((example) => `<span class="chip chip-static en">${escapeHtml(example)}</span>`).join('')}</div>
                  ${rule.note ? `<p class="text-sm muted">${richText(rule.note)}</p>` : ''}
                </li>`).join('')}
            </ul>
          </section>` : ''}

        ${(structure.notes || []).map((note) => `
          <section class="lesson-block card">
            <h3 class="card-title">${escapeHtml(note.title)}</h3>
            <p class="muted">${richText(note.text)}</p>
            ${note.examples?.length ? exampleList(note.examples) : ''}
          </section>`).join('')}

        ${structure.shortAnswers?.length ? `
          <section class="lesson-block" aria-labelledby="short-title">
            <h3 class="lesson-h3" id="short-title">Respuestas cortas</h3>
            <p class="muted lesson-h3-sub">En inglés no se contesta solo "Yes" o "No": se repite el auxiliar de la pregunta.</p>
            <div class="table-wrap">
              <table class="table short-table">
                <thead><tr><th scope="col">Pregunta</th><th scope="col">Sí</th><th scope="col">No</th></tr></thead>
                <tbody>${structure.shortAnswers.map((row) => `
                  <tr><td data-label="Pregunta" class="en">${escapeHtml(row.q)}</td><td data-label="Sí" class="en text-success">${escapeHtml(row.yes)}</td><td data-label="No" class="en text-danger">${escapeHtml(row.no)}</td></tr>`).join('')}
                </tbody>
              </table>
            </div>
          </section>` : ''}

        ${structure.whQuestions ? `
          <section class="lesson-block card" aria-labelledby="wh-title">
            <h3 class="card-title" id="wh-title">Preguntas con Wh- (where, what, when...)</h3>
            ${ELH.blocks.formula(structure.whQuestions.formula)}
            <p class="form-explanation">${richText(structure.whQuestions.explanation)}</p>
            ${exampleList(structure.whQuestions.examples || [])}
          </section>` : ''}`,

      mount(root) {
        setupTabs(root);
        const select = root.querySelector('[data-conj-verb]');
        if (select) {
          select.addEventListener('change', () => {
            root.querySelector('[data-conj]').innerHTML = conjugationTable(tense, select.value);
          });
        }
        const builderSlot = root.querySelector('[data-mount="builder"]');
        if (builderSlot) ELH.sentenceBuilder.mount(builderSlot, tense);
        return null;
      },
    };
  }

  /* ---------- 4. Ejemplos ---------- */

  function sectionExamples(tense) {
    const counts = Object.fromEntries(EXAMPLE_FILTERS.map((filter) => [filter.id, filter.id === 'all' ? tense.examples.length : tense.examples.filter((example) => example.form === filter.id).length]));
    const filters = EXAMPLE_FILTERS.filter((filter) => counts[filter.id] > 0);
    const formLabel = Object.fromEntries(FORMS.map((form) => [form.id, form.label]));

    return {
      html: `
        <div class="toolbar">
          <div class="segmented" role="group" aria-label="Filtrar ejemplos">
            ${filters.map((filter) => `<button type="button" data-filter="${filter.id}" aria-pressed="${filter.id === 'all'}">${filter.label} <span class="subtle">${counts[filter.id]}</span></button>`).join('')}
          </div>
          <label class="switch">
            <input type="checkbox" data-toggle-es ${ELH.store.get().profile.showTranslations ? 'checked' : ''}>
            <span class="switch-text">Mostrar la traducción</span>
          </label>
        </div>
        <p class="muted lesson-h3-sub">Pulsa la estrella para guardar un ejemplo en Favoritos${ELH.speech.supported ? ' y el altavoz para escucharlo' : ''}. Si ocultas la traducción, intenta entender la frase antes de mirarla.</p>
        <div class="example-list examples-all ${ELH.store.get().profile.showTranslations ? '' : 'hide-es'}">
          ${tense.examples.map((example) => `<div data-form="${example.form || ''}">${exampleHtml(example, {
            tense,
            fav: true,
            tag: example.form ? `<span class="badge">${formLabel[example.form]}</span>` : '',
          })}</div>`).join('')}
        </div>`,
      mount(root) {
        const list = root.querySelector('.examples-all');
        root.querySelector('[data-toggle-es]').addEventListener('change', (event) => {
          list.classList.toggle('hide-es', !event.target.checked);
          ELH.store.setProfile({ showTranslations: event.target.checked });
        });
        list.addEventListener('click', (event) => {
          // Con la traducción oculta, se puede ver la de una frase pulsando sobre ella
          const spanish = event.target.closest('.example-es');
          if (spanish && list.classList.contains('hide-es')) spanish.classList.toggle('is-revealed');
        });
        root.querySelectorAll('[data-filter]').forEach((button) => {
          button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            root.querySelectorAll('[data-filter]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
            list.querySelectorAll('[data-form]').forEach((row) => { row.hidden = filter !== 'all' && row.dataset.form !== filter; });
          });
        });
        return null;
      },
    };
  }

  /* ---------- 5. Palabras clave ---------- */

  function sectionKeywords(tense) {
    if (!tense.keywords.length) {
      return { html: ELH.ui.emptyState({ iconName: 'key', title: 'Esta lección no tiene palabras clave', text: 'Puedes añadirlas en el campo keywords del archivo de la lección.' }) };
    }
    return {
      html: tense.keywords.map((group, groupIndex) => `
        <section class="card lesson-block keyword-group" data-group="${groupIndex}">
          <h3 class="card-title">${escapeHtml(group.group)}</h3>
          ${group.note ? `<p class="muted">${richText(group.note)}</p>` : ''}
          <div class="chip-group keyword-chips" role="group" aria-label="${escapeHtml(group.group)}">
            ${group.items.map((item, index) => `
              <button type="button" class="chip keyword-chip" data-keyword="${index}" aria-pressed="${index === 0}">
                <span class="en">${escapeHtml(item.word)}</span><span class="keyword-es">${escapeHtml(item.es)}</span>
              </button>`).join('')}
          </div>
          <div class="keyword-panel" aria-live="polite">${group.items[0]?.example ? exampleHtml(group.items[0].example) : ''}</div>
        </section>`).join(''),
      mount(root) {
        root.addEventListener('click', (event) => {
          const chip = event.target.closest('[data-keyword]');
          if (!chip) return;
          const groupEl = chip.closest('[data-group]');
          const item = tense.keywords[Number(groupEl.dataset.group)].items[Number(chip.dataset.keyword)];
          groupEl.querySelectorAll('[data-keyword]').forEach((other) => other.setAttribute('aria-pressed', String(other === chip)));
          groupEl.querySelector('.keyword-panel').innerHTML = item.example ? exampleHtml(item.example) : `<p class="muted">${escapeHtml(item.word)}: ${escapeHtml(item.es)}</p>`;
        });
        return null;
      },
    };
  }

  /* ---------- 6. Errores frecuentes ---------- */

  function sectionMistakes(tense) {
    if (!tense.mistakes.length) {
      return { html: ELH.ui.emptyState({ iconName: 'alert', title: 'Esta lección no tiene errores frecuentes', text: 'Puedes añadirlos en el campo mistakes del archivo de la lección.' }) };
    }
    return {
      html: `
        <div class="toolbar">
          <p class="muted">Lee la frase con el error e intenta corregirla mentalmente antes de mirar la solución.</p>
          <button type="button" class="btn btn-secondary btn-sm" data-action="reveal-all" aria-pressed="false">${icon('eye', { size: 16 })} Ver todas las correcciones</button>
        </div>
        <div class="grid grid-2 mistakes-grid">
          ${tense.mistakes.map((mistake, index) => `
            <article class="card card-tight mistake-card">
              <p class="mistake-wrong en">${icon('xCircle', { size: 18 })}<span><s>${escapeHtml(mistake.wrong)}</s></span></p>
              <div class="mistake-solution" id="mistake-${index}" hidden>
                <p class="mistake-right en">${icon('checkCircle', { size: 18 })}<span>${escapeHtml(mistake.right)}</span></p>
                <p class="text-sm">${richText(mistake.explanation)}</p>
                ${mistake.skill ? skillLink(mistake.skill, tense, 'mistakes') : ''}
              </div>
              <button type="button" class="btn btn-ghost btn-sm mistake-toggle" data-mistake="${index}" aria-expanded="false" aria-controls="mistake-${index}">${icon('eye', { size: 16 })} Ver corrección</button>
            </article>`).join('')}
        </div>`,
      mount(root) {
        function setOpen(button, open) {
          const panel = root.querySelector(`#${button.getAttribute('aria-controls')}`);
          panel.hidden = !open;
          button.setAttribute('aria-expanded', String(open));
          button.innerHTML = open ? `${icon('eyeOff', { size: 16 })} Ocultar corrección` : `${icon('eye', { size: 16 })} Ver corrección`;
        }
        root.addEventListener('click', (event) => {
          const toggle = event.target.closest('[data-mistake]');
          if (toggle) setOpen(toggle, toggle.getAttribute('aria-expanded') !== 'true');
          const all = event.target.closest('[data-action="reveal-all"]');
          if (all) {
            const open = all.getAttribute('aria-pressed') !== 'true';
            all.setAttribute('aria-pressed', String(open));
            all.innerHTML = open ? `${icon('eyeOff', { size: 16 })} Ocultar todas` : `${icon('eye', { size: 16 })} Ver todas las correcciones`;
            root.querySelectorAll('[data-mistake]').forEach((button) => setOpen(button, open));
          }
        });
        return null;
      },
    };
  }

  /* ---------- 7. Comparación ---------- */

  /** Comparaciones propias + las que otros tiempos hacen con este (dadas la vuelta). */
  function comparisonsFor(tense) {
    const list = [];
    tense.comparisons.forEach((comparison) => {
      const other = bank.tenseById(comparison.with);
      if (other) list.push({ ...comparison, other, quizTense: tense.id });
    });
    ELH.data.tenses.forEach((other) => {
      if (other.id === tense.id) return;
      other.comparisons.forEach((comparison) => {
        if (comparison.with !== tense.id || list.some((item) => item.other.id === other.id)) return;
        list.push({
          with: other.id,
          other,
          intro: comparison.intro,
          rows: comparison.rows.map((row) => ({ aspect: row.aspect, this: row.other, other: row.this })),
          pairs: (comparison.pairs || []).map((pair) => ({ this: pair.other, other: pair.this })),
          quiz: comparison.quiz || [],
          quizTense: other.id,
        });
      });
    });
    return list;
  }

  function comparisonPanel(tense, comparison, index) {
    return `<div class="comparison-panel" role="tabpanel" id="cmp-panel-${index}" aria-labelledby="cmp-tab-${index}" ${index ? 'hidden' : ''}>
      <div class="cmp-heads">
        <div class="cmp-head">
          <h3>${escapeHtml(tense.name)}</h3>
          ${ELH.timeline.render({ type: tense.timeline?.type })}
        </div>
        <span class="cmp-vs" aria-hidden="true">vs</span>
        <div class="cmp-head">
          <h3><a href="#/grammar/${comparison.other.id}">${escapeHtml(comparison.other.name)}</a></h3>
          ${ELH.timeline.render({ type: comparison.other.timeline?.type })}
        </div>
      </div>
      ${comparison.intro ? `<p class="lesson-prose">${richText(comparison.intro)}</p>` : ''}
      <div class="table-wrap">
        <table class="table cmp-table">
          <thead><tr><th scope="col"><span class="sr-only">Aspecto</span></th><th scope="col">${escapeHtml(tense.name)}</th><th scope="col">${escapeHtml(comparison.other.name)}</th></tr></thead>
          <tbody>${comparison.rows.map((row) => `
            <tr><th scope="row">${escapeHtml(row.aspect)}</th><td data-label="${escapeHtml(tense.name)}">${richText(row.this)}</td><td data-label="${escapeHtml(comparison.other.name)}">${richText(row.other)}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      ${comparison.pairs?.length ? `
        <h4 class="lesson-h4">Frases parecidas, significado diferente</h4>
        <div class="pair-list">
          ${comparison.pairs.map((pair) => `
            <div class="pair">
              <div class="pair-side"><span class="badge badge-accent">${escapeHtml(tense.name)}</span>${exampleHtml(pair.this)}</div>
              <div class="pair-side"><span class="badge">${escapeHtml(comparison.other.name)}</span>${exampleHtml(pair.other)}</div>
            </div>`).join('')}
        </div>` : ''}
      ${comparison.quiz?.length ? `
        <h4 class="lesson-h4">¿Cuál de los dos?</h4>
        <div data-mount="cmp-quiz-${index}"></div>` : ''}
    </div>`;
  }

  function sectionComparison(tense) {
    const comparisons = comparisonsFor(tense);
    if (!comparisons.length) {
      return {
        html: ELH.ui.emptyState({
          iconName: 'swap',
          title: 'Todavía no hay con qué comparar',
          text: 'Cuando haya otra lección que se compare con esta, la comparación aparecerá aquí automáticamente.',
          action: '<a class="btn btn-secondary" href="#/grammar">Ver todas las lecciones</a>',
        }),
      };
    }
    return {
      html: `
        ${comparisons.length > 1 ? `
          <div class="tabs cmp-tabs" role="tablist" aria-label="Comparar con">
            ${comparisons.map((comparison, index) => `<button type="button" class="tab" role="tab" id="cmp-tab-${index}" aria-controls="cmp-panel-${index}" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-index="${index}">${icon('swap', { size: 16 })} vs ${escapeHtml(comparison.other.name)}</button>`).join('')}
          </div>` : ''}
        ${comparisons.map((comparison, index) => comparisonPanel(tense, comparison, index)).join('')}`,
      mount(root) {
        const runners = {};
        function mountQuiz(index) {
          const comparison = comparisons[index];
          const slot = root.querySelector(`[data-mount="cmp-quiz-${index}"]`);
          Object.values(runners).forEach((runner) => runner.destroy());
          Object.keys(runners).forEach((key) => delete runners[key]);
          if (!slot) return;
          const items = comparison.quiz.map((item) => ({ ...item, tense: comparison.quizTense }));
          runners[index] = ELH.exerciseRunner.mount(slot, {
            items,
            title: `${tense.name} o ${comparison.other.name}`,
            route: `#/grammar/${tense.id}/comparison`,
            onRestart: () => shuffle(items),
          });
        }
        setupTabs(root, (tab) => mountQuiz(Number(tab.dataset.index)));
        mountQuiz(0);
        return () => Object.values(runners).forEach((runner) => runner.destroy());
      },
    };
  }

  /* ---------- 8. Ejercicios ---------- */

  function sectionExercises(tense) {
    const all = bank.lessonItems().filter((item) => item.tense === tense.id);
    const types = Object.keys(bank.TYPES).filter((type) => all.some((item) => item.type === type));
    const filters = { level: 'all', types: types.slice() };
    let runner = null;

    function available() {
      return all.filter((item) => filters.types.includes(item.type) && (filters.level === 'all' || item.level === filters.level));
    }

    function setupHtml() {
      const state = ELH.store.get();
      const done = all.filter((item) => state.exercises.byId[item.id]).length;
      const mastered = all.filter((item) => state.exercises.byId[item.id]?.correct > 0).length;
      const byTense = state.exercises.byTense[tense.id];
      const accuracy = byTense ? percent(byTense.correct, byTense.done) : null;
      const pending = state.exercises.pendingReview.filter((id) => all.some((item) => item.id === id)).length;
      const count = available().length;
      return `
        <div class="grid grid-3 exercise-stats">
          <div class="mini-stat"><span class="mini-stat-value">${done}<small> / ${all.length}</small></span><span class="mini-stat-label">ejercicios distintos hechos</span></div>
          <div class="mini-stat"><span class="mini-stat-value">${mastered}</span><span class="mini-stat-label">acertados al menos una vez</span></div>
          <div class="mini-stat"><span class="mini-stat-value">${accuracy === null ? '—' : `${accuracy}%`}</span><span class="mini-stat-label">aciertos en esta lección</span></div>
        </div>
        <div class="card exercise-setup">
          <div class="field">
            <span class="field-label" id="ex-level-label">Nivel</span>
            <div class="segmented" role="group" aria-labelledby="ex-level-label">
              ${LEVEL_FILTERS.map((level) => `<button type="button" data-level="${level.id}" aria-pressed="${filters.level === level.id}">${level.label}</button>`).join('')}
            </div>
          </div>
          <div class="field">
            <span class="field-label" id="ex-type-label">Tipos de ejercicio</span>
            <div class="chip-group" role="group" aria-labelledby="ex-type-label">
              ${types.map((type) => `<button type="button" class="chip" data-type="${type}" aria-pressed="${filters.types.includes(type)}">${icon(bank.TYPES[type].icon, { size: 16 })} ${escapeHtml(bank.TYPES[type].label)}</button>`).join('')}
            </div>
          </div>
          <div class="exercise-setup-footer">
            <p class="muted" aria-live="polite">${count ? `${plural(count, 'ejercicio disponible', 'ejercicios disponibles')}. Se eligen primero los que no has hecho o fallaste.` : 'No hay ejercicios con estos filtros.'}</p>
            <div class="row">
              ${pending ? `<button type="button" class="btn btn-secondary" data-action="review">${icon('refresh', { size: 18 })} Repasar fallos (${pending})</button>` : ''}
              <button type="button" class="btn btn-primary" data-action="start" ${count ? '' : 'disabled'}>${icon('play', { size: 18 })} Empezar (${Math.min(10, count)})</button>
            </div>
          </div>
        </div>
        <p class="text-sm muted">¿Quieres mezclar varias lecciones? Ve a <a href="#/practice">Práctica</a>.</p>`;
    }

    return {
      html: '<div data-mount="exercises"></div>',
      mount(root) {
        const slot = root.querySelector('[data-mount="exercises"]');

        function showSetup() {
          if (runner) runner.destroy();
          runner = null;
          slot.innerHTML = setupHtml();
        }

        function start(items) {
          if (runner) runner.destroy();
          runner = ELH.exerciseRunner.mount(slot, {
            items,
            title: `Ejercicios de ${tense.name}`,
            route: `#/grammar/${tense.id}/exercises`,
            exitLabel: 'Cambiar los filtros',
            onExit: showSetup,
            onRestart: () => shuffle(bank.weightedSample(available(), 10)),
          });
          slot.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }

        slot.addEventListener('click', (event) => {
          if (runner) return;
          const level = event.target.closest('[data-level]');
          const type = event.target.closest('[data-type]');
          const action = event.target.closest('[data-action]')?.dataset.action;
          if (level) {
            filters.level = level.dataset.level;
            showSetup();
          }
          if (type) {
            const id = type.dataset.type;
            filters.types = filters.types.includes(id) ? filters.types.filter((item) => item !== id) : [...filters.types, id];
            if (!filters.types.length) filters.types = [id];
            showSetup();
          }
          if (action === 'start') start(shuffle(bank.weightedSample(available(), 10)));
          if (action === 'review') {
            const ids = ELH.store.get().exercises.pendingReview;
            start(all.filter((item) => ids.includes(item.id)));
          }
        });

        showSetup();
        return () => { if (runner) runner.destroy(); };
      },
    };
  }

  const RENDERERS = {
    what: sectionWhat,
    uses: sectionUses,
    structure: sectionStructure,
    examples: sectionExamples,
    keywords: sectionKeywords,
    mistakes: sectionMistakes,
    comparison: sectionComparison,
    exercises: sectionExercises,
  };

  const SUBTITLES = {
    what: 'La idea general, en pocas palabras.',
    uses: 'Las situaciones en las que se usa.',
    structure: 'Cómo se forman las frases afirmativas, negativas y preguntas.',
    examples: 'Frases reales con su traducción.',
    keywords: 'Palabras que suelen acompañar a este tiempo verbal y te ayudan a reconocerlo.',
    mistakes: 'Los errores que más se repiten y cómo evitarlos.',
    comparison: 'En qué se parece y en qué se diferencia de otros tiempos verbales.',
    exercises: 'Practica lo que has aprendido. Cada respuesta se corrige y se explica.',
  };

  /* ---------- Página ---------- */

  function headerHtml(tense) {
    const progress = ELH.ui.lessonProgress(tense.id);
    return `
      <div class="lesson-header-main">
        <span class="card-icon lesson-icon">${icon(tense.icon || 'book', { size: 26 })}</span>
        <div>
          <h1>${escapeHtml(tense.name)}</h1>
          <p class="lesson-subtitle">${escapeHtml(tense.nameEs)}${tense.level ? ` <span class="badge badge-outline">Nivel ${escapeHtml(tense.level)}</span>` : ''}</p>
          <p class="page-lead">${escapeHtml(tense.summary)}</p>
        </div>
      </div>
      <div class="lesson-header-side">
        <div class="row">
          ${ELH.ui.favButton('lessons', tense.id, { label: `favoritos: ${tense.name}`, size: 20 })}
          <button type="button" class="btn ${progress.studied ? 'btn-success' : 'btn-secondary'} btn-sm" data-action="toggle-studied" aria-pressed="${progress.studied}">
            ${icon(progress.studied ? 'checkCircle' : 'check', { size: 16 })} ${progress.studied ? 'Lección estudiada' : 'Marcar como estudiada'}
          </button>
        </div>
        <div class="lesson-progress">
          <div class="row-between text-sm"><span>${progress.read} de ${progress.total} apartados leídos</span><strong>${progress.studied ? 100 : progress.percent}%</strong></div>
          ${ELH.ui.progressBar(progress.studied ? 100 : progress.percent, { label: `Progreso de ${tense.name}` })}
        </div>
      </div>`;
  }

  function stepperHtml(tense, current) {
    const lesson = ELH.store.lessonState(tense.id);
    return `<nav class="stepper" aria-label="Apartados de la lección">
      <ol>
        ${SECTIONS.map((section, index) => {
          const read = Boolean(lesson.sections?.[section.id]);
          const isCurrent = section.id === current;
          return `<li>
            <a class="step ${read ? 'is-read' : ''}" href="#/grammar/${tense.id}/${section.id}" ${isCurrent ? 'aria-current="step"' : ''}>
              <span class="step-num" aria-hidden="true">${read && !isCurrent ? icon('check', { size: 14, strokeWidth: 3 }) : index + 1}</span>
              <span class="step-label">${escapeHtml(section.title)}</span>
              ${read ? '<span class="sr-only">(leído)</span>' : ''}
            </a>
          </li>`;
        }).join('')}
      </ol>
    </nav>`;
  }

  function render({ el, params }) {
    const tense = bank.tenseById(params.id);
    if (!tense) return ELH.pages.notFound.render({ el });

    const sectionIndex = Math.max(0, SECTIONS.findIndex((section) => section.id === params.section));
    const section = SECTIONS[sectionIndex];
    const prev = SECTIONS[sectionIndex - 1];
    const next = SECTIONS[sectionIndex + 1];
    const content = RENDERERS[section.id](tense);

    // Guarda el avance de la lección
    const before = ELH.store.lessonState(tense.id);
    const firstVisit = !Object.keys(before.sections || {}).length;
    const completedNow = ELH.store.markSectionRead(tense.id, section.id, SECTIONS.length);
    ELH.store.setLastLocation(`#/grammar/${tense.id}/${section.id}`, `${tense.name}, ${section.title}`);
    if (firstVisit) {
      ELH.store.logActivity({ type: 'lesson', icon: 'book', title: `Has empezado ${tense.name}`, detail: section.title, route: `#/grammar/${tense.id}` });
    }
    if (completedNow) {
      ELH.store.logActivity({ type: 'lesson', icon: 'trophy', title: `Lección completada: ${tense.name}`, detail: 'Has leído los 8 apartados', route: `#/grammar/${tense.id}` });
      ELH.toast(`¡Has completado la lección de ${tense.name}!`, { type: 'success', icon: 'trophy', duration: 5000 });
    }

    el.innerHTML = `
      <nav class="breadcrumb" aria-label="Estás aquí">
        <a href="#/grammar">Gramática</a>${icon('chevronRight', { size: 14 })}<span aria-current="page">${escapeHtml(tense.name)}</span>
      </nav>
      <header class="lesson-header" data-lesson-header>${headerHtml(tense)}</header>
      ${stepperHtml(tense, section.id)}

      <section class="lesson-section" aria-labelledby="lesson-section-title">
        <header class="lesson-section-head">
          <span class="card-icon">${icon(section.icon)}</span>
          <div>
            <p class="lesson-section-step">Apartado ${sectionIndex + 1} de ${SECTIONS.length}</p>
            <h2 id="lesson-section-title">${escapeHtml(section.title)}</h2>
            <p class="muted">${escapeHtml(SUBTITLES[section.id])}</p>
          </div>
        </header>
        <div class="lesson-section-body" data-section-body>${content.html}</div>
      </section>

      <nav class="lesson-pager" aria-label="Apartado anterior y siguiente">
        ${prev ? `<a class="btn btn-secondary" href="#/grammar/${tense.id}/${prev.id}">${icon('arrowLeft', { size: 18 })} ${escapeHtml(prev.title)}</a>` : '<span></span>'}
        ${next
          ? `<a class="btn btn-primary" href="#/grammar/${tense.id}/${next.id}">Siguiente: ${escapeHtml(next.title)} ${icon('arrowRight', { size: 18 })}</a>`
          : `<a class="btn btn-primary" href="#/practice">${icon('target', { size: 18 })} Ir a Práctica</a>`}
      </nav>`;

    // En pantallas estrechas, el paso actual queda visible en la barra de pasos
    const stepper = el.querySelector('.stepper');
    const currentStep = el.querySelector('.step[aria-current="step"]');
    if (stepper && currentStep && stepper.scrollWidth > stepper.clientWidth) {
      stepper.scrollLeft = currentStep.offsetLeft - (stepper.clientWidth - currentStep.offsetWidth) / 2;
    }

    const body = el.querySelector('[data-section-body]');
    const cleanupSection = content.mount ? content.mount(body) : null;

    function onClick(event) {
      if (event.target.closest('[data-action="toggle-studied"]')) {
        const studied = !ELH.ui.lessonProgress(tense.id).studied;
        ELH.store.setLessonStudied(tense.id, studied);
        if (studied) {
          ELH.store.logActivity({ type: 'lesson', icon: 'checkCircle', title: `${tense.name} marcada como estudiada`, route: `#/grammar/${tense.id}` });
          ELH.toast(`${tense.name} marcada como estudiada`, { type: 'success' });
        } else {
          ELH.toast(`${tense.name} vuelve a estar pendiente`, { icon: 'refresh' });
        }
        el.querySelector('[data-lesson-header]').innerHTML = headerHtml(tense);
      }
    }
    el.addEventListener('click', onClick);

    return () => {
      el.removeEventListener('click', onClick);
      if (typeof cleanupSection === 'function') cleanupSection();
    };
  }

  ELH.pages.lesson = {
    title: ({ params }) => {
      const tense = bank.tenseById(params.id);
      if (!tense) return 'Lección no encontrada';
      const section = SECTIONS.find((item) => item.id === params.section);
      return section ? `${tense.name}: ${section.title}` : tense.name;
    },
    render,
    exampleId,
    exampleHtml,
    comparisonsFor,
  };
})();
