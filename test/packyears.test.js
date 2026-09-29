import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePackYears,
  evaluateCriteria,
  validateInput,
  formatPackYears,
  buildSummary,
  STATUS,
} from '../assets/js/packyears.js';

const YEAR = 2026;
const statusOf = (result, id) => result.criteria.find((c) => c.id === id).status;

/** Einfacher Modus mit sinnvollen Standardwerten, die alle Kriterien erfüllen. */
const simple = (over = {}) => ({
  mode: 'simple',
  currentYear: YEAR,
  age: 60,
  status: 'current',
  startAge: 20,
  cigarettesPerDay: 20,
  ...over,
});

describe('calculatePackYears', () => {
  test('Flyer-Beispiel: 10 Zig./Tag × 30 Jahre = 15,0 PY', () => {
    const py = calculatePackYears([{ cigarettesPerDay: 10, years: 30 }]);
    assert.equal(py, 15);
    assert.equal(formatPackYears(py), '15,0');
  });

  test('20 × 25 = 25,0 PY', () => {
    assert.equal(formatPackYears(calculatePackYears([{ cigarettesPerDay: 20, years: 25 }])), '25,0');
  });

  test('40 × 10 = 20,0 PY', () => {
    assert.equal(formatPackYears(calculatePackYears([{ cigarettesPerDay: 40, years: 10 }])), '20,0');
  });

  test('Phasen: 10 J. à 20 + 15 J. à 10 = 17,5 PY', () => {
    const py = calculatePackYears([
      { cigarettesPerDay: 20, years: 10 },
      { cigarettesPerDay: 10, years: 15 },
    ]);
    assert.equal(py, 17.5);
    assert.equal(formatPackYears(py), '17,5');
  });

  test('leere oder ungültige Eingaben ergeben NaN', () => {
    assert.ok(Number.isNaN(calculatePackYears([])));
    assert.ok(Number.isNaN(calculatePackYears([{ cigarettesPerDay: -1, years: 3 }])));
  });
});

describe('evaluateCriteria – Alter', () => {
  for (const [age, expected] of [
    [49, STATUS.NOT_MET],
    [50, STATUS.MET],
    [75, STATUS.MET],
    [76, STATUS.NOT_MET],
  ]) {
    test(`Alter ${age} → ${expected}`, () => {
      assert.equal(statusOf(evaluateCriteria(simple({ age, startAge: 15 })), 'age'), expected);
    });
  }

  test('Geburtsjahr an der Grenze (±1 Jahr) → nicht beurteilbar', () => {
    // 2026 − 1976 = 50 → heute 49 oder 50
    const r = evaluateCriteria(simple({ age: undefined, birthYear: 1976, startAge: 15 }));
    assert.equal(statusOf(r, 'age'), STATUS.UNKNOWN);
    assert.equal(r.outcome, 'unclear');
  });

  test('Geburtsjahr eindeutig im Bereich → erfüllt', () => {
    const r = evaluateCriteria(simple({ age: undefined, birthYear: 1960 }));
    assert.equal(statusOf(r, 'age'), STATUS.MET);
  });
});

describe('evaluateCriteria – Rauchstopp', () => {
  test('Rauchstopp vor 9 Jahren → erfüllt', () => {
    const r = evaluateCriteria(simple({ status: 'former', quitYear: YEAR - 9, age: 65, startAge: 15 }));
    assert.equal(statusOf(r, 'quit'), STATUS.MET);
  });

  test('Rauchstopp vor genau 10 Jahren → nicht erfüllt', () => {
    const r = evaluateCriteria(simple({ status: 'former', quitYear: YEAR - 10, age: 65, startAge: 15 }));
    assert.equal(statusOf(r, 'quit'), STATUS.NOT_MET);
    assert.equal(r.outcome, 'noMatch');
  });

  test('aktiv Rauchende → Rauchstopp entfällt, zählt als erfüllt', () => {
    const r = evaluateCriteria(simple());
    assert.equal(statusOf(r, 'quit'), STATUS.NOT_APPLICABLE);
    assert.equal(r.metCount, 4);
    assert.equal(r.total, 4);
    assert.equal(r.outcome, 'match');
  });

  test('Rauchdauer bei ehemaligen endet mit dem Rauchstopp', () => {
    // geboren 1961, Beginn mit 20 (1981), Stopp 2020 → 39 Jahre
    const r = evaluateCriteria(simple({ age: 65, status: 'former', quitYear: 2020 }));
    assert.equal(r.smokingYears, 39);
    assert.equal(r.yearsSinceQuit, 6);
  });
});

