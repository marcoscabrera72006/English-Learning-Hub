/* ==========================================================================
   theme.js
   Modo claro, modo oscuro o automático (el que use tu sistema).
   ========================================================================== */

(function () {
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  function apply(preference) {
    const root = document.documentElement;
    if (preference === 'light' || preference === 'dark') root.setAttribute('data-theme', preference);
    else root.removeAttribute('data-theme');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', effective() === 'dark' ? '#060d1e' : '#0a1630');
    window.dispatchEvent(new CustomEvent('elh:theme'));
  }

  /** Tema que se está viendo ahora mismo ('light' o 'dark'). */
  function effective() {
    const preference = ELH.store.get().profile.theme;
    if (preference === 'light' || preference === 'dark') return preference;
    return media.matches ? 'dark' : 'light';
  }

  function set(preference) {
    ELH.store.setProfile({ theme: preference });
    apply(preference);
  }

  function toggle() {
    set(effective() === 'dark' ? 'light' : 'dark');
  }

  const onSystemChange = () => {
    if (ELH.store.get().profile.theme === 'system') apply('system');
  };
  if (typeof media.addEventListener === 'function') media.addEventListener('change', onSystemChange);

  ELH.theme = { apply, effective, set, toggle };
})();
