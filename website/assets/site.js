// 공통 메뉴/푸터 주입 — 메뉴를 바꾸려면 PAGES만 수정하세요.
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
 shop:'<path d="M4 8h16l-1 12H5zM8 8a4 4 0 0 1 8 0"/><path d="M12 12c-2 1-2 3 0 5 2-2 2-4 0-5z"/>'
};
const PAGES=[
 ['about.html','회사소개','about','우리가 누구이며 어떤 가치로 일하는지'],
 ['maternity.html','산모신생아 건강관리사','mom','산후 회복과 신생아 돌봄을 함께합니다'],
 ['infant.html','영유아 관리사','baby','영유아 성장 단계에 맞춘 안전한 돌봄'],
 ['housekeeping.html','가사관리','home','깔끔하고 믿을 수 있는 가사 서비스'],
 ['organize.html','정리수납','organize','공간을 정돈해 일상을 가볍게'],
 ['growth-note.html','성장노트','note','불편과 의견을 해결하고, 개선으로 키워가는 공간'],
 ['match.html','번개매칭','bolt','급할 때 가장 빠르게 연결해 드립니다'],
 ['academy.html','평생교육원','school','돌봄 전문가를 위한 교육과 자격 과정'],
 ['branch.html','지사모집','branch','함께 따사로운을 키워갈 지사장님을 모십니다'],
 ['shop.html','따사마켓','shop','친환경 육아용품 · 세제용품']
];
const svg=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${I[k]}</svg>`;
const cur=location.pathname.split('/').pop()||'index.html';
const CARE=['maternity.html','infant.html','housekeeping.html','organize.html'];
const link=p=>`<a href="${p[0]}" class="${cur===p[0]?'on':''}">${p[1]}</a>`;
const care=PAGES.filter(p=>CARE.includes(p[0])),rest=PAGES.filter(p=>!CARE.includes(p[0]));
const byName=n=>PAGES.find(p=>p[0]===n);
const topNav=['about.html'].map(byName).map(link).join('')+
 `<div class="dd"><a href="#" class="${CARE.includes(cur)?'on':''}">돌봄 서비스 ▾</a><div class="ddm">${care.map(link).join('')}</div></div>`+
 ['growth-note.html','match.html','academy.html','shop.html','branch.html'].map(byName).map(link).join('');
document.body.insertAdjacentHTML('afterbegin',`<header class="site"><div class="wrap">
 <a class="logo" href="index.html">따사로운</a><nav class="main">${topNav}</nav></div></header>`);
document.body.insertAdjacentHTML('beforeend',`<footer class="site"><div class="wrap"><b>따사로운 통합서비스</b> 사업자등록번호: (입력) · 대표: (입력)<br><b>따사로운 평생교육원</b> 사업자등록번호: (입력) · 대표: (입력)<br>주소: (입력) · 전화: (입력) · 이메일: (입력)<br>www.ttasaroun.co.kr<br>© 2026 All rights reserved.</div></footer>`);
const card=p=>`<a class="card" href="${p[0]}"><i>${svg(p[2])}</i><h3>${p[1]}</h3><p>${p[3]}</p></a>`;
const g1=document.getElementById('care-cards');if(g1)g1.innerHTML=care.map(card).join('');
const g2=document.getElementById('more-cards');if(g2)g2.innerHTML=rest.map(card).join('');
const ph=document.getElementById('pagehead');
if(ph){const p=PAGES.find(x=>x[0]===cur);if(p)ph.innerHTML=`<div class="wrap"><h1>${svg(p[2])}${p[1]}</h1><p>${p[3]}</p></div>`}
