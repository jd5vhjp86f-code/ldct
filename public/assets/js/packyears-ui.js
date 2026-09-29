/**
 * Packungsjahre-Rechner – Oberfläche.
 * Bindet sich an <form data-lks-calculator="simple|extended">. Keine Speicherung,
 * kein Versand: alle Eingaben bleiben im Browser (kein fetch, kein Storage).
 */
import {
  CRITERIA,
  STATUS_LABEL,
  RESULT_TEXT,
  RESULT_TEXT_CLINICIAN,
  evaluateCriteria,
  validateInput,
  formatPackYears,
  formatYears,
  buildSummary,
} from './packyears.js';

const BAR_MAX_MIN = 30; // Skala mindestens bis 30 PY, damit die 15-PY-Marke mittig liegt

const parseNum = (v) => {
  const s = String(v ?? '').trim().replace(',', '.');
  if (s === '') return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

function debounce(fn, ms) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

class Calculator {
  constructor(form) {
    this.form = form;
    this.mode = form.dataset.lksCalculator === 'extended' ? 'extended' : 'simple';
    this.currentYear = new Date().getFullYear();
    this.texts = this.mode === 'extended' ? RESULT_TEXT_CLINICIAN : RESULT_TEXT;
    this.touched = new Set();
    this.submitted = false;
    this.phaseSeq = 0;

    const root = form.closest('.lks-calc');
    this.out = {
      region: root.querySelector('.lks-calc__result'),
      packYears: root.querySelector('[data-out="packYears"]'),
      years: root.querySelector('[data-out="years"]'),
      bar: root.querySelector('.lks-bar__fill'),
      barTrack: root.querySelector('.lks-bar__track'),
      mark: root.querySelector('.lks-bar__mark'),
      criteria: root.querySelector('.lks-criteria'),
      message: root.querySelector('.lks-calc__message'),
      tobacco: root.querySelector('[data-out="tobacco"]'),
      live: root.querySelector('[data-out="live"]'),
      summary: root.querySelector('[data-out="summary"]'),
      copy: root.querySelector('[data-action="copy"]'),
      copyStatus: root.querySelector('[data-out="copyStatus"]'),
    };

    this.announce = debounce((text) => {
      this.out.live.textContent = text;
    }, 700);

    if (this.mode === 'extended') this.initPhases();
    form.addEventListener('input', () => this.update());
    form.addEventListener('change', (e) => {
      if (e.target.name) this.touched.add(e.target.name);
      this.update();
    });
    form.addEventListener('focusout', (e) => {
      if (e.target.name) this.touched.add(e.target.name);
      this.update();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.submitted = true;
      this.update();
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      (firstInvalid ?? this.out.region).focus();
    });
    this.out.copy?.addEventListener('click', () => this.copy());
    this.update();
  }

  /* ---------------- Eingaben lesen */

  value(name) {
    const el = this.form.elements[name];
    if (!el) return undefined;
    if (el instanceof RadioNodeList) return el.value || undefined;
    if (el.type === 'checkbox') return el.checked;
    return el.value;
  }

  readInput() {
    const ageMode = this.value('ageMode') ?? 'age';
    const input = {
      mode: this.mode,
      currentYear: this.currentYear,
      status: this.value('status'),
    };
    if (ageMode === 'birthYear') input.birthYear = parseNum(this.value('birthYear'));
    else input.age = parseNum(this.value('age'));

    if (this.mode === 'extended') {
      input.phases = [...this.form.querySelectorAll('.lks-phase')].map((row) => ({
        fromYear: parseNum(row.querySelector('[data-f="fromYear"]').value),
        toYear: parseNum(row.querySelector('[data-f="toYear"]').value),
        cigarettesPerDay: parseNum(row.querySelector('[data-f="cigarettesPerDay"]').value),
      }));
    } else {
      input.startAge = parseNum(this.value('startAge'));
      input.cigarettesPerDay = parseNum(this.value('cigarettesPerDay'));
      if (input.status === 'former') input.quitYear = parseNum(this.value('quitYear'));
      const pause = parseNum(this.value('pauseYears'));
      if (pause !== undefined) input.pauseYears = pause;
    }
    return input;
  }

  /* ---------------- Sichtbarkeit abhängiger Felder */

  syncVisibility() {
    const ageMode = this.value('ageMode') ?? 'age';
    this.form.querySelectorAll('[data-show-if]').forEach((el) => {
      const [name, val] = el.dataset.showIf.split('=');
      const show = (name === 'ageMode' ? ageMode : this.value(name)) === val;
      el.hidden = !show;
      el.querySelectorAll('input').forEach((i) => (i.disabled = !show));
    });
  }

  /* ---------------- Fehler am Feld */

  showErrors(errors) {
    this.form.querySelectorAll('[data-error-for]').forEach((errEl) => {
      const key = errEl.dataset.errorFor;
      const input = this.fieldFor(key);
      const name = input?.name ?? key;
      const visible = this.submitted || this.touched.has(name);
      const msg = visible ? errors[key] ?? '' : '';
      errEl.textContent = msg;
      if (input) {
        if (msg) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
      }
    });
  }

  fieldFor(key) {
    const m = key.match(/^phases\.(\d+)\.(\w+)$/);
    if (m) return this.form.querySelectorAll('.lks-phase')[m[1]]?.querySelector(`[data-f="${m[2]}"]`);
    const el = this.form.elements[key];
    return el instanceof RadioNodeList ? el[0] : el;
  }

  isComplete(input) {
    const has = (v) => v !== undefined && !Number.isNaN(v);
    const ageOk = has(input.age) || has(input.birthYear);
    if (!ageOk || !input.status) return false;
    if (this.mode === 'extended') {
      return input.phases.length > 0 &&
        input.phases.every((p) => has(p.fromYear) && has(p.toYear) && has(p.cigarettesPerDay));
    }
    return has(input.startAge) && has(input.cigarettesPerDay) &&
      (input.status !== 'former' || has(input.quitYear));
  }

  /* ---------------- Ausgabe */

  update() {
    this.syncVisibility();
    const input = this.readInput();
    const errors = validateInput(input);
    this.showErrors(errors);

    const tobacco = this.value('otherTobacco') === true;
    this.out.tobacco.hidden = !tobacco;
    this.out.tobacco.textContent = this.texts.otherTobacco;

    const ready = this.isComplete(input) && Object.keys(errors).length === 0;
    if (!ready) {
      this.out.region.dataset.state = 'empty';
      this.out.message.textContent =
        Object.keys(errors).length && this.isComplete(input)
          ? 'Bitte prüfen Sie die markierten Angaben.'
          : 'Bitte füllen Sie alle Pflichtfelder aus. Das Ergebnis erscheint dann hier.';
      this.out.packYears.textContent = '–';
      this.out.years.textContent = '–';
      this.out.bar.style.width = '0';
      this.out.barTrack.setAttribute('aria-valuenow', '0');
      this.out.barTrack.setAttribute('aria-valuetext', 'noch kein Ergebnis');
      if (this.out.summary) this.out.summary.textContent = '';
      if (this.out.copy) this.out.copy.disabled = true;
      this.lastResult = null;
      return;
    }

    const r = evaluateCriteria(input);
    this.lastResult = r;
    this.out.region.dataset.state = 'result';
    const py = formatPackYears(r.packYears);
    this.out.packYears.textContent = py;
    this.out.years.textContent = `${formatYears(r.smokingYears)} J.`;

    const max = Math.max(BAR_MAX_MIN, Math.ceil(r.packYears / 10) * 10);
    this.out.bar.style.width = `${Math.min(100, (r.packYears / max) * 100)}%`;
    this.out.mark.style.left = `${(CRITERIA.MIN_PACK_YEARS / max) * 100}%`;
    this.out.barTrack.setAttribute('aria-valuemax', String(max));
    this.out.barTrack.setAttribute('aria-valuenow', String(Math.round(r.packYears * 10) / 10));
    this.out.barTrack.setAttribute('aria-valuetext', `${py} Packungsjahre, Programmschwelle 15`);

    this.out.criteria.replaceChildren(
      ...r.criteria.map((c) => {
        const li = document.createElement('li');
        const label = document.createElement('span');
        label.textContent = c.label;
        const st = document.createElement('span');
        st.className = 'lks-criteria__status';
        st.dataset.status = c.status;
        st.textContent = STATUS_LABEL[c.status];
        li.append(label, st);
        return li;
      }),
    );

    const msg = this.texts[r.outcome];
    this.out.message.textContent = msg;
    if (this.out.summary) this.out.summary.textContent = buildSummary(r);
    if (this.out.copy) this.out.copy.disabled = false;
    this.announce(`Ergebnis: ${py} Packungsjahre, Rauchdauer ${formatYears(r.smokingYears)} Jahre. ${msg}`);
  }

  async copy() {
    if (!this.lastResult) return;
    const text = buildSummary(this.lastResult);
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Fallback für ältere Browser / ohne Berechtigung: Text markieren
      const range = document.createRange();
      range.selectNodeContents(this.out.summary);
      const sel = getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ok = document.execCommand?.('copy') ?? false;
    }
    this.out.copyStatus.textContent = ok
      ? 'In die Zwischenablage kopiert.'
      : 'Kopieren nicht möglich – der Text ist markiert (Strg/Cmd + C).';
  }

  /* ---------------- Phasen (erweiterter Modus) */

  initPhases() {
    this.phaseList = this.form.querySelector('.lks-phases');
    this.phaseTpl = this.form.querySelector('template[data-phase]');
    this.form.querySelector('[data-action="add-phase"]').addEventListener('click', () => {
      const row = this.addPhase();
      row.querySelector('input').focus();
      this.update();
    });
    this.phaseList.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="remove-phase"]');
      if (!btn) return;
      const row = btn.closest('.lks-phase');
      const next = row.nextElementSibling ?? row.previousElementSibling;
      row.remove();
      this.renumberPhases();
      (next?.querySelector('input') ?? this.form.querySelector('[data-action="add-phase"]')).focus();
      this.update();
    });
    this.addPhase();
  }

  addPhase() {
    const n = ++this.phaseSeq;
    const frag = this.phaseTpl.content.cloneNode(true);
    frag.querySelectorAll('[data-id]').forEach((el) => {
      el.id = `${el.dataset.id}-${n}`;
    });
    frag.querySelectorAll('[for]').forEach((el) => el.setAttribute('for', `${el.getAttribute('for')}-${n}`));
    frag.querySelectorAll('[aria-describedby]').forEach((el) =>
      el.setAttribute('aria-describedby', el.getAttribute('aria-describedby').split(' ').map((id) => `${id}-${n}`).join(' ')),
    );
    frag.querySelectorAll('input').forEach((el) => (el.name = `${el.dataset.f}-${n}`));
    this.phaseList.append(frag);
    this.renumberPhases();
    return this.phaseList.lastElementChild;
  }

  renumberPhases() {
    const rows = [...this.phaseList.querySelectorAll('.lks-phase')];
    rows.forEach((row, i) => {
      row.querySelector('legend').textContent = `Phase ${i + 1}`;
      row.querySelectorAll('[data-error-for]').forEach((el) => {
        el.dataset.errorFor = `phases.${i}.${el.dataset.field}`;
      });
      const rm = row.querySelector('[data-action="remove-phase"]');
      rm.hidden = rows.length === 1;
      rm.setAttribute('aria-label', `Phase ${i + 1} entfernen`);
    });
  }
}

document.querySelectorAll('form[data-lks-calculator]').forEach((f) => new Calculator(f));
