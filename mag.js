(function(){
  var reduce=/[?&]motion=off/.test(location.search);
  var rv=document.querySelectorAll('.rv');
  if(reduce||!('IntersectionObserver' in window)){rv.forEach(function(e){e.classList.add('in')})}
  else{var io=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  rv.forEach(function(e){io.observe(e)})}
})();

/* tellers */
(function(){
  var reduce=/[?&]motion=off/.test(location.search);
  var nums=document.querySelectorAll('[data-n]');
  function show(el){var to=parseFloat(el.dataset.n),d=parseInt(el.dataset.d||'0',10);el.textContent=to.toFixed(d)}
  if(reduce||!('IntersectionObserver' in window)){nums.forEach(show)}
  else{
    var io=new IntersectionObserver(function(en){en.forEach(function(x){
      if(!x.isIntersecting)return;io.unobserve(x.target);
      var el=x.target,to=parseFloat(el.dataset.n),d=parseInt(el.dataset.d||'0',10),t0=performance.now(),dur=1500;
      (function f(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=(to*e).toFixed(d);if(k<1)requestAnimationFrame(f)})(t0);
    })},{threshold:.6});
    nums.forEach(function(n){io.observe(n)});
  }
  /* pakket kiezen */
  document.querySelectorAll('[data-pick]').forEach(function(a){a.addEventListener('click',function(){var s=document.getElementById('p');if(s)s.value=a.dataset.pick})});
  /* formulier */
  var form=document.getElementById('form');
  if(form){form.addEventListener('submit',async function(e){
    e.preventDefault();var ok=false,btn=form.querySelector('.send');btn.disabled=true;
    try{var r=await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(new FormData(form)).toString()});ok=r.ok}catch(_){}
    btn.disabled=false;
    var box=form.querySelector('.ok');
    if(ok){form.reset();box.hidden=false}else{box.hidden=false;box.querySelector('b').textContent='Something went wrong.';box.querySelector('p').textContent='Please try again, or email hello@mcreativestudio.be.'}
  })}
})();

