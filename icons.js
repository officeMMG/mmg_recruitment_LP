/* ===== アイコンレジストリ =====
   microCMSには svg を保存せず iconKey（文字列）だけを持たせ、
   実際のSVGはこの固定セットから引く。
   kanri側（kanri/icons.js）と同一内容に保つこと。 */
const ICONS = {
  // 事業内容
  measure: `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <line x1="18" y1="18" x2="6"  y2="33" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <line x1="18" y1="18" x2="18" y2="33" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <line x1="18" y1="18" x2="30" y2="33" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <rect x="10" y="10" width="16" height="9" rx="2" fill="white" opacity="0.15" stroke="white" stroke-width="1.5"/>
    <line x1="10" y1="14.5" x2="26" y2="14.5" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
    <circle cx="18" cy="14.5" r="2.5" stroke="#38bdf8" stroke-width="1.5" fill="none"/>
    <circle cx="18" cy="7" r="2" fill="#38bdf8" opacity="0.9"/>
    <line x1="18" y1="9" x2="18" y2="11" stroke="white" stroke-width="1.2" stroke-linecap="round"/>
  </svg>`,
  design: `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="5" y="5" width="26" height="26" rx="3" fill="white" opacity="0.1" stroke="white" stroke-width="1.5"/>
    <line x1="5"  y1="13" x2="31" y2="13" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="2 2"/>
    <line x1="5"  y1="21" x2="31" y2="21" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="2 2"/>
    <line x1="13" y1="5"  x2="13" y2="31" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="2 2"/>
    <line x1="21" y1="5"  x2="21" y2="31" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="2 2"/>
    <line x1="18" y1="9" x2="13" y2="27" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="18" y1="9" x2="23" y2="27" stroke="white" stroke-width="2" stroke-linecap="round"/>
    <line x1="14.5" y1="20" x2="21.5" y2="20" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="18" cy="9" r="2" fill="#38bdf8"/>
  </svg>`,
  research: `<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="15" cy="15" r="8" stroke="white" stroke-width="2" fill="white" fill-opacity="0.1"/>
    <line x1="21" y1="21" x2="30" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M9 15 Q11 12 13 15 Q15 18 17 15 Q19 12 21 15" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" fill="none" clip-path="url(#lens)"/>
    <defs><clipPath id="lens"><circle cx="15" cy="15" r="7"/></clipPath></defs>
    <circle cx="15" cy="15" r="8" stroke="#38bdf8" stroke-width="0.8" stroke-dasharray="3 3" fill="none" opacity="0.6"/>
  </svg>`,

  // 募集職種
  entry: `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <rect x="4" y="16" width="36" height="12" rx="3" stroke="#0c1a2e" stroke-width="2"/>
    <line x1="10" y1="16" x2="10" y2="22" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="16" y1="16" x2="16" y2="20" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="22" y1="16" x2="22" y2="22" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="28" y1="16" x2="28" y2="20" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="34" y1="16" x2="34" y2="22" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`,
  experienced: `<svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
    <path d="M6 38L38 38L38 6Z" stroke="#0c1a2e" stroke-width="2" stroke-linejoin="round"/>
    <polyline points="38,30 38,38 30,38" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 6L28 16" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="3 2"/>
    <polyline points="32,38 32,32 38,32" stroke="#38bdf8" stroke-width="1.4" fill="none"/>
  </svg>`,

  // 待遇・福利厚生
  schedule: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <rect x="3" y="5" width="24" height="22" rx="3" stroke="white" stroke-width="1.8"/>
    <line x1="3" y1="12" x2="27" y2="12" stroke="white" stroke-width="1.8"/>
    <line x1="9" y1="3" x2="9" y2="8" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <line x1="21" y1="3" x2="21" y2="8" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 19l2 2 4-4" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 19l2 2 4-4" stroke="#38bdf8" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  insurance: `<svg width="26" height="30" viewBox="0 0 26 30" fill="none" aria-hidden="true">
    <path d="M13 2L24 7v9c0 7-5 12-11 13C6 28 1 23 1 16V7Z" stroke="white" stroke-width="1.8" fill="none"/>
    <path d="M7 15l4 4 8-8" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  certification: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <rect x="2" y="3" width="20" height="24" rx="2" stroke="white" stroke-width="1.8"/>
    <line x1="6" y1="10" x2="18" y2="10" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="6" y1="15" x2="18" y2="15" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
    <line x1="6" y1="20" x2="13" y2="20" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
    <circle cx="24" cy="23" r="5.5" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
    <path d="M21.5 23l2 2 3.5-3" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  transport: `<svg width="32" height="22" viewBox="0 0 32 22" fill="none" aria-hidden="true">
    <path d="M4 13L8 5h16l4 8H4Z" stroke="white" stroke-width="1.8" stroke-linejoin="round"/>
    <rect x="2" y="13" width="28" height="7" rx="2" stroke="white" stroke-width="1.8"/>
    <circle cx="8" cy="20" r="2.5" stroke="#38bdf8" stroke-width="1.8"/>
    <circle cx="24" cy="20" r="2.5" stroke="#38bdf8" stroke-width="1.8"/>
    <line x1="11" y1="5" x2="13" y2="13" stroke="#38bdf8" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
    <line x1="21" y1="5" x2="19" y2="13" stroke="#38bdf8" stroke-width="1" stroke-linecap="round" opacity="0.6"/>
  </svg>`,
  salary: `<svg width="30" height="28" viewBox="0 0 30 28" fill="none" aria-hidden="true">
    <polyline points="2,22 8,14 14,18 22,8 28,4" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <polyline points="22,4 28,4 28,10" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="26" x2="28" y2="26" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/>
    <rect x="3" y="18" width="4" height="8" rx="1" fill="white" fill-opacity="0.18" stroke="white" stroke-width="1"/>
    <rect x="10" y="14" width="4" height="12" rx="1" fill="white" fill-opacity="0.18" stroke="white" stroke-width="1"/>
    <rect x="17" y="9" width="4" height="17" rx="1" fill="white" fill-opacity="0.18" stroke="white" stroke-width="1"/>
  </svg>`,
  training: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
    <circle cx="11" cy="8" r="4" stroke="white" stroke-width="1.8"/>
    <path d="M3 26c0-6 3.5-9 8-9s8 3 8 9" stroke="white" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="24" cy="10" r="5.5" fill="rgba(56,189,248,0.15)" stroke="#38bdf8" stroke-width="1.5"/>
    <line x1="24" y1="7" x2="24" y2="13" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <line x1="21" y1="10" x2="27" y2="10" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};
