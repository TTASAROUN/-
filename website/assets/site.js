// 공통 메뉴/푸터 주입 — 메뉴를 바꾸려면 PAGES만 수정하세요.
// 국기는 인터넷 연결 없이도 보이도록 내장 SVG를 사용합니다
const FLAGS={
 kr:'<rect width="30" height="20" fill="#fff"/><g transform="rotate(-33.69 15 10)"><path d="M8.8 10a6.2 6.2 0 0 1 12.4 0z" fill="#cd2e3a"/><path d="M21.2 10a6.2 6.2 0 0 1-12.4 0z" fill="#0047a0"/><circle cx="11.9" cy="10" r="3.1" fill="#0047a0"/><circle cx="18.1" cy="10" r="3.1" fill="#cd2e3a"/></g>',
 us:'<rect width="38" height="20" fill="#fff"/><rect y="0.00" width="38" height="1.54" fill="#b22234"/><rect y="3.08" width="38" height="1.54" fill="#b22234"/><rect y="6.15" width="38" height="1.54" fill="#b22234"/><rect y="9.23" width="38" height="1.54" fill="#b22234"/><rect y="12.31" width="38" height="1.54" fill="#b22234"/><rect y="15.38" width="38" height="1.54" fill="#b22234"/><rect y="18.46" width="38" height="1.54" fill="#b22234"/><rect width="15.200000000000001" height="10.77" fill="#3c3b6e"/><g fill="#fff"><polygon points="1.27,0.46 1.40,0.89 1.85,0.89 1.49,1.15 1.63,1.58 1.27,1.31 0.90,1.58 1.04,1.15 0.68,0.89 1.13,0.89"/><polygon points="3.80,0.46 3.94,0.89 4.39,0.89 4.02,1.15 4.16,1.58 3.80,1.31 3.44,1.58 3.58,1.15 3.21,0.89 3.66,0.89"/><polygon points="6.33,0.46 6.47,0.89 6.92,0.89 6.56,1.15 6.70,1.58 6.33,1.31 5.97,1.58 6.11,1.15 5.75,0.89 6.20,0.89"/><polygon points="8.87,0.46 9.00,0.89 9.45,0.89 9.09,1.15 9.23,1.58 8.87,1.31 8.50,1.58 8.64,1.15 8.28,0.89 8.73,0.89"/><polygon points="11.40,0.46 11.54,0.89 11.99,0.89 11.62,1.15 11.76,1.58 11.40,1.31 11.04,1.58 11.18,1.15 10.81,0.89 11.26,0.89"/><polygon points="13.93,0.46 14.07,0.89 14.52,0.89 14.16,1.15 14.30,1.58 13.93,1.31 13.57,1.58 13.71,1.15 13.35,0.89 13.80,0.89"/><polygon points="2.53,1.54 2.67,1.96 3.12,1.96 2.76,2.23 2.90,2.65 2.53,2.39 2.17,2.65 2.31,2.23 1.95,1.96 2.40,1.96"/><polygon points="5.07,1.54 5.20,1.96 5.65,1.96 5.29,2.23 5.43,2.65 5.07,2.39 4.70,2.65 4.84,2.23 4.48,1.96 4.93,1.96"/><polygon points="7.60,1.54 7.74,1.96 8.19,1.96 7.82,2.23 7.96,2.65 7.60,2.39 7.24,2.65 7.38,2.23 7.01,1.96 7.46,1.96"/><polygon points="10.13,1.54 10.27,1.96 10.72,1.96 10.36,2.23 10.50,2.65 10.13,2.39 9.77,2.65 9.91,2.23 9.55,1.96 10.00,1.96"/><polygon points="12.67,1.54 12.80,1.96 13.25,1.96 12.89,2.23 13.03,2.65 12.67,2.39 12.30,2.65 12.44,2.23 12.08,1.96 12.53,1.96"/><polygon points="1.27,2.61 1.40,3.04 1.85,3.04 1.49,3.30 1.63,3.73 1.27,3.47 0.90,3.73 1.04,3.30 0.68,3.04 1.13,3.04"/><polygon points="3.80,2.61 3.94,3.04 4.39,3.04 4.02,3.30 4.16,3.73 3.80,3.47 3.44,3.73 3.58,3.30 3.21,3.04 3.66,3.04"/><polygon points="6.33,2.61 6.47,3.04 6.92,3.04 6.56,3.30 6.70,3.73 6.33,3.47 5.97,3.73 6.11,3.30 5.75,3.04 6.20,3.04"/><polygon points="8.87,2.61 9.00,3.04 9.45,3.04 9.09,3.30 9.23,3.73 8.87,3.47 8.50,3.73 8.64,3.30 8.28,3.04 8.73,3.04"/><polygon points="11.40,2.61 11.54,3.04 11.99,3.04 11.62,3.30 11.76,3.73 11.40,3.47 11.04,3.73 11.18,3.30 10.81,3.04 11.26,3.04"/><polygon points="13.93,2.61 14.07,3.04 14.52,3.04 14.16,3.30 14.30,3.73 13.93,3.47 13.57,3.73 13.71,3.30 13.35,3.04 13.80,3.04"/><polygon points="2.53,3.69 2.67,4.12 3.12,4.12 2.76,4.38 2.90,4.81 2.53,4.54 2.17,4.81 2.31,4.38 1.95,4.12 2.40,4.12"/><polygon points="5.07,3.69 5.20,4.12 5.65,4.12 5.29,4.38 5.43,4.81 5.07,4.54 4.70,4.81 4.84,4.38 4.48,4.12 4.93,4.12"/><polygon points="7.60,3.69 7.74,4.12 8.19,4.12 7.82,4.38 7.96,4.81 7.60,4.54 7.24,4.81 7.38,4.38 7.01,4.12 7.46,4.12"/><polygon points="10.13,3.69 10.27,4.12 10.72,4.12 10.36,4.38 10.50,4.81 10.13,4.54 9.77,4.81 9.91,4.38 9.55,4.12 10.00,4.12"/><polygon points="12.67,3.69 12.80,4.12 13.25,4.12 12.89,4.38 13.03,4.81 12.67,4.54 12.30,4.81 12.44,4.38 12.08,4.12 12.53,4.12"/><polygon points="1.27,4.77 1.40,5.19 1.85,5.19 1.49,5.46 1.63,5.88 1.27,5.62 0.90,5.88 1.04,5.46 0.68,5.19 1.13,5.19"/><polygon points="3.80,4.77 3.94,5.19 4.39,5.19 4.02,5.46 4.16,5.88 3.80,5.62 3.44,5.88 3.58,5.46 3.21,5.19 3.66,5.19"/><polygon points="6.33,4.77 6.47,5.19 6.92,5.19 6.56,5.46 6.70,5.88 6.33,5.62 5.97,5.88 6.11,5.46 5.75,5.19 6.20,5.19"/><polygon points="8.87,4.77 9.00,5.19 9.45,5.19 9.09,5.46 9.23,5.88 8.87,5.62 8.50,5.88 8.64,5.46 8.28,5.19 8.73,5.19"/><polygon points="11.40,4.77 11.54,5.19 11.99,5.19 11.62,5.46 11.76,5.88 11.40,5.62 11.04,5.88 11.18,5.46 10.81,5.19 11.26,5.19"/><polygon points="13.93,4.77 14.07,5.19 14.52,5.19 14.16,5.46 14.30,5.88 13.93,5.62 13.57,5.88 13.71,5.46 13.35,5.19 13.80,5.19"/><polygon points="2.53,5.85 2.67,6.27 3.12,6.27 2.76,6.53 2.90,6.96 2.53,6.70 2.17,6.96 2.31,6.53 1.95,6.27 2.40,6.27"/><polygon points="5.07,5.85 5.20,6.27 5.65,6.27 5.29,6.53 5.43,6.96 5.07,6.70 4.70,6.96 4.84,6.53 4.48,6.27 4.93,6.27"/><polygon points="7.60,5.85 7.74,6.27 8.19,6.27 7.82,6.53 7.96,6.96 7.60,6.70 7.24,6.96 7.38,6.53 7.01,6.27 7.46,6.27"/><polygon points="10.13,5.85 10.27,6.27 10.72,6.27 10.36,6.53 10.50,6.96 10.13,6.70 9.77,6.96 9.91,6.53 9.55,6.27 10.00,6.27"/><polygon points="12.67,5.85 12.80,6.27 13.25,6.27 12.89,6.53 13.03,6.96 12.67,6.70 12.30,6.96 12.44,6.53 12.08,6.27 12.53,6.27"/><polygon points="1.27,6.92 1.40,7.35 1.85,7.35 1.49,7.61 1.63,8.04 1.27,7.77 0.90,8.04 1.04,7.61 0.68,7.35 1.13,7.35"/><polygon points="3.80,6.92 3.94,7.35 4.39,7.35 4.02,7.61 4.16,8.04 3.80,7.77 3.44,8.04 3.58,7.61 3.21,7.35 3.66,7.35"/><polygon points="6.33,6.92 6.47,7.35 6.92,7.35 6.56,7.61 6.70,8.04 6.33,7.77 5.97,8.04 6.11,7.61 5.75,7.35 6.20,7.35"/><polygon points="8.87,6.92 9.00,7.35 9.45,7.35 9.09,7.61 9.23,8.04 8.87,7.77 8.50,8.04 8.64,7.61 8.28,7.35 8.73,7.35"/><polygon points="11.40,6.92 11.54,7.35 11.99,7.35 11.62,7.61 11.76,8.04 11.40,7.77 11.04,8.04 11.18,7.61 10.81,7.35 11.26,7.35"/><polygon points="13.93,6.92 14.07,7.35 14.52,7.35 14.16,7.61 14.30,8.04 13.93,7.77 13.57,8.04 13.71,7.61 13.35,7.35 13.80,7.35"/><polygon points="2.53,8.00 2.67,8.43 3.12,8.43 2.76,8.69 2.90,9.11 2.53,8.85 2.17,9.11 2.31,8.69 1.95,8.43 2.40,8.43"/><polygon points="5.07,8.00 5.20,8.43 5.65,8.43 5.29,8.69 5.43,9.11 5.07,8.85 4.70,9.11 4.84,8.69 4.48,8.43 4.93,8.43"/><polygon points="7.60,8.00 7.74,8.43 8.19,8.43 7.82,8.69 7.96,9.11 7.60,8.85 7.24,9.11 7.38,8.69 7.01,8.43 7.46,8.43"/><polygon points="10.13,8.00 10.27,8.43 10.72,8.43 10.36,8.69 10.50,9.11 10.13,8.85 9.77,9.11 9.91,8.69 9.55,8.43 10.00,8.43"/><polygon points="12.67,8.00 12.80,8.43 13.25,8.43 12.89,8.69 13.03,9.11 12.67,8.85 12.30,9.11 12.44,8.69 12.08,8.43 12.53,8.43"/><polygon points="1.27,9.08 1.40,9.50 1.85,9.50 1.49,9.77 1.63,10.19 1.27,9.93 0.90,10.19 1.04,9.77 0.68,9.50 1.13,9.50"/><polygon points="3.80,9.08 3.94,9.50 4.39,9.50 4.02,9.77 4.16,10.19 3.80,9.93 3.44,10.19 3.58,9.77 3.21,9.50 3.66,9.50"/><polygon points="6.33,9.08 6.47,9.50 6.92,9.50 6.56,9.77 6.70,10.19 6.33,9.93 5.97,10.19 6.11,9.77 5.75,9.50 6.20,9.50"/><polygon points="8.87,9.08 9.00,9.50 9.45,9.50 9.09,9.77 9.23,10.19 8.87,9.93 8.50,10.19 8.64,9.77 8.28,9.50 8.73,9.50"/><polygon points="11.40,9.08 11.54,9.50 11.99,9.50 11.62,9.77 11.76,10.19 11.40,9.93 11.04,10.19 11.18,9.77 10.81,9.50 11.26,9.50"/><polygon points="13.93,9.08 14.07,9.50 14.52,9.50 14.16,9.77 14.30,10.19 13.93,9.93 13.57,10.19 13.71,9.77 13.35,9.50 13.80,9.50"/></g>',
 cn:'<rect width="30" height="20" fill="#de2910"/><g fill="#ffde00"><polygon points="5.00,2.00 5.67,4.07 7.85,4.07 6.09,5.35 6.76,7.43 5.00,6.15 3.24,7.43 3.91,5.35 2.15,4.07 4.33,4.07"/><polygon points="9.14,2.51 9.62,1.97 9.25,1.34 9.91,1.63 10.39,1.08 10.33,1.80 11.00,2.09 10.29,2.25 10.22,2.97 9.85,2.35"/><polygon points="11.01,4.14 11.66,3.82 11.56,3.10 12.07,3.62 12.72,3.30 12.38,3.95 12.88,4.47 12.17,4.34 11.83,4.99 11.73,4.27"/><polygon points="11.04,6.73 11.76,6.70 11.96,6.00 12.21,6.68 12.94,6.66 12.37,7.10 12.62,7.79 12.01,7.38 11.44,7.83 11.64,7.13"/><polygon points="9.22,8.38 9.90,8.63 10.35,8.06 10.32,8.79 11.00,9.05 10.30,9.24 10.26,9.96 9.87,9.36 9.16,9.55 9.62,8.98"/></g>',
 vn:'<rect width="30" height="20" fill="#da251d"/><polygon points="15.00,4.50 16.35,8.65 20.71,8.65 17.18,11.21 18.53,15.35 15.00,12.79 11.47,15.35 12.82,11.21 9.29,8.65 13.65,8.65" fill="#ff0"/>',
 ph:'<rect width="30" height="10" fill="#0038a8"/><rect y="10" width="30" height="10" fill="#ce1126"/><path d="M0 0L17.32 10L0 20z" fill="#fff"/><g fill="#fcd116"><circle cx="5.77" cy="10" r="1.5"/><polygon points="7.44,9.66 8.87,10.00 7.44,10.34"/><polygon points="7.19,10.94 7.96,12.19 6.71,11.42"/><polygon points="6.11,11.67 5.77,13.10 5.43,11.67"/><polygon points="4.83,11.42 3.58,12.19 4.35,10.94"/><polygon points="4.10,10.34 2.67,10.00 4.10,9.66"/><polygon points="4.35,9.06 3.58,7.81 4.83,8.58"/><polygon points="5.43,8.33 5.77,6.90 6.11,8.33"/><polygon points="6.71,8.58 7.96,7.81 7.19,9.06"/><polygon points="2.96,3.59 3.49,4.19 4.22,3.87 3.82,4.56 4.35,5.16 3.57,4.98 3.17,5.67 3.09,4.88 2.31,4.71 3.04,4.39"/><polygon points="2.96,16.41 3.04,15.61 2.31,15.29 3.09,15.12 3.17,14.33 3.57,15.02 4.35,14.84 3.82,15.44 4.22,16.13 3.49,15.81"/><polygon points="14.30,10.00 13.54,10.25 13.54,11.05 13.07,10.40 12.31,10.65 12.78,10.00 12.31,9.35 13.07,9.60 13.54,8.95 13.54,9.75"/></g>',
 fr:'<rect width="10" height="20" fill="#0055a4"/><rect x="10" width="10" height="20" fill="#fff"/><rect x="20" width="10" height="20" fill="#ef4135"/>',
 th:'<rect width="30" height="20" fill="#a51931"/><rect y="3.33" width="30" height="13.34" fill="#f4f5f8"/><rect y="6.67" width="30" height="6.66" fill="#2d2a4a"/>'
};
// [구글언어코드, 표시이름, 국기코드]
const LANGS=[['ko','한국어','kr'],['en','English','us'],['zh-CN','中文','cn'],['vi','Tiếng Việt','vn'],['tl','Filipino','ph'],['th','ไทย','th'],['fr','Français','fr']];
const FLAGX={kr:5,us:0,cn:0,vn:5,ph:0,th:5,fr:5}; // 동그랗게 보일 때 보여 줄 영역(왼쪽 기준 위치)
const flagSrc=c=>'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FLAGX[c]||0} 0 20 20">${FLAGS[c]}</svg>`);
const flag=c=>`<img class="flag" src="${flagSrc(c)}" alt="" width="26" height="26">`;
const I={
 about:'<path d="M5 21V4h9v17M14 9h5v12M3 21h18M8 8h2M8 12h2M8 16h2"/>',
 mom:'<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>',
 baby:'<circle cx="12" cy="9" r="5"/><path d="M9.5 9h.01M14.5 9h.01M10 11.5q2 1.5 4 0M5 21c1-4 4-5 7-5s6 1 7 5"/>',
 home:'<path d="M4 11l8-7 8 7v9H4zM9 20v-6h6v6"/><path d="M3 12l9-8 9 8" opacity=".0"/>',
 organize:'<path d="M4 4h16v6H4zM4 14h16v6H4zM10 7h4M10 17h4"/>',
 note:'<path d="M5 3h11l3 3v15H5zM9 9h6M9 13h6M9 17h3"/><path d="M15 3v4h4"/>',
 bolt:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
 school:'<path d="M3 10l9-6 9 6M5 10v10M19 10v10M9 20v-6h6v6M3 20h18"/><path d="M12 4V2l3 1-3 1M12 8.5h.01"/>',
 branch:'<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
 couple:'<circle cx="8" cy="8" r="3"/><circle cx="16.5" cy="9" r="2.5"/><path d="M2.5 20c.5-4 3-6 5.5-6s5 2 5.5 6M14.5 14.5c2.5-.5 5.5 1 6 5.5"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
 video:'<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/><path d="M9.5 14.5c-1.4-1-1.8-2.6-.8-3.3.7-.5 1.4 0 1.8.7.4-.7 1.1-1.2 1.8-.7 1-.1.6 2.3-2.8 3.3z"/>',
 go:'<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
 play:'<circle cx="8" cy="8" r="3"/><rect x="13" y="13" width="7" height="7" rx="1"/><path d="M4 20l4-6 4 6z"/>',
 eat:'<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 5h-2M8 3v3M12 3v3"/>',
 buy:'<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
 wear:'<path d="M8 4l-5 4 3 3 2-1v10h8V10l2 1 3-3-5-4a4 4 0 0 1-8 0z"/>',
 give:'<rect x="3" y="9" width="18" height="4" rx="1"/><path d="M5 13v7h14v-7M12 9v11M12 9c-3 0-4-4-1.5-4S12 9 12 9zm0 0c3 0 4-4 1.5-4S12 9 12 9z"/>',
 get:'<path d="M4 14l3-8h10l3 8v5H4z"/><path d="M4 14h5l1 2h4l1-2h5"/>',
 talk:'<path d="M4 5h16v11H11l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>',
 heartic:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M9 11l2 2 4-4" opacity=".0"/>',
 ask:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
 tip:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8l1.5 1.5L13 7M9 13l1.5 1.5L13 12M9 18h6"/>',
 shop:'<path d="M4 8h16l-1 12H5zM8 8a4 4 0 0 1 8 0"/><path d="M12 12c-2 1-2 3 0 5 2-2 2-4 0-5z"/>'
};
const PAGES=[
 ['about.html','회사소개','about','우리가 누구이며 어떤 가치로 일하는지'],
 ['maternity.html','산모·신생아','mom','산후 회복과 신생아 돌봄을 함께합니다'],
 ['infant.html','영유아','baby','영유아 성장 단계에 맞춘 안전한 돌봄'],
 ['housekeeping.html','가사관리','home','깔끔하고 믿을 수 있는 가사 서비스'],
 ['organize.html','정리수납','organize','공간을 정돈해 일상을 가볍게'],
 ['class.html','응애맘빠','couple','출산을 준비하는 예비부부만을 위한 우리 가족 준비 교실'],
 ['letter.html','영상편지','video','아기가 태어나기 전, 엄마 아빠가 남기는 영상편지를 함께 보고 응원해요'],
 ['growth-note.html','열린 의견함','note','불편과 의견을 해결하고, 개선으로 키워가는 공간'],
 ['match.html','번개매칭','bolt','급할 때 가장 빠르게 연결해 드립니다'],
 ['branch.html','지사모집','branch','함께 따사로운을 키워갈 지사장님을 모십니다'],
 ['community.html','따사마을','chat','산모와 엄마들이 함께 나누는 이야기'],
 ['mam.html','따사맘','heartic','관리사님들이 들려주는 제안 · 우리 아기 이야기 · 서비스 소감'],
 ['shop.html','따사마켓','shop','친환경 육아용품 · 세제용품'],
 ['academy.html','평생교육원','school','돌봄 전문가를 위한 교육과 자격 과정']
];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const cur=location.pathname.split('/').pop()||'index.html';
const CARE=['maternity.html','infant.html','housekeeping.html','organize.html'];
const navLabel=p=>p[4]||p[1];
const link=p=>`<a href="${p[0]}" class="${cur===p[0]?'on':''}">${navLabel(p)}</a>`;
const care=PAGES.filter(p=>CARE.includes(p[0])),rest=PAGES.filter(p=>!CARE.includes(p[0])&&p[0]!=='about.html');
const byName=n=>PAGES.find(p=>p[0]===n);
const ddGroup=(label,list)=>`<div class="dd"><a href="#" class="${list.includes(cur)?'on':''}">${label}</a><div class="ddm">${list.map(byName).map(link).join('')}</div></div>`;
const one=n=>link(byName(n));
const topNav=one('about.html')+ddGroup('돌봄 서비스',CARE)+ddGroup('응애맘빠',['class.html','letter.html'])+['match.html','growth-note.html','branch.html'].map(one).join('')+ddGroup('따사로운 이야기',['community.html','mam.html','shop.html'])+one('academy.html');
document.body.insertAdjacentHTML('afterbegin',`<header class="site"><div class="wrap">
 <a class="logo notranslate" href="index.html">따사로운</a><nav class="main">${topNav}</nav><div class="langbox notranslate"><button id="lang-btn" type="button" aria-label="Language">${flag("kr")}</button><div id="lang-menu">${LANGS.map(l=>`<button type="button" data-l="${l[0]}">${flag(l[2])}${l[1]}</button>`).join('')}</div></div><button id="nav-burger" type="button" aria-label="메뉴" aria-expanded="false"><i></i><i></i><i></i></button></div></header><div id="gt"></div>`);
