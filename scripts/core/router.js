/* ==========================================================================
   router.js
   Navegación entre secciones usando la parte "#" de la dirección
   (#/verbs, #/grammar/past-simple...). Funciona sin servidor y en GitHub Pages.

   Cada página es un objeto { title, render({ el, params, query }) }.
   render puede devolver una función de limpieza que se ejecuta al salir.
   ========================================================================== */

(function () {
  const routes = [];
  let cleanup = null;
  let firstRender = true;

  /** Define una ruta: '/grammar/:id/:section?' (el ? hace opcional el parámetro). */
  function define(path, page) {
    const keys = [];
    const pattern = path.replace(/\/:(\w+)(\?)?/g, (_, key, optional) => {
      keys.push(key);
      return optional ? '(?:/([^/]+))?' : '/([^/]+)';
    });
    routes.push({ regex: new RegExp(`^${pattern}/?$`), keys, page });
  }

  function parse() {
    const hash = window.location.hash.replace(/^#/, '') || '/';
    const [path, queryString = ''] = hash.split('?');
    return { path: path || '/', query: Object.fromEntries(new URLSearchParams(queryString)) };
  }

  function resolve() {
    const { path, query } = parse();
    for (const route of routes) {
      const match = path.match(route.regex);
      if (match) {
        const params = {};
        route.keys.forEach((key, index) => {
          if (match[index + 1] !== undefined) params[key] = decodeURIComponent(match[index + 1]);
        });
        return { page: route.page, params, query, path };
      }
    }
    return { page: ELH.pages.notFound, params: {}, query, path };
  }

  function render() {
    if (typeof cleanup === 'function') cleanup();
    cleanup = null;

    const main = document.getElementById('main');
    const context = resolve();
    main.innerHTML = '';
    main.classList.remove('page-enter');
    void main.offsetWidth; // reinicia la animación de entrada
    main.classList.add('page-enter');

    try {
      cleanup = context.page.render({ el: main, ...context }) || null;
    } catch (error) {
      console.error(error);
      main.innerHTML = `<div class="empty-state">${ELH.core.icon('alert', { size: 32 })}<strong>Algo ha fallado al mostrar esta sección</strong><p>Revisa la consola del navegador (F12) para ver el detalle. Si acabas de editar un archivo de data/, comprueba que no falte una coma o una comilla.</p><a class="btn btn-primary" href="#/">Volver al inicio</a></div>`;
    }

    const title = typeof context.page.title === 'function' ? context.page.title(context) : context.page.title;
    document.title = title ? `${title} · English Learning Hub` : 'English Learning Hub';

    if (!context.keepScroll) window.scrollTo({ top: 0 });
    if (!firstRender) main.focus({ preventScroll: true });
    firstRender = false;

    window.dispatchEvent(new CustomEvent('elh:route', { detail: { path: context.path } }));
  }

  function go(path) {
    if (window.location.hash === `#${path}`) render();
    else window.location.hash = path;
  }

  window.addEventListener('hashchange', render);

  // Página para direcciones que no existen
  ELH.pages.notFound = {
    title: 'Página no encontrada',
    render({ el }) {
      el.innerHTML = `
        <div class="empty-state">
          ${ELH.core.icon('search', { size: 32 })}
          <strong>Esta página no existe</strong>
          <p>Puede que el enlace esté mal escrito o que la lección se haya cambiado de nombre.</p>
          <a class="btn btn-primary" href="#/">Ir al inicio</a>
        </div>`;
    },
  };

  ELH.router = { define, start: render, refresh: render, go, current: parse };
})();
