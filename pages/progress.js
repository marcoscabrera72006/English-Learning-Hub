/* ==========================================================================
   progress.js — Mi progreso
   Todo lo que has hecho, calculado a partir de lo guardado en localStorage.
   ========================================================================== */

(function () {
  const { escapeHtml, richText, percent, plural, timeAgo, dayKey } = ELH.core.utils;
  const icon = ELH.core.icon;
  const bank = ELH.core.exercises;

  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  function skillRoute(skill) {
    if (skill.route) return skill.route;
    if (skill.tense && skill.section && bank.tenseById(skill.tense)) return `#/grammar/${skill.tense}/${skill.section}`;
    return '';
  }

  function tile(iconName, value, label, extra = '') {
    return `<div class="card card-tight stat-tile">
      <span class="stat-icon">${icon(iconName, { size: 20 })}</span>
      <span class="stat-value">${value}</span>
      <span class="stat-label">${escapeHtml(label)}</span>
      ${extra}
    </div>`;
  }

  /** Gráfico de barras de la actividad diaria. */
  function activityChart(days) {
    const max = Math.max(...days.map((day) => day.value), 1);
    const today = dayKey();
    const total = days.reduce((sum, day) => sum + day.value, 0);
    const label = (day) => `${day.date.getDate()} ${MONTHS[day.date.getMonth()]}`;
    return `
      <div class="activity-chart" aria-hidden="true">
        <div class="activity-chart-grid">
          <span class="activity-chart-max">${max}</span>
        </div>
        <div class="activity-chart-bars">
          ${days.map((day, index) => `
            <div class="chart-col ${day.key === today ? 'is-today' : ''}" data-tip="${label(day)}: ${plural(day.value, 'actividad', 'actividades')}">
              <span class="chart-bar-track"><span class="chart-bar" style="height:${day.value ? Math.max(4, Math.round((day.value / max) * 100)) : 0}%"></span></span>
              <span class="chart-col-label">${(days.length - 1 - index) % 2 === 0 ? (day.key === today ? 'hoy' : day.date.getDate()) : ''}</span>
            </div>`).join('')}
        </div>
      </div>
      <p class="text-sm muted">${plural(total, 'actividad', 'actividades')} en los últimos ${days.length} días. Cada respuesta y cada tarjeta cuentan una.</p>
      <table class="sr-only">
        <caption>Actividad de los últimos ${days.length} días</caption>
        <thead><tr><th scope="col">Día</th><th scope="col">Actividades</th></tr></thead>
        <tbody>${days.map((day) => `<tr><td>${label(day)}</td><td>${day.value}</td></tr>`).join('')}</tbody>
      </table>`;
  }

  /** Lista de barras horizontales (un valor por fila). */
  function barList(rows, { emptyText }) {
    if (!rows.length) return `<p class="muted text-sm">${escapeHtml(emptyText)}</p>`;
    return `<ul class="bar-list">
      ${rows.map((row) => `
        <li class="bar-row">
          <div class="bar-row-top">
            <span class="bar-row-label">${row.href ? `<a href="${row.href}">${escapeHtml(row.label)}</a>` : escapeHtml(row.label)}</span>
            <span class="bar-row-value">${escapeHtml(row.valueText)}</span>
          </div>
          <div class="bar-track" data-tip="${escapeHtml(row.tip || row.valueText)}"><span class="bar-fill" style="width:${Math.max(row.value ? 2 : 0, Math.min(100, row.value))}%"></span></div>
          ${row.note ? `<p class="bar-row-note">${row.note}</p>` : ''}
        </li>`).join('')}
    </ul>`;
  }

  function grammarSection(state) {
    return ELH.data.tenses.map((tense) => {
      const lesson = ELH.ui.lessonProgress(tense.id);
      const stats = state.exercises.byTense[tense.id];
      return `<li class="tense-progress">
        <a class="tense-progress-name" href="#/grammar/${tense.id}">${escapeHtml(tense.name)}</a>
        <span class="tense-progress-status">${lesson.studied
          ? `<span class="badge badge-success">${icon('check', { size: 14 })} Estudiada</span>`
          : `<span class="badge">${lesson.read} de ${lesson.total} apartados</span>`}</span>
        <span class="tense-progress-bar">${ELH.ui.progressBar(lesson.studied ? 100 : lesson.percent, { size: 'sm', label: `Apartados leídos de ${tense.name}` })}</span>
        <span class="tense-progress-acc text-sm muted">${stats ? `${percent(stats.correct, stats.done)}% de aciertos en ${plural(stats.done, 'respuesta', 'respuestas')}` : 'Sin ejercicios todavía'}</span>
      </li>`;
    }).join('');
  }

  function verbsSection(state) {
    const verbs = ELH.data.irregularVerbs;
    const days = ELH.store.REVIEW_INTERVAL_DAYS;
    const boxes = days.map(() => 0);
    let unseen = 0;
    verbs.forEach((verb) => {
      const verbState = state.verbs[verb.infinitive];
      if (verbState?.seen || verbState?.learned) boxes[verbState.box || 0] += 1;
      else unseen += 1;
    });
    const learned = verbs.filter((verb) => state.verbs[verb.infinitive]?.learned).length;
    const due = verbs.filter((verb) => ELH.store.isVerbDue(verb.infinitive)).length;

    const hardest = verbs
      .map((verb) => {
        const s = ELH.store.verbState(verb.infinitive);
        return { verb, fails: s.wrong + s.practiceWrong, hits: s.right + s.practiceRight };
      })
      .filter((entry) => entry.fails > 0)
      .sort((a, b) => b.fails - a.fails || a.hits - b.hits)
      .slice(0, 8);

    const segments = [
      { label: 'Sin estudiar', count: unseen, cls: 'seg-0' },
      ...boxes.map((count, index) => ({ label: index === 0 ? 'Caja 0' : `Caja ${index}`, count, cls: `seg-${Math.min(index, 5)}` })).filter((seg, index) => index > 0 || seg.count),
    ];

    return `
      <div class="row-between"><span><strong>${learned}</strong> de ${verbs.length} aprendidos</span><span class="text-sm muted">${plural(due, 'verbo para repasar hoy', 'verbos para repasar hoy')}</span></div>
      ${ELH.ui.progressBar(percent(learned, verbs.length), { label: 'Verbos aprendidos' })}
      <h3 class="progress-h3">En qué caja está cada verbo</h3>
      <div class="box-bar" role="img" aria-label="${segments.map((seg) => `${seg.label}: ${seg.count}`).join(', ')}">
        ${segments.filter((seg) => seg.count).map((seg) => `<span class="box-seg ${seg.cls}" style="flex-grow:${seg.count}" data-tip="${seg.label}: ${plural(seg.count, 'verbo', 'verbos')}"></span>`).join('')}
      </div>
      <ul class="box-legend">
        ${segments.map((seg) => `<li><span class="box-swatch ${seg.cls}" aria-hidden="true"></span>${seg.label}<strong>${seg.count}</strong></li>`).join('')}
      </ul>
      <p class="text-sm muted">Cuanto más alta la caja, mejor te lo sabes. Desde la caja ${ELH.store.LEARNED_BOX} cuenta como aprendido.</p>
      <h3 class="progress-h3">Los que más te cuestan</h3>
      ${hardest.length ? `<ul class="hard-verbs">
        ${hardest.map((entry) => `<li><a href="#/verbs?q=${encodeURIComponent(entry.verb.infinitive)}"><span class="en"><strong>${escapeHtml(entry.verb.infinitive)}</strong> ${escapeHtml(entry.verb.past)}, ${escapeHtml(entry.verb.participle || '----------')}</span><span class="badge badge-danger">${plural(entry.fails, 'fallo', 'fallos')}</span></a></li>`).join('')}
      </ul>` : '<p class="muted text-sm">Todavía no has fallado ningún verbo. Cuando falles alguno en las tarjetas o en los ejercicios, aparecerá aquí.</p>'}
      <div class="row"><a class="btn btn-secondary btn-sm" href="#/verbs/flashcards">${icon('cards', { size: 16 })} Estudiar con tarjetas</a></div>`;
  }

  function render({ el }) {
    const state = ELH.store.get();
    const stats = ELH.pages.dashboard.overview();
    const streak = ELH.store.streak();
    const ex = state.exercises;

    const byType = Object.entries(bank.TYPES)
      .filter(([id]) => ex.byType[id])
      .map(([id, type]) => {
        const entry = ex.byType[id];
        const value = percent(entry.correct, entry.done);
        return { label: type.label, value, valueText: `${value}%`, tip: `${entry.correct} de ${entry.done} correctas` };
      });

    const byLevel = Object.entries(bank.LEVELS)
      .filter(([id]) => ex.byLevel[id])
      .map(([id, label]) => {
        const entry = ex.byLevel[id];
        const value = percent(entry.correct, entry.done);
        return { label, value, valueText: `${value}%`, tip: `${entry.correct} de ${entry.done} correctas` };
      });

    const skillEntries = Object.entries(ex.skills).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const maxSkill = skillEntries[0]?.[1] || 1;
    const skills = skillEntries.map(([id, count]) => {
      const skill = ELH.data.skills[id] || { label: id };
      const route = skillRoute(skill);
      return {
        label: skill.label,
        value: (count / maxSkill) * 100,
        valueText: plural(count, 'fallo', 'fallos'),
        note: `${skill.tip ? escapeHtml(skill.tip) : ''}${route ? ` <a href="${route}">Repasar</a>` : ''}`,
      };
    });

    const mistakes = state.mistakes.slice(0, 8);
    const pending = bank.reviewItems().length;

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Mi progreso</h1>
          <p class="page-lead">Tu avance en gramática, verbos y ejercicios. Se guarda automáticamente en este navegador.</p>
        </div>
        <a class="btn btn-ghost btn-sm" href="#/settings">${icon('download', { size: 16 })} Copia de seguridad</a>
      </header>

      <section class="grid grid-4" aria-label="Resumen">
        ${tile('book', `${stats.studied}<small> / ${stats.totalTenses}</small>`, 'Tiempos verbales estudiados')}
        ${tile('layers', `${stats.learnedVerbs}<small> / ${stats.totalVerbs}</small>`, 'Verbos irregulares aprendidos')}
        ${tile('target', ex.attempts, 'Ejercicios realizados', `<span class="text-sm muted">${stats.mastered} de ${stats.totalItems} distintos acertados</span>`)}
        ${tile('checkCircle', ex.attempts ? `${stats.accuracy}%` : '—', 'Porcentaje de aciertos', ex.attempts ? `<span class="text-sm muted">${ex.correct} correctas, ${ex.attempts - ex.correct} fallos</span>` : '')}
      </section>

      <section class="section grid progress-row">
        <article class="card" aria-labelledby="activity-chart-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="activity-chart-title">Actividad diaria</h2>
              <p class="card-subtitle">${streak ? `${icon('flame', { size: 15 })} Racha de ${plural(streak, 'día seguido', 'días seguidos')}` : 'Estudia hoy para empezar una racha.'}</p>
            </div>
          </div>
          ${activityChart(ELH.store.lastDays(14))}
        </article>
        <article class="card" aria-labelledby="grammar-progress-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="grammar-progress-title">Gramática</h2>
              <p class="card-subtitle">Apartados leídos y aciertos por lección.</p>
            </div>
          </div>
          <ul class="tense-progress-list">${grammarSection(state)}</ul>
        </article>
      </section>

      <section class="section grid grid-2">
        <article class="card" aria-labelledby="verbs-progress-title">
          <h2 class="card-title" id="verbs-progress-title">Verbos irregulares</h2>
          ${verbsSection(state)}
        </article>
        <article class="card" aria-labelledby="skills-title">
          <h2 class="card-title" id="skills-title">Errores más frecuentes</h2>
          <p class="card-subtitle">Los temas en los que más fallas. Repásalos para mejorar.</p>
          ${barList(skills, { emptyText: 'Todavía no hay errores. Cuando falles un ejercicio, verás aquí en qué tema ha sido.' })}
        </article>
      </section>

      <section class="section grid grid-2">
        <article class="card" aria-labelledby="type-title">
          <h2 class="card-title" id="type-title">Aciertos por tipo de ejercicio</h2>
          ${barList(byType, { emptyText: 'Haz algunos ejercicios para ver tus aciertos por tipo.' })}
          ${byLevel.length ? `<h3 class="progress-h3">Por nivel</h3>${barList(byLevel, { emptyText: '' })}` : ''}
        </article>
        <article class="card" aria-labelledby="mistakes-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="mistakes-title">Últimos fallos</h2>
              <p class="card-subtitle">${pending ? `${plural(pending, 'pregunta pendiente', 'preguntas pendientes')} de volver a acertar.` : 'No tienes preguntas pendientes de repasar.'}</p>
            </div>
            ${pending ? `<a class="btn btn-primary btn-sm" href="#/practice?review=1">${icon('refresh', { size: 16 })} Repasar</a>` : ''}
          </div>
          ${mistakes.length ? `<ul class="mistake-log">
            ${mistakes.map((mistake) => `
              <li>
                <p class="mistake-log-prompt en">${richText(mistake.prompt || '')}</p>
                <p class="mistake-log-line"><span class="bad en">${mistake.given ? escapeHtml(mistake.given) : 'Sin respuesta'}</span>${icon('arrowRight', { size: 14 })}<span class="good en">${escapeHtml(mistake.expected || '')}</span></p>
                <p class="text-xs subtle">${escapeHtml(bank.TYPES[mistake.type]?.label || '')}${mistake.tense ? `, ${escapeHtml(bank.tenseById(mistake.tense)?.name || '')}` : ''}, ${escapeHtml(timeAgo(mistake.ts))}</p>
              </li>`).join('')}
          </ul>` : ELH.ui.emptyState({ iconName: 'checkCircle', title: 'Sin fallos registrados', text: 'Los errores que cometas en los ejercicios aparecerán aquí con la respuesta correcta.' })}
        </article>
      </section>

      <section class="section card" aria-labelledby="recent-title">
        <h2 class="card-title" id="recent-title">Actividad reciente</h2>
        ${state.activity.length ? `<ul class="activity-list activity-list-full">
          ${state.activity.slice(0, 15).map((entry) => `
            <li>
              <a class="activity-item" href="${entry.route || '#/'}">
                <span class="activity-icon">${icon(entry.icon || 'activity', { size: 18 })}</span>
                <span class="activity-text"><strong>${escapeHtml(entry.title)}</strong>${entry.detail ? `<span>${escapeHtml(entry.detail)}</span>` : ''}</span>
                <span class="activity-time">${escapeHtml(timeAgo(entry.ts))}</span>
              </a>
            </li>`).join('')}
        </ul>` : ELH.ui.emptyState({ iconName: 'activity', title: 'Todavía no hay actividad', text: 'Empieza una lección o haz unos ejercicios.', action: '<a class="btn btn-primary" href="#/grammar">Ir a Gramática</a>' })}
      </section>`;
  }

  ELH.pages.progress = { title: 'Mi progreso', render };
})();