(function(){const h=document.querySelector('header.site'),b=document.getElementById('nav-burger');if(!b)return;b.addEventListener('click',()=>{const o=h.classList.toggle('nav-open');b.setAttribute('aria-expanded',o)});h.querySelectorAll('nav.main a[href]').forEach(a=>{if(!a.parentElement.classList.contains('dd')||a.closest('.ddm'))a.addEventListener('click',()=>h.classList.remove('nav-open'))})})();
document.body.insertAdjacentHTML('beforeend',`<footer class="site"><div class="wrap"><b>따사로운 통합서비스</b> 사업자등록번호: (입력) · 대표: (입력)<br><b>따사로운 평생교육원</b> 사업자등록번호: (입력) · 대표: (입력)<br>주소: (입력) · 전화: (입력) · 이메일: (입력)<br>www.ttassaroun.co.kr<br>© 2026 All rights reserved.</div></footer>`);
const card=p=>`<a class="card" href="${p[0]}"><i>${svg(p[2])}</i><h3>${p[1]}</h3><p>${p[3]}</p></a>`;
const g1=document.getElementById('care-cards');if(g1)g1.innerHTML=care.map(card).join('');
const g2=document.getElementById('more-cards');if(g2)g2.innerHTML=rest.map(card).join('');
const ph=document.getElementById('pagehead');
if(ph){const p=PAGES.find(x=>x[0]===cur);if(p)ph.innerHTML=`<div class="wrap"><h1>${svg(p[2])}${p[1]}</h1><p>${p[3]}</p></div>`}

