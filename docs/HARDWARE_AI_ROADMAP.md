# Materna: hardware and AI/ML roadmap

Evidence reviewed 21 September 2026. Proposed setting: mothers at home in India. Hardware and AI are **not connected or implemented** in this release. Recommendations below distinguish established platform capabilities from experimental clinical uses.

## Recommended direction

First establish an accessible screening-and-support service and a responsible clinical partner. Then evaluate optional data collection and assistance against that baseline. A device or model is worthwhile only if it improves an outcome mothers value: timely support, symptom improvement, less burden or better access.

## Hardware: where it can help

| Option | Reasonable role | Evidence and limits | Recommendation |
| --- | --- | --- | --- |
| Existing phone | Accessible self-report, reminders chosen by the mother, audio of reviewed questions | No extra hardware purchase; notification wording and shared-phone privacy matter | Start here; audio and reminders still need implementation |
| Watch or ring | Optional sleep/activity/resting-heart-rate context for a conversation | Associations and feasibility do not establish a diagnostic biomarker; newborn care and changing physiology complicate interpretation | Small opt-in feasibility study after the core service works |
| Pregnancy-validated upper-arm BP cuff | Separate maternal physical-health monitoring when the maternity team requests it | BP is not a depression marker; exact device model must be validated for pregnancy and, where relevant, pre-eclampsia | Consider only with an obstetric pathway and device validation |
| Custom HRV/EDA/PPG board or band | Engineering experiments using synthetic or properly consented research data | Noise, contact, motion, wear burden, calibration and ambiguous physiological meaning; no reviewed evidence validates a Materna depression detector | Defer; do not label its output depression, safety or suicide risk |
| Continuous microphone, camera, location or household/baby sensor | Possible research signals, with substantial privacy burden | No demonstrated incremental clinical benefit established in this review; captures bystanders or sensitive home activity | Exclude from the first product |