describe('evaluateCriteria – Pausen und Rauchdauer', () => {
  test('30 J. Zeitraum − 5 J. Pause = 25 J. Rauchdauer', () => {
    const r = evaluateCriteria(simple({ age: 60, startAge: 30, pauseYears: 5 }));
    assert.equal(r.smokingYears, 25);
    assert.equal(statusOf(r, 'smokingYears'), STATUS.MET);
    assert.equal(formatPackYears(r.packYears), '25,0');
  });

  test('24 Jahre Rauchdauer → nicht erfüllt', () => {
    const r = evaluateCriteria(simple({ age: 60, startAge: 36 }));
    assert.equal(r.smokingYears, 24);
    assert.equal(statusOf(r, 'smokingYears'), STATUS.NOT_MET);
  });

  test('14,9 PY → nicht erfüllt, 15,0 PY → erfüllt', () => {
    // 30 Jahre Rauchdauer
    const low = evaluateCriteria(simple({ age: 60, startAge: 30, cigarettesPerDay: 9.9 }));
    assert.equal(statusOf(low, 'packYears'), STATUS.NOT_MET);
    const ok = evaluateCriteria(simple({ age: 60, startAge: 30, cigarettesPerDay: 10 }));
    assert.equal(statusOf(ok, 'packYears'), STATUS.MET);
  });

  test('Eignungsprofil ist immer ärztlich zu prüfen', () => {
    assert.equal(statusOf(evaluateCriteria(simple()), 'profile'), STATUS.MEDICAL);
  });
});

describe('evaluateCriteria – erweiterter Modus', () => {
  const ext = (over = {}) => ({
    mode: 'extended',
    currentYear: YEAR,
    age: 61,
    status: 'current',
    phases: [
      { fromYear: 1985, toYear: 1995, cigarettesPerDay: 20 },
      { fromYear: 2011, toYear: 2026, cigarettesPerDay: 10 },
    ],
    ...over,
  });

  test('Phasen 10 J. à 20 + 15 J. à 10 = 17,5 PY; Lücke zählt als Pause', () => {
    const r = evaluateCriteria(ext());
    assert.equal(formatPackYears(r.packYears), '17,5');
    assert.equal(r.smokingYears, 25);
    assert.equal(r.pauseYears, 16);
    assert.equal(r.outcome, 'match');
  });

  test('ehemalig: Rauchstopp = Ende der letzten Phase', () => {
    const r = evaluateCriteria(
      ext({
        status: 'former',
        phases: [{ fromYear: 1985, toYear: 2017, cigarettesPerDay: 20 }],
      }),
    );
    assert.equal(r.yearsSinceQuit, 9);
    assert.equal(statusOf(r, 'quit'), STATUS.MET);
  });

  test('Kurzzusammenfassung im Beispielformat', () => {
    const r = evaluateCriteria(
      ext({ phases: [{ fromYear: 1993, toYear: 2026, cigarettesPerDay: 16.6667 }] }),
    );
    assert.equal(
      buildSummary(r),
      'Packungsjahre: 27,5 · Rauchdauer: 33 J. · Status: aktiv · Alter: 61 · ' +
        'Kriterien rechnerisch erfüllt: 4/4 (Eignungsprofil ärztlich zu prüfen)',
    );
  });

  test('Validierung: Überschneidung, Zukunft, aktive Phase muss bis heute gehen', () => {
    const e = validateInput(
      ext({
        phases: [
          { fromYear: 1985, toYear: 2000, cigarettesPerDay: 20 },
          { fromYear: 1999, toYear: 2020, cigarettesPerDay: 10 },
          { fromYear: 2021, toYear: 2030, cigarettesPerDay: 0 },
        ],
      }),
    );
    assert.ok(e['phases.1.fromYear']);
    assert.ok(e['phases.2.toYear']);
    assert.ok(e['phases.2.cigarettesPerDay']);
  });

  test('Validierung: gültige Phasen ohne Fehler', () => {
    assert.deepEqual(validateInput(ext()), {});
  });
});

describe('validateInput – einfacher Modus', () => {
  test('gültige Eingabe ohne Fehler', () => {
    assert.deepEqual(validateInput(simple()), {});
    assert.deepEqual(validateInput(simple({ status: 'former', quitYear: 2020, pauseYears: 2 })), {});
  });

  test('Rauchbeginn muss vor aktuellem Alter liegen', () => {
    assert.ok(validateInput(simple({ startAge: 60 })).startAge);
  });

  test('Rauchstopp nicht in der Zukunft und nicht vor Rauchbeginn', () => {
    assert.ok(validateInput(simple({ status: 'former', quitYear: YEAR + 1 })).quitYear);
    // geboren 1966, Beginn mit 20 → 1986
    assert.ok(validateInput(simple({ status: 'former', quitYear: 1980 })).quitYear);
    assert.equal(validateInput(simple({ status: 'former', quitYear: 1986 })).quitYear, undefined);
  });

  test('Rauchstopp fehlt bei „habe aufgehört“', () => {
    assert.ok(validateInput(simple({ status: 'former' })).quitYear);
  });

  test('Zigaretten pro Tag 1–100', () => {
    assert.ok(validateInput(simple({ cigarettesPerDay: 0 })).cigarettesPerDay);
    assert.ok(validateInput(simple({ cigarettesPerDay: 101 })).cigarettesPerDay);
    assert.equal(validateInput(simple({ cigarettesPerDay: 1 })).cigarettesPerDay, undefined);
    assert.equal(validateInput(simple({ cigarettesPerDay: 100 })).cigarettesPerDay, undefined);
  });

  test('Pausen dürfen den Zeitraum nicht übersteigen', () => {
    assert.ok(validateInput(simple({ pauseYears: 40 })).pauseYears);
    assert.ok(validateInput(simple({ pauseYears: -1 })).pauseYears);
  });

  test('fehlendes Alter und Status werden gemeldet', () => {
    const e = validateInput(simple({ age: undefined, status: undefined }));
    assert.ok(e.age);
    assert.ok(e.status);
  });
});
