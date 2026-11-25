/* ==========================================================================
   app.js — Arranque de la aplicación
   Aplica el tema, monta la barra lateral y la superior, y define las rutas.
   ========================================================================== */

(function () {
  ELH.theme.apply(ELH.store.get().profile.theme);
  ELH.topbar.init();
  ELH.sidebar.init();

  const { router, pages } = ELH;
  router.define('/', pages.dashboard);
  router.define('/grammar', pages.grammar);
  router.define('/grammar/:id/:section?', pages.lesson);
  router.define('/verbs', pages.verbs.list);
  router.define('/verbs/flashcards', pages.verbs.flashcards);
  router.define('/practice', pages.practice);
  router.define('/progress', pages.progress);
  router.define('/favorites', pages.favorites);
  router.define('/settings', pages.settings);
  router.define('/about', pages.about);

  // Un enlace a la página en la que ya estás la vuelve a cargar
  // (por ejemplo, pulsar "Práctica" en el menú en mitad de una sesión).
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#/"]');
    if (!link || event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;
    if (link.getAttribute('href') === window.location.hash) {
      event.preventDefault();
      router.refresh();
    }
  });

  router.start();
})();
