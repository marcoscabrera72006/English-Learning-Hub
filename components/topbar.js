/* ==========================================================================
   topbar.js
   Barra superior: botón de menú (móvil), buscador general y cambio de tema.
   ========================================================================== */

(function () {
  const icon = ELH.core.icon;

  function themeButtonHtml() {
    const dark = ELH.theme.effective() === 'dark';
    return `${icon(dark ? 'sun' : 'moon')}<span class="sr-only">${dark ? 'Activar modo claro' : 'Activar modo oscuro'}</span>`;
  }

  function init() {
    const topbar = document.getElementById('topbar');
    topbar.innerHTML = `
      <button type="button" class="btn btn-icon topbar-menu" data-action="toggle-nav" aria-controls="sidebar" aria-expanded="false" aria-label="Abrir el menú">
        ${icon('menu')}
      </button>
      <div class="topbar-search"></div>
      <div class="topbar-actions">
        <button type="button" class="btn btn-icon" data-action="toggle-theme" title="Cambiar entre modo claro y oscuro">${themeButtonHtml()}</button>
      </div>`;

    ELH.search.mount(topbar.querySelector('.topbar-search'));

    topbar.addEventListener('click', (event) => {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'toggle-nav') {
        const open = !document.getElementById('app').classList.contains('nav-open');
        ELH.sidebar.setOpen(open);
      }
      if (action === 'toggle-theme') ELH.theme.toggle();
    });

    window.addEventListener('elh:theme', () => {
      const button = topbar.querySelector('[data-action="toggle-theme"]');
      if (button) button.innerHTML = themeButtonHtml();
    });
  }

  ELH.topbar = { init };
})();