/* 3D-ring */
(function(){
  const reduce = /[?&]motion=off/.test(location.search);
  const $ = s => document.querySelector(s);
/* 3D-ring: kaarten draaien om je heen, komen van achteren; sleep, pijlen, klik */
  const stage = $('#stage'), ringEl = $('#ring'), dots = $('#dots'), prev = $('#prev'), next = $('#next');
  const baseCards = [...ringEl.children], BASE = baseCards.length;
  if (!reduce) baseCards.forEach(c => { const k = c.cloneNode(true); k.setAttribute('aria-hidden', 'true'); k.querySelectorAll('a,button').forEach(x => { x.tabIndex = -1; }); if (k.matches('a,button')) k.tabIndex = -1; ringEl.appendChild(k); });
  const cards = [...ringEl.children], N = cards.length, TH = 360 / N;
  cards.forEach((c, i) => { c.style.setProperty('--i', i); c.style.setProperty('--th', TH + 'deg'); if (i < BASE) dots.appendChild(document.createElement('i')); });
  let ang = 0, tween = null, dn = false, sx = 0, sa = 0, moved = false, hov = false, idle = 0, vis = false, last = 0;
  const geo = () => {
    const cw = cards[0].offsetWidth || 380;
    const R = (cw / 2) / Math.tan(Math.PI / N) + cw * .1;
    stage.style.setProperty('--R', R.toFixed(0) + 'px');
  };
  const norm = d => ((d % 360) + 540) % 360 - 180;
  const paint = () => {
    ringEl.style.setProperty('--ang', (-ang).toFixed(2) + 'deg');
    let best = 0, bd = 999;
    cards.forEach((c, i) => {
      const d = Math.abs(norm(i * TH - ang));
      const op = d <= 68 ? 1 : Math.max(0, 1 - (d - 68) / 34);
      c.style.setProperty('--op', (op * (d < 12 ? 1 : Math.max(.35, 1 - d / 110))).toFixed(3)); c.style.scale = (1 - Math.min(d / 100, 1) * .14).toFixed(3);
      c.style.pointerEvents = d < 80 ? 'auto' : 'none';
      c.style.setProperty('--mo', d < 30 ? 1 : .12);
      if (d < bd) { bd = d; best = i; }
    });
    cards.forEach((c, i) => c.classList.toggle('cur', i === best));
    [...dots.children].forEach((d, k) => d.classList.toggle('on', k === best % BASE));
  };
  const goTo = target => {
    const from = ang; const to = from + norm(target - from); const t0 = performance.now(), dur = reduce ? 1 : 750;
    tween = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3); ang = from + (to - from) * e; paint(); if (p >= 1) tween = null; };
  };
  const nearest = () => Math.round(ang / TH) * TH;
  const bump = () => { idle = Date.now() + 3500; };
  prev.onclick = () => { bump(); goTo(nearest() - TH); };
  next.onclick = () => { bump(); goTo(nearest() + TH); };
  let downCase = null;
  stage.addEventListener('pointerdown', e => { downCase = e.target.closest('.case'); dn = true; moved = false; sx = e.clientX; sa = ang; tween = null; stage.classList.add('drag'); bump(); try { stage.setPointerCapture(e.pointerId); } catch (_) {} });
  stage.addEventListener('pointermove', e => { if (!dn) return; const dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; ang = sa - dx * .28; paint(); });
  const up = () => { if (!dn) return; dn = false; stage.classList.remove('drag'); bump(); };
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('pointerleave', () => { hov = false; idle = Date.now() + 500; });
  stage.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' && (e.movementX || e.movementY)) hov = !!e.target.closest('.case'); });
  addEventListener('scroll', () => { hov = false; }, { passive: true });
  stage.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next.click(); if (e.key === 'ArrowLeft') prev.click(); });
  /* klik op een zijkaart draait hem naar voren; klik op de voorste opent het project */
  stage.addEventListener('click', e => {
    if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; return; }
    const c = e.target.closest('.case') || downCase; downCase = null; if (!c) return;
    const i = cards.indexOf(c);
    if (Math.abs(norm(i * TH - ang)) > 25) { e.preventDefault(); e.stopPropagation(); bump(); goTo(i * TH); }
    else if (c.dataset.client !== undefined && window.__openClient) { e.preventDefault(); window.__openClient(+c.dataset.client); }
  }, true);
  new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; }), { threshold: .2 }).observe(stage);
  const spin = t => {
    requestAnimationFrame(spin);
    const dt = last ? Math.min(50, t - last) : 16; last = t;
    if (tween) { tween(t); return; }
    if (reduce || dn || hov || !vis || document.hidden || document.body.classList.contains('lock') || Date.now() < idle) return;
    ang += dt * .022; paint();
  };
  addEventListener('resize', () => { geo(); paint(); });
  geo(); paint(); requestAnimationFrame(spin);

  
})();

