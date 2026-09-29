/**
 * Packungsjahre-Rechner – reine Rechen- und Bewertungslogik.
 *
 * Framework-frei, ohne DOM-Zugriff und ohne Seiteneffekte, damit das Modul
 * CMS-unabhängig portierbar und mit `node --test` prüfbar ist.
 *
 * Grundlage: Einschlusskriterien der Lungenkrebs-Früherkennung mittels
 * Niedrigdosis-CT (LuKrFrühErkV / KFE-RL). Das Ergebnis ist ausschließlich
 * eine Orientierung; die Teilnahmeberechtigung klärt die Arztpraxis.
 */

/** Grenzwerte der Einschlusskriterien. */
export const CRITERIA = Object.freeze({
  MIN_AGE: 50,
  MAX_AGE: 75,
  MIN_SMOKING_YEARS: 25,
  MIN_PACK_YEARS: 15,
  /** Rauchstopp muss weniger als so viele Jahre zurückliegen. */
  MAX_YEARS_SINCE_QUIT: 10,
  CIGARETTES_PER_PACK: 20,
  MIN_CIGARETTES_PER_DAY: 1,
  MAX_CIGARETTES_PER_DAY: 100,
});

/** Mögliche Zustände eines Kriteriums. */
export const STATUS = Object.freeze({
  MET: 'met',
  NOT_MET: 'not-met',
  UNKNOWN: 'unknown',
  /** Kriterium trifft nicht zu (Rauchstopp bei aktiv Rauchenden) – gilt als erfüllt. */
  NOT_APPLICABLE: 'not-applicable',
  /** Wird ausschließlich ärztlich geprüft (Eignungsprofil). */
  MEDICAL: 'medical',
});

export const STATUS_LABEL = Object.freeze({
  [STATUS.MET]: 'erfüllt',
  [STATUS.NOT_MET]: 'nicht erfüllt',
  [STATUS.UNKNOWN]: 'nicht beurteilbar',
  [STATUS.NOT_APPLICABLE]: 'entfällt',
  [STATUS.MEDICAL]: 'wird ärztlich geprüft',
});

export const RESULT_TEXT = Object.freeze({
  match:
    'Ihre Angaben sprechen dafür, dass ein Beratungsgespräch in Ihrer Arztpraxis sinnvoll ist.',
  noMatch:
    'Nach Ihren Angaben sind die Kriterien des Programms derzeit nicht erfüllt. ' +
    'Bei Beschwerden oder Fragen wenden Sie sich bitte an Ihre Arztpraxis.',
  unclear:
    'Einzelne Angaben lassen sich rechnerisch nicht eindeutig beurteilen. ' +
    'Bitte besprechen Sie Ihre Situation in Ihrer Arztpraxis.',
  otherTobacco: 'Bitte besprechen Sie andere Tabakprodukte mit Ihrer Arztpraxis.',
});

/** Ergebnistexte im erweiterten Modus (Zielgruppe: Zuweisende). */
export const RESULT_TEXT_CLINICIAN = Object.freeze({
  match: 'Die rechnerisch prüfbaren Einschlusskriterien sind nach den Angaben erfüllt. Eignungsprofil ärztlich prüfen.',
  noMatch: 'Nach den Angaben ist mindestens ein Einschlusskriterium nicht erfüllt.',
  unclear: 'Mindestens ein Kriterium ist rechnerisch nicht eindeutig beurteilbar (z. B. Alter aus Geburtsjahr an der Altersgrenze).',
  otherTobacco: 'Andere Tabakprodukte werden nicht in Packungsjahre umgerechnet und sind gesondert zu bewerten.',
});

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

/** Rundet auf eine Nachkommastelle und vermeidet Gleitkomma-Artefakte (z. B. 17.499999). */
const round1 = (n) => Math.round((n + Number.EPSILON) * 10) / 10;

/**
 * Packungsjahre einer einzelnen Rauchphase.
 * @param {number} cigarettesPerDay Zigaretten pro Tag (Durchschnitt; Selbstgedrehte zählen mit)
 * @param {number} years Rauchjahre in dieser Phase
 */
export function packYearsForPhase(cigarettesPerDay, years) {
  if (!isNum(cigarettesPerDay) || !isNum(years) || cigarettesPerDay < 0 || years < 0) {
    return NaN;
  }
  return (cigarettesPerDay / CRITERIA.CIGARETTES_PER_PACK) * years;
}

/**
 * Packungsjahre = Σ (Zigaretten pro Tag / 20) × Rauchjahre.
 * @param {Array<{cigarettesPerDay:number, years:number}>} phases
 * @returns {number} ungerundete Summe (NaN bei ungültigen Phasen)
 */
