/* ==========================================================================
   toast.js
   Avisos breves en la esquina inferior ("¡Verbo aprendido!", "Progreso guardado").
   Uso: ELH.toast('Texto', { type: 'success' | 'info' | 'error' })
   ========================================================================== */

(function () {
  const ICONS = { success: 'checkCircle', info: 'info', error: 'alert', star: 'star', trophy: 'trophy' };

  function toast(message, { type = 'info', icon, duration = 3200 } = {}) {
    const region = document.getElementById('toast-region');
    if (!region) return;
    const element = document.createElement('div');
    element.className = `toast toast-${type}`;
    element.setAttribute('role', 'status');
    element.innerHTML = `${ELH.core.icon(icon || ICONS[type] || 'info', { size: 20 })}<span>${ELH.core.utils.escapeHtml(message)}</span>`;
    region.appendChild(element);

    setTimeout(() => {
      element.classList.add('is-leaving');
      setTimeout(() => element.remove(), 300);
    }, duration);
  }

  ELH.toast = toast;
})();
