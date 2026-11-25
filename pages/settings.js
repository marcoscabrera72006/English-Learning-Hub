/* ==========================================================================
   settings.js — Ajustes
   Nombre, tema, objetivo diario, traducciones, voz, copia de seguridad
   y reinicio del progreso (siempre con confirmación).
   ========================================================================== */

(function () {
  const { escapeHtml, debounce, downloadText, dayKey } = ELH.core.utils;
  const icon = ELH.core.icon;

  const THEMES = [
    { id: 'system', label: 'Automático', icon: 'settings' },
    { id: 'light', label: 'Claro', icon: 'sun' },
    { id: 'dark', label: 'Oscuro', icon: 'moon' },
  ];

  const GOALS = [10, 20, 30, 50];

  const VOICES = [
    { id: 'en-GB', label: 'Inglés británico' },
    { id: 'en-US', label: 'Inglés americano' },
  ];

  const RESETS = [
    { id: 'lessons', title: 'Borrar el progreso de las lecciones', text: 'Los apartados leídos y las lecciones marcadas como estudiadas.', label: 'Borrar lecciones' },
    { id: 'verbs', title: 'Borrar el progreso de los verbos', text: 'Verbos aprendidos, cajas de repaso y verbos favoritos.', label: 'Borrar verbos' },
    { id: 'exercises', title: 'Borrar los ejercicios', text: 'Respuestas, porcentaje de aciertos, errores frecuentes y preguntas pendientes.', label: 'Borrar ejercicios' },
    { id: 'all', title: 'Borrar todo el progreso', text: 'Deja la aplicación como nueva. Se mantienen tu nombre y tus preferencias.', label: 'Borrar todo' },
  ];

  function radioSegmented(name, options, current) {
    return `<div class="segmented" role="radiogroup" aria-label="${escapeHtml(name)}">
      ${options.map((option) => `<label class="segmented-radio"><input type="radio" name="${name}" value="${option.id}" ${String(current) === String(option.id) ? 'checked' : ''}><span>${option.icon ? icon(option.icon, { size: 16 }) : ''}${escapeHtml(option.label)}</span></label>`).join('')}
    </div>`;
  }

  function render({ el }) {
    const profile = ELH.store.get().profile;

    el.innerHTML = `
      <header class="page-header">
        <div>
          <h1>Ajustes</h1>
          <p class="page-lead">Los cambios se guardan solos en este navegador.</p>
        </div>
      </header>

      ${ELH.store.isAvailable() ? '' : `<div class="callout callout-warning section">${icon('alert')}<div><span class="callout-title">No se puede guardar el progreso</span>Tu navegador está bloqueando el almacenamiento local (por ejemplo, en modo privado). Podrás usar la aplicación, pero se perderá todo al cerrarla.</div></div>`}

      <div class="settings-layout">
        <section class="card settings-card" aria-labelledby="profile-title">
          <h2 class="card-title" id="profile-title">${icon('user', { size: 20 })} Perfil</h2>
          <label class="field">
            <span class="field-label">Tu nombre</span>
            <input class="input" type="text" name="name" value="${escapeHtml(profile.name)}" maxlength="40" autocomplete="given-name" placeholder="Escribe tu nombre">
            <span class="field-hint">Solo se usa para saludarte en el inicio.</span>
          </label>
          <div class="field">
            <span class="field-label">Objetivo diario</span>
            ${radioSegmented('dailyGoal', GOALS.map((goal) => ({ id: goal, label: String(goal) })), profile.dailyGoal)}
            <span class="field-hint">Actividades al día. Cada respuesta y cada tarjeta repasada cuentan una.</span>
          </div>
        </section>

        <section class="card settings-card" aria-labelledby="look-title">
          <h2 class="card-title" id="look-title">${icon('sun', { size: 20 })} Apariencia y estudio</h2>
          <div class="field">
            <span class="field-label">Tema</span>
            ${radioSegmented('theme', THEMES, profile.theme)}
            <span class="field-hint">Automático usa el mismo modo que tu sistema.</span>
          </div>
          <label class="switch">
            <input type="checkbox" name="showTranslations" ${profile.showTranslations ? 'checked' : ''}>
            <span class="switch-text">Mostrar la traducción de los ejemplos</span>
          </label>
          <div class="field">
            <span class="field-label">Voz para escuchar las frases</span>
            ${ELH.speech.supported ? `
              <div class="row">
                ${radioSegmented('voice', VOICES, profile.voice)}
                <button type="button" class="btn btn-secondary btn-sm" data-action="test-voice">${icon('volume', { size: 16 })} Probar</button>
              </div>
              <span class="field-hint">Usa las voces instaladas en tu dispositivo. Funciona sin conexión.</span>`
              : '<p class="text-sm muted">Tu navegador no permite leer texto en voz alta, por eso no aparecen los botones de escuchar.</p>'}
          </div>
        </section>

        <section class="card settings-card" aria-labelledby="backup-title">
          <h2 class="card-title" id="backup-title">${icon('download', { size: 20 })} Copia de seguridad</h2>
          <p class="text-sm muted">El progreso se guarda en este navegador. Si cambias de ordenador o de navegador, descarga una copia y cárgala en el otro.</p>
          <div class="row">
            <button type="button" class="btn btn-secondary" data-action="export">${icon('download', { size: 18 })} Descargar copia</button>
            <label class="btn btn-secondary file-button">
              ${icon('upload', { size: 18 })} Cargar copia
              <input type="file" accept="application/json,.json" data-import class="sr-only">
            </label>
          </div>
        </section>

        <section class="card settings-card settings-danger" aria-labelledby="reset-title">
          <h2 class="card-title" id="reset-title">${icon('trash', { size: 20 })} Reiniciar el progreso</h2>
          <p class="text-sm muted">Antes de borrar te pediremos confirmación. Lo borrado no se puede recuperar, salvo que tengas una copia descargada.</p>
          <ul class="reset-list">
            ${RESETS.map((reset) => `
              <li>
                <div><strong>${escapeHtml(reset.title)}</strong><p class="text-sm muted">${escapeHtml(reset.text)}</p></div>
                <button type="button" class="btn btn-sm ${reset.id === 'all' ? 'btn-danger' : 'btn-danger-outline'}" data-reset="${reset.id}">${escapeHtml(reset.label)}</button>
              </li>`).join('')}
          </ul>
        </section>
      </div>`;

    const saveName = debounce((value) => {
      ELH.store.setProfile({ name: value.trim() });
      ELH.toast('Nombre guardado', { icon: 'check', duration: 1800 });
    }, 600);

    function onInput(event) {
      if (event.target.name === 'name') saveName(event.target.value);
    }

    function onChange(event) {
      const { name, value, checked } = event.target;
      if (name === 'theme') ELH.theme.set(value);
      if (name === 'dailyGoal') {
        ELH.store.setProfile({ dailyGoal: Number(value) });
        ELH.toast(`Objetivo diario: ${value} actividades`, { icon: 'target', duration: 2000 });
      }
      if (name === 'showTranslations') ELH.store.setProfile({ showTranslations: checked });
      if (name === 'voice') ELH.store.setProfile({ voice: value });
      if (event.target.matches('[data-import]')) importFile(event.target);
    }

    function importFile(input) {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const ok = await ELH.confirm({
          title: '¿Cargar esta copia de seguridad?',
          message: 'Se sustituirá todo el progreso actual por el del archivo.',
          confirmLabel: 'Cargar copia',
        });
        input.value = '';
        if (!ok) return;
        try {
          ELH.store.importData(String(reader.result));
          ELH.theme.apply(ELH.store.get().profile.theme);
          ELH.toast('Copia de seguridad cargada', { type: 'success' });
          ELH.router.refresh();
        } catch (error) {
          ELH.toast(error instanceof SyntaxError ? 'El archivo no es un JSON válido.' : error.message, { type: 'error', duration: 5000 });
        }
      };
      reader.onerror = () => ELH.toast('No se pudo leer el archivo.', { type: 'error' });
      reader.readAsText(file);
    }

    async function onClick(event) {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'test-voice') ELH.speech.speak('Hello! This is how I sound. Practice makes perfect.');
      if (action === 'export') {
        downloadText(`english-learning-hub-progreso-${dayKey()}.json`, ELH.store.exportData());
        ELH.toast('Copia descargada', { type: 'success', icon: 'download' });
      }
      const resetButton = event.target.closest('[data-reset]');
      if (resetButton) {
        const reset = RESETS.find((item) => item.id === resetButton.dataset.reset);
        const ok = await ELH.confirm({
          title: `¿${reset.title}?`,
          message: `${reset.text} Esta acción no se puede deshacer.`,
          confirmLabel: reset.label,
          danger: true,
        });
        if (!ok) return;
        ELH.store.reset(reset.id);
        ELH.toast('Progreso borrado', { icon: 'trash' });
      }
    }

    el.addEventListener('input', onInput);
    el.addEventListener('change', onChange);
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('input', onInput);
      el.removeEventListener('change', onChange);
      el.removeEventListener('click', onClick);
    };
  }

  ELH.pages.settings = { title: 'Ajustes', render };
})();
