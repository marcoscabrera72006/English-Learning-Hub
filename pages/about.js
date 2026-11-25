/* ==========================================================================
   about.js — Acerca del proyecto
   Los datos del autor salen de data/site-config.js (no hay nada inventado:
   si los campos están vacíos, se explica cómo rellenarlos).
   ========================================================================== */

(function () {
  const { escapeHtml } = ELH.core.utils;
  const icon = ELH.core.icon;

  const TECHNOLOGIES = [
    { name: 'HTML5', text: 'Estructura semántica y accesible.' },
    { name: 'CSS3', text: 'Variables, Grid, Flexbox, modo oscuro y animaciones.' },
    { name: 'JavaScript', text: 'Sin frameworks ni dependencias. Funciona abriendo el archivo.' },
    { name: 'localStorage', text: 'El progreso se guarda en tu navegador, sin cuentas ni servidores.' },
    { name: 'Web Speech API', text: 'Lee las frases en voz alta con las voces de tu dispositivo.' },
    { name: 'GitHub Pages', text: 'Se publica gratis como una web estática.' },
  ];

  const STRUCTURE = `English-Learning-Hub/
├── index.html            Página principal
├── data/                 CONTENIDOS (aquí se edita casi todo)
│   ├── tenses/           Una lección por archivo
│   ├── irregular-verbs.js
│   ├── skills.js
│   └── site-config.js    Tu nombre y tu GitHub
├── components/           Piezas reutilizables
├── pages/                Una página por sección
├── scripts/              Núcleo y arranque
├── styles/               Diseño
├── assets/               Icono, tipografías y capturas
└── docs/                 Guía para añadir lecciones`;

  function authorCard() {
    const author = ELH.data.config.author || {};
    const name = (author.name || '').trim();
    const user = (author.githubUser || '').trim().replace(/^@/, '');
    const bio = (author.bio || '').trim();

    if (!name && !user) {
      return `<div class="author-empty">
        <span class="author-avatar" aria-hidden="true">${icon('user', { size: 26 })}</span>
        <div>
          <strong>Aquí aparecerán tu nombre y tu perfil de GitHub</strong>
          <p class="text-sm muted">Abre <code>data/site-config.js</code> y rellena los campos <code>name</code>, <code>githubUser</code> y, si quieres, <code>bio</code>. Guarda el archivo y recarga la página.</p>
        </div>
      </div>`;
    }

    const initials = (name || user).split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
    return `<div class="author">
      <span class="author-avatar" aria-hidden="true">${escapeHtml(initials)}</span>
      <div>
        ${name ? `<strong class="author-name">${escapeHtml(name)}</strong>` : ''}
        ${bio ? `<p class="muted">${escapeHtml(bio)}</p>` : ''}
        ${user ? `<a class="btn btn-secondary btn-sm" href="https://github.com/${encodeURIComponent(user)}" target="_blank" rel="noopener noreferrer">${icon('github', { size: 16 })} github.com/${escapeHtml(user)}</a>` : ''}
      </div>
    </div>`;
  }

  function render({ el }) {
    const config = ELH.data.config;
    const tenses = ELH.data.tenses;

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Acerca del proyecto</h1>
          <p class="page-lead">Qué es English Learning Hub, con qué está hecho y quién lo ha creado.</p>
        </div>
        <span class="badge">Versión ${escapeHtml(config.version)}</span>
      </header>

      <section class="about-hero card">
        ${ELH.core.logo(56)}
        <blockquote class="about-quote">${escapeHtml(config.description)}</blockquote>
      </section>

      <section class="section grid grid-2">
        <article class="card" aria-labelledby="author-title">
          <h2 class="card-title" id="author-title">Autor</h2>
          ${authorCard()}
        </article>
        <article class="card" aria-labelledby="content-title">
          <h2 class="card-title" id="content-title">Qué incluye</h2>
          <ul class="how-list">
            <li>${icon('book', { size: 18 })}<span>${tenses.length} lecciones de gramática: ${tenses.map((tense) => escapeHtml(tense.name)).join(', ')}.</span></li>
            <li>${icon('layers', { size: 18 })}<span>${ELH.data.irregularVerbs.length} verbos irregulares con tarjetas y repaso espaciado.</span></li>
            <li>${icon('target', { size: 18 })}<span>${Object.keys(ELH.core.exercises.TYPES).length} tipos de ejercicio en 3 niveles, con corrección explicada.</span></li>
            <li>${icon('chart', { size: 18 })}<span>Seguimiento del progreso, errores frecuentes y objetivo diario.</span></li>
          </ul>
        </article>
      </section>

      <section class="section" aria-labelledby="tech-title">
        <div class="section-title"><h2 id="tech-title">Tecnologías</h2></div>
        <div class="grid grid-3">
          ${TECHNOLOGIES.map((tech) => `<div class="card card-tight tech-card"><strong>${escapeHtml(tech.name)}</strong><p class="text-sm muted">${escapeHtml(tech.text)}</p></div>`).join('')}
        </div>
      </section>

      <section class="section grid grid-2">
        <article class="card" aria-labelledby="structure-title">
          <h2 class="card-title" id="structure-title">Cómo está organizado</h2>
          <p class="text-sm muted">El contenido está separado del diseño: para añadir un tiempo verbal nuevo solo hay que crear su archivo en <code>data/tenses/</code>. Los pasos están en <code>docs/COMO-ANADIR-LECCIONES.md</code>.</p>
          <pre class="code-block"><code>${escapeHtml(STRUCTURE)}</code></pre>
        </article>
        <article class="card" aria-labelledby="credits-title">
          <h2 class="card-title" id="credits-title">Créditos</h2>
          <ul class="credits-list">
            <li><strong>Lista de verbos irregulares</strong><span class="text-sm muted">Material de clase (Irregular verbs). Los 82 verbos, sus formas y sus traducciones se han copiado tal cual.</span></li>
            <li><strong>Iconos</strong><span class="text-sm muted">Basados en el estilo de Lucide (licencia ISC).</span></li>
            <li><strong>Tipografías</strong><span class="text-sm muted">Bricolage Grotesque y Atkinson Hyperlegible, de Google Fonts (licencia SIL Open Font). Van incluidas en el proyecto, así que también se ven sin conexión.</span></li>
          </ul>
        </article>
      </section>`;
  }

  ELH.pages.about = { title: 'Acerca del proyecto', render };
})();
