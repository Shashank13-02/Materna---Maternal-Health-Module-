// Published content and scoring; supportAction is a separate prototype policy.
// Evidence, permissions and limitations: docs/CLINICAL_EVIDENCE.md.
export const REVIEW_DATE = '2026-09-21';
export const POLICY_VERSION = 'materna-self-check-2.0';
export const FREQUENCY = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
export const TIMEFRAME = 'Over the last 2 weeks, how often have you been bothered by the following problems?';
export const INSTRUMENTS = {
  phq9: {
    name: 'PHQ-9', title: 'Your mood', max: 27,
    source: 'https://www.hiv.uw.edu/page/mental-health-screening/phq-9',
    questions: [
      'Little interest or pleasure in doing things',
      'Feeling down, depressed or hopeless',
      'Trouble falling asleep, staying asleep, or sleeping too much',
      'Feeling tired or having little energy',
      'Poor appetite or overeating',
      "Feeling bad about yourself - or that you're a failure or have let yourself or your family down",
      'Trouble concentrating on things, such as reading the newspaper or watching television',
      'Moving or speaking so slowly that other people could have noticed. Or, the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      'Thoughts that you would be better off dead or of hurting yourself in some way',
    ],
  },
  gad7: {
    name: 'GAD-7', title: 'Your worries', max: 21,
    source: 'https://www.hiv.uw.edu/page/mental-health-screening/gad-7',
    questions: [
      'Feeling nervous, anxious or on edge', 'Not being able to stop or control worrying',
      'Worrying too much about different things', 'Trouble relaxing',
      'Being so restless that it is hard to sit still', 'Becoming easily annoyed or irritable',
      'Feeling afraid as if something awful might happen',
    ],
  },
};

export function scoreInstrument(id, answers) {
  const instrument = INSTRUMENTS[id];
  if (!instrument) throw new Error('Unknown screening instrument');
  // Missing, declined, malformed and sparse answers must never become zero.
  if (!Array.isArray(answers) || answers.length !== instrument.questions.length ||
      Array.from(answers).some(value => !Number.isInteger(value) || value < 0 || value > 3)) return null;
  const total = answers.reduce((sum, value) => sum + value, 0);
  const band = id === 'phq9'
    ? (total >= 20 ? 'Severe' : total >= 15 ? 'Moderately severe' : total >= 10 ? 'Moderate' : total >= 5 ? 'Mild' : 'Minimal')
    : (total >= 15 ? 'Severe' : total >= 10 ? 'Moderate' : total >= 5 ? 'Mild' : 'Minimal');
  return { instrument: instrument.name, total, max: instrument.max, band };
}

// Help actions, not diagnoses, suicide predictions or validated triage.
// Partial answers can trigger help without completion or persistence.
export function supportAction({ phq9 = [], gad7 = [], safety = {}, functioning = null, wantsHelp = false } = {}) {
  if (safety.immediate === 'yes' || safety.immediate === 'unsure' || safety.reality === 'yes') return 'emergency';
  if (Number.isInteger(phq9[8]) && phq9[8] > 0) return 'talk_now';
  if (safety.reality === 'unsure') return 'talk_now';
  if (safety.home === 'yes' || safety.home === 'unsure') return 'private_support';
  const mood = scoreInstrument('phq9', phq9);
  const anxiety = scoreInstrument('gad7', gad7);
  if (wantsHelp || functioning === 'very' || functioning === 'extremely' ||
      (mood && mood.total >= 10) || (anxiety && anxiety.total >= 10)) return 'review';
  if (Object.values(safety).includes('skip') || phq9[8] === 'skip') return 'safety_unanswered';
  if ((mood && mood.total >= 5) || (anxiety && anxiety.total >= 5) || functioning === 'somewhat') return 'discuss';
  if (!mood || !anxiety || !['immediate', 'reality', 'home'].every(key => safety[key] === 'no') || functioning === null || functioning === 'skip') return 'incomplete';
  return 'continue';
}

export const ACTIONS = {
  emergency: { title: 'Please get urgent help now', text: 'If you might act on thoughts of harm, cannot keep yourself or your baby safe, or have new confusion or unusual experiences, call 112 in India or go to the nearest emergency department. Ask a trusted, safe person to stay with you and help care for the baby. Do not wait to finish this check-in.' },
  talk_now: { title: 'Please speak with someone now', text: 'Your answer needs a conversation with a qualified professional now, whatever your questionnaire total. Call your care team or Tele-MANAS. If you might act on these thoughts or cannot stay safe, call 112 or go to the nearest emergency department.' },
  private_support: { title: 'Choose support that is safe for you', text: 'Contact a trusted professional privately if it is safe to do so. You do not need to involve a partner or family member who makes you feel unsafe. If you are in immediate danger, call 112. Materna does not contact anyone for you.' },
  safety_unanswered: { title: 'Some safety questions were left unanswered', text: 'You do not have to share an answer here. Materna cannot assess your safety from a questionnaire. Speak privately with a professional if you have concerns; urgent help is available below.' },
  review: { title: 'Arrange a conversation with your care team', text: 'These answers are a reason to seek a professional assessment. Contact your maternity team, doctor or mental-health professional to agree on support and follow-up. Do not start, stop or change medicines based on a score.' },
  discuss: { title: 'You deserve support with what feels difficult', text: 'Consider discussing these feelings with your maternity team or a mental-health professional, especially if they persist, worsen or affect daily life. Agree together on when to check in again.' },
  incomplete: { title: 'Your check-in is incomplete', text: 'Unanswered questions are not counted as zero. Complete a questionnaire for its score, or speak with a professional without finishing it. You can ask for help at any score.' },
  continue: { title: 'Keep making space for your wellbeing', text: 'You reported few symptoms on these questionnaires. This does not rule out a mental-health condition or establish that you are safe. Contact your care team whenever you are concerned, even with a small score.' },
};
