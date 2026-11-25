/* ==========================================================================
   favorites.js — Favoritos
   Verbos, lecciones y ejemplos que has guardado con la estrella.
   ========================================================================== */

(function () {
  const { escapeHtml, plural } = ELH.core.utils;
  const icon = ELH.core.icon;

  function findExample(id) {
    for (const tense of ELH.data.tenses) {
      const example = tense.examples.find((item) => ELH.pages.lesson.exampleId(tense, item) === id);
      if (example) return { tense, example };
    }
    return null;
  }

  function content() {
    const favorites = ELH.store.get().favorites;
    const verbs = favorites.verbs.map((id) => ELH.data.irregularVerbs.find((verb) => verb.infinitive === id)).filter(Boolean);
    const lessons = favorites.lessons.map((id) => ELH.data.tenses.find((tense) => tense.id === id)).filter(Boolean);
    const examples = favorites.examples.map(findExample).filter(Boolean);
    const total = verbs.length + lessons.length + examples.length;

    if (!total) {
      return ELH.ui.emptyState({
        iconName: 'star',
        title: 'Todavía no tienes favoritos',
        text: 'Pulsa la estrella que aparece junto a los verbos, las lecciones y los ejemplos para guardarlos aquí y repasarlos cuando quieras.',
        action: '<div class="row" style="justify-content:center"><a class="btn btn-primary" href="#/verbs">Ver verbos irregulares</a><a class="btn btn-secondary" href="#/grammar">Ver lecciones</a></div>',
      });
    }

    return `
      <section class="section" aria-labelledby="fav-verbs-title">
        <div class="section-title">
          <h2 id="fav-verbs-title">Verbos <span class="badge">${verbs.length}</span></h2>
          ${verbs.length ? `<a class="btn btn-secondary btn-sm" href="#/verbs/flashcards?deck=favorites">${icon('cards', { size: 16 })} Estudiar con tarjetas</a>` : ''}
        </div>
        ${verbs.length ? `<div class="table-wrap">
          <table class="table verbs-table">
            <thead><tr><th scope="col">Infinitive</th><th scope="col">Past Simple</th><th scope="col">Past Participle</th><th scope="col">Meaning</th><th scope="col"><span class="sr-only">Acciones</span></th></tr></thead>
            <tbody>${verbs.map((verb) => `
              <tr>
                <th scope="row" class="en verb-inf" data-label="Infinitive"><span>${escapeHtml(verb.infinitive)}</span></th>
                <td class="en" data-label="Past Simple">${escapeHtml(verb.past)}</td>
                <td class="en" data-label="Past Participle">${ELH.ui.verbFormHtml(verb.participle)}</td>
                <td data-label="Meaning">${escapeHtml(verb.meaning)}</td>
                <td class="verb-actions" data-label="Acciones">
                  ${ELH.speech.button([verb.infinitive, verb.past, verb.participle].filter(Boolean).join(', '), { label: 'Escuchar' })}
                  ${ELH.ui.favButton('verbs', verb.infinitive, { label: `favoritos: ${verb.infinitive}` })}
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<p class="muted">No has guardado ningún verbo. Usa la estrella de la <a href="#/verbs">lista de verbos</a>.</p>'}
      </section>

      <section class="section" aria-labelledby="fav-lessons-title">
        <div class="section-title"><h2 id="fav-lessons-title">Lecciones <span class="badge">${lessons.length}</span></h2></div>
        ${lessons.length
          ? `<div class="grid grid-3">${lessons.map((tense) => ELH.pages.grammar.tenseCard(tense)).join('')}</div>`
          : '<p class="muted">No has guardado ninguna lección. Usa la estrella que hay en cada lección.</p>'}
      </section>

      <section class="section" aria-labelledby="fav-examples-title">
        <div class="section-title"><h2 id="fav-examples-title">Ejemplos <span class="badge">${examples.length}</span></h2></div>
        ${examples.length
          ? `<div class="example-list">${examples.map(({ tense, example }) => ELH.pages.lesson.exampleHtml(example, {
            tense,
            fav: true,
            tag: `<a class="badge badge-accent" href="#/grammar/${tense.id}/examples">${escapeHtml(tense.name)}</a>`,
          })).join('')}</div>`
          : '<p class="muted">No has guardado ningún ejemplo. Los encontrarás en el apartado Ejemplos de cada lección.</p>'}
      </section>`;
  }

  function render({ el }) {
    const favorites = ELH.store.get().favorites;
    const total = favorites.verbs.length + favorites.lessons.length + favorites.examples.length;
    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Favoritos</h1>
          <p class="page-lead">Lo que has guardado para repasar. Pulsa la estrella otra vez para quitarlo.</p>
        </div>
        ${total ? `<p class="page-header-meta">${plural(total, 'elemento guardado', 'elementos guardados')}</p>` : ''}
      </header>
      <div data-favorites>${content()}</div>`;

    // Al quitar un favorito, la lista se actualiza sola
    const slot = el.querySelector('[data-favorites]');
    let last = JSON.stringify(favorites);
    const unsubscribe = ELH.store.subscribe((state) => {
      const current = JSON.stringify(state.favorites);
      if (current === last) return;
      last = current;
      slot.innerHTML = content();
      const meta = el.querySelector('.page-header-meta');
      const count = state.favorites.verbs.length + state.favorites.lessons.length + state.favorites.examples.length;
      if (meta) meta.textContent = count ? plural(count, 'elemento guardado', 'elementos guardados') : '';
    });
    return unsubscribe;
  }

  ELH.pages.favorites = { title: 'Favoritos', render };
})();