// ── 다국어(자동번역) ─────────────────────────────
// 언어를 추가하려면 LANGS에 [구글언어코드, 표시이름]만 넣으면 됩니다. (코드 목록: cloud.google.com/translate/docs/languages)
// 구글 번역 위젯을 사용하므로 페이지 내용을 수정해도 번역이 자동 반영됩니다. (기계번역 — 계약서·안내문 등 중요 문서는 별도 감수 필요)
// 1) 사이트에 넣어 둔 번역표로 바로 번역 (assets/i18n.js)  2) 번역표에 없는 문구는 구글 번역이 이어서 번역 (실제 사이트에서만 동작)
function googleLang(code,n){
 const c=document.querySelector('.goog-te-combo');
 if(!c){if((n||0)<10)setTimeout(()=>googleLang(code,(n||0)+1),400);return}
 c.value=code==='ko'?'':code;c.dispatchEvent(new Event('change'));
}
(function(){
 const btn=document.getElementById('lang-btn'),menu=document.getElementById('lang-menu');if(!btn)return;
 const show=c=>{const l=LANGS.find(x=>x[0]===c)||LANGS[0];btn.firstElementChild.src=flagSrc(l[2])};
 const sc0=document.createElement('script');sc0.src='assets/i18n.js';
 sc0.onload=()=>{const sv=window.TtasaI18n.saved();if(sv!=='ko'){show(sv);window.TtasaI18n.apply(sv);setTimeout(()=>googleLang(sv),600)}};
 document.head.appendChild(sc0);
 btn.onclick=e=>{e.stopPropagation();menu.classList.toggle('open')};
 document.addEventListener('click',()=>menu.classList.remove('open'));
 menu.querySelectorAll('button').forEach(b=>b.onclick=()=>{
  const c=b.dataset.l;
  if(c==='ko')try{document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'}catch(e){}
  show(c);menu.classList.remove('open');
  if(window.TtasaI18n)window.TtasaI18n.apply(c);
  googleLang(c);
 });
 window.googleTranslateElementInit=()=>new google.translate.TranslateElement({pageLanguage:'ko',includedLanguages:LANGS.map(l=>l[0]).filter(c=>c!=='ko').join(','),autoDisplay:false},'gt');
 const sc=document.createElement('script');sc.src='https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';document.head.appendChild(sc);
})();

// 폼/피드가 있는 페이지에서만 설정과 폼 스크립트를 불러옵니다
if(document.querySelector('[data-form],[data-feed],[data-match],[data-share],[data-community],[data-letter]')){
 const ld=src=>new Promise(r=>{const e=document.createElement('script');e.src=src;e.onload=r;document.head.appendChild(e)});
 ld('assets/config.js').then(()=>ld('assets/forms.js')).then(()=>{
  if(document.querySelector('[data-share],[data-community]'))ld('assets/share.js').then(()=>{if(document.querySelector('[data-community]'))ld('assets/community.js')});
  if(document.querySelector('[data-letter]'))ld('assets/letter.js');
  if(document.querySelector('[data-match]'))ld('assets/holidays.js').then(()=>ld('assets/match-core.js')).then(()=>ld('assets/sample-caregivers.js')).then(()=>ld('assets/match.js'));
 });
}

// 상단 하위 메뉴(돌봄 서비스·응애맘빠): 마우스를 올리거나(PC) 눌러서(모바일 포함) 펼칩니다
(function(){
 const all=[...document.querySelectorAll('.dd')];
 all.forEach(dd=>dd.querySelector(':scope > a').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const o=dd.classList.contains('open');all.forEach(x=>x.classList.remove('open'));if(!o){const r=dd.getBoundingClientRect();dd.querySelector('.ddm').style.setProperty('--ddtop',(document.querySelector('header.site').getBoundingClientRect().bottom+4)+'px');dd.classList.add('open')}}));
 document.addEventListener('click',()=>all.forEach(x=>x.classList.remove('open')));
})();