export function calculatePackYears(phases) {
  if (!Array.isArray(phases) || phases.length === 0) return NaN;
  return phases.reduce((sum, p) => sum + packYearsForPhase(p.cigarettesPerDay, p.years), 0);
}

/**
 * Alter aus Alter- oder Geburtsjahr-Angabe.
 * Beim Geburtsjahr ist das Alter nur auf ±1 Jahr bekannt (Geburtstag im
 * laufenden Jahr schon gewesen oder nicht).
 * @returns {{min:number, max:number}|null}
 */
export function resolveAge({ age, birthYear, currentYear }) {
  if (isNum(age)) return { min: age, max: age };
  if (isNum(birthYear) && isNum(currentYear)) {
    const max = currentYear - birthYear;
    return { min: max - 1, max };
  }
  return null;
}

/**
 * Überführt Eingaben (einfacher oder erweiterter Modus) in Phasen, Rauchdauer
 * und Jahre seit Rauchstopp. Setzt gültige Eingaben voraus (siehe validateInput).
 *
 * Einfacher Modus:
 *   { mode:'simple', age|birthYear, status:'current'|'former', startAge,
 *     quitYear (nur 'former'), cigarettesPerDay, pauseYears?, currentYear }
 *
 * Erweiterter Modus:
 *   { mode:'extended', age|birthYear, status, currentYear,
 *     phases:[{fromYear, toYear, cigarettesPerDay}] }
 *   Lücken zwischen den Phasen gelten als Rauchpausen und zählen nicht zur Rauchdauer.
 *   Rauchstopp = Ende der letzten Phase.
 */
export function derivePhases(input) {
  const { currentYear, status } = input;

  if (input.mode === 'extended') {
    const phases = input.phases.map((p) => ({
      cigarettesPerDay: p.cigarettesPerDay,
      years: p.toYear - p.fromYear,
    }));
    const smokingYears = phases.reduce((s, p) => s + p.years, 0);
    const first = Math.min(...input.phases.map((p) => p.fromYear));
    const last = Math.max(...input.phases.map((p) => p.toYear));
    const pauseYears = last - first - smokingYears;
    const quitYear = status === 'former' ? last : null;
    return {
      phases,
      smokingYears,
      pauseYears,
      yearsSinceQuit: quitYear === null ? null : currentYear - quitYear,
    };
  }

  // Einfacher Modus: Zeitraum vom Rauchbeginn bis heute bzw. bis zum Rauchstopp.
  const ageRange = resolveAge(input);
  const age = ageRange.max; // Geburtsjahr-Angabe: Obergrenze, analog zur Jahresrechnung
  const birthYear = currentYear - age;
  const endAge = status === 'former' ? input.quitYear - birthYear : age;
  const pauseYears = isNum(input.pauseYears) ? input.pauseYears : 0;
  const smokingYears = Math.max(0, endAge - input.startAge - pauseYears);
  return {
    phases: [{ cigarettesPerDay: input.cigarettesPerDay, years: smokingYears }],
    smokingYears,
    pauseYears,
    yearsSinceQuit: status === 'former' ? currentYear - input.quitYear : null,
  };
}

function ageStatus(range) {
  if (!range) return STATUS.UNKNOWN;
  const ok = (a) => a >= CRITERIA.MIN_AGE && a <= CRITERIA.MAX_AGE;
  if (ok(range.min) && ok(range.max)) return STATUS.MET;
  if (!ok(range.min) && !ok(range.max)) return STATUS.NOT_MET;
  return STATUS.UNKNOWN;
}

/**
 * Bewertet die Einschlusskriterien.
 * @returns {{
 *   packYears:number, smokingYears:number, pauseYears:number,
 *   yearsSinceQuit:number|null, age:{min:number,max:number}|null,
 *   criteria:Array<{id:string,label:string,status:string}>,
 *   metCount:number, total:number, outcome:'match'|'noMatch'|'unclear'
 * }}
 */
