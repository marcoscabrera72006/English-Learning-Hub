/* ==========================================================================
   utils.js
   Funciones pequeñas que se usan en toda la aplicación.
   ========================================================================== */

(function () {
  const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const DAY_MS = 24 * 60 * 60 * 1000;

  /** Evita que un texto se interprete como HTML. */
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
  }

  /** Convierte **texto** en un resaltado (se usa para marcar el verbo en los ejemplos). */
  function richText(value) {
    return escapeHtml(value).replace(/\*\*(.+?)\*\*/g, '<strong class="hl">$1</strong>');
  }

  /** Quita las marcas ** de un texto. */
  function plainText(value) {
    return String(value ?? '').replace(/\*\*/g, '');
  }

  /** Minúsculas y sin tildes: sirve para buscar sin preocuparse de acentos. */
  function normalizeSearch(value) {
    return String(value ?? '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .trim();
  }

  function shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /** Número a partir de un texto (siempre el mismo para el mismo texto). */
  function hashString(text) {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  /** Clave del día en formato AAAA-MM-DD (hora local). */
  function dayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /** Elige un elemento distinto cada día, pero el mismo durante todo el día. */
  function pickOfTheDay(list, salt = '') {
    if (!list.length) return null;
    return list[hashString(dayKey() + salt) % list.length];
  }

  /** "hace 5 min", "ayer", "hace 3 días"... */
  function timeAgo(timestamp) {
    if (!timestamp) return '';
    const minutes = Math.round((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'ahora mismo';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.round(hours / 24);
    if (days === 1) return 'ayer';
    if (days < 30) return `hace ${days} días`;
    return new Date(timestamp).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function percent(part, total) {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  function plural(count, singular, pluralForm) {
    return `${count} ${count === 1 ? singular : pluralForm}`;
  }

  function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }

  function debounce(fn, wait = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  /** Distancia de edición entre dos textos (cuántas letras hay que cambiar). */
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      const current = [i];
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      }
      previous = current;
    }
    return previous[b.length];
  }

  /** Atajo para obtener un elemento. */
  function qs(selector, root = document) {
    return root.querySelector(selector);
  }

  function qsa(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  /** Descarga un texto como archivo (por ejemplo, la copia de seguridad). */
  function downloadText(filename, text, type = 'application/json') {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  ELH.core.utils = {
    DAY_MS,
    escapeHtml,
    richText,
    plainText,
    normalizeSearch,
    shuffle,
    hashString,
    dayKey,
    pickOfTheDay,
    timeAgo,
    percent,
    plural,
    capitalize,
    debounce,
    levenshtein,
    qs,
    qsa,
    downloadText,
  };
})();
