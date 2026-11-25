/* ==========================================================================
   PRESENT SIMPLE
   Lección completa: explicación, estructura, ejemplos, palabras clave,
   errores frecuentes, comparaciones y ejercicios.
   Consulta docs/COMO-ANADIR-LECCIONES.md para saber qué significa cada campo.
   ========================================================================== */

ELH.registerTense({
  id: 'present-simple',
  order: 1,
  name: 'Present Simple',
  nameEs: 'Presente simple',
  level: 'A1',
  icon: 'repeat',
  summary: 'Para hablar de rutinas, hábitos, gustos y cosas que son verdad siempre.',
  formulaShort: 'I work / She works',

  timeline: {
    type: 'repeated',
    caption: 'La acción se repite: ayer, hoy, mañana... Es parte de tu vida normal.',
  },

  // 1. ¿QUÉ ES?
  what: {
    intro: [
      'El Present Simple es el presente "de siempre". Lo usamos para hablar de lo que hacemos normalmente, de cómo son las cosas y de lo que nos gusta o pensamos.',
      'No describe lo que está pasando justo en este momento, sino lo que pasa de forma habitual o lo que es verdad en general.',
    ],
    keyIdea: 'Piensa en el Present Simple como una foto de tu vida normal: lo que haces cada día, lo que te gusta y lo que siempre es verdad.',
    spanish: 'Equivale a nuestro presente de indicativo: "trabajo", "vivo", "me gusta".',
    examples: [
      { en: 'I **drink** coffee every morning.', es: 'Bebo café todas las mañanas.' },
      { en: 'Water **boils** at 100 degrees.', es: 'El agua hierve a 100 grados.' },
    ],
    quickCheck: [
      {
        id: 'ps-qc-1',
        type: 'choice',
        level: 'beginner',
        prompt: '¿Qué frase habla de una rutina?',
        options: ['I get up at seven every day.', 'I am getting up now.'],
        answers: ['I get up at seven every day.'],
        explanation: '"Every day" indica algo que se repite: es una rutina, así que usamos el Present Simple.',
        skill: 'tense-choice',
      },
      {
        id: 'ps-qc-2',
        type: 'choice',
        level: 'beginner',
        prompt: 'Con he, she o it, en frases afirmativas el verbo...',
        options: ['lleva -s', 'no cambia', 'lleva -ing'],
        answers: ['lleva -s'],
        explanation: 'Es la regla más importante del Present Simple: she works, he plays, it rains.',
        skill: 'third-person-s',
      },
    ],
  },

  // 2. ¿CUÁNDO SE UTILIZA?
  uses: [
    {
      title: 'Rutinas y hábitos',
      description: 'Cosas que haces con frecuencia: todos los días, los lunes, a menudo...',
      example: { en: 'I **get up** at seven every day.', es: 'Me levanto a las siete todos los días.' },
    },
    {
      title: 'Verdades generales y hechos',
      description: 'Cosas que siempre son ciertas o que forman parte de cómo funciona el mundo.',
      example: { en: 'The sun **rises** in the east.', es: 'El sol sale por el este.' },
    },
    {
      title: 'Gustos, opiniones y sentimientos',
      description: 'Con verbos como like, love, hate, want, know o think.',
      example: { en: 'She **loves** chocolate.', es: 'A ella le encanta el chocolate.' },
    },
    {
      title: 'Situaciones permanentes',
      description: 'Dónde vives, a qué te dedicas... cosas que no cambian de un día para otro.',
      example: { en: 'My father **works** in a bank.', es: 'Mi padre trabaja en un banco.' },
    },
    {
      title: 'Horarios y programas',
      description: 'Horarios fijos de trenes, clases, películas o tiendas.',
      example: { en: 'The train **leaves** at 8:30.', es: 'El tren sale a las 8:30.' },
    },
  ],

  // 3. ESTRUCTURA
  structure: {
    forms: {
      affirmative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'Verbo (+s)', role: 'verb', label: '+s con he / she / it' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'Con I, you, we y they el verbo se queda igual (es el infinitivo sin "to"). Con he, she e it añadimos -s al verbo.',
        template: '{subject} {s} {complement} {time}.',
        tips: {
          third: 'Con he, she o it el verbo lleva -s: works, watches, studies.',
          nonThird: 'Con I, you, we y they el verbo no cambia.',
        },
        examples: [
          { en: 'I **play** the guitar.', es: 'Toco la guitarra.' },
          { en: 'She **plays** the guitar.', es: 'Ella toca la guitarra.' },
        ],
      },
      negative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: "don't / doesn't", role: 'aux', label: 'do not / does not' },
          { text: 'Verbo', role: 'verb', label: 'sin -s' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: "Usamos el auxiliar do + not (don't). Con he, she e it usamos does + not (doesn't). El verbo vuelve a su forma base: la -s ya la lleva doesn't.",
        template: '{subject} {do} not {base} {complement} {time}.',
        tips: {
          third: "Con he, she o it usamos doesn't y el verbo va sin -s: she doesn't work.",
          nonThird: "Con I, you, we y they usamos don't: I don't work.",
        },
        examples: [
          { en: "I **don't like** fish.", es: 'No me gusta el pescado.' },
          { en: "He **doesn't like** fish.", es: 'A él no le gusta el pescado.' },
        ],
      },
      question: {
        formula: [
          { text: 'Do / Does', role: 'aux', label: 'auxiliar' },
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'Verbo', role: 'verb', label: 'sin -s' },
          { text: 'Complemento?', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'Ponemos Do al principio (o Does con he, she, it). El verbo va en su forma base, sin -s.',
        template: '{Do} {subject} {base} {complement} {time}?',
        tips: {
          third: 'Con he, she o it la pregunta empieza por Does y el verbo va sin -s: Does she work?',
          nonThird: 'Con I, you, we y they la pregunta empieza por Do: Do you work?',
        },
        examples: [
          { en: '**Do** you **speak** English?', es: '¿Hablas inglés?' },
          { en: '**Does** your brother **live** here?', es: '¿Tu hermano vive aquí?' },
        ],
      },
    },

    // El verbo "to be" funciona de otra manera: no usa do / does
    verbOverrides: {
      be: {
        affirmative: '{subject} {be} {complement} {time}.',
        negative: '{subject} {be} not {complement} {time}.',
        question: '{Be} {subject} {complement} {time}?',
        note: 'El verbo to be (ser / estar) es especial: no usa do ni does. Se dice I am, she is, they are; en negativa I am not, she isn\'t; y en pregunta Are you...?, Is she...?',
      },
    },

    spelling: {
      title: 'Cómo se añade la -s (he / she / it)',
      rules: [
        { rule: 'La mayoría de los verbos: añadimos -s.', examples: ['work → works', 'play → plays', 'read → reads'] },
        { rule: 'Verbos que terminan en -s, -sh, -ch, -x u -o: añadimos -es.', examples: ['watch → watches', 'wash → washes', 'fix → fixes', 'go → goes', 'do → does'] },
        { rule: 'Consonante + y: la y cambia a -ies.', examples: ['study → studies', 'cry → cries', 'fly → flies'] },
        { rule: 'Vocal + y: solo añadimos -s.', examples: ['play → plays', 'buy → buys', 'enjoy → enjoys'] },
        { rule: 'Verbo irregular: have.', examples: ['have → has'] },
      ],
    },

    notes: [
      {
        title: 'Los adverbios de frecuencia van antes del verbo',
        text: 'Always, usually, often, sometimes y never se colocan delante del verbo principal. Pero si el verbo es to be, van detrás.',
        examples: [
          { en: 'I **always walk** to school.', es: 'Siempre voy andando al instituto.' },
          { en: 'She **is always** happy.', es: 'Ella siempre está contenta.' },
        ],
      },
    ],

    shortAnswers: [
      { q: 'Do you like pizza?', yes: 'Yes, I do.', no: "No, I don't." },
      { q: 'Does she speak French?', yes: 'Yes, she does.', no: "No, she doesn't." },
    ],

    whQuestions: {
      formula: [
        { text: 'Wh-', role: 'rest', label: 'where, what...' },
        { text: 'do / does', role: 'aux', label: 'auxiliar' },
        { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
        { text: 'Verbo?', role: 'verb', label: 'sin -s' },
      ],
      explanation: 'Las preguntas con Where, What, When, Why o How siguen la misma estructura: la palabra interrogativa va delante de do / does.',
      examples: [
        { en: 'Where **do** you **live**?', es: '¿Dónde vives?' },
        { en: 'What time **does** the film **start**?', es: '¿A qué hora empieza la película?' },
        { en: 'What **does** your mother **do**?', es: '¿A qué se dedica tu madre?' },
      ],
    },
  },

  // Constructor de frases interactivo
  builder: {
    defaultVerb: 'work',
    verbs: [
      { base: 'work', es: 'trabajar', complement: 'in an office' },
      { base: 'play', es: 'jugar', complement: 'football' },
      { base: 'study', es: 'estudiar', complement: 'English' },
      { base: 'watch', es: 'ver', complement: 'TV' },
      { base: 'live', es: 'vivir', complement: 'in Madrid' },
      { base: 'go', es: 'ir', complement: 'to the gym' },
      { base: 'have', es: 'tener / tomar', complement: 'breakfast' },
      { base: 'like', es: 'gustar', complement: 'pizza' },
      { base: 'be', es: 'ser / estar', complement: 'at home' },
    ],
    times: ['every day', 'on Mondays', 'at the weekend', 'in the morning'],
  },

  // 4. EJEMPLOS (form: affirmative | negative | question)
  examples: [
    { en: 'I **live** in a small town.', es: 'Vivo en un pueblo pequeño.', form: 'affirmative' },
    { en: 'My sister **works** in a hospital.', es: 'Mi hermana trabaja en un hospital.', form: 'affirmative' },
    { en: 'We **play** basketball on Saturdays.', es: 'Jugamos al baloncesto los sábados.', form: 'affirmative' },
    { en: 'He **watches** TV every evening.', es: 'Él ve la tele todas las tardes.', form: 'affirmative' },
    { en: 'The shop **opens** at nine.', es: 'La tienda abre a las nueve.', form: 'affirmative' },
    { en: 'It **rains** a lot in winter.', es: 'Llueve mucho en invierno.', form: 'affirmative' },
    { en: "I **don't eat** meat.", es: 'No como carne.', form: 'negative' },
    { en: "She **doesn't like** horror films.", es: 'No le gustan las películas de terror.', form: 'negative' },
    { en: "They **don't have** a car.", es: 'No tienen coche.', form: 'negative' },
    { en: '**Do** you **speak** English?', es: '¿Hablas inglés?', form: 'question' },
    { en: '**Does** your brother **study** at university?', es: '¿Tu hermano estudia en la universidad?', form: 'question' },
    { en: 'Where **do** they **live**?', es: '¿Dónde viven?', form: 'question' },
  ],

  // 5. PALABRAS CLAVE
  keywords: [
    {
      group: 'Adverbios de frecuencia',
      note: 'Van antes del verbo principal (I always walk), pero después del verbo to be (She is always late).',
      items: [
        { word: 'always', es: 'siempre', example: { en: 'I **always** have breakfast at home.', es: 'Siempre desayuno en casa.' } },
        { word: 'usually', es: 'normalmente', example: { en: 'We **usually** go to school by bus.', es: 'Normalmente vamos al instituto en autobús.' } },
        { word: 'often', es: 'a menudo', example: { en: 'They **often** play tennis.', es: 'Juegan al tenis a menudo.' } },
        { word: 'sometimes', es: 'a veces', example: { en: 'I **sometimes** cook dinner.', es: 'A veces preparo la cena.' } },
        { word: 'rarely', es: 'rara vez', example: { en: 'He **rarely** watches TV.', es: 'Él rara vez ve la tele.' } },
        { word: 'never', es: 'nunca', example: { en: 'She **never** drinks coffee.', es: 'Ella nunca bebe café.' } },
      ],
    },
    {
      group: 'Expresiones de tiempo',
      note: 'Suelen ir al final de la frase.',
      items: [
        { word: 'every day', es: 'todos los días', example: { en: 'I study English **every day**.', es: 'Estudio inglés todos los días.' } },
        { word: 'on Mondays', es: 'los lunes', example: { en: 'We have English class **on Mondays**.', es: 'Tenemos clase de inglés los lunes.' } },
        { word: 'at the weekend', es: 'el fin de semana', example: { en: 'They visit their grandparents **at the weekend**.', es: 'Visitan a sus abuelos el fin de semana.' } },
        { word: 'once a week', es: 'una vez a la semana', example: { en: 'I go to the gym **once a week**.', es: 'Voy al gimnasio una vez a la semana.' } },
        { word: 'twice a month', es: 'dos veces al mes', example: { en: 'She goes to the cinema **twice a month**.', es: 'Va al cine dos veces al mes.' } },
        { word: 'in the morning', es: 'por la mañana', example: { en: 'He runs **in the morning**.', es: 'Él corre por la mañana.' } },
      ],
    },
  ],

  // 6. ERRORES FRECUENTES
  mistakes: [
    { wrong: 'She work in a bank.', right: 'She works in a bank.', explanation: 'Con he, she o it el verbo necesita -s en las frases afirmativas.', skill: 'third-person-s' },
    { wrong: "He don't like fish.", right: "He doesn't like fish.", explanation: "Con he, she o it el negativo es doesn't, no don't.", skill: 'do-does' },
    { wrong: "She doesn't works here.", right: "She doesn't work here.", explanation: "Doesn't ya lleva la marca de tercera persona. El verbo va sin -s.", skill: 'do-does' },
    { wrong: 'Do she live here?', right: 'Does she live here?', explanation: 'En las preguntas con he, she o it usamos Does.', skill: 'do-does' },
    { wrong: 'You like pizza?', right: 'Do you like pizza?', explanation: 'En inglés las preguntas necesitan el auxiliar do / does. No basta con la entonación, como en español.', skill: 'question-order' },
    { wrong: 'I go always to the gym.', right: 'I always go to the gym.', explanation: 'Los adverbios de frecuencia van antes del verbo principal.', skill: 'frequency-adverbs' },
    { wrong: 'He studys every day.', right: 'He studies every day.', explanation: 'Si el verbo termina en consonante + y, la y cambia a -ies.', skill: 'third-person-s' },
    { wrong: 'I am work in an office.', right: 'I work in an office.', explanation: 'No mezcles am / is / are con el Present Simple. Am, is y are solo se usan si el verbo es to be (I am a student) o en el Present Continuous (I am working).', skill: 'do-does' },
  ],

  // 7. COMPARACIONES (se muestran solo si el otro tiempo verbal existe)
  comparisons: [
    {
      with: 'present-continuous',
      intro: 'Los dos hablan del presente, pero miran cosas diferentes: uno tu vida normal y el otro lo que pasa ahora mismo.',
      rows: [
        { aspect: 'Qué expresa', this: 'Hábitos, rutinas y cosas permanentes', other: 'Acciones que están pasando ahora o en esta temporada' },
        { aspect: 'Estructura', this: 'I work / She works', other: 'I am working / She is working' },
        { aspect: 'Negativa', this: "She doesn't work.", other: "She isn't working." },
        { aspect: 'Pregunta', this: 'Does she work?', other: 'Is she working?' },
        { aspect: 'Palabras clave', this: 'always, usually, every day, on Mondays', other: 'now, right now, at the moment, today' },
        { aspect: 'Pregunta típica', this: 'What do you do? (¿A qué te dedicas?)', other: 'What are you doing? (¿Qué estás haciendo?)' },
      ],
      pairs: [
        {
          this: { en: 'I **work** in an office.', es: 'Trabajo en una oficina (es mi trabajo habitual).' },
          other: { en: 'I **am working** from home today.', es: 'Hoy estoy trabajando desde casa.' },
        },
        {
          this: { en: 'She **plays** the piano.', es: 'Toca el piano (sabe tocarlo, lo hace habitualmente).' },
          other: { en: 'She **is playing** the piano now.', es: 'Está tocando el piano ahora.' },
        },
      ],
      quiz: [
        { id: 'ps-vs-pc-1', type: 'choice', level: 'beginner', prompt: 'Listen! The baby ___.', options: ['cries', 'is crying'], answers: ['is crying'], explanation: '"Listen!" indica que está pasando en este momento: Present Continuous.', skill: 'tense-choice' },
        { id: 'ps-vs-pc-2', type: 'choice', level: 'beginner', prompt: 'My father ___ coffee every morning.', options: ['drinks', 'is drinking'], answers: ['drinks'], explanation: '"Every morning" es una rutina: Present Simple.', skill: 'tense-choice' },
        { id: 'ps-vs-pc-3', type: 'choice', level: 'intermediate', prompt: 'Be quiet, please. I ___.', options: ['study', 'am studying'], answers: ['am studying'], explanation: 'Pides silencio porque estás estudiando ahora mismo: Present Continuous.', skill: 'tense-choice' },
        { id: 'ps-vs-pc-4', type: 'choice', level: 'intermediate', prompt: 'Water ___ at 100 °C.', options: ['boils', 'is boiling'], answers: ['boils'], explanation: 'Es una verdad general (siempre ocurre): Present Simple.', skill: 'tense-choice' },
      ],
    },
    {
      with: 'past-simple',
      intro: 'Tienen una estructura muy parecida: lo que cambia es el auxiliar (do / does o did) y la forma del verbo en afirmativa.',
      rows: [
        { aspect: 'Cuándo', this: 'Presente: lo que pasa normalmente', other: 'Pasado: algo que ocurrió y terminó' },
        { aspect: 'Afirmativa', this: 'She works.', other: 'She worked.' },
        { aspect: 'Negativa', this: "She doesn't work.", other: "She didn't work." },
        { aspect: 'Pregunta', this: 'Does she work?', other: 'Did she work?' },
        { aspect: 'Palabras clave', this: 'every day, usually, on Mondays', other: 'yesterday, last week, ago, in 2020' },
      ],
      pairs: [
        {
          this: { en: 'I **walk** to school every day.', es: 'Voy andando al instituto todos los días.' },
          other: { en: 'I **walked** to school yesterday.', es: 'Ayer fui andando al instituto.' },
        },
        {
          this: { en: "He **doesn't play** tennis.", es: 'Él no juega al tenis.' },
          other: { en: "He **didn't play** tennis last Sunday.", es: 'Él no jugó al tenis el domingo pasado.' },
        },
      ],
      quiz: [
        { id: 'ps-vs-past-1', type: 'choice', level: 'beginner', prompt: 'Last summer we ___ to Italy.', options: ['go', 'went'], answers: ['went'], explanation: '"Last summer" es un momento terminado del pasado: Past Simple.', skill: 'tense-choice' },
        { id: 'ps-vs-past-2', type: 'choice', level: 'beginner', prompt: 'I usually ___ up at seven.', options: ['get', 'got'], answers: ['get'], explanation: '"Usually" indica una rutina: Present Simple.', skill: 'tense-choice' },
        { id: 'ps-vs-past-3', type: 'choice', level: 'intermediate', prompt: '___ you see the match yesterday?', options: ['Do', 'Did'], answers: ['Did'], explanation: '"Yesterday" es pasado, así que la pregunta se hace con Did.', skill: 'tense-choice' },
        { id: 'ps-vs-past-4', type: 'choice', level: 'intermediate', prompt: "She ___ like coffee. She prefers tea.", options: ["doesn't", "didn't"], answers: ["doesn't"], explanation: 'Habla de un gusto actual (prefers está en presente): Present Simple.', skill: 'tense-choice' },
      ],
    },
  ],

  // Categorías de error propias de esta lección (para "Errores más frecuentes")
  skills: {
    'third-person-s': { label: 'La -s de he / she / it', section: 'structure', tip: 'Con he, she e it el verbo lleva -s en afirmativa.' },
    'do-does': { label: 'Usar do / does correctamente', section: 'structure', tip: "Do con I, you, we, they. Does con he, she, it. Después de does / doesn't, el verbo va sin -s." },
    'frequency-adverbs': { label: 'Posición de los adverbios de frecuencia', section: 'keywords', tip: 'Antes del verbo principal, pero después de to be.' },
  },

  // 8. EJERCICIOS
  // type: fill | choice | negative | question | translate | identify | irregular | correct
  // level: beginner | intermediate | advanced
  exercises: [
    // Completar
    { id: 'ps-f1', type: 'fill', level: 'beginner', prompt: 'She ___ (live) in London.', answers: ['lives'], explanation: 'She es tercera persona del singular: live + s = lives.', skill: 'third-person-s' },
    { id: 'ps-f2', type: 'fill', level: 'beginner', prompt: 'I ___ (play) football on Saturdays.', answers: ['play'], explanation: 'Con I el verbo no cambia.', skill: 'third-person-s' },
    { id: 'ps-f3', type: 'fill', level: 'beginner', prompt: 'My brother ___ (watch) TV every night.', answers: ['watches'], explanation: 'My brother = he. Los verbos que terminan en -ch añaden -es: watches.', skill: 'third-person-s' },
    { id: 'ps-f4', type: 'fill', level: 'beginner', prompt: 'They ___ (not / like) fish.', answers: ["don't like"], explanation: "Con they usamos don't + verbo: don't like.", skill: 'do-does' },
    { id: 'ps-f5', type: 'fill', level: 'intermediate', prompt: '___ your mother work on Saturdays?', answers: ['Does'], explanation: 'Your mother = she, así que la pregunta empieza por Does.', skill: 'do-does' },
    { id: 'ps-f6', type: 'fill', level: 'intermediate', prompt: 'He ___ (study) Maths at university.', answers: ['studies'], explanation: 'Consonante + y: la y cambia a -ies. Study → studies.', skill: 'third-person-s' },
    { id: 'ps-f7', type: 'fill', level: 'intermediate', prompt: "The film ___ (start) at 9 o'clock.", answers: ['starts'], explanation: 'Un horario fijo se expresa con Present Simple. The film = it → starts.', skill: 'third-person-s' },
    { id: 'ps-f8', type: 'fill', level: 'intermediate', prompt: 'Tom ___ (not / have) a car.', answers: ["doesn't have"], explanation: "Tom = he → doesn't. Después de doesn't el verbo va en su forma base: have (no has).", skill: 'do-does', traps: { "doesn't has": "Después de doesn't el verbo vuelve a su forma base: have, no has." } },
    { id: 'ps-f9', type: 'fill', level: 'advanced', prompt: 'What time ___ (the bus / leave)?', answers: ['does the bus leave'], explanation: 'Pregunta con Wh-: What time + does + sujeto + verbo sin -s.', skill: 'question-order' },
    { id: 'ps-f10', type: 'fill', level: 'advanced', prompt: 'My cat ___ (not / eat) vegetables.', answers: ["doesn't eat"], explanation: "My cat = it → doesn't eat.", skill: 'do-does' },
    { id: 'ps-f11', type: 'fill', level: 'advanced', prompt: 'She always ___ (fly) to Paris for work.', answers: ['flies'], explanation: 'Fly termina en consonante + y: flies.', skill: 'third-person-s' },
    { id: 'ps-f12', type: 'fill', level: 'advanced', prompt: 'Where ___ (your parents / work)?', answers: ['do your parents work'], explanation: 'Your parents = they → do. Where + do + sujeto + verbo.', skill: 'question-order' },

    // Elegir
    { id: 'ps-c1', type: 'choice', level: 'beginner', prompt: 'He ___ to school by bus.', options: ['go', 'goes', 'going'], answers: ['goes'], explanation: 'He → el verbo lleva -s. Go termina en -o, así que añade -es: goes.', skill: 'third-person-s' },
    { id: 'ps-c2', type: 'choice', level: 'beginner', prompt: '___ you like chocolate?', options: ['Do', 'Does', 'Are'], answers: ['Do'], explanation: 'Con you la pregunta empieza por Do.', skill: 'do-does' },
    { id: 'ps-c3', type: 'choice', level: 'intermediate', prompt: 'My parents ___ in a big house.', options: ['lives', 'live', 'are live'], answers: ['live'], explanation: 'My parents = they → el verbo no lleva -s.', skill: 'third-person-s' },
    { id: 'ps-c4', type: 'choice', level: 'intermediate', prompt: 'She ___ coffee.', options: ["don't drink", "doesn't drink", "doesn't drinks"], answers: ["doesn't drink"], explanation: "She → doesn't, y el verbo va sin -s.", skill: 'do-does' },
    { id: 'ps-c5', type: 'choice', level: 'advanced', prompt: '¿Qué frase es correcta?', options: ['She never is late.', 'She is never late.', 'She is late never.'], answers: ['She is never late.'], explanation: 'Con el verbo to be, el adverbio de frecuencia va detrás: is never.', skill: 'frequency-adverbs' },
    { id: 'ps-c6', type: 'choice', level: 'advanced', prompt: '¿Qué frase es correcta?', options: ['Does he plays tennis?', 'Does he play tennis?', 'Do he play tennis?'], answers: ['Does he play tennis?'], explanation: 'He → Does, y el verbo va sin -s.', skill: 'do-does' },

    // Pasar a negativa
    { id: 'ps-n1', type: 'negative', level: 'beginner', prompt: 'I like pizza.', answers: ["I don't like pizza."], explanation: "Con I usamos don't + verbo.", skill: 'do-does' },
    { id: 'ps-n2', type: 'negative', level: 'beginner', prompt: 'She works on Sundays.', answers: ["She doesn't work on Sundays."], explanation: "Con she usamos doesn't y el verbo pierde la -s: works → doesn't work.", skill: 'do-does' },
    { id: 'ps-n3', type: 'negative', level: 'intermediate', prompt: 'My friends live near here.', answers: ["My friends don't live near here."], explanation: "My friends = they → don't live.", skill: 'do-does' },
    { id: 'ps-n4', type: 'negative', level: 'intermediate', prompt: 'He watches the news every day.', answers: ["He doesn't watch the news every day."], explanation: "He → doesn't watch (sin -es).", skill: 'do-does' },
    { id: 'ps-n5', type: 'negative', level: 'advanced', prompt: 'The train stops in Toledo.', answers: ["The train doesn't stop in Toledo."], explanation: "The train = it → doesn't stop.", skill: 'do-does' },
    { id: 'ps-n6', type: 'negative', level: 'advanced', prompt: 'She is a teacher.', answers: ["She isn't a teacher."], explanation: "Con el verbo to be no usamos don't / doesn't: is → is not (isn't).", skill: 'do-does', traps: { "She doesn't be a teacher.": "Con el verbo to be no se usa doesn't: basta con añadir not → She isn't a teacher." } },

    // Pasar a pregunta
    { id: 'ps-q1', type: 'question', level: 'beginner', prompt: 'You speak French.', answers: ['Do you speak French?'], explanation: 'Do + sujeto + verbo.', skill: 'question-order' },
    { id: 'ps-q2', type: 'question', level: 'beginner', prompt: 'She has a dog.', answers: ['Does she have a dog?'], explanation: 'Con she usamos Does, y has vuelve a su forma base: have.', skill: 'do-does', traps: { 'Does she has a dog?': 'Después de Does el verbo vuelve a su forma base: have, no has.' } },
    { id: 'ps-q3', type: 'question', level: 'intermediate', prompt: 'They play video games at the weekend.', answers: ['Do they play video games at the weekend?'], explanation: 'They → Do they play...?', skill: 'question-order' },
    { id: 'ps-q4', type: 'question', level: 'intermediate', prompt: 'Your brother studies Medicine.', answers: ['Does your brother study Medicine?'], explanation: 'Your brother = he → Does. Studies vuelve a study.', skill: 'do-does' },
    { id: 'ps-q5', type: 'question', level: 'advanced', prompt: 'He goes to the gym every day.', answers: ['Does he go to the gym every day?'], explanation: 'Does he + go (sin -es).', skill: 'do-does' },
    { id: 'ps-q6', type: 'question', level: 'advanced', prompt: 'She works in a hospital. (Pregunta con Where)', answers: ['Where does she work?'], explanation: 'Where + does + she + work (sin -s).', skill: 'question-order' },

    // Traducir
    { id: 'ps-t1', type: 'translate', level: 'beginner', prompt: 'Yo vivo en Madrid.', answers: ['I live in Madrid.'], explanation: 'Con I el verbo no cambia: I live.', skill: 'vocabulary' },
    { id: 'ps-t2', type: 'translate', level: 'beginner', prompt: 'Ella bebe agua.', answers: ['She drinks water.'], explanation: 'She → drink + s = drinks.', skill: 'third-person-s' },
    { id: 'ps-t3', type: 'translate', level: 'intermediate', prompt: 'Mi padre no trabaja los domingos.', answers: ["My father doesn't work on Sundays.", "My dad doesn't work on Sundays."], explanation: "My father = he → doesn't work. Los días de la semana van con on y en mayúscula.", skill: 'do-does' },
    { id: 'ps-t4', type: 'translate', level: 'intermediate', prompt: '¿Te gusta el café?', answers: ['Do you like coffee?'], explanation: 'Pregunta con you: Do you like...?', skill: 'question-order' },
    { id: 'ps-t5', type: 'translate', level: 'advanced', prompt: 'Normalmente vamos al cine los viernes.', answers: ['We usually go to the cinema on Fridays.', 'We usually go to the movies on Fridays.', 'Usually we go to the cinema on Fridays.'], explanation: 'Usually va antes del verbo principal: We usually go...', skill: 'frequency-adverbs' },
    { id: 'ps-t6', type: 'translate', level: 'advanced', prompt: '¿A qué hora empieza la clase?', answers: ['What time does the class start?', 'What time does class start?', 'What time does the lesson start?', 'When does the class start?'], explanation: 'What time + does + sujeto + start (sin -s).', skill: 'question-order' },

    // Identificar el tiempo verbal
    { id: 'ps-i1', type: 'identify', level: 'beginner', prompt: 'I play tennis every Sunday.', answers: ['present-simple'], explanation: '"Every Sunday" indica una rutina y el verbo está en su forma básica: Present Simple.', skill: 'tense-choice' },
    { id: 'ps-i2', type: 'identify', level: 'intermediate', prompt: 'Does she live in Paris?', answers: ['present-simple'], explanation: 'Pregunta con Does + verbo en forma base: Present Simple.', skill: 'tense-choice' },
    { id: 'ps-i3', type: 'identify', level: 'advanced', prompt: "He doesn't usually wake up early.", answers: ['present-simple'], explanation: "Doesn't + verbo en forma base y un adverbio de frecuencia (usually): Present Simple.", skill: 'tense-choice' },

    // Corregir errores
    { id: 'ps-e1', type: 'correct', level: 'beginner', prompt: 'He play the guitar.', answers: ['He plays the guitar.'], explanation: 'He → el verbo lleva -s: plays.', skill: 'third-person-s' },
    { id: 'ps-e2', type: 'correct', level: 'beginner', prompt: "She don't like milk.", answers: ["She doesn't like milk."], explanation: "She → doesn't.", skill: 'do-does' },
    { id: 'ps-e3', type: 'correct', level: 'intermediate', prompt: 'Does he works here?', answers: ['Does he work here?'], explanation: 'Después de Does el verbo va sin -s.', skill: 'do-does' },
    { id: 'ps-e4', type: 'correct', level: 'intermediate', prompt: 'I go never to the beach.', answers: ['I never go to the beach.'], explanation: 'Never va antes del verbo principal.', skill: 'frequency-adverbs' },
    { id: 'ps-e5', type: 'correct', level: 'advanced', prompt: 'My sister watchs TV every day.', answers: ['My sister watches TV every day.'], explanation: 'Los verbos que terminan en -ch añaden -es: watches.', skill: 'third-person-s' },
    { id: 'ps-e6', type: 'correct', level: 'advanced', prompt: 'Where you live?', answers: ['Where do you live?'], explanation: 'Las preguntas necesitan el auxiliar: Where do you live?', skill: 'question-order' },
  ],
});
