/* ==========================================================================
   speech.js
   Pronunciación con la síntesis de voz del propio navegador (Web Speech API).
   No usa servicios externos. Si el navegador no la soporta, los botones de
   "Escuchar" simplemente no aparecen.
   ========================================================================== */

(function () {
  const { escapeHtml, plainText } = ELH.core.utils;
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  let voices = [];

  function loadVoices() {
    voices = window.speechSynthesis.getVoices();
  }

  if (supported) {
    loadVoices();
    if (typeof window.speechSynthesis.addEventListener === 'function') {
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }
  }

  function pickVoice(lang) {
    const normalized = (voice) => voice.lang.replace('_', '-');
    return voices.find((voice) => normalized(voice) === lang)
      || voices.find((voice) => normalized(voice).startsWith('en'))
      || null;
  }

  function speak(text) {
    if (!supported) return;
    const lang = ELH.store.get().profile.voice || 'en-GB';
    const utterance = new SpeechSynthesisUtterance(plainText(text).replace(/_{2,}/g, 'blank'));
    utterance.lang = lang;
    utterance.rate = 0.9;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  /** Botón "Escuchar". Devuelve '' si el navegador no tiene síntesis de voz. */
  function button(text, { label = 'Escuchar', className = '' } = {}) {
    if (!supported) return '';
    const clean = plainText(text);
    return `<button type="button" class="btn btn-icon btn-sm ${className}" data-speak="${escapeHtml(clean)}" aria-label="${escapeHtml(`${label}: ${clean}`)}" title="${escapeHtml(label)}">${ELH.core.icon('volume', { size: 18 })}</button>`;
  }

  // Un único listener para todos los botones de "Escuchar"
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-speak]');
    if (trigger) speak(trigger.dataset.speak);
  });

  ELH.speech = { supported, speak, button };
})();
