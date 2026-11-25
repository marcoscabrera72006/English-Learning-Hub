/* ==========================================================================
   PRESENT CONTINUOUS
   Lección completa: explicación, estructura, ejemplos, palabras clave,
   errores frecuentes, comparaciones y ejercicios.
   Consulta docs/COMO-ANADIR-LECCIONES.md para saber qué significa cada campo.
   ========================================================================== */

ELH.registerTense({
  id: 'present-continuous',
  order: 2,
  name: 'Present Continuous',
  nameEs: 'Presente continuo',
  level: 'A1',
  icon: 'play',
  summary: 'Para hablar de lo que está pasando ahora mismo, de situaciones temporales y de planes ya organizados.',
  formulaShort: 'am / is / are + verbo-ing',

  timeline: {
    type: 'now-ongoing',
    caption: 'La acción empezó hace un momento y todavía no ha terminado: está en marcha ahora.',
  },

  // 1. ¿QUÉ ES?
  what: {
    intro: [
      'El Present Continuous (también llamado Present Progressive) sirve para hablar de acciones que están en marcha: empezaron hace poco y todavía no han terminado.',
      'Se forma con el verbo to be en presente (am, is, are) más el verbo principal terminado en -ing.',
    ],
    keyIdea: 'Si en español dirías "estoy + -ando / -iendo" (estoy comiendo, está lloviendo), lo más probable es que en inglés necesites el Present Continuous.',
    spanish: 'Equivale a "estar + gerundio": estoy estudiando, están jugando.',
    examples: [
      { en: 'I **am studying** English right now.', es: 'Estoy estudiando inglés ahora mismo.' },
      { en: 'Look! It **is snowing**.', es: '¡Mira! Está nevando.' },
    ],
    quickCheck: [
      {
        id: 'pc-qc-1',
        type: 'choice',
        level: 'beginner',
        prompt: '¿Qué frase describe algo que está pasando ahora?',
        options: ['She is talking on the phone.', 'She talks on the phone every day.'],
        answers: ['She is talking on the phone.'],
        explanation: 'Is talking (is + verbo-ing) describe una acción en marcha en este momento.',
        skill: 'tense-choice',
      },
      {
        id: 'pc-qc-2',
        type: 'choice',
        level: 'beginner',
        prompt: 'El Present Continuous se forma con...',
        options: ['am / is / are + verbo-ing', 'do / does + verbo', 'verbo + -ed'],
        answers: ['am / is / are + verbo-ing'],
        explanation: 'Siempre necesita dos piezas: el verbo to be (am, is, are) y el verbo principal con -ing.',
        skill: 'be-aux',
      },
    ],
  },

  // 2. ¿CUÁNDO SE UTILIZA?
  uses: [
    {
      title: 'Acciones que pasan ahora mismo',
      description: 'Lo que está ocurriendo en el momento en que hablas.',
      example: { en: 'I **am studying** English right now.', es: 'Estoy estudiando inglés ahora mismo.' },
    },
    {
      title: 'Situaciones temporales',
      description: 'Esta semana, este mes, estos días: algo que está pasando durante una temporada, pero no es permanente.',
      example: { en: 'She **is living** with her aunt this month.', es: 'Este mes está viviendo con su tía.' },
    },
    {
      title: 'Planes de futuro ya organizados',
      description: 'Cuando algo ya está decidido y organizado (con hora, fecha o lugar). Suele llevar una expresión de futuro: tonight, tomorrow, next week...',
      example: { en: 'We **are meeting** Laura tomorrow at five.', es: 'Quedamos con Laura mañana a las cinco.' },
    },
    {
      title: 'Cambios y tendencias',
      description: 'Cosas que están cambiando poco a poco.',
      example: { en: 'The weather **is getting** colder.', es: 'Está empezando a hacer más frío.' },
    },
  ],

  // 3. ESTRUCTURA
  structure: {
    forms: {
      affirmative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'am / is / are', role: 'aux', label: 'verbo to be' },
          { text: 'Verbo + -ing', role: 'verb', label: 'working, playing...' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'Usamos el verbo to be en presente como auxiliar y el verbo principal con -ing. Con I → am; con he, she, it → is; con you, we, they → are.',
        template: '{subject} {be} {ing} {complement} {time}.',
        tips: {
          I: "Con I siempre usamos am: I am working (I'm working).",
          third: "Con he, she o it usamos is: she is working (she's working).",
          nonThird: "Con you, we y they usamos are: they are working (they're working).",
        },
        examples: [
          { en: 'I **am reading** a book.', es: 'Estoy leyendo un libro.' },
          { en: 'They **are playing** in the park.', es: 'Están jugando en el parque.' },
        ],
      },
      negative: {
        formula: [
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'am / is / are', role: 'aux', label: 'verbo to be' },
          { text: 'not', role: 'neg', label: "isn't, aren't" },
          { text: 'Verbo + -ing', role: 'verb', label: 'working, playing...' },
          { text: 'Complemento', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: "Añadimos not después de am, is o are. Formas cortas: I'm not, isn't, aren't.",
        template: '{subject} {be} not {ing} {complement} {time}.',
        tips: {
          I: "Con I la forma corta es I'm not (no existe \"amn't\").",
          third: "Con he, she o it: is not = isn't.",
          nonThird: "Con you, we y they: are not = aren't.",
        },
        examples: [
          { en: "She **isn't working** today.", es: 'Hoy no está trabajando.' },
          { en: "We **aren't watching** TV.", es: 'No estamos viendo la tele.' },
        ],
      },
      question: {
        formula: [
          { text: 'Am / Is / Are', role: 'aux', label: 'verbo to be' },
          { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
          { text: 'Verbo + -ing', role: 'verb', label: 'working, playing...' },
          { text: 'Complemento?', role: 'rest', label: 'resto de la frase' },
        ],
        explanation: 'Cambiamos el orden: el verbo to be va antes del sujeto. No usamos do ni does.',
        template: '{Be} {subject} {ing} {complement} {time}?',
        tips: {
          I: 'Con I: Am I...?',
          third: 'Con he, she o it: Is she working?',
          nonThird: 'Con you, we y they: Are you working?',
        },
        examples: [
          { en: '**Are** you **coming** to the party?', es: '¿Vienes a la fiesta?' },
          { en: '**Is** it **raining**?', es: '¿Está lloviendo?' },
        ],
      },
    },

    spelling: {
      title: 'Cómo se forma el -ing',
      rules: [
        { rule: 'La mayoría de los verbos: añadimos -ing.', examples: ['work → working', 'play → playing', 'read → reading'] },
        { rule: 'Terminan en -e (que no suena): quitamos la e.', examples: ['make → making', 'write → writing', 'come → coming'], note: 'Pero: see → seeing, be → being.' },
        { rule: 'Terminan en -ie: cambia a -ying.', examples: ['lie → lying', 'die → dying'] },
        { rule: 'Una sílaba con consonante + vocal + consonante: doblamos la última consonante.', examples: ['run → running', 'swim → swimming', 'sit → sitting', 'stop → stopping'] },
        { rule: 'No se dobla si termina en w, x o y.', examples: ['snow → snowing', 'fix → fixing', 'play → playing'] },
      ],
    },

    notes: [
      {
        title: 'Verbos que normalmente no se usan en continuo',
        text: 'Los verbos de estado (gustos, opiniones, saber, poseer) suelen ir en Present Simple aunque hablemos de ahora: like, love, hate, want, need, know, understand, believe, remember, own.',
        examples: [
          { en: 'I **know** the answer.', es: 'Sé la respuesta. (no "I am knowing")' },
          { en: 'She **wants** a new phone.', es: 'Quiere un móvil nuevo. (no "she is wanting")' },
        ],
      },
    ],

    shortAnswers: [
      { q: 'Are you watching TV?', yes: 'Yes, I am.', no: "No, I'm not." },
      { q: 'Is it raining?', yes: 'Yes, it is.', no: "No, it isn't." },
    ],

    whQuestions: {
      formula: [
        { text: 'Wh-', role: 'rest', label: 'where, what...' },
        { text: 'am / is / are', role: 'aux', label: 'verbo to be' },
        { text: 'Sujeto', role: 'subject', label: 'I / you / he...' },
        { text: 'Verbo + -ing?', role: 'verb', label: 'doing, going...' },
      ],
      explanation: 'La palabra interrogativa va al principio y después am / is / are + sujeto + verbo-ing.',
      examples: [
        { en: 'What **are** you **doing**?', es: '¿Qué estás haciendo?' },
        { en: 'Where **is** she **going**?', es: '¿Adónde va?' },
        { en: 'Why **are** they **laughing**?', es: '¿Por qué se están riendo?' },
      ],
    },
  },

  // Constructor de frases interactivo
  builder: {
    defaultVerb: 'study',
    verbs: [
      { base: 'study', es: 'estudiar', complement: 'English' },
      { base: 'work', es: 'trabajar', complement: 'from home' },
      { base: 'watch', es: 'ver', complement: 'a film' },
      { base: 'play', es: 'jugar', complement: 'video games' },
      { base: 'read', es: 'leer', complement: 'a book' },
      { base: 'cook', es: 'cocinar', complement: 'dinner' },
      { base: 'write', es: 'escribir', complement: 'an email' },
      { base: 'run', es: 'correr', complement: 'in the park' },
      { base: 'swim', es: 'nadar', complement: 'in the pool' },
    ],
    times: ['now', 'right now', 'at the moment', 'today', 'this week', 'tonight'],
  },

  // 4. EJEMPLOS
  examples: [
    { en: 'I **am reading** a very good book.', es: 'Estoy leyendo un libro muy bueno.', form: 'affirmative' },
    { en: 'Look! It **is snowing**.', es: '¡Mira! Está nevando.', form: 'affirmative' },
    { en: 'The children **are playing** in the garden.', es: 'Los niños están jugando en el jardín.', form: 'affirmative' },
    { en: 'My parents **are travelling** around Italy this month.', es: 'Mis padres están viajando por Italia este mes.', form: 'affirmative' },
    { en: 'We **are having** a party on Saturday.', es: 'Hacemos una fiesta el sábado.', form: 'affirmative' },
    { en: 'Prices **are going** up.', es: 'Los precios están subiendo.', form: 'affirmative' },
    { en: "I **am not sleeping**. I'm just resting.", es: 'No estoy durmiendo. Solo estoy descansando.', form: 'negative' },
    { en: "She **isn't working** today.", es: 'Hoy no está trabajando.', form: 'negative' },
    { en: "They **aren't listening** to the teacher.", es: 'No están escuchando al profesor.', form: 'negative' },
    { en: '**Are** you **coming** to the party?', es: '¿Vienes a la fiesta?', form: 'question' },
    { en: '**Is** he **wearing** a jacket?', es: '¿Lleva puesta una chaqueta?', form: 'question' },
    { en: 'What **are** you **cooking**?', es: '¿Qué estás cocinando?', form: 'question' },
  ],

  // 5. PALABRAS CLAVE
  keywords: [
    {
      group: 'Ahora mismo',
      note: 'Indican que la acción está pasando en este momento.',
      items: [
        { word: 'now', es: 'ahora', example: { en: 'She is sleeping **now**.', es: 'Ahora está durmiendo.' } },
        { word: 'right now', es: 'ahora mismo', example: { en: "I'm cooking **right now**.", es: 'Estoy cocinando ahora mismo.' } },
        { word: 'at the moment', es: 'en este momento', example: { en: 'He is working **at the moment**.', es: 'En este momento está trabajando.' } },
        { word: 'Look!', es: '¡Mira!', example: { en: '**Look!** The bus is coming.', es: '¡Mira! Viene el autobús.' } },
        { word: 'Listen!', es: '¡Escucha!', example: { en: '**Listen!** Someone is singing.', es: '¡Escucha! Alguien está cantando.' } },
      ],
    },
    {
      group: 'Temporadas',
      note: 'Situaciones temporales que todavía no han terminado.',
      items: [
        { word: 'today', es: 'hoy', example: { en: "I'm working from home **today**.", es: 'Hoy estoy trabajando desde casa.' } },
        { word: 'this week', es: 'esta semana', example: { en: 'We are studying the Past Simple **this week**.', es: 'Esta semana estamos estudiando el Past Simple.' } },
        { word: 'these days', es: 'estos días', example: { en: 'She is learning to drive **these days**.', es: 'Estos días está aprendiendo a conducir.' } },
        { word: 'currently', es: 'actualmente', example: { en: 'They are **currently** living in Valencia.', es: 'Actualmente están viviendo en Valencia.' } },
      ],
    },
    {
      group: 'Planes de futuro',
      note: 'Con una expresión de futuro, el Present Continuous habla de planes ya organizados.',
      items: [
        { word: 'tonight', es: 'esta noche', example: { en: 'We are going to the cinema **tonight**.', es: 'Esta noche vamos al cine.' } },
        { word: 'tomorrow', es: 'mañana', example: { en: 'I am meeting my friends **tomorrow**.', es: 'Mañana he quedado con mis amigos.' } },
        { word: 'next week', es: 'la semana que viene', example: { en: 'She is flying to Rome **next week**.', es: 'La semana que viene vuela a Roma.' } },
        { word: 'at the weekend', es: 'el fin de semana', example: { en: 'What are you doing **at the weekend**?', es: '¿Qué haces el fin de semana?' } },
      ],
    },
  ],

  // 6. ERRORES FRECUENTES
  mistakes: [
    { wrong: 'She working now.', right: 'She is working now.', explanation: 'Falta el verbo to be. El Present Continuous siempre necesita am, is o are.', skill: 'be-aux' },
    { wrong: 'I am work at the moment.', right: 'I am working at the moment.', explanation: 'Después de am, is o are el verbo lleva -ing.', skill: 'be-aux' },
    { wrong: 'They is playing football.', right: 'They are playing football.', explanation: 'They va con are.', skill: 'be-aux' },
    { wrong: 'He is runing in the park.', right: 'He is running in the park.', explanation: 'Run tiene una sílaba y termina en consonante + vocal + consonante: se dobla la n → running.', skill: 'ing-spelling' },
    { wrong: 'She is writeing a letter.', right: 'She is writing a letter.', explanation: 'Si el verbo termina en -e, la quitamos antes de añadir -ing.', skill: 'ing-spelling' },
    { wrong: 'I am knowing the answer.', right: 'I know the answer.', explanation: 'Know es un verbo de estado (como like, love, want, need o understand): normalmente no se usa en continuo.', skill: 'stative-verbs' },
    { wrong: 'Do you watching TV?', right: 'Are you watching TV?', explanation: 'En el Present Continuous la pregunta se hace con am, is o are, nunca con do / does.', skill: 'question-order' },
    { wrong: 'What you are doing?', right: 'What are you doing?', explanation: 'En las preguntas, are va antes del sujeto.', skill: 'question-order' },
  ],

  // 7. COMPARACIONES
  comparisons: [
    {
      with: 'past-simple',
      intro: 'Uno mira lo que está pasando ahora; el otro, algo que ya terminó en el pasado.',
      rows: [
        { aspect: 'Cuándo', this: 'Ahora, en este momento o en esta temporada', other: 'En un momento terminado del pasado' },
        { aspect: 'Estructura', this: 'am / is / are + verbo-ing', other: 'verbo + -ed o forma irregular' },
        { aspect: 'Negativa', this: "She isn't working.", other: "She didn't work." },
        { aspect: 'Pregunta', this: 'Are you studying?', other: 'Did you study?' },
        { aspect: 'Palabras clave', this: 'now, at the moment, today, this week', other: 'yesterday, last night, ago, in 2019' },
      ],
      pairs: [
        {
          this: { en: 'I **am reading** a book now.', es: 'Ahora estoy leyendo un libro.' },
          other: { en: 'I **read** a book last week.', es: 'Leí un libro la semana pasada.' },
        },
        {
          this: { en: 'They **are playing** football at the moment.', es: 'En este momento están jugando al fútbol.' },
          other: { en: 'They **played** football yesterday.', es: 'Ayer jugaron al fútbol.' },
        },
      ],
      quiz: [
        { id: 'pc-vs-past-1', type: 'choice', level: 'beginner', prompt: 'Shh! The baby ___ now.', options: ['is sleeping', 'slept'], answers: ['is sleeping'], explanation: '"Now" indica que la acción está pasando: Present Continuous.', skill: 'tense-choice' },
        { id: 'pc-vs-past-2', type: 'choice', level: 'beginner', prompt: 'We ___ the museum last Saturday.', options: ['are visiting', 'visited'], answers: ['visited'], explanation: '"Last Saturday" es un momento terminado: Past Simple.', skill: 'tense-choice' },
        { id: 'pc-vs-past-3', type: 'choice', level: 'intermediate', prompt: 'Look! Those birds ___ south.', options: ['are flying', 'flew'], answers: ['are flying'], explanation: '"Look!" indica que lo estás viendo ahora: Present Continuous.', skill: 'tense-choice' },
        { id: 'pc-vs-past-4', type: 'choice', level: 'intermediate', prompt: 'She ___ her keys two days ago.', options: ['is losing', 'lost'], answers: ['lost'], explanation: '"Two days ago" es pasado terminado: Past Simple (lose → lost).', skill: 'tense-choice' },
      ],
    },
  ],

  skills: {
    'be-aux': { label: 'El verbo to be (am / is / are) en el continuo', section: 'structure', tip: 'Sujeto + am / is / are + verbo-ing. No te olvides de ninguna de las dos piezas.' },
    'ing-spelling': { label: 'Ortografía de la forma -ing', section: 'structure', tip: 'Quita la -e final (making) y dobla la consonante en verbos cortos (running).' },
    'stative-verbs': { label: 'Verbos que no se usan en continuo', section: 'mistakes', tip: 'Like, love, want, need, know y understand van en Present Simple.' },
  },

  // 8. EJERCICIOS
  exercises: [
    // Completar
    { id: 'pc-f1', type: 'fill', level: 'beginner', prompt: 'She ___ (read) a book now.', answers: ['is reading'], explanation: 'She → is + reading.', skill: 'be-aux' },
    { id: 'pc-f2', type: 'fill', level: 'beginner', prompt: 'I ___ (study) for my exam at the moment.', answers: ['am studying'], explanation: 'I → am + studying.', skill: 'be-aux' },
    { id: 'pc-f3', type: 'fill', level: 'beginner', prompt: 'They ___ (play) football in the park.', answers: ['are playing'], explanation: 'They → are + playing.', skill: 'be-aux' },
    { id: 'pc-f4', type: 'fill', level: 'beginner', prompt: 'We ___ (not / watch) TV right now.', answers: ["aren't watching"], explanation: "We → are not (aren't) + watching.", skill: 'be-aux' },
    { id: 'pc-f5', type: 'fill', level: 'intermediate', prompt: 'Look! It ___ (rain).', answers: ['is raining'], explanation: '"Look!" → está pasando ahora: is raining.', skill: 'be-aux' },
    { id: 'pc-f6', type: 'fill', level: 'intermediate', prompt: 'He ___ (run) to the bus stop.', answers: ['is running'], explanation: 'Run → running (se dobla la n).', skill: 'ing-spelling', traps: { 'is runing': 'Casi: run tiene una sílaba y termina en consonante + vocal + consonante, así que se dobla la n → running.' } },
    { id: 'pc-f7', type: 'fill', level: 'intermediate', prompt: 'Be quiet! The baby ___ (sleep).', answers: ['is sleeping'], explanation: 'The baby = it/he/she → is sleeping.', skill: 'be-aux' },
    { id: 'pc-f8', type: 'fill', level: 'intermediate', prompt: 'My sister ___ (write) an email.', answers: ['is writing'], explanation: 'Write termina en -e: se quita → writing.', skill: 'ing-spelling', traps: { 'is writeing': 'Si el verbo termina en -e, se quita antes de -ing: writing.' } },
    { id: 'pc-f9', type: 'fill', level: 'advanced', prompt: 'Why ___ (you / cry)?', answers: ['are you crying'], explanation: 'Pregunta con Why: Why + are + you + crying.', skill: 'question-order' },
    { id: 'pc-f10', type: 'fill', level: 'advanced', prompt: 'They ___ (swim) in the lake today.', answers: ['are swimming'], explanation: 'Swim → swimming (se dobla la m).', skill: 'ing-spelling' },
    { id: 'pc-f11', type: 'fill', level: 'advanced', prompt: 'Tom ___ (have) a shower at the moment.', answers: ['is having'], explanation: '"Have a shower" es una acción (ducharse), así que sí puede ir en continuo. Have → having (quitamos la e).', skill: 'ing-spelling' },
    { id: 'pc-f12', type: 'fill', level: 'advanced', prompt: 'I ___ (meet) my cousins tomorrow.', answers: ['am meeting'], explanation: 'Es un plan ya organizado para mañana: Present Continuous.', skill: 'be-aux' },

    // Elegir
    { id: 'pc-c1', type: 'choice', level: 'beginner', prompt: 'Listen! Someone ___ at the door.', options: ['knock', 'is knocking', 'knocks'], answers: ['is knocking'], explanation: '"Listen!" indica que está pasando ahora mismo.', skill: 'tense-choice' },
    { id: 'pc-c2', type: 'choice', level: 'beginner', prompt: 'We ___ dinner right now.', options: ['are having', 'is having', 'having'], answers: ['are having'], explanation: 'We → are.', skill: 'be-aux' },
    { id: 'pc-c3', type: 'choice', level: 'intermediate', prompt: 'She ___ to music at the moment.', options: ['listens', 'is listening', 'listening'], answers: ['is listening'], explanation: '"At the moment" → Present Continuous: is listening.', skill: 'tense-choice' },
    { id: 'pc-c4', type: 'choice', level: 'intermediate', prompt: '___ they working today?', options: ['Do', 'Are', 'Is'], answers: ['Are'], explanation: 'They → Are. En el continuo no se usa do.', skill: 'question-order' },
    { id: 'pc-c5', type: 'choice', level: 'advanced', prompt: '¿Qué frase es correcta?', options: ['I am wanting a coffee.', 'I want a coffee.', 'I wanting a coffee.'], answers: ['I want a coffee.'], explanation: 'Want es un verbo de estado: no se usa en continuo.', skill: 'stative-verbs' },
    { id: 'pc-c6', type: 'choice', level: 'advanced', prompt: '¿Cómo se escribe el -ing de "sit"?', options: ['siting', 'sitting', 'sitteing'], answers: ['sitting'], explanation: 'Una sílaba, consonante + vocal + consonante: se dobla la t.', skill: 'ing-spelling' },

    // Pasar a negativa
    { id: 'pc-n1', type: 'negative', level: 'beginner', prompt: 'I am sleeping.', answers: ["I'm not sleeping."], explanation: "I am → I am not (I'm not).", skill: 'be-aux' },
    { id: 'pc-n2', type: 'negative', level: 'beginner', prompt: 'She is cooking dinner.', answers: ["She isn't cooking dinner."], explanation: "is → is not (isn't).", skill: 'be-aux' },
    { id: 'pc-n3', type: 'negative', level: 'intermediate', prompt: 'They are watching a film.', answers: ["They aren't watching a film."], explanation: "are → are not (aren't).", skill: 'be-aux' },
    { id: 'pc-n4', type: 'negative', level: 'intermediate', prompt: 'It is raining now.', answers: ["It isn't raining now."], explanation: "is → is not (isn't).", skill: 'be-aux' },
    { id: 'pc-n5', type: 'negative', level: 'advanced', prompt: 'We are meeting John tonight.', answers: ["We aren't meeting John tonight."], explanation: "are → are not (aren't). No hace falta do.", skill: 'be-aux', traps: { "We don't meeting John tonight.": "En el Present Continuous la negativa se hace con am / is / are + not, no con don't." } },
    { id: 'pc-n6', type: 'negative', level: 'advanced', prompt: 'He is wearing a blue shirt today.', answers: ["He isn't wearing a blue shirt today."], explanation: "is → is not (isn't).", skill: 'be-aux' },

    // Pasar a pregunta
    { id: 'pc-q1', type: 'question', level: 'beginner', prompt: 'You are studying.', answers: ['Are you studying?'], explanation: 'Are va delante del sujeto.', skill: 'question-order' },
    { id: 'pc-q2', type: 'question', level: 'beginner', prompt: 'She is working today.', answers: ['Is she working today?'], explanation: 'Is va delante del sujeto.', skill: 'question-order' },
    { id: 'pc-q3', type: 'question', level: 'intermediate', prompt: 'They are playing tennis.', answers: ['Are they playing tennis?'], explanation: 'Are + they + playing...?', skill: 'question-order' },
    { id: 'pc-q4', type: 'question', level: 'intermediate', prompt: 'It is snowing in the mountains.', answers: ['Is it snowing in the mountains?'], explanation: 'Is + it + snowing...?', skill: 'question-order' },
    { id: 'pc-q5', type: 'question', level: 'advanced', prompt: 'He is going to the cinema tonight. (Pregunta con Where)', answers: ['Where is he going tonight?', 'Where is he going?'], explanation: 'Where + is + he + going?', skill: 'question-order' },
    { id: 'pc-q6', type: 'question', level: 'advanced', prompt: 'They are laughing. (Pregunta con Why)', answers: ['Why are they laughing?'], explanation: 'Why + are + they + laughing?', skill: 'question-order' },

    // Traducir
    { id: 'pc-t1', type: 'translate', level: 'beginner', prompt: 'Estoy estudiando inglés.', answers: ['I am studying English.'], explanation: 'Estoy + -ando → I am + -ing.', skill: 'be-aux' },
    { id: 'pc-t2', type: 'translate', level: 'beginner', prompt: 'Está lloviendo.', answers: ['It is raining.', "It's raining."], explanation: 'En inglés el sujeto es obligatorio: It is raining.', skill: 'be-aux' },
    { id: 'pc-t3', type: 'translate', level: 'intermediate', prompt: 'Ellos no están viendo la tele.', answers: ["They aren't watching TV.", "They aren't watching the TV.", "They aren't watching television."], explanation: "They + are not (aren't) + watching.", skill: 'be-aux' },
    { id: 'pc-t4', type: 'translate', level: 'intermediate', prompt: '¿Qué estás haciendo?', answers: ['What are you doing?'], explanation: 'What + are + you + doing?', skill: 'question-order' },
    { id: 'pc-t5', type: 'translate', level: 'advanced', prompt: 'Mañana cenamos con mis abuelos.', answers: ['We are having dinner with my grandparents tomorrow.', 'Tomorrow we are having dinner with my grandparents.'], explanation: 'Es un plan ya organizado: en inglés se usa el Present Continuous (are having), aunque en español digamos "cenamos".', skill: 'tense-choice' },
    { id: 'pc-t6', type: 'translate', level: 'advanced', prompt: 'Mi hermano está viviendo en Londres este año.', answers: ['My brother is living in London this year.'], explanation: 'Situación temporal ("este año"): is living.', skill: 'be-aux' },

    // Identificar
    { id: 'pc-i1', type: 'identify', level: 'beginner', prompt: 'She is reading a magazine now.', answers: ['present-continuous'], explanation: 'is + reading y "now": Present Continuous.', skill: 'tense-choice' },
    { id: 'pc-i2', type: 'identify', level: 'intermediate', prompt: 'Are you coming to the party tonight?', answers: ['present-continuous'], explanation: 'Are + verbo-ing: Present Continuous (aquí habla de un plan).', skill: 'tense-choice' },
    { id: 'pc-i3', type: 'identify', level: 'advanced', prompt: 'The weather is getting warmer.', answers: ['present-continuous'], explanation: 'is getting: describe un cambio que está ocurriendo.', skill: 'tense-choice' },

    // Corregir errores
    { id: 'pc-e1', type: 'correct', level: 'beginner', prompt: 'She are dancing.', answers: ['She is dancing.'], explanation: 'She → is.', skill: 'be-aux' },
    { id: 'pc-e2', type: 'correct', level: 'beginner', prompt: 'I am play the piano.', answers: ['I am playing the piano.'], explanation: 'Después de am el verbo lleva -ing.', skill: 'be-aux' },
    { id: 'pc-e3', type: 'correct', level: 'intermediate', prompt: 'They is making a cake.', answers: ['They are making a cake.'], explanation: 'They → are.', skill: 'be-aux' },
    { id: 'pc-e4', type: 'correct', level: 'intermediate', prompt: 'He is siting on the sofa.', answers: ['He is sitting on the sofa.'], explanation: 'Sit → sitting (se dobla la t).', skill: 'ing-spelling' },
    { id: 'pc-e5', type: 'correct', level: 'advanced', prompt: 'Do you listening to me?', answers: ['Are you listening to me?'], explanation: 'La pregunta del Present Continuous se hace con am / is / are.', skill: 'question-order' },
    { id: 'pc-e6', type: 'correct', level: 'advanced', prompt: 'I am liking this song.', answers: ['I like this song.'], explanation: 'Like es un verbo de estado: va en Present Simple.', skill: 'stative-verbs' },
  ],
});