// 마우스 커서: 작은 원 하나. 누를 수 있는 곳에서는 조금 커져요. (마우스가 없는 기기에서는 적용 안 됨)
(function(){
 if(!window.matchMedia||!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const st=document.createElement('style');
 st.textContent=`html.cur,html.cur *{cursor:none!important}html.cur input:not([type=checkbox]):not([type=radio]),html.cur textarea{cursor:text!important}
.cur-ring{position:fixed;left:0;top:0;z-index:99999;pointer-events:none;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:50%;background:radial-gradient(circle at 34% 30%,#ffd2ac 0,#f58a45 38%,#e25f14 66%,#a9440c 100%);box-shadow:0 1px 2px rgba(90,35,0,.45),0 3px 6px rgba(226,95,20,.28);opacity:0;transition:opacity .2s,width .18s,height .18s,margin .18s}
.cur-ring.on{width:16px;height:16px;margin:-8px 0 0 -8px}
.cur-ring.dn{width:7px;height:7px;margin:-3.5px 0 0 -3.5px}
html.cur-in .cur-ring{opacity:1}`;
 document.head.appendChild(st);
 const ring=document.createElement('div');ring.className='cur-ring';document.body.append(ring);document.documentElement.classList.add('cur');
 let x=-100,y=-100,rx=x,ry=y;
 const SEL='a,button,[role=button],label,select,summary,.btn,.chip,input[type=checkbox],input[type=radio],.cal-d,.ddb';
 document.addEventListener('mousemove',e=>{x=e.clientX;y=e.clientY;document.documentElement.classList.add('cur-in');
  ring.classList.toggle('on',!!(e.target.closest&&e.target.closest(SEL)));if(reduce)ring.style.transform=`translate(${x}px,${y}px)`},{passive:true});
 document.addEventListener('mouseleave',()=>document.documentElement.classList.remove('cur-in'));
 document.addEventListener('mousedown',()=>ring.classList.add('dn'));document.addEventListener('mouseup',()=>ring.classList.remove('dn'));
 if(!reduce)(function f(){rx+=(x-rx)*.35;ry+=(y-ry)*.35;ring.style.transform=`translate(${rx}px,${ry}px)`;requestAnimationFrame(f)})();
})();
