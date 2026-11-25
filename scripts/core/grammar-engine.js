/* ==========================================================================
   grammar-engine.js
   "Motor" que conjuga verbos y construye frases a partir de plantillas.
   Lo usan el constructor de frases, las tablas de conjugación y la frase
   del día. Al ser genérico, sirve también para tiempos verbales futuros.

   Piezas disponibles en las plantillas (data/tenses/*.js → template):
     {subject}     sujeto (I, you, he...)
     {base}        verbo en infinitivo (work)
     {s}           verbo con -s si el sujeto es he / she / it (works)
     {ing}         verbo con -ing (working)
     {past}        pasado (worked, went)
     {participle}  participio (worked, gone)
     {do}          do / does          {be}   am / is / are
     {was}         was / were         {have} have / has
     {complement}  complemento        {time} expresión de tiempo
   Si la pieza empieza por mayúscula ({Do}, {Be}...) el resultado también.
   Las palabras sin llaves (not, did, will...) se copian tal cual.
   ========================================================================== */

(function () {
  const SUBJECTS = [
    { id: 'I', text: 'I', es: 'yo', third: false },
    { id: 'you', text: 'you', es: 'tú / vosotros', third: false },
    { id: 'he', text: 'he', es: 'él', third: true },
    { id: 'she', text: 'she', es: 'ella', third: true },
    { id: 'it', text: 'it', es: 'ello (cosa o animal)', third: true },
    { id: 'we', text: 'we', es: 'nosotros', third: false },
    { id: 'they', text: 'they', es: 'ellos / ellas', third: false },
  ];

  const ROLE_LABELS = {
    subject: 'Sujeto',
    aux: 'Auxiliar',
    verb: 'Verbo',
    neg: 'Negación',
    rest: 'Complemento',
    time: 'Tiempo',
  };

  const AUXILIARY_WORDS = ['do', 'does', 'did', 'am', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'shall', 'should', 'going', 'to'];
  const VERB_TOKENS = ['base', 's', 'ing', 'past', 'participle'];
  const AUX_TOKENS = ['do', 'be', 'was', 'have'];

  // Verbos de dos sílabas que también doblan la consonante final
  const DOUBLE_FINAL = ['begin', 'forget', 'prefer', 'admit', 'control', 'refer', 'regret', 'occur', 'travel', 'cancel', 'upset'];

  const isVowel = (char) => 'aeiou'.includes(char);

  function vowelGroups(word) {
    return (word.match(/[aeiouy]+/g) || []).length;
  }

  /** ¿Hay que doblar la última consonante? (stop → stopping, run → running) */
  function doublesFinalConsonant(verb) {
    if (DOUBLE_FINAL.includes(verb)) return true;
    if (verb.length < 3) return false;
    const [a, b, c] = verb.slice(-3);
    if (isVowel(a) || !isVowel(b) || isVowel(c) || 'wxy'.includes(c)) return false;
    return vowelGroups(verb) === 1;
  }

  function findIrregular(verb) {
    return ELH.data.irregularVerbs.find((item) => item.infinitive === verb) || null;
  }

  /** Separa las variantes: "burnt, burned" → ['burnt', 'burned']; "was / were" → ['was', 'were'] */
  function splitForms(value) {
    if (!value) return [];
    return String(value).split(/\s*[\/,]\s*/).map((form) => form.trim()).filter(Boolean);
  }

  function thirdPerson(verb) {
    const special = { have: 'has', be: 'is' };
    if (special[verb]) return special[verb];
    if (/(s|sh|ch|x|z|o)$/.test(verb)) return `${verb}es`;
    if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ies`;
    return `${verb}s`;
  }

  function ingForm(verb) {
    if (verb === 'be') return 'being';
    if (/ie$/.test(verb)) return `${verb.slice(0, -2)}ying`;
    if (/[^aeiouy]e$/.test(verb)) return `${verb.slice(0, -1)}ing`;
    if (doublesFinalConsonant(verb)) return `${verb}${verb.slice(-1)}ing`;
    return `${verb}ing`;
  }

  /** Pasado como si el verbo fuera regular (también sirve para detectar "goed", "buyed"...). */
  function regularPast(verb) {
    if (/e$/.test(verb)) return `${verb}d`;
    if (/[^aeiou]y$/.test(verb)) return `${verb.slice(0, -1)}ied`;
    if (doublesFinalConsonant(verb)) return `${verb}${verb.slice(-1)}ed`;
    return `${verb}ed`;
  }

  function pastForms(verb) {
    const irregular = findIrregular(verb);
    return irregular ? splitForms(irregular.past) : [regularPast(verb)];
  }

  function participleForms(verb) {
    const irregular = findIrregular(verb);
    if (irregular) return splitForms(irregular.participle);
    return [regularPast(verb)];
  }

  function beForm(subject) {
    if (subject.id === 'I') return 'am';
    return subject.third ? 'is' : 'are';
  }

  function wasForm(subject) {
    return subject.id === 'I' || subject.third ? 'was' : 'were';
  }

  function resolveToken(key, subject, verb, extras) {
    switch (key) {
      case 'subject': return { text: subject.text, role: 'subject' };
      case 'base': return { text: verb, role: 'verb' };
      case 's': return { text: subject.third ? thirdPerson(verb) : verb, role: 'verb' };
      case 'ing': return { text: ingForm(verb), role: 'verb' };
      case 'past': return { text: pastForms(verb)[0], role: 'verb' };
      case 'participle': return { text: participleForms(verb)[0] || verb, role: 'verb' };
      case 'do': return { text: subject.third ? 'does' : 'do', role: 'aux' };
      case 'be': return { text: beForm(subject), role: 'aux' };
      case 'was': return { text: wasForm(subject), role: 'aux' };
      case 'have': return { text: subject.third ? 'has' : 'have', role: 'aux' };
      case 'complement': return extras.complement ? { text: extras.complement, role: 'rest' } : null;
      case 'time': return extras.time ? { text: extras.time, role: 'time' } : null;
      default: return { text: key, role: 'rest' };
    }
  }

  function roleForLiteral(word) {
    const lower = word.toLowerCase();
    if (lower === 'not') return 'neg';
    if (AUXILIARY_WORDS.includes(lower)) return 'aux';
    return 'rest';
  }

  /**
   * Construye una frase a partir de una plantilla.
   * Devuelve { tokens: [{text, role}], text, short } donde "short" es la forma contraída.
   */
  function build(template, { subjectId = 'I', verb = 'work', complement = '', time = '', form = 'affirmative' } = {}) {
    const subject = SUBJECTS.find((item) => item.id === subjectId) || SUBJECTS[0];
    const tokens = [];
    let endPunctuation = '';

    template.trim().split(/\s+/).forEach((piece) => {
      const match = piece.match(/^\{(\w+)\}([.?!]*)$/);
      if (match) {
        const [, rawKey, punctuation] = match;
        const key = rawKey.toLowerCase();
        const token = resolveToken(key, subject, verb, { complement, time });
        if (token) {
          if (rawKey[0] === rawKey[0].toUpperCase() && rawKey !== key) {
            token.text = token.text.charAt(0).toUpperCase() + token.text.slice(1);
          }
          tokens.push(token);
        }
        if (punctuation) endPunctuation = punctuation;
      } else {
        const literal = piece.replace(/[.?!]+$/, '');
        const punctuation = piece.slice(literal.length);
        if (literal) tokens.push({ text: literal, role: roleForLiteral(literal) });
        if (punctuation) endPunctuation = punctuation;
      }
    });

    // Primera letra en mayúscula (sin tocar "I")
    if (tokens.length) {
      const first = tokens[0];
      first.text = first.text.charAt(0).toUpperCase() + first.text.slice(1);
    }

    const text = `${tokens.map((t) => t.text).join(' ')}${endPunctuation}`;
    const shortTokens = form === 'question' ? null : contractTokens(tokens);
    const short = shortTokens ? `${shortTokens.map((t) => t.text).join(' ')}${endPunctuation}` : null;

    return {
      tokens,
      text,
      punctuation: endPunctuation,
      short: short && short !== text ? short : null,
      shortTokens: short && short !== text ? shortTokens : null,
    };
  }

  const NEGATIVE_CONTRACTIONS = {
    do: "don't", does: "doesn't", did: "didn't", is: "isn't", are: "aren't",
    was: "wasn't", were: "weren't", have: "haven't", has: "hasn't", had: "hadn't",
    will: "won't", can: "can't", could: "couldn't", would: "wouldn't", should: "shouldn't",
  };

  const SUBJECT_CONTRACTIONS = {
    'i am': "I'm", 'you are': "you're", 'we are': "we're", 'they are': "they're",
    'he is': "he's", 'she is': "she's", 'it is': "it's",
  };

  /** Forma contraída: "does not" → "doesn't", "I am" → "I'm". */
  function contractTokens(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      const next = tokens[i + 1];
      const lower = token.text.toLowerCase();

      // sujeto + am / is / are → I'm, she's, they're...
      // En negativa preferimos "she isn't" a "she's not" (salvo con I: "I'm not")
      const afterNext = tokens[i + 2];
      const negativeWithIsAre = afterNext && afterNext.text.toLowerCase() === 'not' && next && next.text.toLowerCase() !== 'am';
      if (token.role === 'subject' && next && next.role === 'aux' && !negativeWithIsAre) {
        const key = `${lower} ${next.text.toLowerCase()}`;
        if (SUBJECT_CONTRACTIONS[key]) {
          const contracted = SUBJECT_CONTRACTIONS[key];
          const text = i === 0 ? contracted.charAt(0).toUpperCase() + contracted.slice(1) : contracted;
          result.push({ text, role: 'subject' });
          i += 1;
          continue;
        }
      }

      // auxiliar + not → don't, isn't, didn't...
      if (token.role === 'aux' && next && next.text.toLowerCase() === 'not' && NEGATIVE_CONTRACTIONS[lower]) {
        result.push({ text: NEGATIVE_CONTRACTIONS[lower], role: 'aux' });
        i += 1;
        continue;
      }

      result.push({ ...token });
    }
    return result;
  }

  /** Expande contracciones en un texto: "doesn't" → "does not", "I'm" → "I am". */
  const EXPANSIONS = {
    "don't": 'do not', "doesn't": 'does not', "didn't": 'did not', "isn't": 'is not', "aren't": 'are not',
    "wasn't": 'was not', "weren't": 'were not', "haven't": 'have not', "hasn't": 'has not', "hadn't": 'had not',
    "won't": 'will not', "can't": 'can not', cannot: 'can not', "couldn't": 'could not', "wouldn't": 'would not',
    "shouldn't": 'should not', "i'm": 'i am', "you're": 'you are', "we're": 'we are', "they're": 'they are',
    "he's": 'he is', "she's": 'she is', "it's": 'it is', "that's": 'that is', "what's": 'what is',
    "where's": 'where is', "who's": 'who is', "there's": 'there is', "i've": 'i have', "you've": 'you have',
    "we've": 'we have', "they've": 'they have', "i'll": 'i will', "you'll": 'you will', "he'll": 'he will',
    "she'll": 'she will', "we'll": 'we will', "they'll": 'they will', "it'll": 'it will', "i'd": 'i would',
  };

  function expandContractions(lowerText) {
    return lowerText.replace(/[a-z]+'[a-z]+|cannot/g, (word) => EXPANSIONS[word] || word);
  }

  /** Contrae un texto completo ("She does not work." → "She doesn't work."). */
  function contractText(text) {
    let result = text;
    Object.entries(NEGATIVE_CONTRACTIONS).forEach(([aux, short]) => {
      result = result.replace(new RegExp(`\\b${aux} not\\b`, 'gi'), (match) => (match[0] === match[0].toUpperCase() ? short.charAt(0).toUpperCase() + short.slice(1) : short));
    });
    result = result.replace(/\bI am\b/g, "I'm");
    return result;
  }

  /** Clasifica un verbo irregular por su patrón: A-A-A (cut), A-B-B (buy), A-B-A (come), A-B-C (go). */
  function verbPattern(verb) {
    if (!verb.participle) return 'special';
    const pasts = splitForms(verb.past);
    const participles = splitForms(verb.participle);
    if (pasts.length > 1 || participles.length > 1) return 'variants';
    const [inf, past, part] = [verb.infinitive, pasts[0], participles[0]];
    if (inf === past && past === part) return 'AAA';
    if (past === part) return 'ABB';
    if (inf === part) return 'ABA';
    return 'ABC';
  }

  ELH.core.grammar = {
    SUBJECTS,
    ROLE_LABELS,
    VERB_TOKENS,
    AUX_TOKENS,
    findIrregular,
    splitForms,
    thirdPerson,
    ingForm,
    regularPast,
    pastForms,
    participleForms,
    build,
    contractTokens,
    expandContractions,
    contractText,
    verbPattern,
  };
})();