export function evaluateCriteria(input) {
  const derived = derivePhases(input);
  const packYears = calculatePackYears(derived.phases);
  const age = resolveAge(input);

  const criteria = [
    {
      id: 'age',
      label: `Alter ${CRITERIA.MIN_AGE} bis ${CRITERIA.MAX_AGE} Jahre`,
      status: ageStatus(age),
    },
    {
      id: 'smokingYears',
      label: `Rauchdauer mindestens ${CRITERIA.MIN_SMOKING_YEARS} Jahre`,
      status: derived.smokingYears >= CRITERIA.MIN_SMOKING_YEARS ? STATUS.MET : STATUS.NOT_MET,
    },
    {
      id: 'packYears',
      label: `Mindestens ${CRITERIA.MIN_PACK_YEARS} Packungsjahre`,
      // Vergleich auf dem angezeigten (gerundeten) Wert, damit Anzeige und Bewertung übereinstimmen.
      status: round1(packYears) >= CRITERIA.MIN_PACK_YEARS ? STATUS.MET : STATUS.NOT_MET,
    },
    {
      id: 'quit',
      label: `Rauchstopp vor weniger als ${CRITERIA.MAX_YEARS_SINCE_QUIT} Jahren`,
      status:
        derived.yearsSinceQuit === null
          ? STATUS.NOT_APPLICABLE
          : derived.yearsSinceQuit < CRITERIA.MAX_YEARS_SINCE_QUIT
            ? STATUS.MET
            : STATUS.NOT_MET,
    },
    {
      id: 'profile',
      label: 'Gesundheitszustand lässt eine Teilnahme zu',
      status: STATUS.MEDICAL,
    },
  ];

  const computed = criteria.filter((c) => c.status !== STATUS.MEDICAL);
  const counts = (c) => c.status === STATUS.MET || c.status === STATUS.NOT_APPLICABLE;
  const metCount = computed.filter(counts).length;
  let outcome = 'match';
  if (computed.some((c) => c.status === STATUS.NOT_MET)) outcome = 'noMatch';
  else if (computed.some((c) => c.status === STATUS.UNKNOWN)) outcome = 'unclear';

  return {
    packYears,
    smokingYears: derived.smokingYears,
    pauseYears: derived.pauseYears,
    yearsSinceQuit: derived.yearsSinceQuit,
    age,
    status: input.status,
    criteria,
    metCount,
    total: computed.length,
    outcome,
  };
}

/* ------------------------------------------------------------------ */
/* Validierung                                                         */
/* ------------------------------------------------------------------ */

const MIN_START_AGE = 5;
const MAX_AGE_INPUT = 120;

/**
 * Prüft Eingaben. Gibt ein Objekt Feldname → Fehlermeldung zurück (leer = gültig).
 * Phasenfehler im erweiterten Modus werden als `phases.<index>.<feld>` geliefert.
 */
