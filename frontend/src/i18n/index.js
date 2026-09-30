// i18n configuration — English + Hindi
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // App
      app_name: 'Maternal Health',
      app_subtitle: 'ANC Data Entry',

      // Auth
      login_title: 'Welcome',
      login_subtitle: 'Sign in with your registered mobile number',
      phone_label: 'Mobile Number',
      phone_placeholder: '+91 98765 43210',
      send_otp: 'Send OTP',
      otp_sent: 'OTP sent to {{phone}}',
      otp_label: 'Enter OTP',
      otp_hint: 'Enter the 6-digit code sent to your phone',
      verify_otp: 'Verify & Login',
      resend_otp: 'Resend OTP',
      mock_hint: 'Development OTP: 123456',

      // Navigation
      nav_home: 'Home',
      nav_new: 'New ANC',
      nav_records: 'Records',
      nav_sync: 'Sync',

      // Dashboard
      dashboard_greeting: 'Good {{time}}, {{name}}',
      dashboard_role: '{{role}} Worker',
      pending_sync: '{{count}} records pending sync',
      sync_now: 'Sync Now',
      total_beneficiaries: 'Beneficiaries',
      todays_visits: "Today's Visits",
      high_risk: 'High Risk',
      synced_today: 'Synced Today',
      recent_records: 'Recent Records',
      no_records: 'No records yet. Start by adding a new ANC visit.',
      add_new_anc: 'Add New ANC Visit',

      // ANC Form Steps
      step_beneficiary: 'Beneficiary',
      step_vitals: 'Vitals',
      step_labs: 'Labs',
      step_nutrition: 'Nutrition',
      step_flags: 'Flags',
      anc_form_title: 'New ANC Record',
      anc_contact_label: 'ANC Contact Number',
      visit_date_label: 'Visit Date',

      // Step 1 — Obstetric History
      beneficiary_id: 'Beneficiary ID / RCH ID',
      beneficiary_name: 'Beneficiary Name',
      gravida_label: 'Gravida (G)',
      para_label: 'Para (P)',
      lmp_label: 'Last Menstrual Period (LMP)',
      edd_label: 'Expected Date of Delivery (EDD)',
      gestational_age: 'Gestational Age (weeks)',
      prev_stillbirth: 'Previous Stillbirth',
      prev_neonatal_death: 'Previous Neonatal Death',
      prev_cesarean: 'Previous Cesarean Section',
      prev_preterm: 'Previous Preterm Birth',
      prev_lbw: 'Previous Low Birth Weight',
      prev_pph: 'Previous Postpartum Hemorrhage',
      num_abortions: 'Number of Abortions',

      // Step 2 — Vitals
      systolic_bp: 'Systolic BP (mmHg)',
      diastolic_bp: 'Diastolic BP (mmHg)',
      weight_kg: 'Weight (kg)',
      fundal_height: 'Fundal Height (cm)',
      oedema_present: 'Oedema Present',
      oedema_severity: 'Oedema Severity',
      pulse_rate: 'Pulse Rate (bpm)',
      fetal_heart_rate: 'Fetal Heart Rate (bpm)',

      // Step 3 — Labs
      hemoglobin: 'Hemoglobin (g/dL)',
      fbs: 'Fasting Blood Sugar (mg/dL)',
      ppbs: '2hr PPBS (mg/dL)',
      urine_albumin: 'Urine Albumin',
      urine_sugar: 'Urine Sugar',
      hiv_status: 'HIV Status',
      vdrl_status: 'VDRL Status',
      blood_group: 'Blood Group',

      // Step 4 — Nutrition
      ifa_distributed: 'IFA Tablets Distributed',
      ifa_consumed: 'IFA Tablets Consumed (last month)',
      ifa_compliance: 'IFA Compliance',
      calcium_given: 'Calcium Tablets Given',
      tt_status: 'TT Vaccination Status',
      dietary_counseling: 'Dietary Counseling Done',
      muac: 'MUAC (cm)',

      // Step 5 — Flags
      flags_title: 'PMSMA Risk Flag Review',
      flags_subtitle: 'Auto-evaluated flags — verify and adjust if needed',
      flags_active: '{{count}} flags active',
      risk_level: 'Risk Level',
      referral_recommended: 'Referral Recommended',
      referral_to: 'Refer to: {{facility}}',

      // Actions
      next: 'Next',
      back: 'Back',
      save_record: 'Save Record',
      saving: 'Saving...',
      saved: 'Record Saved!',
      required: 'Required',

      // Sync
      online: 'Online — syncing records...',
      offline: 'Offline — data saved locally',
      syncing: 'Syncing {{count}} records...',
      sync_complete: '{{synced}} records synced',
      sync_failed: '{{failed}} records failed to sync',

      // Risk Labels
      risk_low: 'Low Risk',
      risk_moderate: 'Moderate Risk',
      risk_high: 'High Risk',
      risk_critical: 'Critical Risk',
    }
  },
  hi: {
    translation: {
      app_name: 'मातृ स्वास्थ्य',
      app_subtitle: 'ANC डेटा प्रविष्टि',

      login_title: 'स्वागत है',
      login_subtitle: 'अपने पंजीकृत मोबाइल नंबर से साइन इन करें',
      phone_label: 'मोबाइल नंबर',
      phone_placeholder: '+91 98765 43210',
      send_otp: 'OTP भेजें',
      otp_sent: '{{phone}} पर OTP भेजा गया',
      otp_label: 'OTP दर्ज करें',
      otp_hint: 'आपके फोन पर भेजा गया 6 अंकों का कोड दर्ज करें',
      verify_otp: 'सत्यापित करें और लॉगिन करें',
      resend_otp: 'OTP पुनः भेजें',
      mock_hint: 'डेवलपमेंट OTP: 123456',

      nav_home: 'होम',
      nav_new: 'नया ANC',
      nav_records: 'रिकॉर्ड',
      nav_sync: 'सिंक',

      dashboard_greeting: 'नमस्ते {{name}}',
      dashboard_role: '{{role}} कार्यकर्ता',
      pending_sync: '{{count}} रिकॉर्ड सिंक के लिए लंबित',
      sync_now: 'अभी सिंक करें',
      total_beneficiaries: 'लाभार्थी',
      todays_visits: 'आज की विजिट',
      high_risk: 'उच्च जोखिम',
      synced_today: 'आज सिंक हुए',
      recent_records: 'हालिया रिकॉर्ड',
      no_records: 'कोई रिकॉर्ड नहीं। नई ANC विजिट जोड़ें।',
      add_new_anc: 'नई ANC विजिट जोड़ें',

      step_beneficiary: 'लाभार्थी',
      step_vitals: 'जांच',
      step_labs: 'परीक्षण',
      step_nutrition: 'पोषण',
      step_flags: 'जोखिम',
      anc_form_title: 'नया ANC रिकॉर्ड',

      systolic_bp: 'सिस्टोलिक BP (mmHg)',
      diastolic_bp: 'डायस्टोलिक BP (mmHg)',
      weight_kg: 'वजन (kg)',
      hemoglobin: 'हीमोग्लोबिन (g/dL)',
      oedema_present: 'सूजन मौजूद',

      next: 'आगे',
      back: 'पीछे',
      save_record: 'रिकॉर्ड सहेजें',
      saving: 'सहेजा जा रहा है...',
      saved: 'रिकॉर्ड सहेजा गया!',
      required: 'आवश्यक',

      online: 'ऑनलाइन — रिकॉर्ड सिंक हो रहे हैं...',
      offline: 'ऑफलाइन — डेटा स्थानीय रूप से सहेजा गया',

      risk_low: 'कम जोखिम',
      risk_moderate: 'मध्यम जोखिम',
      risk_high: 'उच्च जोखिम',
      risk_critical: 'अत्यधिक जोखिम',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
