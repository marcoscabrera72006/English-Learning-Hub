/* ==========================================================================
   PAST SIMPLE
   Lección completa: explicación, estructura, ejemplos, palabras clave,
   errores frecuentes y ejercicios. Las comparaciones con Present Simple y
   Present Continuous se definen en esos archivos y aparecen aquí también.
   Consulta docs/COMO-ANADIR-LECCIONES.md para saber qué significa cada campo.
   ========================================================================== */

ELH.registerTense({
  id: 'past-simple',
  order: 3,
  name: 'Past Simple',
  nameEs: 'Pasado simple',
  level: 'A1–A2',
  icon: 'history',
  summary: 'Para hablar de acciones que empezaron y terminaron en un momento concreto del pasado.',
  formulaShort: 'verbo + -ed / forma irregular',

  timeline: {
    type: 'past-point',
    caption: 'La acción ocurrió en un momento del pasado y ya terminó.',
  },

  // 1. ¿QUÉ ES?
  what: {
    intro: [
      'El Past Simple cuenta cosas que empezaron y terminaron en el pasado. Normalmente sabemos cuándo pasaron: ayer, la semana pasada, en 2020...',
      'Los verbos regulares añaden -ed (work → worked). Los irregulares tienen su propia forma, que es la segunda columna de tu lista de verbos irregulares (go → went).',
      'Para las negativas y las preguntas usamos el auxiliar did, que es igual para todas las personas.',
    ],
    keyIdea: 'Acción terminada + momento del pasado = Past Simple.',
    spanish: 'Equivale sobre todo al pretérito indefinido ("trabajé", "fui") y muchas veces también al imperfecto ("vivía", "jugaba").',
    examples: [
      { en: 'I **visited** my grandparents last weekend.', es: 'Visité a mis abuelos el fin de semana pasado.' },
      { en: 'We **went** to the beach yesterday.', es: 'Ayer fuimos a la playa.' },
    ],
    quickCheck: [
      {
        id: 'past-qc-1',
        type: 'choice',
        level: 'beginner',
        prompt: '¿Qué frase está en Past Simple?',
        options: ['I walked to school.', 'I walk to school.'],
        answers: ['I walked to school.'],
        explanation: 'Walked lleva -ed: es el pasado de walk.',
        skill: 'past-regular',
      },
      {
        id: 'past-qc-2',
        type: 'choice',
        level: 'beginner',
        prompt: "En negativa, después de didn't el verbo va...",
        options: ['en infinitivo (go)', 'en pasado (went)', 'con -ing (going)'],
        answers: ['en infinitivo (go)'],
        explanation: "Did ya indica que es pasado, así que el verbo vuelve al infinitivo: I didn't go.",
        skill: 'did-infinitive',
      },
    ],
  },

  // 2. ¿CUÁNDO SE UTILIZA?
  uses: [
    {
      title: 'Acciones terminadas en un momento concreto',
      description: 'Algo que pasó y terminó: ayer, el año pasado, hace dos días...',
      example: { en: 'I **visited** my grandparents last weekend.', es: 'Visité a mis abuelos el fin de semana pasado.' },
    },
    {
      title: 'Una serie de acciones (contar una historia)',
      description: 'Varias acciones seguidas, una detrás de otra.',
      example: { en: 'She **got** up, **had** a shower and **left** for work.', es: 'Se levantó, se duchó y se fue a trabajar.' },
    },
    {
      title: 'Hábitos o situaciones del pasado',
      description: 'Cosas que hacías antes y ya no haces, o situaciones que duraron un tiempo y terminaron.',
      example: { en: 'When I was a child, I **played** with toy cars.', es: 'Cuando era pequeño, jugaba con coches de juguete.' },
    },
    {
      title: 'Describir el pasado con to be: was / were',
      description: 'Cómo era algo, dónde estaba alguien o cómo se sentía.',
      example: { en: 'The film **was** great and we **were** very happy.', es: 'La película fue genial y estábamos muy contentos.' },
    },
  ],

  // 3. ESTRUCTURA
  structure: {
    forms: {
      affirmative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'Verbo en pasado', role: 'verb', label: '-ed o irregular' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'El verbo es igual para todas las personas. Regulares: + -ed (worked). Irregulares: su propia forma (went, bought, saw...).',
        template: '{subject} {past} {complement} {time}.',
        tips: {
          third: 'En pasado he, she e it no añaden -s: she worked, he went.',
        },
        examples: [
          { en: 'I **worked** yesterday.', es: 'Ayer trabajé.' },
          { en: 'She **went** to London.', es: 'Ella fue a Londres.' },
        ],
      },
      negative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: "didn't", role: 'aux', label: 'did not' },
          { text: 'Verbo', role: 'verb', label: 'en infinitivo' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: "Usamos did + not (didn't) para todas las personas. El verbo vuelve al infinitivo: didn't go (no didn't went).",
        template: '{subject} did not {base} {complement} {time}.',
        tips: {
          default: "Didn't ya indica el pasado, así que el verbo va en infinitivo.",
        },
        examples: [
          { en: "I **didn't watch** TV.", es: 'No vi la tele.' },
          { en: "He **didn't go** to the party.", es: 'No fue a la fiesta.' },
        ],
      },
      question: {
        formula: [
          { text: 'Did', role: 'aux', label: 'auxiliar' },
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'Verbo', role: 'verb', label: 'en infinitivo' },
          { text: 'Complemento?', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'Did va al principio para todas las personas y el verbo vuelve al infinitivo.',
        template: 'Did {subject} {base} {complement} {time}?',
        tips: {
          default: 'Did + sujeto + infinitivo: Did you see...? (no "Did you saw...?")',
        },
        examples: [
          { en: '**Did** you **finish** your homework?', es: '¿Terminaste los deberes?' },
          { en: '**Did** they **win** the match?', es: '¿Ganaron el partido?' },
        ],
      },
    },

    // El verbo "to be" no usa did: was / were
    verbOverrides: {
      be: {
        affirmative: '{subject} {was} {complement} {time}.',
        negative: '{subject} {was} not {complement} {time}.',
        question: '{Was} {subject} {complement} {time}?',
        note: "To be no usa did. Con I, he, she e it → was; con you, we y they → were. Negativa: wasn't / weren't. Pregunta: Was I...? Were you...?",
      },
    },

    spelling: {
      title: 'Cómo se añade -ed (verbos regulares)',
      rules: [
        { rule: 'La mayoría de los verbos: añadimos -ed.', examples: ['work → worked', 'play → played', 'watch → watched'] },
        { rule: 'Terminan en -e: solo añadimos -d.', examples: ['live → lived', 'like → liked', 'dance → danced'] },
        { rule: 'Consonante + y: la y cambia a -ied.', examples: ['study → studied', 'cry → cried', 'try → tried'] },
        { rule: 'Vocal + y: añadimos -ed.', examples: ['play → played', 'enjoy → enjoyed', 'stay → stayed'] },
        { rule: 'Una sílaba con consonante + vocal + consonante: doblamos la última consonante.', examples: ['stop → stopped', 'plan → planned', 'chat → chatted'], note: 'En inglés británico también: travel → travelled.' },
      ],
    },

    notes: [
      {
        title: 'El verbo to be en pasado: was / were',
        text: "I, he, she, it → was. You, we, they → were. No usa did: She wasn't at home. / Were you tired?",
        examples: [
          { en: 'I **was** at the cinema last night.', es: 'Anoche estuve en el cine.' },
          { en: "They **weren't** at school.", es: 'No estaban en el instituto.' },
          { en: '**Was** it cold?', es: '¿Hacía frío?' },
        ],
      },
      {
        title: 'Cómo suena la -ed',
        text: 'Suena /t/ después de sonidos como p, k, s, sh o ch (worked, watched); /d/ después de la mayoría de sonidos sonoros (played, lived); y /ɪd/ (una sílaba más) solo después de t o d (wanted, needed).',
        examples: [
          { en: 'She **wanted** a coffee.', es: 'Quería un café. (wanted se pronuncia con una sílaba más)' },
        ],
      },
    ],

    shortAnswers: [
      { q: 'Did you see the match?', yes: 'Yes, I did.', no: "No, I didn't." },
      { q: 'Was it cold?', yes: 'Yes, it was.', no: "No, it wasn't." },
    ],

    whQuestions: {
      formula: [
        { text: 'Wh-', role: 'rest', label: 'where, what...' },
        { text: 'did', role: 'aux', label: 'auxiliar' },
        { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
        { text: 'Verbo?', role: 'verb', label: 'en infinitivo' },
      ],
      explanation: 'La palabra interrogativa va al principio, seguida de did, el sujeto y el verbo en infinitivo.',
      examples: [
        { en: 'Where **did** you **go** on holiday?', es: '¿Adónde fuiste de vacaciones?' },
        { en: 'What **did** she **buy**?', es: '¿Qué compró?' },
        { en: 'What time **did** the film **start**?', es: '¿A qué hora empezó la película?' },
      ],
    },
  },

  // Constructor de frases interactivo
  builder: {
    defaultVerb: 'go',
    verbs: [
      { base: 'go', es: 'ir', complement: 'to the beach' },
      { base: 'work', es: 'trabajar', complement: 'in a shop' },
      { base: 'play', es: 'jugar', complement: 'tennis' },
      { base: 'study', es: 'estudiar', complement: 'for the exam' },
      { base: 'visit', es: 'visitar', complement: 'my grandparents' },
      { base: 'buy', es: 'comprar', complement: 'a new phone' },
      { base: 'see', es: 'ver', complement: 'a good film' },
      { base: 'eat', es: 'comer', complement: 'pizza' },
      { base: 'write', es: 'escribir', complement: 'a letter' },
      { base: 'be', es: 'ser / estar', complement: 'at home' },
    ],
    times: ['yesterday', 'last night', 'last week', 'two days ago', 'in 2020'],
  },

  // 4. EJEMPLOS
  examples: [
    { en: 'I **watched** a great film last night.', es: 'Anoche vi una película genial.', form: 'affirmative' },
    { en: 'We **went** to the beach last summer.', es: 'Fuimos a la playa el verano pasado.', form: 'affirmative' },
    { en: 'She **bought** a new phone two days ago.', es: 'Se compró un móvil nuevo hace dos días.', form: 'affirmative' },
    { en: 'My grandparents **lived** in a small village.', es: 'Mis abuelos vivían en un pueblo pequeño.', form: 'affirmative' },
    { en: 'The concert **was** amazing.', es: 'El concierto fue increíble.', form: 'affirmative' },
    { en: 'He **woke** up, **had** breakfast and **left**.', es: 'Se despertó, desayunó y se fue.', form: 'affirmative' },
    { en: "I **didn't go** to class yesterday.", es: 'Ayer no fui a clase.', form: 'negative' },
    { en: "He **didn't study** for the exam.", es: 'No estudió para el examen.', form: 'negative' },
    { en: "We **weren't** at home.", es: 'No estábamos en casa.', form: 'negative' },
    { en: '**Did** you **finish** your homework?', es: '¿Terminaste los deberes?', form: 'question' },
    { en: 'Where **did** they **meet**?', es: '¿Dónde se conocieron?', form: 'question' },
    { en: '**Was** it cold in London?', es: '¿Hacía frío en Londres?', form: 'question' },
  ],

  // 5. PALABRAS CLAVE
  keywords: [
    {
      group: 'Expresiones de tiempo pasado',
      note: 'Indican un momento terminado del pasado. Suelen ir al principio o al final de la frase.',
      items: [
        { word: 'yesterday', es: 'ayer', example: { en: 'I called her **yesterday**.', es: 'La llamé ayer.' } },
        { word: 'last night', es: 'anoche', example: { en: 'We watched a film **last night**.', es: 'Anoche vimos una película.' } },
        { word: 'last week / year', es: 'la semana / el año pasado', example: { en: 'They played tennis **last week**.', es: 'Jugaron al tenis la semana pasada.' } },
        { word: 'in 2020', es: 'en 2020', example: { en: 'She was born **in 2005**.', es: 'Nació en 2005.' } },
        { word: 'when I was a child', es: 'cuando era pequeño/a', example: { en: '**When I was a child**, I lived in Cádiz.', es: 'Cuando era pequeño, vivía en Cádiz.' } },
      ],
    },
    {
      group: 'Ago (hace...)',
      note: 'Ago va siempre detrás de la cantidad de tiempo: two days ago (hace dos días), nunca "ago two days".',
      items: [
        { word: 'two days ago', es: 'hace dos días', example: { en: 'They arrived **two days ago**.', es: 'Llegaron hace dos días.' } },
        { word: 'a week ago', es: 'hace una semana', example: { en: 'I started the course **a week ago**.', es: 'Empecé el curso hace una semana.' } },
        { word: 'a long time ago', es: 'hace mucho tiempo', example: { en: 'We met **a long time ago**.', es: 'Nos conocimos hace mucho tiempo.' } },
      ],
    },
    {
      group: 'Para contar una historia',
      note: 'Ordenan las acciones una detrás de otra.',
      items: [
        { word: 'first', es: 'primero', example: { en: '**First**, we had breakfast.', es: 'Primero desayunamos.' } },
        { word: 'then', es: 'luego', example: { en: '**Then** we went for a walk.', es: 'Luego fuimos a dar un paseo.' } },
        { word: 'after that', es: 'después de eso', example: { en: '**After that**, we visited a museum.', es: 'Después de eso, visitamos un museo.' } },
        { word: 'finally', es: 'por último', example: { en: '**Finally**, we went home.', es: 'Por último, nos fuimos a casa.' } },
      ],
    },
  ],

  // 6. ERRORES FRECUENTES
  mistakes: [
    { wrong: "I didn't went to the party.", right: "I didn't go to the party.", explanation: "Después de didn't el verbo va en infinitivo. El pasado ya lo indica did.", skill: 'did-infinitive' },
    { wrong: 'Did you saw the film?', right: 'Did you see the film?', explanation: 'En las preguntas con Did el verbo va en infinitivo.', skill: 'did-infinitive' },
    { wrong: 'She goed to London.', right: 'She went to London.', explanation: 'Go es irregular: su pasado es went.', skill: 'past-irregular' },
    { wrong: 'We buyed a new car.', right: 'We bought a new car.', explanation: 'Buy es irregular: su pasado es bought.', skill: 'past-irregular' },
    { wrong: 'He studyed a lot.', right: 'He studied a lot.', explanation: 'Consonante + y: la y cambia a -ied → studied.', skill: 'past-regular' },
    { wrong: 'They was at home.', right: 'They were at home.', explanation: 'They va con were. Was solo con I, he, she, it.', skill: 'was-were' },
    { wrong: 'Did she was happy?', right: 'Was she happy?', explanation: 'Con el verbo to be no se usa did: la pregunta se hace con Was / Were.', skill: 'was-were' },
    { wrong: 'I arrived ago two days.', right: 'I arrived two days ago.', explanation: 'Ago va detrás de la cantidad de tiempo.', skill: 'past-time' },
  ],

  // Las comparaciones con Present Simple y Present Continuous ya están
  // definidas en sus archivos y se muestran también en esta lección.
  comparisons: [],

  skills: {
    'past-regular': { label: 'Pasado de los verbos regulares (-ed)', section: 'structure', tip: 'Fíjate en la ortografía: lived, studied, stopped.' },
    'past-irregular': { label: 'Pasado de los verbos irregulares', section: 'structure', tip: 'Es la segunda columna de la lista de verbos irregulares.', route: '#/verbs' },
    'did-infinitive': { label: "Infinitivo después de did / didn't", section: 'structure', tip: "Did ya marca el pasado: Did you go? / I didn't go." },
    'was-were': { label: 'Was / were', section: 'structure', tip: 'I, he, she, it → was. You, we, they → were. Sin did.' },
    'past-time': { label: 'Expresiones de tiempo pasado (ago, last...)', section: 'keywords', tip: 'Ago va detrás: two days ago.' },
  },

  // 8. EJERCICIOS
  exercises: [
    // Completar
    { id: 'past-f1', type: 'fill', level: 'beginner', prompt: 'I ___ (watch) a film yesterday.', answers: ['watched'], explanation: 'Watch es regular: + -ed → watched.', skill: 'past-regular' },
    { id: 'past-f2', type: 'fill', level: 'beginner', prompt: 'She ___ (go) to the cinema last night.', answers: ['went'], explanation: 'Go es irregular: go → went.', skill: 'past-irregular', traps: { goed: 'Go es irregular: su pasado es went.', gone: 'Gone es el participio. En Past Simple se usa la segunda columna: went.' } },
    { id: 'past-f3', type: 'fill', level: 'beginner', prompt: 'We ___ (be) at home yesterday.', answers: ['were'], explanation: 'We → were.', skill: 'was-were' },
    { id: 'past-f4', type: 'fill', level: 'beginner', prompt: 'They ___ (not / play) football last week.', answers: ["didn't play"], explanation: "didn't + infinitivo: didn't play.", skill: 'did-infinitive' },
    { id: 'past-f5', type: 'fill', level: 'intermediate', prompt: 'He ___ (study) for three hours.', answers: ['studied'], explanation: 'Consonante + y → -ied: studied.', skill: 'past-regular' },
    { id: 'past-f6', type: 'fill', level: 'intermediate', prompt: 'I ___ (buy) this jacket in London.', answers: ['bought'], explanation: 'Buy es irregular: bought.', skill: 'past-irregular' },
    { id: 'past-f7', type: 'fill', level: 'intermediate', prompt: 'The train ___ (stop) at every station.', answers: ['stopped'], explanation: 'Stop: una sílaba, consonante + vocal + consonante → se dobla la p: stopped.', skill: 'past-regular' },
    { id: 'past-f8', type: 'fill', level: 'intermediate', prompt: 'It ___ (not / be) cold yesterday.', answers: ["wasn't"], explanation: "It → was. Negativa: was not (wasn't). Con to be no se usa did.", skill: 'was-were', traps: { "didn't be": "Con el verbo to be no se usa did: It wasn't cold." } },
    { id: 'past-f9', type: 'fill', level: 'advanced', prompt: '___ (you / see) the match last night?', answers: ['Did you see'], explanation: 'Did + sujeto + infinitivo: Did you see...?', skill: 'did-infinitive' },
    { id: 'past-f10', type: 'fill', level: 'advanced', prompt: 'She ___ (write) a long letter to her grandmother.', answers: ['wrote'], explanation: 'Write es irregular: wrote.', skill: 'past-irregular' },
    { id: 'past-f11', type: 'fill', level: 'advanced', prompt: 'We ___ (travel) to Portugal two years ago.', answers: ['travelled', 'traveled'], explanation: 'Travel → travelled (británico) o traveled (americano).', skill: 'past-regular' },
    { id: 'past-f12', type: 'fill', level: 'advanced', prompt: 'Where ___ (they / meet)?', answers: ['did they meet'], explanation: 'Where + did + sujeto + infinitivo.', skill: 'question-order' },

    // Verbos irregulares en frases
    { id: 'past-v1', type: 'irregular', level: 'beginner', prompt: 'Yesterday I ___ (eat) paella.', answers: ['ate'], explanation: 'Eat → ate → eaten.', skill: 'past-irregular', verb: 'eat' },
    { id: 'past-v2', type: 'irregular', level: 'beginner', prompt: 'We ___ (see) a dolphin in the sea.', answers: ['saw'], explanation: 'See → saw → seen.', skill: 'past-irregular', verb: 'see' },
    { id: 'past-v3', type: 'irregular', level: 'intermediate', prompt: 'He ___ (lose) his keys again.', answers: ['lost'], explanation: 'Lose → lost → lost.', skill: 'past-irregular', verb: 'lose' },
    { id: 'past-v4', type: 'irregular', level: 'intermediate', prompt: 'My mum ___ (make) a delicious cake.', answers: ['made'], explanation: 'Make → made → made.', skill: 'past-irregular', verb: 'make' },
    { id: 'past-v5', type: 'irregular', level: 'advanced', prompt: 'The children ___ (swim) in the lake all afternoon.', answers: ['swam'], explanation: 'Swim → swam → swum. En Past Simple, swam.', skill: 'past-irregular', verb: 'swim', traps: { swum: 'Swum es el participio. El Past Simple es swam.' } },
    { id: 'past-v6', type: 'irregular', level: 'advanced', prompt: 'I ___ (think) the exam was easy.', answers: ['thought'], explanation: 'Think → thought → thought.', skill: 'past-irregular', verb: 'think' },

    // Elegir
    { id: 'past-c1', type: 'choice', level: 'beginner', prompt: 'Last year we ___ to Paris.', options: ['go', 'went', 'gone'], answers: ['went'], explanation: 'Gone es el participio; el Past Simple de go es went.', skill: 'past-irregular' },
    { id: 'past-c2', type: 'choice', level: 'beginner', prompt: 'We went to the cinema yesterday. ___ you like the film?', options: ['Do', 'Did', 'Were'], answers: ['Did'], explanation: 'Hablamos de ayer: pregunta en pasado con Did.', skill: 'did-infinitive' },
    { id: 'past-c3', type: 'choice', level: 'intermediate', prompt: 'She ___ at home last night.', options: ['was', 'were', 'did'], answers: ['was'], explanation: 'She → was.', skill: 'was-were' },
    { id: 'past-c4', type: 'choice', level: 'intermediate', prompt: "They didn't ___ the bus.", options: ['catch', 'caught', 'catched'], answers: ['catch'], explanation: "Después de didn't, infinitivo: catch.", skill: 'did-infinitive' },
    { id: 'past-c5', type: 'choice', level: 'advanced', prompt: '¿Qué frase es correcta?', options: ['Did she went home?', 'Did she go home?', 'Did she goes home?'], answers: ['Did she go home?'], explanation: 'Did + sujeto + infinitivo.', skill: 'did-infinitive' },
    { id: 'past-c6', type: 'choice', level: 'advanced', prompt: '¿Qué frase es correcta?', options: ['We was tired.', 'We were tired.', 'We did be tired.'], answers: ['We were tired.'], explanation: 'We → were. To be no usa did.', skill: 'was-were' },

    // Pasar a negativa
    { id: 'past-n1', type: 'negative', level: 'beginner', prompt: 'I played tennis.', answers: ["I didn't play tennis."], explanation: "played → didn't play.", skill: 'did-infinitive' },
    { id: 'past-n2', type: 'negative', level: 'beginner', prompt: 'She was happy.', answers: ["She wasn't happy."], explanation: "was → wasn't. Sin did.", skill: 'was-were' },
    { id: 'past-n3', type: 'negative', level: 'intermediate', prompt: 'They went to the party.', answers: ["They didn't go to the party."], explanation: "went → didn't go (infinitivo).", skill: 'did-infinitive', traps: { "They didn't went to the party.": "Después de didn't el verbo vuelve al infinitivo: go, no went." } },
    { id: 'past-n4', type: 'negative', level: 'intermediate', prompt: 'He bought a new car.', answers: ["He didn't buy a new car."], explanation: "bought → didn't buy.", skill: 'did-infinitive' },
    { id: 'past-n5', type: 'negative', level: 'advanced', prompt: 'We saw the film yesterday.', answers: ["We didn't see the film yesterday."], explanation: "saw → didn't see.", skill: 'did-infinitive' },
    { id: 'past-n6', type: 'negative', level: 'advanced', prompt: 'The children were in the garden.', answers: ["The children weren't in the garden."], explanation: "were → weren't.", skill: 'was-were' },

    // Pasar a pregunta
    { id: 'past-q1', type: 'question', level: 'beginner', prompt: 'You called Anna.', answers: ['Did you call Anna?'], explanation: 'Did + you + call (infinitivo).', skill: 'did-infinitive' },
    { id: 'past-q2', type: 'question', level: 'beginner', prompt: 'It was expensive.', answers: ['Was it expensive?'], explanation: 'Con to be: Was + it...?', skill: 'was-were' },
    { id: 'past-q3', type: 'question', level: 'intermediate', prompt: 'She took the bus.', answers: ['Did she take the bus?'], explanation: 'took → Did she take...?', skill: 'did-infinitive' },
    { id: 'past-q4', type: 'question', level: 'intermediate', prompt: 'They were at school.', answers: ['Were they at school?'], explanation: 'Were + they...?', skill: 'was-were' },
    { id: 'past-q5', type: 'question', level: 'advanced', prompt: 'He went to Rome last summer. (Pregunta con Where)', answers: ['Where did he go last summer?', 'Where did he go?'], explanation: 'Where + did + he + go.', skill: 'question-order' },
    { id: 'past-q6', type: 'question', level: 'advanced', prompt: 'They arrived at ten. (Pregunta con What time)', answers: ['What time did they arrive?'], explanation: 'What time + did + they + arrive.', skill: 'question-order' },

    // Traducir
    { id: 'past-t1', type: 'translate', level: 'beginner', prompt: 'Ayer jugué al fútbol.', answers: ['I played football yesterday.', 'Yesterday I played football.', 'I played soccer yesterday.', 'Yesterday I played soccer.'], explanation: 'Play es regular: played.', skill: 'past-regular' },
    { id: 'past-t2', type: 'translate', level: 'beginner', prompt: 'Ella estaba cansada.', answers: ['She was tired.'], explanation: 'She → was.', skill: 'was-were' },
    { id: 'past-t3', type: 'translate', level: 'intermediate', prompt: 'No fuimos a la playa.', answers: ["We didn't go to the beach."], explanation: "We + didn't + go.", skill: 'did-infinitive' },
    { id: 'past-t4', type: 'translate', level: 'intermediate', prompt: '¿Viste la película?', answers: ['Did you see the film?', 'Did you see the movie?', 'Did you watch the film?', 'Did you watch the movie?'], explanation: 'Did + you + see (infinitivo).', skill: 'did-infinitive' },
    { id: 'past-t5', type: 'translate', level: 'advanced', prompt: 'Compré este libro hace dos semanas.', answers: ['I bought this book two weeks ago.'], explanation: 'Buy → bought. Ago va detrás: two weeks ago.', skill: 'past-time' },
    { id: 'past-t6', type: 'translate', level: 'advanced', prompt: '¿Dónde conociste a tu mejor amigo?', answers: ['Where did you meet your best friend?'], explanation: 'Where + did + you + meet. "Conocer a alguien" (la primera vez) se dice meet.', skill: 'question-order' },

    // Identificar
    { id: 'past-i1', type: 'identify', level: 'beginner', prompt: 'I visited Rome in 2019.', answers: ['past-simple'], explanation: 'visited (-ed) y "in 2019": Past Simple.', skill: 'tense-choice' },
    { id: 'past-i2', type: 'identify', level: 'intermediate', prompt: "She didn't come to class yesterday.", answers: ['past-simple'], explanation: "didn't + infinitivo y \"yesterday\": Past Simple.", skill: 'tense-choice' },
    { id: 'past-i3', type: 'identify', level: 'advanced', prompt: 'Did they win the match?', answers: ['past-simple'], explanation: 'Pregunta con Did: Past Simple.', skill: 'tense-choice' },

    // Corregir errores
    { id: 'past-e1', type: 'correct', level: 'beginner', prompt: 'I goed to school.', answers: ['I went to school.'], explanation: 'Go es irregular: went.', skill: 'past-irregular' },
    { id: 'past-e2', type: 'correct', level: 'beginner', prompt: 'She were at home.', answers: ['She was at home.'], explanation: 'She → was.', skill: 'was-were' },
    { id: 'past-e3', type: 'correct', level: 'intermediate', prompt: "He didn't came to the party.", answers: ["He didn't come to the party."], explanation: "Después de didn't, infinitivo: come.", skill: 'did-infinitive' },
    { id: 'past-e4', type: 'correct', level: 'intermediate', prompt: 'We buyed some bread.', answers: ['We bought some bread.'], explanation: 'Buy es irregular: bought.', skill: 'past-irregular' },
    { id: 'past-e5', type: 'correct', level: 'advanced', prompt: 'Did you went out last night?', answers: ['Did you go out last night?'], explanation: 'Did + infinitivo: Did you go out...?', skill: 'did-infinitive' },
    { id: 'past-e6', type: 'correct', level: 'advanced', prompt: 'I saw her ago three days.', answers: ['I saw her three days ago.'], explanation: 'Ago va detrás de la cantidad de tiempo.', skill: 'past-time' },
  ],
});
