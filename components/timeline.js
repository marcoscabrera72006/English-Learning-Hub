/* ==========================================================================
   timeline.js
   Pequeño esquema de línea del tiempo (pasado — ahora — futuro) que muestra
   cuándo ocurre la acción de cada tiempo verbal.

   Tipos disponibles (campo timeline.type de cada lección):
     'repeated'     acción que se repite (Present Simple)
     'now-ongoing'  acción en marcha ahora (Present Continuous)
     'past-point'   acción terminada en el pasado (Past Simple)
     'past-ongoing' acción en marcha en un momento del pasado (Past Continuous)
     'past-to-now'  desde el pasado hasta ahora (Present Perfect)
     'future-point' acción en el futuro (Future Simple / going to)
   ========================================================================== */

(function () {
  const { escapeHtml } = ELH.core.utils;
  const WIDTH = 560;
  const AXIS_Y = 54;
  const NOW_X = 300;

  function base() {
    return `
      <line class="tl-axis" x1="20" y1="${AXIS_Y}" x2="${WIDTH - 20}" y2="${AXIS_Y}"/>
      <path class="tl-tick" d="M${WIDTH - 30} ${AXIS_Y - 6} L${WIDTH - 20} ${AXIS_Y} L${WIDTH - 30} ${AXIS_Y + 6}" fill="none"/>
      <line class="tl-now" x1="${NOW_X}" y1="14" x2="${NOW_X}" y2="${AXIS_Y + 22}"/>
      <text class="tl-now-label" x="${NOW_X}" y="10" text-anchor="middle">ahora</text>
      <text class="tl-label" x="24" y="${AXIS_Y + 30}">pasado</text>
      <text class="tl-label" x="${WIDTH - 24}" y="${AXIS_Y + 30}" text-anchor="end">futuro</text>`;
  }

  const SHAPES = {
    repeated: () => [90, 160, 230, 370, 440, 510]
      .map((x) => `<circle class="tl-event" cx="${x}" cy="${AXIS_Y}" r="7"/>`).join(''),
    'now-ongoing': () => `<rect class="tl-span" x="${NOW_X - 70}" y="${AXIS_Y - 11}" width="130" height="22" rx="11"/>`,
    'past-point': () => `<circle class="tl-event" cx="150" cy="${AXIS_Y}" r="9"/>`,
    'past-ongoing': () => `<rect class="tl-span" x="90" y="${AXIS_Y - 11}" width="130" height="22" rx="11"/>`,
    'past-to-now': () => `<rect class="tl-span" x="110" y="${AXIS_Y - 11}" width="${NOW_X - 110}" height="22" rx="11"/>`,
    'future-point': () => `<circle class="tl-event" cx="450" cy="${AXIS_Y}" r="9"/>`,
  };

  function render(timeline) {
    if (!timeline || !SHAPES[timeline.type]) return '';
    return `<figure class="timeline-figure">
      <svg class="timeline-svg" viewBox="0 0 ${WIDTH} ${AXIS_Y + 36}" role="img" aria-label="${escapeHtml(timeline.caption || 'Línea del tiempo')}">
        ${base()}
        ${SHAPES[timeline.type]()}
      </svg>
      ${timeline.caption ? `<figcaption>${escapeHtml(timeline.caption)}</figcaption>` : ''}
    </figure>`;
  }

  ELH.timeline = { render, types: Object.keys(SHAPES) };
})();
