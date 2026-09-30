import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreInstrument, supportAction, INSTRUMENTS } from './screening.js';

const answersWithTotal = (length, total) => Array.from({ length }, (_, i) => Math.max(0, Math.min(3, total - i * 3)));
const clearContext = { phq9: Array(9).fill(0), gad7: Array(7).fill(0), safety: { immediate: 'no', reality: 'no', home: 'no' }, functioning: 'none' };

test('published PHQ-9 bands include every boundary and maximum', () => {
  for (const [total, band] of [[0, 'Minimal'], [4, 'Minimal'], [5, 'Mild'], [9, 'Mild'], [10, 'Moderate'], [14, 'Moderate'], [15, 'Moderately severe'], [19, 'Moderately severe'], [20, 'Severe'], [27, 'Severe']]) {
    assert.deepEqual(scoreInstrument('phq9', answersWithTotal(9, total)), { instrument: 'PHQ-9', total, max: 27, band });
  }
});
test('published GAD-7 bands include every boundary and maximum', () => {
  for (const [total, band] of [[0, 'Minimal'], [4, 'Minimal'], [5, 'Mild'], [9, 'Mild'], [10, 'Moderate'], [14, 'Moderate'], [15, 'Severe'], [21, 'Severe']]) {
    assert.deepEqual(scoreInstrument('gad7', answersWithTotal(7, total)), { instrument: 'GAD-7', total, max: 21, band });
  }
});
test('missing, declined, sparse and invalid answers never produce a reassuring zero', () => {
  for (const id of Object.keys(INSTRUMENTS)) {
    const length = INSTRUMENTS[id].questions.length;
    for (const value of [null, undefined, 'skip', '', '0', false, -1, 4, 1.5, NaN]) {
      assert.equal(scoreInstrument(id, [value, ...Array(length - 1).fill(0)]), null);
    }
    for (const values of [[], new Array(length), Array(length - 1).fill(0), Array(length + 1).fill(0)]) assert.equal(scoreInstrument(id, values), null);
  }
  assert.throws(() => scoreInstrument('invented', []));
});
test('every positive PHQ-9 self-harm response triggers help, including incomplete forms', () => {
  for (const value of [1, 2, 3]) {
    const phq9 = Array(9).fill(null); phq9[8] = value;
    assert.equal(supportAction({ phq9 }), 'talk_now');
    assert.equal(supportAction({ ...clearContext, phq9: [...Array(8).fill(0), value] }), 'talk_now');
  }
});
test('acute danger and new reality disturbances override all totals', () => {
  for (const safety of [{ immediate: 'yes' }, { immediate: 'unsure' }, { reality: 'yes' }]) {
    assert.equal(supportAction({ ...clearContext, safety }), 'emergency');
    assert.equal(supportAction({ safety }), 'emergency');
  }
  assert.equal(supportAction({ safety: { reality: 'unsure' } }), 'talk_now');
});
test('unsafe home invites private support and never automatic partner involvement', () => {
  for (const home of ['yes', 'unsure']) assert.equal(supportAction({ safety: { home } }), 'private_support');
});
test('patient request and impaired function matter independently of scores and omissions', () => {
  assert.equal(supportAction({ ...clearContext, wantsHelp: true }), 'review');
  assert.equal(supportAction({ wantsHelp: true, safety: { home: 'skip' } }), 'review');
  for (const functioning of ['very', 'extremely']) assert.equal(supportAction({ functioning }), 'review');
  assert.equal(supportAction({ ...clearContext, functioning: 'somewhat' }), 'discuss');
});
test('scores are separate and either questionnaire can warrant assessment', () => {
  assert.equal(supportAction({ ...clearContext, phq9: answersWithTotal(9, 10) }), 'review');
  assert.equal(supportAction({ ...clearContext, gad7: answersWithTotal(7, 10) }), 'review');
  assert.equal(supportAction({ ...clearContext, gad7: answersWithTotal(7, 5) }), 'discuss');
  assert.equal(supportAction({ ...clearContext, phq9: answersWithTotal(9, 5), gad7: answersWithTotal(7, 5) }), 'discuss');
});
test('incomplete safety and symptoms do not result in a completed reassuring pathway', () => {
  assert.equal(supportAction(), 'incomplete');
  assert.equal(supportAction({ ...clearContext, safety: {} }), 'incomplete');
  assert.equal(supportAction({ ...clearContext, safety: { immediate: 'skip' } }), 'safety_unanswered');
  assert.equal(supportAction({ ...clearContext, functioning: 'skip' }), 'incomplete');
  assert.equal(supportAction(clearContext), 'continue');
});