/* vensters: diensten en merken */
(function(){
  const $=q=>document.querySelector(q), sheet=$('#sheet'); if(!sheet)return;
  const SV=[
    {n:'01',t:'Strategy',h:['A clear direction.','A stronger presence.'],i:['A strategy built around your business, your audience and your goals.','From positioning to content planning, every detail has a purpose.'],g:['Social media analysis','Brand positioning','Audience and competitor research','Content pillars and creative direction','Monthly content planning'],r:'A clear direction for everything you communicate online.'},
    {n:'02',t:'Content creation',h:['Made to capture attention.','Designed to feel like you.'],i:['From concept to final edit, every piece of content is created to reflect your brand and connect with your audience.'],g:['Creative concepts','Photo and video production','Professional editing','Platform-ready formats','Consistent visual style'],r:'A library of ready-to-use content that brings your brand to life.'},
    {n:'03',t:'Websites & apps',h:['Your business.','Beautifully brought online.'],i:['Digital experiences that combine thoughtful design, intuitive navigation and the functionality your business needs.'],g:['Custom design and structure','Responsive development','User-friendly navigation','Content integration','Testing and launch'],r:'A professional digital experience, built around your business.'}
  ];
  const CL=[
    {n:'Sportchefs by Kookeiland',c:'Food & sport',i:'c_sport',t:'I create fresh, energetic content for Sportchefs, so every meal looks as good as it tastes and fits the active people it is made for.',s:['Content creation','Reels','Social strategy']},
    {n:'Rox Beauty',c:'Beauty',i:'c_rox',t:'For Rox Beauty I build content with an elegant, personal look, so the brand stays recognisable and feels close to its clients.',s:['Photo','Social media','Brand look']},
    {n:'Bruce Catering',c:'Catering',i:'c_bruce',v:'media/bruce.mp4',p:'img/bruce-poster.jpg',t:'With Bruce Catering I show the people and the plates behind the food. Warm and honest content that makes guests want to book.',s:['Photo','Social media','Storytelling']},
    {n:'Munch Superfood',c:'Superfood',i:'c_munch',t:'I keep Munch clean and clear. Honest content that lets the products and the meal plans speak for themselves.',s:['Content creation','Social strategy','Product shots']},
    {n:'Cafeina',c:'Party & coffee',i:'c_cafeina',t:'For Cafeina I make high-energy content full of music and atmosphere. Your cup of party, in every post and reel.',s:['Event content','Reels','Social media']},
    {n:'Nomad Antwerpen',c:'Restaurant',i:'c_nomad',t:'For Nomad I capture the light, the space and the details that make people want a table, and turn them into content.',s:['Photo','Social media','Brand look']}
  ];
  let sv=0,cl=0,last=null;
  const showS=k=>{sv=(k+SV.length)%SV.length;const c=SV[sv];
    $('#svN').textContent=c.n+' — '+c.t;$('#svH').innerHTML=c.h.map(x=>'<span>'+x+'</span>').join('');
    $('#svI').innerHTML=c.i.map(x=>'<p>'+x+'</p>').join('');$('#svG').innerHTML=c.g.map(x=>'<li>'+x+'</li>').join('');
    $('#svR').innerHTML='<b>The result:</b> '+c.r;$('#svCount').textContent=(sv+1)+' / '+SV.length};
  const showC=k=>{cl=(k+CL.length)%CL.length;const c=CL[cl],im=$('#clImg'),v=$('#clVid');
    v.pause();
    if(c.v){v.hidden=false;v.poster=c.p;v.src=c.v;v.loop=true;im.hidden=true;v.muted=false;const pl=v.play();if(pl)pl.catch(()=>{v.muted=true;v.play().catch(()=>{})})}else{v.hidden=true;v.removeAttribute('src');v.load();im.hidden=false;im.src='img/'+c.i+'.webp';im.alt=c.n}
    $('#clName').textContent=c.n;$('#clCat').textContent=c.c;$('#clInfo').textContent=c.t;
    $('#clTags').innerHTML=c.s.map(x=>'<span>'+x+'</span>').join('');$('#clCount').textContent=(cl+1)+' / '+CL.length};
  const open=w=>{last=document.activeElement;$('#svPane').hidden=w!=='s';$('#clPane').hidden=w!=='c';sheet.hidden=false;requestAnimationFrame(()=>sheet.classList.add('on'));document.body.style.overflow='hidden';$('#sx').focus()};
  const close=()=>{const v=$('#clVid');if(v)v.pause();sheet.classList.remove('on');setTimeout(()=>{sheet.hidden=true},300);document.body.style.overflow='';if(last&&last.focus)last.focus()};
  window.__openService=k=>{showS(k);open('s')};window.__openClient=k=>{showC(k);open('c')};
  document.querySelectorAll('.more[data-svc]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();window.__openService(+a.dataset.svc)}));
  $('#svPrev').onclick=()=>showS(sv-1);$('#svNext').onclick=()=>showS(sv+1);$('#clPrev').onclick=()=>showC(cl-1);$('#clNext').onclick=()=>showC(cl+1);
  $('#sx').onclick=close;sheet.addEventListener('click',e=>{if(e.target===sheet||e.target.closest('[data-close]'))close()});
  addEventListener('keydown',e=>{if(sheet.hidden)return;if(e.key==='Escape')close();if(!$('#clPane').hidden){if(e.key==='ArrowRight')showC(cl+1);if(e.key==='ArrowLeft')showC(cl-1)}else{if(e.key==='ArrowRight')showS(sv+1);if(e.key==='ArrowLeft')showS(sv-1)}});
})();

/* prijzen-venster: opent via Pricing in menu of voettekst, alles tegelijk */
(function(){
  const $=q=>document.querySelector(q), ps=$('#psheet'); if(!ps)return;
  let last=null;
  const open=()=>{last=document.activeElement;$('#plPane').hidden=false;$('#cuPane').hidden=false;ps.hidden=false;requestAnimationFrame(()=>ps.classList.add('on'));document.body.style.overflow='hidden';$('#px').focus()};
  const close=()=>{ps.classList.remove('on');setTimeout(()=>{ps.hidden=true},300);document.body.style.overflow='';if(last&&last.focus)last.focus()};
  document.querySelectorAll('a[href="#pricing"],[data-open]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();open()}));
  $('#px').onclick=close;
  ps.addEventListener('click',e=>{if(e.target===ps||e.target.closest('[data-pick]'))close()});
  addEventListener('keydown',e=>{if(!ps.hidden&&e.key==='Escape')close()});
  if(location.hash==='#pricing')open();
})();

/* social: links die nog volgen blijven rustig staan */
document.querySelectorAll('a[data-soon]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));

/* ═══ beweging ═══ */
(function(){
  const off=/[?&]motion=off/.test(location.search); if(off)return;
  const $=q=>document.querySelector(q), $$=q=>[...document.querySelectorAll(q)];

  /* koppen: woorden in maskers */
  $$('.mega2').forEach(h=>{
    let n=0;
    (function walk(node){
      [...node.childNodes].forEach(c=>{
        if(c.nodeType===3){
          const f=document.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(p=>{
            if(!p)return;
            if(/^\s+$/.test(p)){f.appendChild(document.createTextNode(' '));return}
            const w=document.createElement('span');w.className='wd';
            const i=document.createElement('span');i.textContent=p;i.style.setProperty('--w',n++);
            w.style.setProperty('--w',n);i.style.setProperty('--w',n);w.appendChild(i);f.appendChild(w);
          });
          c.replaceWith(f);
        }else if(c.nodeType===1&&!c.classList.contains('wd'))walk(c);
      });
    })(h);
  });
  /* "in" op de kop zelf zodra hij in beeld komt */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.2});
  $$('.mega2').forEach(h=>{h.classList.add('rv');io.observe(h)});

  /* menu: weg bij naar beneden scrollen, terug bij omhoog; voortgangsbalk; parallax */
  const nav=$('#nav'), prog=$('#prog');
  const par=$$('.hero-bg img,.intro-grid .photo img,.phil-grid .photo img,.quick .photo img');
  let last=scrollY, tick=false, vel=0;
  function onScroll(){
    tick=false;const y=scrollY,d=y-last;vel=d;
    if(nav)nav.classList.remove('gone');
    last=y;
    const h=document.documentElement.scrollHeight-innerHeight;
    document.documentElement.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    par.forEach(img=>{
      const p=img.closest('.photo,.hero-bg')||img,r=p.getBoundingClientRect();
      if(r.bottom<-100||r.top>innerHeight+100)return;
      const k=((r.top+r.height/2)-innerHeight/2)/innerHeight;
      img.style.translate='0 '+(k*-38).toFixed(1)+'px';
      if(!img.closest('.hero-bg'))img.style.scale='1.12';
    });
  }
  addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});
  onScroll();

  /* tekststrook: loopt altijd, sneller bij scrollen */
  const st=$('.strip-t');
  if(st){let x=0,w=0;const calc=()=>{w=st.scrollWidth/3};calc();addEventListener('resize',calc);
    let v=0;(function f(){requestAnimationFrame(f);v+=(Math.abs(vel)-v)*.08;vel*=.9;x-=.7+v*.35;if(-x>=w)x+=w;st.style.transform='translate3d('+x.toFixed(1)+'px,0,0)'})()}

  /* knoppen: magnetisch (alleen met muis) */
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    $$('.pill').forEach(b=>{
      b.addEventListener('mousemove',e=>{const r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.2).toFixed(1)+'px,'+((e.clientY-r.top-r.height/2)*.3).toFixed(1)+'px)'});
      b.addEventListener('mouseleave',()=>{b.style.transform=''});
    });
  }
})();

