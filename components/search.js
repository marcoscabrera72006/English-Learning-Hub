/* ==========================================================================
   search.js
   Buscador general: encuentra páginas, lecciones, apartados, verbos,
   palabras clave y ejemplos. Atajo de teclado: "/" o Ctrl + K.
   ========================================================================== */

(function () {
  const { escapeHtml, normalizeSearch, plainText, debounce } = ELH.core.utils;
  const icon = ELH.core.icon;

  const GROUP_ORDER = ['Páginas', 'Lecciones', 'Verbos irregulares', 'Palabras clave', 'Ejemplos', 'Apartados de lecciones'];
  const MAX_PER_GROUP = 4;

  const PAGES = [
    { title: 'Inicio', route: '#/', icon: 'home', keywords: 'dashboard panel inicio home resumen' },
    { title: 'Gramática: tiempos verbales', route: '#/grammar', icon: 'book', keywords: 'grammar tenses tiempos verbales lecciones' },
    { title: 'Verbos irregulares', route: '#/verbs', icon: 'layers', keywords: 'irregular verbs lista tabla' },
    { title: 'Tarjetas de verbos', route: '#/verbs/flashcards', icon: 'cards', keywords: 'flashcards tarjetas repaso estudiar memorizar' },
    { title: 'Práctica', route: '#/practice', icon: 'target', keywords: 'ejercicios practice test examen' },
    { title: 'Mi progreso', route: '#/progress', icon: 'chart', keywords: 'progress estadisticas errores evolucion' },
    { title: 'Favoritos', route: '#/favorites', icon: 'star', keywords: 'favorites guardados' },
    { title: 'Ajustes', route: '#/settings', icon: 'settings', keywords: 'settings tema oscuro claro reiniciar copia seguridad nombre objetivo' },
    { title: 'Acerca del proyecto', route: '#/about', icon: 'info', keywords: 'about autor github proyecto creditos' },
  ];

  let index = null;

  function entry(group, title, subtitle, route, iconName, extra = '') {
    return {
      group,
      title,
      subtitle,
      route,
      icon: iconName,
      titleKey: normalizeSearch(title),
      haystack: normalizeSearch(`${title} ${subtitle} ${extra}`),
    };
  }

  function buildIndex() {
    const entries = PAGES.map((page) => entry('Páginas', page.title, '', page.route, page.icon, page.keywords));

    ELH.data.tenses.forEach((tense) => {
      const base = `#/grammar/${tense.id}`;
      entries.push(entry('Lecciones', tense.name, `${tense.nameEs}: ${tense.summary}`, base, tense.icon || 'book', tense.formulaShort));
      ELH.ui.LESSON_SECTIONS.forEach((section) => {
        entries.push(entry('Apartados de lecciones', section.title, tense.name, `${base}/${section.id}`, section.icon));
      });
      tense.examples.forEach((example) => {
        entries.push(entry('Ejemplos', plainText(example.en), `${example.es} (${tense.name})`, `${base}/examples`, 'message'));
      });
      tense.keywords.forEach((group) => {
        group.items.forEach((item) => {
          entries.push(entry('Palabras clave', item.word, `${item.es} (${tense.name})`, `${base}/keywords`, 'key', plainText(item.example?.en || '')));
        });
      });
    });

    ELH.data.irregularVerbs.forEach((verb) => {
      entries.push(entry(
        'Verbos irregulares',
        `${verb.infinitive} → ${verb.past} → ${verb.participle || '----------'}`,
        verb.meaning,
        `#/verbs?q=${encodeURIComponent(verb.infinitive)}`,
        'layers',
      ));
    });

    return entries;
  }

  function search(query) {
    if (!index) index = buildIndex();
    const q = normalizeSearch(query);
    if (!q) return [];
    const terms = q.split(/\s+/);
    const scored = [];
    index.forEach((item) => {
      if (!terms.every((term) => item.haystack.includes(term))) return;
      let score = 1;
      if (item.titleKey === q) score += 100;
      else if (item.titleKey.startsWith(q)) score += 50;
      else if (item.titleKey.includes(q)) score += 20;
      scored.push({ ...item, score });
    });
    scored.sort((a, b) => b.score - a.score);

    const grouped = GROUP_ORDER.map((group) => ({
      group,
      items: scored.filter((item) => item.group === group).slice(0, MAX_PER_GROUP),
    })).filter((group) => group.items.length);
    return grouped;
  }

  function mount(container) {
    container.innerHTML = `
      <div class="search" role="search">
        <label class="sr-only" for="global-search">Buscar en English Learning Hub</label>
        <div class="input-with-icon">
          ${icon('search', { size: 18 })}
          <input id="global-search" class="input" type="search" placeholder="Buscar verbos, lecciones, ejemplos..." autocomplete="off" spellcheck="false"
            role="combobox" aria-expanded="false" aria-controls="search-results" aria-autocomplete="list">
        </div>
        <span class="search-shortcut kbd" aria-hidden="true">/</span>
        <div class="search-results" id="search-results" role="listbox" hidden></div>
      </div>`;

    const input = container.querySelector('input');
    const panel = container.querySelector('.search-results');
    let flat = [];
    let active = -1;

    function close() {
      panel.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }

    function setActive(newIndex) {
      active = newIndex;
      panel.querySelectorAll('.search-item').forEach((item, i) => {
        item.setAttribute('aria-selected', String(i === active));
        if (i === active) {
          input.setAttribute('aria-activedescendant', item.id);
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    function render() {
      const query = input.value.trim();
      if (!query) {
        close();
        return;
      }
      const groups = search(query);
      flat = groups.flatMap((group) => group.items);
      if (!flat.length) {
        panel.innerHTML = `<p class="search-empty">No hay resultados para "${escapeHtml(query)}". Prueba con un verbo (go, went), un tiempo verbal o una palabra en español.</p>`;
      } else {
        let counter = 0;
        panel.innerHTML = groups.map((group) => `
          <div role="group" aria-label="${escapeHtml(group.group)}">
            <p class="search-group-title">${escapeHtml(group.group)}</p>
            ${group.items.map((item) => {
              const id = `search-option-${counter++}`;
              return `<a class="search-item" id="${id}" role="option" aria-selected="false" href="${item.route}">
                ${icon(item.icon, { size: 18 })}
                <span class="search-item-text">
                  <span class="search-item-title">${escapeHtml(item.title)}</span>
                  ${item.subtitle ? `<span class="search-item-sub">${escapeHtml(item.subtitle)}</span>` : ''}
                </span>
              </a>`;
            }).join('')}
          </div>`).join('');
      }
      panel.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      active = -1;
    }

    const onInput = debounce(render, 80);
    input.addEventListener('input', onInput);
    input.addEventListener('focus', () => { if (input.value.trim()) render(); });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' && flat.length) {
        event.preventDefault();
        setActive(active < flat.length - 1 ? active + 1 : 0);
      } else if (event.key === 'ArrowUp' && flat.length) {
        event.preventDefault();
        setActive(active > 0 ? active - 1 : flat.length - 1);
      } else if (event.key === 'Enter') {
        const target = flat[active >= 0 ? active : 0];
        if (target) {
          event.preventDefault();
          ELH.router.go(target.route.replace(/^#/, ''));
          input.value = '';
          close();
          input.blur();
        }
      } else if (event.key === 'Escape') {
        input.value = '';
        close();
        input.blur();
      }
    });

    panel.addEventListener('click', (event) => {
      if (event.target.closest('.search-item')) {
        input.value = '';
        close();
      }
    });

    document.addEventListener('click', (event) => {
      if (!container.contains(event.target)) close();
    });

    // Atajos: "/" o Ctrl + K
    document.addEventListener('keydown', (event) => {
      const typing = event.target.matches('input, textarea, select, [contenteditable="true"]');
      if ((event.key === '/' && !typing) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  ELH.search = { mount, search };
})();
