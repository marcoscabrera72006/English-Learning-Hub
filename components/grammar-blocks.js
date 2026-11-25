/* ==========================================================================
   grammar-blocks.js
   Muestra las frases como bloques de colores: cada color es una pieza de la
   frase (sujeto, auxiliar, verbo, negación, complemento, tiempo).
   ========================================================================== */

(function () {
  const { escapeHtml } = ELH.core.utils;
  const { ROLE_LABELS } = ELH.core.grammar;

  /** Frase construida por el motor → bloques. */
  function sentence(tokens, { size = '', animated = false, punctuation = '' } = {}) {
    const parts = tokens.map((token, index) => {
      const isLast = index === tokens.length - 1;
      const text = isLast ? `${token.text}${punctuation}` : token.text;
      return `<span class="block role-${token.role}" title="${escapeHtml(ROLE_LABELS[token.role] || '')}">${escapeHtml(text)}</span>`;
    });
    const label = tokens.map((t) => t.text).join(' ') + punctuation;
    return `<div class="blocks ${size ? `blocks-${size}` : ''} ${animated ? 'is-animated' : ''}" role="text" aria-label="${escapeHtml(label)}">${parts.join('')}</div>`;
  }

  /** Fórmula de la estructura (bloque + etiqueta debajo). */
  function formula(parts) {
    const html = parts.map((part, index) => `
      ${index > 0 ? '<span class="formula-plus" aria-hidden="true">+</span>' : ''}
      <span class="formula-part">
        <span class="block role-${part.role}">${escapeHtml(part.text)}</span>
        ${part.label ? `<span class="formula-label">${escapeHtml(part.label)}</span>` : ''}
      </span>`).join('');
    const label = parts.map((part) => part.text).join(' + ');
    return `<div class="formula" role="text" aria-label="${escapeHtml(label)}">${html}</div>`;
  }

  /** Leyenda de colores. roles: lista de roles a mostrar. */
  function legend(roles = ['subject', 'aux', 'verb', 'neg', 'rest', 'time']) {
    return `<div class="legend" aria-label="Leyenda de colores">${roles.map((role) => `
      <span class="legend-item role-${role}"><span class="legend-swatch" aria-hidden="true"></span>${escapeHtml(ROLE_LABELS[role])}</span>`).join('')}
    </div>`;
  }

  ELH.blocks = { sentence, formula, legend };
})();
