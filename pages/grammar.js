/* ==========================================================================
   grammar.js — Índice de gramática
   Muestra una tarjeta por cada tiempo verbal registrado en data/tenses/.
   ========================================================================== */

(function () {
  const { escapeHtml, plural } = ELH.core.utils;
  const icon = ELH.core.icon;

  /** Tarjeta de un tiempo verbal (también se usa en el inicio). */
  function tenseCard(tense) {
    const progress = ELH.ui.lessonProgress(tense.id);
    const status = progress.studied
      ? `<span class="badge badge-success">${icon('check', { size: 14 })} Estudiada</span>`
      : progress.started
        ? `<span class="badge badge-accent">${progress.read} de ${progress.total} apartados</span>`
        : '<span class="badge">Sin empezar</span>';
    const target = progress.lastSection && !progress.studied ? `#/grammar/${tense.id}/${progress.lastSection}` : `#/grammar/${tense.id}`;
    const action = progress.studied ? 'Repasar' : progress.started ? 'Continuar' : 'Empezar';

    return `<article class="card tense-card">
      <div class="tense-card-top">
        <span class="card-icon">${icon(tense.icon || 'book')}</span>
        <div class="tense-card-heading">
          <h3 class="tense-card-title"><a class="stretched-link" href="${target}">${escapeHtml(tense.name)}</a></h3>
          <p class="tense-card-es">${escapeHtml(tense.nameEs)}${tense.level ? ` <span class="badge badge-outline">${escapeHtml(tense.level)}</span>` : ''}</p>
        </div>
        ${ELH.ui.favButton('lessons', tense.id, { label: `favoritos: ${tense.name}`, className: 'tense-card-fav' })}
      </div>
      <p class="tense-card-summary">${escapeHtml(tense.summary)}</p>
      ${tense.formulaShort ? `<p class="tense-card-formula en">${escapeHtml(tense.formulaShort)}</p>` : ''}
      <div class="tense-card-timeline">${ELH.timeline.render({ type: tense.timeline?.type })}</div>
      <div class="tense-card-footer">
        ${status}
        <span class="tense-card-action">${action} ${icon('chevronRight', { size: 16 })}</span>
      </div>
      ${ELH.ui.progressBar(progress.studied ? 100 : progress.percent, { size: 'sm', label: `Progreso de ${tense.name}` })}
    </article>`;
  }

  function render({ el }) {
    const tenses = ELH.data.tenses;
    const studied = tenses.filter((tense) => ELH.ui.lessonProgress(tense.id).studied).length;

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Gramática</h1>
          <p class="page-lead">Cada tiempo verbal es una lección interactiva con explicación, estructura, ejemplos, errores típicos, comparaciones y ejercicios.</p>
        </div>
        <p class="page-header-meta">${plural(studied, 'lección estudiada', 'lecciones estudiadas')} de ${tenses.length}</p>
      </header>

      <section class="section" aria-labelledby="tenses-title">
        <h2 class="sr-only" id="tenses-title">Tiempos verbales</h2>
        <div class="grid grid-3">${tenses.map(tenseCard).join('')}</div>
      </section>

      <section class="section grid grid-2" aria-label="Cómo funcionan las lecciones">
        <article class="card">
          <h2 class="card-title">Cómo está organizada cada lección</h2>
          <p class="card-subtitle">Ve en orden la primera vez. Cada apartado que abres queda marcado como leído.</p>
          <ol class="lesson-outline">
            ${ELH.ui.LESSON_SECTIONS.map((section) => `<li>${icon(section.icon, { size: 18 })}<span>${escapeHtml(section.title)}</span></li>`).join('')}
          </ol>
        </article>
        <article class="card">
          <h2 class="card-title">Los colores de las frases</h2>
          <p class="card-subtitle">En todas las lecciones las frases se dividen en piezas de colores. Así ves de un vistazo dónde va cada cosa.</p>
          <div class="grammar-legend-demo">
            ${ELH.blocks.sentence([
              { text: 'She', role: 'subject' },
              { text: 'does', role: 'aux' },
              { text: 'not', role: 'neg' },
              { text: 'play', role: 'verb' },
              { text: 'tennis', role: 'rest' },
              { text: 'on Mondays', role: 'time' },
            ], { size: 'lg', punctuation: '.' })}
          </div>
          ${ELH.blocks.legend()}
        </article>
      </section>`;
  }

  ELH.pages.grammar = { title: 'Gramática', render, tenseCard };
})();