/* lichtvlek volgt de muis in glaskaarten · foto's altijd zichtbaar (vangnet) */
(function(){
  document.querySelectorAll('.beliefs li,.plan,.q,.stat3,.form').forEach(g=>{
    g.addEventListener('pointermove',e=>{const r=g.getBoundingClientRect();g.style.setProperty('--mx',(e.clientX-r.left)+'px');g.style.setProperty('--my',(e.clientY-r.top)+'px')});
    g.addEventListener('pointerleave',()=>{g.style.removeProperty('--mx');g.style.removeProperty('--my')});
  });
  const fb=()=>document.querySelectorAll('.rv:not(.in)').forEach(el=>{const r=el.getBoundingClientRect();if(r.top<innerHeight*.92&&r.bottom>0)el.classList.add('in')});
  addEventListener('scroll',()=>requestAnimationFrame(fb),{passive:true});addEventListener('load',fb);setTimeout(fb,1200);
})();

/* diensten: hoveren (of tikken) op de tekst wisselt de foto */
(function(){
  const sc=document.getElementById('scene'); if(!sc)return;
  const items=[...sc.querySelectorAll('.sc-item')], imgs=[...sc.querySelectorAll('.sc-media img')], dots=[...sc.querySelectorAll('.sc-dots i')];
  let cur=-1;
  const set=i=>{if(i===cur)return;cur=i;items.forEach((e,k)=>e.classList.toggle('on',k===i));imgs.forEach((e,k)=>e.classList.toggle('on',k===i));dots.forEach((e,k)=>e.classList.toggle('on',k===i))};
  items.forEach((it,k)=>{
    it.addEventListener('mouseenter',()=>set(k));
    it.addEventListener('focusin',()=>set(k));
    it.addEventListener('click',e=>{if(!e.target.closest('.more'))set(k)});
    it.setAttribute('tabindex','0');
  });
  dots.forEach((d,k)=>d.addEventListener('click',()=>set(k)));
  set(0);
})();

/* voettekst-diensten openen het venster · review-knop */
(function(){
  document.querySelectorAll('a[data-svcjump]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();if(window.__openService)window.__openService(+a.dataset.svcjump)}));
  const v=document.getElementById('rv'),b=document.getElementById('rplay');
  if(v&&b){b.addEventListener('click',()=>{v.play().catch(()=>{});b.classList.add('off')});v.addEventListener('play',()=>b.classList.add('off'));v.addEventListener('pause',()=>{if(v.ended||v.currentTime===0)b.classList.remove('off')});v.addEventListener('ended',()=>b.classList.remove('off'))}
})();

/* logo weg bij scrollen */
(function(){const n=document.getElementById('nav');if(!n)return;const f=()=>n.classList.toggle('scrolled',scrollY>60);addEventListener('scroll',f,{passive:true});f()})();
