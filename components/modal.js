/* ==========================================================================
   modal.js
   Ventana de confirmación. Devuelve una promesa con true (aceptar) o false.
   Uso:
     const ok = await ELH.confirm({ title, message, confirmLabel, danger: true });
   ========================================================================== */

(function () {
  const { escapeHtml } = ELH.core.utils;

  function confirmDialog({ title, message, confirmLabel = 'Aceptar', cancelLabel = 'Cancelar', danger = false } = {}) {
    return new Promise((resolve) => {
      const root = document.getElementById('modal-root');
      const previousFocus = document.activeElement;
      const titleId = `modal-title-${Date.now()}`;

      root.innerHTML = `
        <div class="modal-backdrop" data-modal-close>
          <div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="${titleId}">
            <div class="modal-icon ${danger ? '' : 'is-info'}">${ELH.core.icon(danger ? 'alert' : 'info', { size: 24 })}</div>
            <h2 id="${titleId}">${escapeHtml(title)}</h2>
            <p>${escapeHtml(message)}</p>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" data-modal-cancel>${escapeHtml(cancelLabel)}</button>
              <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-modal-confirm>${escapeHtml(confirmLabel)}</button>
            </div>
          </div>
        </div>`;

      const dialog = root.querySelector('.modal');
      const buttons = Array.from(dialog.querySelectorAll('button'));

      function close(result) {
        document.removeEventListener('keydown', onKeydown);
        root.innerHTML = '';
        if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
        resolve(result);
      }

      function onKeydown(event) {
        if (event.key === 'Escape') close(false);
        // Mantiene el foco dentro de la ventana
        if (event.key === 'Tab') {
          const first = buttons[0];
          const last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
      }

      root.querySelector('[data-modal-cancel]').addEventListener('click', () => close(false));
      root.querySelector('[data-modal-confirm]').addEventListener('click', () => close(true));
      root.querySelector('[data-modal-close]').addEventListener('click', (event) => {
        if (event.target === event.currentTarget) close(false);
      });
      document.addEventListener('keydown', onKeydown);
      buttons[0].focus();
    });
  }

  ELH.confirm = confirmDialog;
})();