export function validateInput(input) {
  const e = {};
  const { currentYear } = input;
  const int = (v) => isNum(v) && Number.isInteger(v);

  // Alter / Geburtsjahr
  let age = null;
  if (input.birthYear !== undefined && input.age === undefined) {
    if (!int(input.birthYear)) e.birthYear = 'Bitte geben Sie Ihr Geburtsjahr an (z. B. 1965).';
    else if (input.birthYear > currentYear - 18 || input.birthYear < currentYear - MAX_AGE_INPUT)
      e.birthYear = 'Bitte prüfen Sie das Geburtsjahr.';
    else age = currentYear - input.birthYear;
  } else if (!int(input.age)) {
    e.age = 'Bitte geben Sie Ihr Alter in ganzen Jahren an.';
  } else if (input.age < 18 || input.age > MAX_AGE_INPUT) {
    e.age = 'Bitte geben Sie ein Alter zwischen 18 und 120 Jahren an.';
  } else {
    age = input.age;
  }

  if (input.status !== 'current' && input.status !== 'former') {
    e.status = 'Bitte wählen Sie aus, ob Sie aktuell rauchen oder aufgehört haben.';
  }

  const cigMsg = `Bitte geben Sie eine Zahl zwischen ${CRITERIA.MIN_CIGARETTES_PER_DAY} und ${CRITERIA.MAX_CIGARETTES_PER_DAY} an.`;
  const cigOk = (v) =>
    isNum(v) && v >= CRITERIA.MIN_CIGARETTES_PER_DAY && v <= CRITERIA.MAX_CIGARETTES_PER_DAY;

  if (input.mode === 'extended') {
    const phases = Array.isArray(input.phases) ? input.phases : [];
    if (phases.length === 0) e.phases = 'Bitte legen Sie mindestens eine Rauchphase an.';
    const birthYear = age === null ? null : currentYear - age;
    phases.forEach((p, i) => {
      const k = `phases.${i}`;
      if (!int(p.fromYear)) e[`${k}.fromYear`] = 'Bitte ein Jahr angeben.';
      else if (birthYear !== null && p.fromYear < birthYear + MIN_START_AGE)
        e[`${k}.fromYear`] = 'Das Jahr liegt vor einem plausiblen Rauchbeginn.';
      if (!int(p.toYear)) e[`${k}.toYear`] = 'Bitte ein Jahr angeben.';
      else if (p.toYear > currentYear) e[`${k}.toYear`] = 'Das Jahr darf nicht in der Zukunft liegen.';
      else if (int(p.fromYear) && p.toYear <= p.fromYear)
        e[`${k}.toYear`] = '„bis“ muss nach „von“ liegen.';
      if (!cigOk(p.cigarettesPerDay)) e[`${k}.cigarettesPerDay`] = cigMsg;
    });
    // Überlappungen
    const valid = phases
      .map((p, i) => ({ ...p, i }))
      .filter((p) => int(p.fromYear) && int(p.toYear) && p.toYear > p.fromYear)
      .sort((a, b) => a.fromYear - b.fromYear);
    for (let j = 1; j < valid.length; j++) {
      if (valid[j].fromYear < valid[j - 1].toYear) {
        e[`phases.${valid[j].i}.fromYear`] = 'Die Phase überschneidet sich mit einer anderen Phase.';
      }
    }
    if (input.status === 'current' && valid.length && !e.status) {
      const last = Math.max(...valid.map((p) => p.toYear));
      if (last !== currentYear) {
        const idx = valid.find((p) => p.toYear === last).i;
        e[`phases.${idx}.toYear`] ??= `Bei aktuellem Rauchen endet die letzte Phase ${currentYear}.`;
      }
    }
    return e;
  }

  // Einfacher Modus
  if (!int(input.startAge)) e.startAge = 'Bitte geben Sie an, mit wie vielen Jahren Sie angefangen haben.';
  else if (input.startAge < MIN_START_AGE) e.startAge = 'Bitte prüfen Sie das Alter bei Rauchbeginn.';
  else if (age !== null && input.startAge >= age)
    e.startAge = 'Der Rauchbeginn muss vor Ihrem aktuellen Alter liegen.';

  let endAge = age;
  if (input.status === 'former') {
    if (!int(input.quitYear)) e.quitYear = 'Bitte geben Sie das Jahr Ihres Rauchstopps an.';
    else if (input.quitYear > currentYear) e.quitYear = 'Das Jahr darf nicht in der Zukunft liegen.';
    else if (age !== null && int(input.startAge)) {
      const startYear = currentYear - age + input.startAge;
      if (input.quitYear < startYear)
        e.quitYear = 'Der Rauchstopp kann nicht vor dem Rauchbeginn liegen.';
      else endAge = input.quitYear - (currentYear - age);
    }
  }

  if (!cigOk(input.cigarettesPerDay)) e.cigarettesPerDay = cigMsg;

  if (input.pauseYears !== undefined && input.pauseYears !== null) {
    if (!isNum(input.pauseYears) || input.pauseYears < 0)
      e.pauseYears = 'Bitte geben Sie 0 oder mehr Jahre an.';
    else if (!e.startAge && !e.quitYear && endAge !== null && int(input.startAge) &&
      input.pauseYears >= endAge - input.startAge)
      e.pauseYears = 'Die Pausen sind länger als der gesamte Zeitraum.';
  }
  return e;
}

/* ------------------------------------------------------------------ */
/* Formatierung                                                        */
/* ------------------------------------------------------------------ */

const nf1 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

/** Packungsjahre mit einer Nachkommastelle im deutschen Format, z. B. „27,5“. */
export const formatPackYears = (n) => nf1.format(round1(n));
export const formatYears = (n) => nf0.format(n);

/**
 * Kopierbare Kurzzusammenfassung für die Dokumentation (Zuweiser).
 * Beispiel: „Packungsjahre: 27,5 · Rauchdauer: 33 J. · Status: aktiv · Alter: 61 ·
 * Kriterien rechnerisch erfüllt: 4/4 (Eignungsprofil ärztlich zu prüfen)“
 */
export function buildSummary(result) {
  const age = result.age
    ? result.age.min === result.age.max
      ? formatYears(result.age.max)
      : `${formatYears(result.age.min)}–${formatYears(result.age.max)}`
    : '–';
  const parts = [
    `Packungsjahre: ${formatPackYears(result.packYears)}`,
    `Rauchdauer: ${formatYears(result.smokingYears)} J.`,
  ];
  if (result.pauseYears > 0) parts.push(`Pausen: ${formatYears(result.pauseYears)} J.`);
  parts.push(
    result.status === 'former'
      ? `Status: ehemalig (Rauchstopp vor ${formatYears(result.yearsSinceQuit)} J.)`
      : 'Status: aktiv',
  );
  parts.push(`Alter: ${age}`);
  parts.push(
    `Kriterien rechnerisch erfüllt: ${result.metCount}/${result.total} (Eignungsprofil ärztlich zu prüfen)`,
  );
  return parts.join(' · ');
}
