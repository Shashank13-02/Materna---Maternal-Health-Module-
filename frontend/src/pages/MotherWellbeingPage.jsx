import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppIcon from '../components/AppIcon';
import { ACTIONS, FREQUENCY, INSTRUMENTS, POLICY_VERSION, REVIEW_DATE, TIMEFRAME, scoreInstrument, supportAction } from '../clinical/screening';

const SAFETY_QUESTIONS = [
  ['immediate', 'Are you in immediate danger, worried you may act on thoughts of harming yourself or your baby, or unable to keep yourself or your baby safe right now?'],
  ['reality', 'Are you experiencing new severe confusion, hearing or seeing things other people do not, or feeling out of touch with reality?'],
  ['home', 'Do you feel unsafe, threatened or controlled by someone at home?'],
];
const SAFETY_OPTIONS = [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure'], ['skip', 'Prefer not to answer']];
const STAGES = {
  planning: 'Planning a pregnancy', pregnant: 'During pregnancy',
  early_postpartum: 'Birth to 6 weeks after birth', postpartum: '6 weeks to 1 year after birth',
  loss: 'After pregnancy loss', other: 'Another stage / prefer not to say',
};

function Choices({ name, question, options, value, onChange }) {
  return <div className="screen-question"><fieldset className="question-group">
    <legend>{question}</legend>
    <div className="frequency-grid">{options.map(([key, label]) => <label key={key} className={`answer-option ${value === key ? 'selected' : ''}`}>
      <input type="radio" name={name} checked={value === key} onChange={() => onChange(key)} />
      <span>{label}</span>
    </label>)}</div>
  </fieldset></div>;
}

function HelpContacts() {
  return <section className="materna-support glass-card" id="support" aria-labelledby="support-title">
    <p className="eyebrow">A person to talk to</p>
    <h2 id="support-title">Help is available without completing a check-in</h2>
    <p>In immediate danger, unable to stay safe, or experiencing new severe confusion or loss of touch with reality? Seek emergency help now.</p>
    <div className="help-buttons"><a className="btn btn-danger" href="tel:112">India emergency · 112</a><a className="btn btn-secondary" href="tel:14416">Tele-MANAS · 14416</a></div>
    <p>Tele-MANAS offers 24/7 mental-health support in India. It is not emergency dispatch. Outside India, use your local emergency or crisis service. Calls need a working phone connection.</p>
    <p className="text-sm">Materna is not monitored. No alert, call or referral is sent automatically.</p>
  </section>;
}

function EvidenceNotes() {
  return <details className="evidence-notes">
    <summary>Where the questions and guidance come from</summary>
    <p>PHQ-9 (mood) and GAD-7 (anxiety) use published English questions, a two-week timeframe and separate totals. They support a conversation; they cannot diagnose a condition. The safety questions are Materna prompts and are not a validated scale.</p>
    <p>The original tools were developed by Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues, with support from Pfizer. Pfizer permits their reproduction and distribution. No automatic translation of questionnaire wording is used.</p>
    <ul>
      <li><a href={INSTRUMENTS.phq9.source} target="_blank" rel="noreferrer">PHQ-9 questions and scoring</a></li>
      <li><a href={INSTRUMENTS.gad7.source} target="_blank" rel="noreferrer">GAD-7 questions and scoring</a></li>
      <li><a href="https://www.acog.org/programs/perinatal-mental-health/patient-screening" target="_blank" rel="noreferrer">ACOG: screening during pregnancy and postpartum</a></li>
      <li><a href="https://www.nimh.nih.gov/health/publications/perinatal-depression" target="_blank" rel="noreferrer">NIMH: perinatal depression and psychosis</a></li>
      <li><a href="https://www.dghs.mohfw.gov.in/national-mental-health-programme.php" target="_blank" rel="noreferrer">Government of India: Tele-MANAS</a> · <a href="https://112.gov.in/" target="_blank" rel="noreferrer">112 emergency service</a></li>
    </ul>
    <p>Materna’s home workflow has not been clinically validated in India. Language, pregnancy stage and clinical context affect interpretation. A clinician should set your follow-up plan. Questions about sleep, energy or appetite may need discussion in the context of pregnancy and caring for a newborn.</p>
    <p className="text-sm">Evidence reviewed {REVIEW_DATE} · {POLICY_VERSION} · English prototype</p>
  </details>;
}

export default function MotherWellbeingPage() {
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState('pregnant');
  const [safety, setSafety] = useState({ immediate: null, reality: null, home: null });
  const [responses, setResponses] = useState({ phq9: Array(9).fill(null), gad7: Array(7).fill(null) });
  const [functioning, setFunctioning] = useState(null);
  const [wantsHelp, setWantsHelp] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [activeInstrument, setActiveInstrument] = useState('phq9');
  const [consent, setConsent] = useState(false);
  const focusTarget = useRef(null);
  const urgentTarget = useRef(null);
  const action = supportAction({ ...responses, safety, functioning, wantsHelp });
  const urgent = ['emergency', 'talk_now', 'private_support'].includes(action);
  const instrument = INSTRUMENTS[activeInstrument];
  const answered = responses[activeInstrument].filter(value => value !== null).length;

  useEffect(() => { if (started || showResult) focusTarget.current?.focus(); }, [started, showResult, activeInstrument]);
  useEffect(() => { if (urgent) urgentTarget.current?.focus(); }, [action, urgent]);

  const reset = () => {
    setResponses({ phq9: Array(9).fill(null), gad7: Array(7).fill(null) });
    setSafety({ immediate: null, reality: null, home: null });
    setFunctioning(null); setWantsHelp(false); setShowResult(false); setStarted(false); setConsent(false);
    setActiveInstrument('phq9'); setStage('pregnant');
  };

  return <main className="page mother-page" lang="en">
    <header className="mother-header"><Link to="/wellbeing" className="mother-brand"><AppIcon name="heart" /><span>Materna</span></Link><a href="#support" className="btn btn-secondary">Find support</a></header>
    <div className="mother-intro"><p className="eyebrow">Your wellbeing matters, too</p><h1 ref={focusTarget} tabIndex={-1}>{showResult ? 'Your check-in, explained' : started ? 'A little space for how you feel' : 'Support through pregnancy and beyond'}</h1>
      <p>{showResult ? 'You can show this screen to your care team and decide your next step together.' : 'Take a moment to notice how you have been feeling. You can ask for help at any time.'}</p>
    </div>
    {urgent && <section ref={urgentTarget} tabIndex={-1} role="alert" className="safety-card immediate-support">
      <h2>{ACTIONS[action].title}</h2><p>{ACTIONS[action].text}</p>
      <div className="help-buttons"><a className="btn btn-danger" href="tel:112">Emergency · 112</a><a className="btn btn-secondary" href="tel:14416">Talk to Tele-MANAS</a></div>
      <p className="text-sm">India numbers · No one is automatically notified.</p>
    </section>}

    {!started && <section className="glass-card start-checkin">
      <h2>Before you begin</h2>
      <p>This English-language check-in uses the PHQ-9 and GAD-7 questionnaires. You can leave questions unanswered, pause or stop. The results are screening information, not a diagnosis.</p>
      <label className="form-group">Where are you in your journey?
        <select className="input select" value={stage} onChange={event => setStage(event.target.value)}>{Object.entries(STAGES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
      </label>
      <div className="privacy-note"><AppIcon name="lock" size={24} /><p>No name, phone number or account is needed. Your new answers stay in this page’s memory; Materna does not save or send them. Reloading, leaving this page or clearing the check-in removes them. Use a private device if possible.</p></div>
      <label className="consent-row"><input type="checkbox" checked={consent} onChange={event => setConsent(event.target.checked)} /><span>I understand and choose to continue.</span></label>
      <button className="btn btn-primary btn-full btn-lg" disabled={!consent} onClick={() => setStarted(true)}>Start my check-in</button>
    </section>}

    {started && !showResult && <>
      <section aria-labelledby="safety-title"><h2 id="safety-title">First, your safety</h2><p className="section-description">These questions are separate from your scores. If something feels unsafe, you do not need to finish the form.</p>
        {SAFETY_QUESTIONS.map(([key, question]) => <Choices key={key} name={`safety-${key}`} question={question} options={SAFETY_OPTIONS} value={safety[key]} onChange={value => setSafety(previous => ({ ...previous, [key]: value }))} />)}
      </section>
      <section aria-label="Screening questionnaires">
        <div className="instrument-switch">{Object.entries(INSTRUMENTS).map(([id, item]) => <button className={`btn ${activeInstrument === id ? 'btn-primary' : 'btn-secondary'}`} key={id} aria-pressed={activeInstrument === id} onClick={() => setActiveInstrument(id)}>{item.title} · {item.name}</button>)}</div>
        <h2>{instrument.title}</h2><p className="section-description">{TIMEFRAME}</p>
        <p className="text-sm">{answered} of {instrument.questions.length} questions answered or skipped. Skipped questions do not receive a score.</p>
        <progress className="checkin-progress" value={answered} max={instrument.questions.length} aria-label={`${instrument.name} completion`} />
        {instrument.questions.map((question, index) => <Choices key={`${activeInstrument}-${index}`} name={`${activeInstrument}-${index}`} question={`${index + 1}. ${question}`} options={[...FREQUENCY.map((label, value) => [value, label]), ['skip', 'Prefer not to answer']]} value={responses[activeInstrument][index]} onChange={value => setResponses(previous => ({ ...previous, [activeInstrument]: previous[activeInstrument].map((item, i) => i === index ? value : item) }))} />)}
      </section>
      <section aria-labelledby="context-title"><h2 id="context-title">How life feels right now</h2>
        <p className="section-description">These context questions do not add to either questionnaire score.</p>
        <Choices name="functioning" question="How much are these difficulties affecting everyday life, relationships or looking after yourself?" options={[[ 'none', 'Not difficult at all'], ['somewhat', 'Somewhat difficult'], ['very', 'Very difficult'], ['extremely', 'Extremely difficult'], ['skip', 'Prefer not to answer']]} value={functioning} onChange={setFunctioning} />
        <label className="consent-row"><input type="checkbox" checked={wantsHelp} onChange={event => setWantsHelp(event.target.checked)} /><span>I would like to talk to a professional, whatever my scores.</span></label>
      </section>
      <div className="help-buttons"><button className="btn btn-secondary" onClick={() => setActiveInstrument(activeInstrument === 'phq9' ? 'gad7' : 'phq9')}>{activeInstrument === 'phq9' ? 'Continue to worries' : 'Review mood answers'}</button><button className="btn btn-primary" onClick={() => setShowResult(true)}>View my check-in</button></div>
    </>}

    {started && showResult && <section className="checkin-results">
      <p className="text-sm">{STAGES[stage]} · Based on the last two weeks · English</p>
      <div className="score-grid">{Object.entries(INSTRUMENTS).map(([id, item]) => {
        const score = scoreInstrument(id, responses[id]);
        return <article className="glass-card" key={id}><p className="eyebrow">{item.name}</p><h2>{item.title}</h2>{score ? <><p className="screening-total">{score.total}<span> / {score.max}</span></p><p>{score.band} symptom range</p></> : <><p className="screening-total">Incomplete</p><p>No total: one or more answers are missing or skipped.</p></>}<a href={item.source} target="_blank" rel="noreferrer">About this questionnaire</a></article>;
      })}</div>
      <div className="glass-card"><h2>{ACTIONS[action].title}</h2><p>{ACTIONS[action].text}</p><p>These are symptom ranges, not a diagnosis or a prediction of suicide risk. No score rules out problems that need care.</p>
        {action !== 'incomplete' && (scoreInstrument('phq9', responses.phq9) === null || scoreInstrument('gad7', responses.gad7) === null) && <p>At least one questionnaire is incomplete. The support message above still applies.</p>}
        <p className="text-sm">This result has not been saved, shared or reviewed by a clinician.</p>
      </div>
      <button className="btn btn-secondary" onClick={() => setShowResult(false)}>Review my answers</button>
    </section>}

    <HelpContacts />
    <section className="glass-card everyday-support"><h2>Make room for support</h2>
      <p>Tell a trusted person what would help today, such as a meal, company or help with caring tasks. A professional can discuss talking therapies and other treatment options with you.</p>
      <p>Very upsetting, unwanted thoughts deserve a conversation with a professional. Having a thought does not by itself mean you intend to act on it. If you feel you may act or cannot keep yourself or your baby safe, get emergency help.</p>
      <p>If mood changes after birth are severe, worsening, or last beyond two weeks, seek professional advice. You do not need to wait two weeks to ask for help.</p>
    </section>
    <EvidenceNotes />
    {started && <button className="btn btn-secondary btn-full" onClick={reset}>Clear my answers and finish</button>}
    <footer className="mother-footer"><span>Materna · Home check-in prototype</span><Link to="/login">Staff prototype sign-in</Link></footer>
  </main>;
}
