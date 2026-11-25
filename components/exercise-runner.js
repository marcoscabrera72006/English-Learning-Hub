/* ==========================================================================
   exercise-runner.js
   Muestra una sesión de ejercicios, pregunta a pregunta:
     1. Corrige la respuesta.
     2. Muestra la respuesta correcta y compara palabra por palabra.
     3. Explica por qué y da pistas sobre el error.
     4. Al final, resume la sesión y permite repetir los fallos.

   Uso:
     const runner = ELH.exerciseRunner.mount(container, {
       items, title, onExit, exitLabel, onRestart, route,
     });
     runner.destroy();
   ========================================================================== */

(function () {
  const { escapeHtml, richText, percent, shuffle } = ELH.core.utils;
  const answers = ELH.core.answers;
  const bank = ELH.core.exercises;
  const icon = ELH.core.icon;

  const PRAISE = ['¡Correcto!', '¡Muy bien!', '¡Exacto!', '¡Perfecto!', '¡Bien hecho!'];

  const PLACEHOLDERS = {
    fill: 'Escribe la forma verbal',
    negative: 'Escribe la frase en negativa',
    question: 'Escribe la pregunta',
    translate: 'Escribe la frase en inglés',
    correct: 'Corrige la frase',
    irregular: 'Escribe la forma del verbo',
  };

  function promptHtml(item) {
    return richText(item.prompt)
      .replace(/_{2,}/g, '<span class="blank"><span class="sr-only">hueco</span></span>')
      .replace(/\(([^)]+)\)/g, '<span class="hint-verb">($1)</span>');
  }

  function optionsFor(item) {
    if (item.type === 'identify') {
      let tenses = ELH.data.tenses;
      if (tenses.length > 4) {
        const correct = tenses.find((t) => t.id === item.answers[0]);
        tenses = shuffle([correct, ...shuffle(tenses.filter((t) => t !== correct)).slice(0, 3)]);
      }
      return tenses.map((tense) => ({ value: tense.id, label: tense.name }));
    }
    const list = item.keepOrder ? item.options : shuffle(item.options);
    return list.map((option) => ({ value: option, label: option }));
  }

  function skillLink(item) {
    const skill = ELH.data.skills[item.skill];
    if (!skill) return '';
    const route = skill.route || (skill.tense && skill.section && bank.tenseById(skill.tense) ? `#/grammar/${skill.tense}/${skill.section}` : '');
    if (!route) return `<p class="text-sm muted">${icon('lightbulb', { size: 14 })} ${escapeHtml(skill.label)}: ${escapeHtml(skill.tip || '')}</p>`;
    return `<p class="text-sm"><a href="${route}">${icon('book', { size: 14 })} Repasar: ${escapeHtml(skill.label)}</a></p>`;
  }

  function mount(container, options) {
    const settings = { title: 'Práctica', exitLabel: 'Volver', route: '#/practice', ...options };
    let items = settings.items.slice();
    let index = 0;
    let results = [];
    let answered = false;
    let currentOptions = [];
    let logged = false;

    const isOptionItem = (item) => item.type === 'choice' || item.type === 'identify' || item.presentation === 'choice';

    function answerArea(item) {
      if (isOptionItem(item)) {
        currentOptions = optionsFor(item);
        const wide = currentOptions.every((option) => option.label.length < 28);
        return `<div class="options ${wide ? 'is-wide' : ''}" role="group" aria-label="Opciones">
          ${currentOptions.map((option, i) => `
            <button type="button" class="option-btn en" data-option="${i}">
              <span class="option-key" aria-hidden="true">${i + 1}</span>
              <span>${escapeHtml(option.label)}</span>
            </button>`).join('')}
        </div>`;
      }
      if (item.inputs) {
        return `<div class="exercise-inputs is-multi">
          ${item.inputs.map((input, i) => `
            <label class="field">
              <span class="field-label">${escapeHtml(input.label)}</span>
              <input class="input" data-input="${i}" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
            </label>`).join('')}
        </div>`;
      }
      const prefill = item.type === 'correct' ? escapeHtml(item.prompt) : '';
      return `<div class="exercise-inputs">
        <label class="field">
          <span class="sr-only">Tu respuesta</span>
          <input class="input" data-input="0" type="text" value="${prefill}" placeholder="${escapeHtml(PLACEHOLDERS[item.type] || 'Tu respuesta')}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false">
        </label>
      </div>`;
    }

    function renderQuestion() {
      answered = false;
      const item = items[index];
      const type = bank.TYPES[item.type];
      const tense = bank.tenseById(item.tense);
      const correctSoFar = results.filter((r) => r.correct).length;
      const instruction = item.instruction || type?.instruction || '';

      container.innerHTML = `
        <div class="runner">
          <div class="runner-top">
            <span>Pregunta ${index + 1} de ${items.length}</span>
            ${ELH.ui.progressBar(percent(index, items.length), { label: 'Avance de la sesión' })}
            <span class="runner-score" title="Respuestas correctas">${icon('checkCircle', { size: 16 })} ${correctSoFar}</span>
          </div>
          <article class="card exercise">
            <div class="exercise-meta">
              ${type ? `<span class="badge badge-accent">${icon(type.icon, { size: 14 })} ${escapeHtml(type.label)}</span>` : ''}
              ${item.level ? `<span class="badge">${escapeHtml(bank.LEVELS[item.level] || item.level)}</span>` : ''}
              ${tense ? `<span class="badge">${escapeHtml(tense.name)}</span>` : ''}
            </div>
            <p class="exercise-instruction">${escapeHtml(instruction)}</p>
            <p class="exercise-prompt ${item.type === 'translate' ? '' : 'en'}">${promptHtml(item)}</p>
            <form class="exercise-form" novalidate>
              ${answerArea(item)}
              <div class="exercise-actions">
                ${item.hint ? `<button type="button" class="btn btn-ghost btn-sm" data-action="hint">${icon('lightbulb', { size: 16 })} Pista</button>` : ''}
                <button type="button" class="btn btn-ghost btn-sm" data-action="skip">No lo sé</button>
                <span class="spacer"></span>
                ${isOptionItem(item) ? '' : '<button type="submit" class="btn btn-primary" data-action="check">Comprobar</button>'}
              </div>
              ${item.hint ? `<div class="hint-box" hidden><div class="callout">${icon('lightbulb')}<span>${escapeHtml(item.hint)}</span></div></div>` : ''}
            </form>
            <div class="feedback-slot" aria-live="polite"></div>
          </article>
        </div>`;

      const firstInput = container.querySelector('[data-input="0"]');
      if (firstInput) {
        firstInput.focus({ preventScroll: true });
        if (item.type === 'correct') firstInput.setSelectionRange(firstInput.value.length, firstInput.value.length);
      }
    }

    function readResponse(item) {
      const inputs = Array.from(container.querySelectorAll('[data-input]'));
      if (item.inputs) return inputs.map((input) => input.value);
      return inputs[0] ? inputs[0].value : '';
    }

    function alternativeNote(item, response) {
      // Formas válidas que no aparecen en tu lista (por ejemplo "dreamed")
      const check = (given, primary) => {
        if (!primary || !given.trim()) return null;
        const value = answers.normalize(given);
        const list = primary.map(answers.normalize);
        if (list.includes(value) || value === list.join(' ')) return null;
        return `También es correcto, pero en tu lista aparece "${primary.join(', ')}".`;
      };
      if (item.inputs) return item.inputs.map((input, i) => check(response[i] || '', input.primary)).filter(Boolean);
      return [check(response, item.primary)].filter(Boolean);
    }

    function check(response, { skipped = false } = {}) {
      if (answered) return;
      const item = items[index];
      const evaluation = skipped ? { correct: false, perInput: [] } : answers.evaluate(item, response);
      answered = true;

      // Textos de "tu respuesta" y "respuesta correcta"
      let given = '';
      let expected = '';
      let rows = [];
      const optionItem = isOptionItem(item);

      if (optionItem) {
        const chosen = currentOptions.find((option) => option.value === response);
        given = chosen ? chosen.label : '';
        expected = item.type === 'identify' ? bank.displayAnswer(item) : item.answers[0];
        rows = [
          !evaluation.correct && given ? { label: 'Tu respuesta', html: escapeHtml(given) } : null,
          { label: 'Respuesta correcta', html: escapeHtml(expected) },
        ].filter(Boolean);
      } else if (item.inputs) {
        const values = skipped ? item.inputs.map(() => '') : response;
        given = values.join(' / ');
        const expectedParts = item.inputs.map((input, i) => answers.closestAnswer(values[i] || '', input.answers));
        expected = item.inputs.map((input, i) => `${input.label}: ${expectedParts[i]}`).join(' · ');
        item.inputs.forEach((input, i) => {
          const value = values[i] || '';
          const ok = evaluation.perInput[i];
          if (!ok && value.trim()) {
            const diff = answers.renderDiff(value, expectedParts[i]);
            rows.push({ label: `${input.label}: tú`, html: diff.givenHtml });
            rows.push({ label: `${input.label}: correcta`, html: diff.expectedHtml });
          } else {
            rows.push({ label: input.label, html: escapeHtml(expectedParts[i]) });
          }
        });
      } else {
        given = skipped ? '' : response;
        expected = answers.closestAnswer(given, item.answers);
        if (!evaluation.correct && given.trim()) {
          const diff = answers.renderDiff(given, expected);
          rows = [
            { label: 'Tu respuesta', html: diff.givenHtml },
            { label: 'Respuesta correcta', html: diff.expectedHtml },
          ];
        } else {
          rows = [{ label: 'Respuesta correcta', html: escapeHtml(expected) }];
        }
      }

      // Pistas sobre el error
      let tips = [];
      if (!evaluation.correct && !skipped) {
        if (item.inputs) {
          item.inputs.forEach((input, i) => {
            if (!evaluation.perInput[i] && (response[i] || '').trim()) {
              tips.push(...answers.diagnose(item, response[i], answers.closestAnswer(response[i], input.answers)));
            }
          });
        } else if (!optionItem) {
          tips = answers.diagnose(item, given, expected);
        }
      }
      if (evaluation.correct) tips = alternativeNote(item, response);

      ELH.store.recordAnswer(item, { correct: evaluation.correct, given: skipped ? '(no lo sabía)' : given, expected });
      results.push({ item, correct: evaluation.correct, given: skipped ? '' : given, expected });

      // Estados visuales
      if (optionItem) {
        container.querySelectorAll('[data-option]').forEach((button) => {
          const option = currentOptions[Number(button.dataset.option)];
          button.disabled = true;
          if (item.type === 'identify' ? option.value === item.answers[0] : option.value === item.answers[0]) button.classList.add('is-correct');
          else if (option.value === response) button.classList.add('is-wrong');
          else button.classList.add('is-dim');
        });
      } else {
        container.querySelectorAll('[data-input]').forEach((input, i) => {
          input.readOnly = true;
          if (!skipped) input.classList.add(evaluation.perInput[i] ? 'is-correct' : 'is-wrong');
        });
      }

      const isLast = index === items.length - 1;
      const actions = container.querySelector('.exercise-actions');
      actions.innerHTML = `<span class="spacer"></span>
        <button type="button" class="btn btn-primary" data-action="next">${isLast ? 'Ver resultados' : 'Siguiente'} ${icon(isLast ? 'trophy' : 'arrowRight', { size: 18 })}</button>`;

      const title = evaluation.correct
        ? PRAISE[Math.floor(Math.random() * PRAISE.length)]
        : skipped ? 'Aquí tienes la respuesta' : 'No es correcto';

      container.querySelector('.feedback-slot').innerHTML = `
        <div class="feedback ${evaluation.correct ? 'is-correct' : 'is-wrong'}">
          <p class="feedback-title">${icon(evaluation.correct ? 'checkCircle' : skipped ? 'lightbulb' : 'xCircle', { size: 22 })} ${escapeHtml(title)}</p>
          <div class="feedback-rows">
            ${rows.map((row) => `<div class="feedback-row"><span class="feedback-label">${escapeHtml(row.label)}</span><span class="feedback-answer en">${row.html}</span></div>`).join('')}
          </div>
          <div class="feedback-why">
            ${item.explanation ? `<p><strong>¿Por qué?</strong> ${escapeHtml(item.explanation)}</p>` : ''}
            ${tips.length ? `<p><strong>${evaluation.correct ? 'Nota:' : 'Fíjate:'}</strong></p><ul>${tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join('')}</ul>` : ''}
            ${!evaluation.correct ? skillLink(item) : ''}
          </div>
        </div>`;

      container.querySelector('[data-action="next"]').focus({ preventScroll: true });
      const feedback = container.querySelector('.feedback');
      if (feedback && feedback.getBoundingClientRect().bottom > window.innerHeight) {
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function next() {
      if (index < items.length - 1) {
        index += 1;
        renderQuestion();
      } else {
        renderSummary();
      }
    }

    function summaryMessage(score) {
      if (score === 100) return '¡Sesión perfecta! Lo tienes dominado.';
      if (score >= 80) return '¡Muy bien! Solo te quedan pequeños detalles.';
      if (score >= 50) return 'Vas por buen camino. Repasa los errores de abajo y vuelve a intentarlo.';
      return 'Los errores también enseñan. Lee las explicaciones y repite los fallos: así es como se aprende.';
    }

    function renderSummary() {
      const total = results.length;
      const correct = results.filter((r) => r.correct).length;
      const score = percent(correct, total);
      const wrong = results.filter((r) => !r.correct);

      if (!logged) {
        logged = true;
        ELH.store.logActivity({
          type: 'practice',
          icon: 'target',
          title: settings.title,
          detail: `${correct} de ${total} correctas`,
          route: settings.route,
        });
      }

      container.innerHTML = `
        <section class="card">
          <div class="summary">
            ${ELH.ui.ring(score, { size: 128, stroke: 12, label: `${score}%`, sublabel: `${correct} de ${total}`, success: score >= 70, ariaLabel: `${correct} de ${total} respuestas correctas` })}
            <div>
              <h2>${escapeHtml(settings.title)}: sesión terminada</h2>
              <p class="muted" style="margin-top:6px">${escapeHtml(summaryMessage(score))}</p>
              <div class="summary-actions">
                ${wrong.length ? `<button type="button" class="btn btn-primary" data-action="retry-wrong">${icon('refresh', { size: 18 })} Repetir los fallos (${wrong.length})</button>` : ''}
                ${settings.onRestart ? `<button type="button" class="btn ${wrong.length ? 'btn-secondary' : 'btn-primary'}" data-action="restart">${icon('shuffle', { size: 18 })} Otra ronda</button>` : ''}
                ${settings.onExit ? `<button type="button" class="btn btn-ghost" data-action="exit">${escapeHtml(settings.exitLabel)}</button>` : ''}
              </div>
            </div>
          </div>
          ${wrong.length ? `
            <h3 style="margin-top:28px">Repasa tus errores</h3>
            <div class="review-list">
              ${wrong.map((result) => `
                <div class="review-item">
                  <p class="review-item-prompt en">${richText(result.item.prompt)}</p>
                  <p class="review-item-line">${result.given ? `<span class="bad en">${escapeHtml(result.given)}</span> → ` : '<span class="muted">Sin respuesta</span> → '}<span class="good en">${escapeHtml(result.expected)}</span></p>
                  ${result.item.explanation ? `<p class="review-item-line muted">${escapeHtml(result.item.explanation)}</p>` : ''}
                </div>`).join('')}
            </div>` : `<div class="callout callout-success" style="margin-top:22px">${icon('trophy')}<span>No has cometido ningún error en esta sesión.</span></div>`}
        </section>`;

      const firstButton = container.querySelector('.summary-actions button');
      if (firstButton) firstButton.focus({ preventScroll: true });
    }

    function restartWith(newItems) {
      items = newItems;
      index = 0;
      results = [];
      logged = false;
      renderQuestion();
    }

    function onClick(event) {
      const optionButton = event.target.closest('[data-option]');
      if (optionButton && !answered) {
        check(currentOptions[Number(optionButton.dataset.option)].value);
        return;
      }
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (!action) return;
      if (action === 'skip') check(items[index].inputs ? [] : '', { skipped: true });
      if (action === 'hint') {
        const box = container.querySelector('.hint-box');
        if (box) box.hidden = false;
      }
      if (action === 'next') next();
      if (action === 'retry-wrong') restartWith(results.filter((r) => !r.correct).map((r) => r.item));
      if (action === 'restart' && settings.onRestart) {
        const fresh = settings.onRestart();
        if (fresh && fresh.length) restartWith(fresh);
      }
      if (action === 'exit' && settings.onExit) settings.onExit();
    }

    function onSubmit(event) {
      event.preventDefault();
      if (answered) {
        next();
        return;
      }
      const item = items[index];
      const response = readResponse(item);
      const empty = Array.isArray(response) ? response.every((v) => !v.trim()) : !response.trim();
      if (empty) {
        const input = container.querySelector('[data-input]');
        if (input) {
          input.classList.add('is-wrong');
          input.setAttribute('aria-invalid', 'true');
          input.focus();
          setTimeout(() => input.classList.remove('is-wrong'), 600);
        }
        return;
      }
      check(response);
    }

    function onKeydown(event) {
      if (!container.isConnected) return;
      const typing = event.target.matches('input, textarea, select');
      const item = items[index];
      if (!answered && item && isOptionItem(item) && !typing) {
        const number = Number(event.key);
        if (number >= 1 && number <= currentOptions.length) {
          event.preventDefault();
          check(currentOptions[number - 1].value);
        }
      } else if (answered && event.key === 'Enter' && !typing && !event.target.closest('button, a')) {
        event.preventDefault();
        next();
      }
    }

    container.addEventListener('click', onClick);
    container.addEventListener('submit', onSubmit);
    document.addEventListener('keydown', onKeydown);

    if (!items.length) {
      container.innerHTML = ELH.ui.emptyState({ iconName: 'target', title: 'No hay ejercicios con estos filtros', text: 'Prueba a cambiar el nivel o el tipo de ejercicio.' });
    } else {
      renderQuestion();
    }

    return {
      destroy() {
        container.removeEventListener('click', onClick);
        container.removeEventListener('submit', onSubmit);
        document.removeEventListener('keydown', onKeydown);
      },
    };
  }

  ELH.exerciseRunner = { mount };
})();
