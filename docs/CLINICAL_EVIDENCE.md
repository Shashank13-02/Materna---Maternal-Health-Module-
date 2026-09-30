# Materna: clinical evidence and implementation decisions

Reviewed: 21 September 2026. Intended audience: mothers using the application independently at home, initially in India. Status: an English-language prototype, not a clinically validated or monitored care service.

## What changed

The previous nine-question flow combined modified mood, anxiety, sleep and household-safety questions. Its thresholds of 8 and 15 and automatic 1/7/28-day follow-ups had no documented validation. Those rules were removed from the active app. The old screen was replaced; existing browser database records were not deleted or converted into validated scores.

The new `/wellbeing` flow is available without an account. It holds new answers in React memory only; it does not read legacy patient records, save responses, send them to the backend, or call an AI service. Staff routes remain separate development screens. Separation of browser tables is not encryption or access control. The previous claims that prototype records were protected were removed from the staff sign-in page.

This is a targeted literature and guidance review, not a systematic review. Primary clinical guidance, instrument publishers and original research were prioritised. A source supporting an instrument does not validate this app, its routing language, or its use by every language and age group.

## Clinical foundation

| Source and type | Evidence-supported principle | Application in Materna |
| --- | --- | --- |
| [WHO, integration guide (2022)](https://www.who.int/publications/i/item/9789240057142), service guidance | Integrate mental-health support into maternal care and adapt it to cultural and service context | Mother-facing language, links to care; clinical service partnership remains necessary |
| [ACOG, Patient Screening / CPG 4 (2023)](https://www.acog.org/programs/perinatal-mental-health/patient-screening), clinical guideline implementation | Use validated instruments early in prenatal care, later in pregnancy and postpartum, with assessment and follow-up available; positive self-harm answers need immediate professional assessment; postpartum psychosis needs immediate medical attention | Separate instruments, support on partial answers and no invented follow-up interval |
| [NICE NG225 §1.6 (2022)](https://www.nice.org.uk/guidance/ng225/chapter/recommendations#risk-assessment-tools-and-scales), self-harm guidance | Scores and global low/medium/high labels should not predict suicide or determine access to care | No suicide risk score, no green safety clearance, no withholding help because a total is small |
| [NIMH, Perinatal Depression](https://www.nimh.nih.gov/health/publications/perinatal-depression), patient education | Distinguishes persistent/severe symptoms from early baby blues and describes psychosis and available treatments | Brief support text and emergency guidance; no medication recommendations |
| [NHS Birmingham and Solihull, intrusive thoughts](https://www.bsmhft.nhs.uk/our-services/specialist-services/perinatal-mental-health-service/information-for-mothers/worrying-intrusive-thoughts/), specialist patient education | Distressing unwanted thoughts warrant discussion and are not synonymous with intent | Avoid automatic statements that a mother will harm her baby |

These international guidelines inform design; they are not described as Indian clinical policy or proof of regulatory approval.

## Instruments, permissions and scores

The prototype uses the published English PHQ-9 and GAD-7 item sets and their four response options, with a two-week recall period. Names, item counts and maxima are stored alongside the content in `frontend/src/clinical/screening.js`. Questions are not rewritten by an LLM or translated automatically.

| Instrument | Purpose | Scoring and conventional symptom bands |
| --- | --- | --- |
| PHQ-9 | Depression symptom screening | Nine items, each 0–3; total 0–27. 0–4 minimal, 5–9 mild, 10–14 moderate, 15–19 moderately severe, 20–27 severe |
| GAD-7 | Generalised anxiety symptom screening | Seven items, each 0–3; total 0–21. 0–4 minimal, 5–9 mild, 10–14 moderate, 15–21 severe |

Sources: [University of Washington PHQ-9](https://www.hiv.uw.edu/page/mental-health-screening/phq-9), [UW GAD-7](https://www.hiv.uw.edu/page/mental-health-screening/gad-7), [Spitzer et al., original GAD-7 study, 2006](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/410326), and [NHS Scotland GAD-7 scoring sheet](https://rightdecisions.scot.nhs.uk/media/1835/gad-7_anxiety.pdf). The original GAD-7 study and Scottish sheet establish that the severe band starts at **15**, resolving an ambiguous “greater than 15” line on the UW page.

These are symptom bands, not diagnoses. No sensitivity or specificity from a general adult study is advertised as Materna's accuracy. Screening cutoffs vary by purpose and population; UW also discusses a GAD-7 threshold of 8. The prototype uses the conventional moderate band (10) to encourage assessment, but welcomes help-seeking at any score. This choice needs local clinician review.

The PHQ/GAD instruments were developed by Robert L. Spitzer, Janet B.W. Williams, Kurt Kroenke and colleagues with Pfizer support. [Pfizer's 21 July 2010 public-access statement](https://www.pfizer.com/news/press-release/press-release-detail/pfizer_to_offer_free_public_access_to_mental_health_assessment_tools_to_improve_diagnosis_and_patient_care) permits access and use without copyright restriction. Attribution is retained. This permission does not imply Pfizer endorses Materna.

No incomplete, skipped, invalid or sparse answer array receives a total. Mood and anxiety are never added together. Functioning, stage and safety prompts are separate unscored Materna context questions; they do not purport to be a formal diagnostic interview or the instruments' original impairment addendum.

## Support policy: evidence-informed, not clinically validated triage

| Trigger, even with an unfinished form | Result |
| --- | --- |
| Immediate danger / inability to stay safe answered yes or uncertain, or new reality disturbance answered yes | Show emergency help immediately and direct to a safe person and emergency assessment |
| Any PHQ-9 item 9 answer of 1–3, or uncertain reality disturbance | Encourage immediate conversation with a qualified professional; distinguish emergency danger from a positive screening item |
| Threatening/controlling home situation answered yes or uncertain | Offer private support, without automatic partner contact |
| Either total ≥10, major functional difficulty, or an explicit request for help | Encourage professional assessment regardless of other scores |
| Safety item declined | State safety cannot be assessed; never substitute zero. A higher-priority support action takes precedence |
| Either total 5–9 or some functional difficulty | Invite discussion, particularly if persistent or worsening |
| Missing questionnaire, safety or functioning answers | Explain incompleteness; still offer support |
| Complete questionnaires with few reported symptoms | Supportive message with explicit limits; no assurance of safety |

The “uncertain” paths and prioritisation order are conservative engineering choices requiring clinical sign-off. They are not externally validated algorithms. PHQ-9/GAD-7 do not assess all perinatal conditions, including bipolar disorder, trauma, OCD or psychosis. ACOG additionally calls for bipolar screening before starting medication for depression/anxiety; Materna does not prescribe. Symptoms needing help should never wait for an app score.

[Tele-MANAS / DGHS](https://www.dghs.mohfw.gov.in/national-mental-health-programme.php) verifies 14416 for 24/7 mental-health support in India. [ERSS](https://112.gov.in/) verifies 112 for emergencies. Calls require connectivity; outside India users need local services. The app does not make calls, dispatch emergency services or notify clinicians automatically.

## Why local validation is still essential

[Fellmeth et al., BMJ Open, 18 March 2026](https://pubmed.ncbi.nlm.nih.gov/41857859/) studied Hindi measures in rural Kangra, with 480 perinatal/non-perinatal participants and complete data for 443. Among perinatal participants GAD-7 AUROC was 0.88 (95% CI 0.79–0.96). The authors caution that few clinically diagnosed cases limit interpretation. This supports local research; it does not validate an English home app or establish one national cutoff.

[Joshi et al., Hindi EPDS antenatal validation](https://pubmed.ncbi.nlm.nih.gov/31927197/) found an optimal 9/10 threshold in its sample, with sensitivity 65.38% and specificity 79.73%. This illustrates why a universal EPDS threshold or a casual translation would be inappropriate.

EPDS is a strong candidate for the next perinatal-specific implementation. Select the exact language version, review reproduction/digital-use terms, preserve its seven-day timeframe, answer order and reverse-scored items, and agree on locally supported thresholds with a clinical partner. PHQ-9/GAD-7 were chosen now for inspectable scoring and explicit reproduction permission, not demonstrated superiority to EPDS.

## Remaining work before real home use

1. Have an Indian perinatal mental-health clinician review wording and every support path, including severe impairment, mania, loss, abuse, adolescents and users who cannot reliably self-report. Stage selection currently adds context; it does not alter thresholds or make the workflow validated for pregnancy loss or minors.
2. Partner with an actual care service: define referral acceptance, available hours, responsibility and response arrangements. Collect referral completion and barriers, not just questionnaire completion.
3. Conduct language adaptation, comprehension interviews and accessibility testing with mothers. Release reviewed translations with version identifiers; do not substitute generated translations.
4. Validate the home administration against an independent clinical reference assessment. Pre-specify thresholds, false-negative tolerance and missing-data handling. Include pregnancy/postpartum stages, literacy levels and local languages.
5. Add longitudinal records only after real identity separation, consent, deletion/export, retention rules and secure storage are implemented. Prototype OTP, localStorage tokens and browser databases are not suitable protection for production health records. Legacy custom scores must never be compared with PHQ-9/GAD-7 totals.
6. Audit the staff ANC risk engine separately. It contains weighted, normalised risk scores without a documented validated basis; it is excluded from the mother's new route and is not clinically approved by this work.

## Verification

Automated tests in `frontend/src/clinical/screening.test.js` cover every severity boundary, invalid/missing/declined input, positive self-harm answers with incomplete questionnaires, acute safety overrides, home safety, functioning, and help requests independent of scores. Tests check implementation correctness, not clinical efficacy.

Checks on 21 September 2026:

- `node --test src/clinical/screening.test.js` from `frontend`: 9 tests passed.
- `npm run build`: passed, including PWA generation; existing bundle-size warning remains.
- `npm run lint`: no errors; a hook-dependency warning remains in the separate ANC `Step5Flags.jsx` component.
- Browser smoke test with synthetic answers: public check-in loads without OTP; participation checkbox enables start; a single positive PHQ-9 item 9 response immediately displays support before completion; results show both incomplete instruments without totals; reload returns to a fresh check-in. No phone calls were placed.
- Desktop layout was visually inspected. Comprehensive mobile-device, screen-reader, usability and clinical validation remain outstanding.

The new flow intentionally has no storage or AI call. Old IndexedDB data is retained, not migrated, uploaded or erased. Clearing new answers clears the current check-in only; it does not remove old records, browser history, screenshots or other device traces.