[NHS England's maternity BP recommendations](https://www.england.nhs.uk/long-read/recommendations-for-digital-blood-pressure-monitoring-in-maternity-services/) and [STRIDE BP's pregnancy device list](https://www.stridebp.org/bp-monitors/) support choosing a specifically validated cuff. Bluetooth connectivity is a transport feature, not evidence of measurement accuracy. This review does not recommend a brand or establish a price/budget.

The [2024 All of Us/Fitbit study](https://mhealth.jmir.org/2024/1/e54622/) explores individualised postpartum-depression recognition from wearable/EHR data in a cross-sectional framework. Its authors explicitly call for prospective validation. It provides a research direction, not evidence that a consumer watch can prospectively diagnose depression in Indian mothers. Do not market classification performance as clinical benefit or equate retrospective recognition with early prediction.

For wearable research, record sleep opportunity/caring demands, pregnancy/postpartum stage, illness, medication changes, wear time and sensor quality. These are proposed confounders to evaluate, not a validated correction formula. HRV values from different devices, algorithms or sampling windows should not be assumed interchangeable. Missing data must remain missing; non-wear is not evidence of illness or wellbeing.

## Integration architecture

The current React/Vite browser app has no native health-platform integration. A logical next architecture is:

1. Device or companion app writes supported observations to a health platform.
2. A native mobile app or reviewed native bridge requests only the needed read permissions.
3. An adapter checks units, timestamps/timezone, provenance, duplicate records, device/firmware version, observation window and quality.
4. With separate consent, a secure backend stores only necessary observations under the correct user account.
5. The mother sees descriptive trends with coverage/missingness, and decides what to share with a care professional.

[Android Health Connect](https://developer.android.com/health-and-fitness/health-connect/read-data) supplies permission-controlled reading APIs; [sleep documentation](https://developer.android.com/health-and-fitness/health-connect/experiences/sleep) describes sleep and related permissions. [Apple HealthKit](https://developer.apple.com/documentation/healthkit/authorizing-access-to-health-data) requires native app capability and authorisation. These are not browser REST endpoints available by adding a JavaScript button. Data availability varies by device, source application and permissions. Direct BLE would require a supported vendor protocol and on-device tests; this review makes no claim that a chosen device works with the current PWA.

A proposed observation contract should include `observation_id`, `user_id`, `metric`, `value`, `unit`, `start_at`, `end_at`, `timezone`, `source`, `source_record_id`, `device_model`, `algorithm_version`, `quality`, `coverage` and `consent_version`. No such sensor is simulated as live data in this implementation. Keep raw audio, GPS and inferred emotional states out of the default contract.

## AI: useful assistance before prediction

| Candidate | Concrete benefit | Necessary limits | Priority |
| --- | --- | --- | --- |
| Clinician-reviewed educational content, retrieved with citations | Explains a question or care option in understandable language | Versioned approved corpus; refuse unsupported medical answers; do not rewrite scored questions | Best first AI experiment; retrieval-only FAQ can be an even simpler baseline |
| Optional voice transcription | Reduces typing burden | Explicit opt-in, editable transcript, language/accent evaluation; avoid voice-emotion diagnosis and unintended raw-audio retention | Later accessibility pilot |
| Summary for a consultation | Organises the mother's own words and scores | Separate stated facts from inference; mother previews/corrects before sharing; no diagnoses or medication directions | High practical value once secure records exist |
| Personalised reminder timing | Reduces burden and missed check-ins | User controls timing/opt-out; no sensitive lock-screen content; no guilt-based streaks | Start with simple preferences before ML |
| Wearable/symptom prediction | Could flag changes worth discussion | Requires a defined target, representative data, external validation and an accountable response service | Research only |

These are design proposals, not demonstrated benefits in Materna. [WHO's 2024 guidance on large multimodal models](https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models) highlights risks including erroneous outputs and automation bias. [ICMR's 2023 AI ethics guidance](https://www.icmr.gov.in/ethical-guidelines-for-application-of-artificial-intelligence-in-biomedical-research-and-healthcare) provides the relevant Indian research-governance framework. Neither document certifies a particular chatbot.

Keep instrument scoring and explicit emergency instructions deterministic and available offline. An LLM must not lower urgency, declare someone safe, prescribe, infer abuse or diagnose depression from a facial expression/voice/HRV reading. A crisis-keyword classifier may miss indirect or multilingual expressions; emergency help must remain available regardless of its output. Do not launch a free-form therapeutic chatbot without a reviewed escalation workflow and evaluation.

## Logical ML evaluation plan

1. Define a testable question, for example: does adding optional wearable data improve identification of clinician-assessed depressive episodes over validated questionnaires alone? Define the prediction time and horizon before data collection.
2. Use informed research consent and ethics review. Recruit across sites, languages, devices and pregnancy stages. Include women without wearables so the core service remains available.
3. Obtain independent clinical reference assessments. A PHQ-9/EPDS cutoff can be a symptom-screening outcome but is not equivalent to clinician-diagnosed depression. Do not train and assess a diagnostic claim against the app's own invented labels.
4. Prevent leakage: split by mother and site, respect chronology, and exclude future clinical notes or post-outcome sensor data. Repeated daily samples from one mother must not appear in both training and test sets.
5. Compare against a simple questionnaire-only model and ordinary regression before complex ML. Measure calibration, sensitivity, specificity, PPV/NPV at realistic prevalence, PR-AUC, coverage/abstention and incremental net benefit. Report uncertainty, not just accuracy/AUROC.
6. Examine performance by language, literacy, pregnancy/postpartum stage, device, access and relevant demographic groups. Analyse dropout and missing data; wearable ownership creates selection bias.
7. Test prospectively at an external site in silent mode, with ordinary care still responsible for every concern. Agree on thresholds and alert workload with clinicians. Determine sample size with a statistician using anticipated outcome prevalence and precision; do not invent a universal required cohort size.
8. Only then evaluate effects on help-seeking, completed referrals, symptoms, false alarms, distress, clinician burden and equitable access. Plan monitoring, rollback and retirement after updates or drift.

## Proposed build order and decision gates

| Phase | Deliverable | Proceed when |
| --- | --- | --- |
| Now | Inspectable English questionnaires, immediate support and source provenance | Implemented and software-tested; clinical review still outstanding |
| Clinical pilot preparation | Reviewed local-language content, referral partner, home usability study and protocol | Clinicians and participating mothers can understand and use it safely |
| Secure longitudinal service | Real identities/authorisation, consent, retention/deletion, secure storage, reliable follow-up | Security and clinical workflow tests pass; mother controls sharing |
| Optional assistance | Approved-content FAQ and reviewed consultation summary | Evaluation shows accurate, comprehensible help without unsafe advice |
| Wearable feasibility | One supported device/platform integration with data-quality reporting | Adequate adherence, acceptable burden and usable data |
| Predictive ML research | Externally and prospectively evaluated model | Meaningful benefit beyond the simple baseline and an accountable care response |

Before distributing a product with diagnostic, monitoring or treatment claims, obtain an intended-use assessment from the appropriate Indian regulatory/legal specialists. This report does not determine regulatory classification or claim legal compliance. No devices were purchased, cloud accounts connected, data uploaded, research participants enrolled or models trained as part of this work.
