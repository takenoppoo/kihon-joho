/* 追加の問題集：index.html に読み込みの行がなくても、ここで読み込む（すでに読み込み済みなら何もしない） */
(function(){var ids=[1601,1602,1603,1701,1702,1703,1704,1705,1801,1802,1803,1901,1902,1903,2001,2002,2003,2004,2101,2201,2202,2203,2204,2301,2302,2303,2304,2401,2402,2403,2501,2502,2503,2504,2505,2506];window.VOLS=window.VOLS||[];
ids.forEach(function(id){if(window.VOLS.some(function(v){return v.vol===id}))return;
try{var x=new XMLHttpRequest();x.open('GET','data_vol'+id+'.js',false);x.send();if(x.status===200)(0,eval)(x.responseText)}catch(e){}})})();
(function(){
var RAW=(window.VOLS||[]).slice().sort(function(a,b){return a.vol-b.vol}), MARK=['ア','イ','ウ','エ'], KEY='kihon_wrong2';
/* 1巻＝15問（5問×3セット）に組み直す：分野ごとに、元の問題集を順に並べて15問ずつ区切る。音声と苦手ボックスの記録は、元の番号のまま使う */
var PER=15,FIDX=['sec','kiso','comp','sysk','soft','hard','ui','media','db','net','dev','devm','algo','pm','sm','audit','sstr','splan','mgmt','tech','biz','corp','law'];
function topicOf(t){var x=String(t||'').split('：').pop().replace(/（.*$/,'');return x}
var VOLS=(function(){
  var g={},order=[];
  RAW.forEach(function(v){var f=v.field||'sec',k=(v.subj||'A')+'|'+f;if(!g[k]){g[k]={subj:v.subj||'A',field:f,qs:[],tp:[]};order.push(k)}
    v.qs.forEach(function(q){q.avol=v.vol;q.aex=q.ex;q.id='v'+v.vol+'-'+q.no;g[k].qs.push({q:q,t:topicOf(v.title)})})});
  var out=[];
  order.forEach(function(k){var G=g[k],fi=FIDX.indexOf(G.field);if(fi<0)fi=FIDX.length+order.indexOf(k);
    for(var i=0,n=1;i<G.qs.length;i+=PER,n++){
      var ch=G.qs.slice(i,i+PER),tp=[];ch.forEach(function(c){if(c.t&&tp.indexOf(c.t)<0)tp.push(c.t)});
      out.push({vol:(fi+1)*100+n,n:n,subj:G.subj,field:G.field,title:tp.slice(0,3).join('・')+(tp.length>3?'ほか':''),qs:ch.map(function(c){return c.q})})}});
  return out.sort(function(a,b){return a.vol-b.vol})})();
var Q={};VOLS.forEach(function(v){v.qs.forEach(function(q,i){q.dno=i+1;q.ex=i+1;q.vol=v.vol;Q[q.id]=q})});
function getQ(id){return Q[id]}
function sortIds(a){return a.slice().sort(function(x,y){var p=Q[x],r=Q[y];return p.vol-r.vol||p.dno-r.dno})}
function dn(id){for(var i=0;i<VOLS.length;i++)if(VOLS[i].vol===+id)return VOLS[i].n||VOLS[i].vol;return id}
function qLabel(q){return '第'+dn(q.vol)+'巻　問'+(q.dno||q.no)}
function qShort(q){return q.q.slice(0,34)+(q.q.length>34?'…':'')}
function pad2(n){return n<10?'0'+n:''+n}
try{ // 旧版（第1回だけの保存）から引き継ぐ
  ['kihon_sec1_wrong:kihon_wrong2','kihon_sec1_weak:kihon_weak2'].forEach(function(p){var a=p.split(':');
    if(!localStorage.getItem(a[1])&&localStorage.getItem(a[0])){var o=JSON.parse(localStorage.getItem(a[0]));localStorage.setItem(a[1],JSON.stringify(o.map(function(n){return 'v1-'+n})))}})
}catch(e){}
var app=document.getElementById('app'), mem=null;
function load(){try{var v=localStorage.getItem(KEY);if(v)return JSON.parse(v)}catch(e){}return mem||[]}
function save(a){mem=a;try{localStorage.setItem(KEY,JSON.stringify(a))}catch(e){}}
var WKEY='kihon_weak2',wmem=null;
function loadW(){try{var v=localStorage.getItem(WKEY);if(v)return JSON.parse(v)}catch(e){}return wmem||[]}
function saveW(a){wmem=a;try{localStorage.setItem(WKEY,JSON.stringify(a))}catch(e){}}
function inW(no){return loadW().indexOf(no)>=0}
function toggleW(no){var w=loadW(),i=w.indexOf(no);if(i>=0)w.splice(i,1);else w.push(no);saveW(w);countNav();return i<0}
function countNav(){var r=document.getElementById('navrev'),w=document.getElementById('navweak');if(r)r.textContent='復習（'+load().length+'）';if(w)w.textContent='苦手（'+loadW().length+'）'}
function chk(no){
  var b=el('button','chk');b.setAttribute('aria-label','苦手ボックスに入れる');
  function draw(){var on=inW(no);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');b.textContent=on?'✓ 苦手':'□ 苦手'}
  b.onclick=function(){toggleW(no);draw()};b.refresh=draw;draw();return b;
}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function slot(){var s=document.getElementById('crumbslot');if(!s){var h=document.querySelector('header');if(h){s=document.createElement('div');s.id='crumbslot';h.appendChild(s)}}return s}
function clear(){stopSpeak();app.innerHTML='';var cs=slot();if(cs)cs.innerHTML='';window.scrollTo(0,0)}

var synth=window.speechSynthesis, playing=null;
function stopSpeak(){if(synth)synth.cancel();if(audio){audio.pause();audio=null}if(playing){playing.classList.remove('on');playing=null}}
var manifest=window.AUDIO_MANIFEST||{},audio=null,speed=1;
try{var sv=localStorage.getItem('kihon_speed');if(sv)speed=parseFloat(sv)||1}catch(e){}
var spdSel=document.getElementById('spd');
if(spdSel){spdSel.value=String(speed);spdSel.onchange=function(){speed=parseFloat(spdSel.value)||1;try{localStorage.setItem('kihon_speed',String(speed))}catch(e){}if(audio)audio.playbackRate=speed}}
try{fetch('audio/manifest.json').then(function(r){return r.ok?r.json():{}}).then(function(m){manifest=m||{}}).catch(function(){})}catch(e){}
function endPlay(btn){if(playing===btn){btn.classList.remove('on');btn.textContent=btn.dataset.lbl;playing=null}}
function speak(btn,text,file){
  if(playing===btn){stopSpeak();return}
  stopSpeak();playing=btn;btn.classList.add('on');
  if(file&&manifest[file]){
    audio=new Audio('audio/'+manifest[file]);audio.playbackRate=speed;audio.onended=function(){endPlay(btn)};
    audio.play().catch(function(){stopSpeak()});return;
  }
  if(!synth){stopSpeak();return}
  var vs=synth.getVoices().filter(function(v){return /^ja/i.test(v.lang)});
  var parts=text.split('\n').map(function(t){return t.trim()}).filter(Boolean);
  parts.forEach(function(t,i){
    var u=new SpeechSynthesisUtterance(t);u.lang='ja-JP';u.rate=speed;if(vs[0])u.voice=vs[0];
    if(i===parts.length-1)u.onend=function(){endPlay(btn)};
    synth.speak(u);
  });
}
function fkey(q,suf){var av=q.avol||q.vol,ae=q.aex||q.ex;var k='v'+pad2(av)+'_ex'+ae+suf;if(!manifest[k]&&av===1)k='ex'+ae+suf;return k}
function spk(text,file){var b=el('button','btn spk','🔊 読み上げ');b.dataset.lbl='🔊 読み上げ';b.setAttribute('aria-label','読み上げ');b.onclick=function(){speak(b,text,typeof file==='function'?file():file)};var w=el('span','credit','VOICEVOX:ずんだもん');var box=el('span','spkbox');box.appendChild(b);box.appendChild(w);return box}
function noLetter(t){return String(t).replace(/（[アイウエ]）/g,'')}
function finText(q,clean){return clean&&!q.fixed?q.fin.replace(/よって、答えは「[アイウエ]」の/,'正解は、'):q.fin}
function extraText(q,clean){var r=[];if(q.steptext)r.push(q.steptext);if(q.calc)q.calc.forEach(function(s){r.push(s.t);s.l.forEach(function(t){r.push(t)})});if(q.fin)r.push(finText(q,clean));return r}
function readText(q,label){
  return [label,q.q].concat(q.choices.map(function(t,i){return MARK[i]+'、'+(String(t).indexOf('img:')===0?'図':t)}),['答えは、'+MARK[q.ans]+'です。'],[q.story,q.meaning],extraText(q,false)).join('\n');
}
function chBody(t){
  if(typeof t==='string'&&t.indexOf('img:')===0){var im=el('img','chimg');im.src=t.slice(4);im.alt='選択肢の図';return im}
  return el('span',0,t)}
function lines(box,txt){txt.split('\n').forEach(function(l){if(l.trim())box.appendChild(el('p',0,l.trim()))})}
function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t}return a}
// 正解位置がかたよらないよう均等に割り当て、選択肢の順番はバラバラにする
function prepare(ids){
  var pos=shuffle(ids.map(function(_,i){return i%4}));
  return shuffle(ids).map(function(id,i){
    var q=getQ(id), others=shuffle([0,1,2,3].filter(function(k){return k!==q.ans}));
    if(q.fixed)return {q:q,order:[0,1,2,3],pos:q.ans};
    var order=[],t=pos[i%pos.length],o=0;
    for(var p=0;p<4;p++){order.push(p===t?q.ans:others[o++])}
    return {q:q,order:order,pos:t};
  });
}
function qBlock(item,showNo){
  var q=item.q,b=el('div');
  b.appendChild(el('div','meta',showNo));
  b.appendChild(el('div','q',q.q));
  if(q.fig){[].concat(q.fig).forEach(function(f){var im=el('img','fig');im.src=f;im.alt=q.figAlt||'図';b.appendChild(im)})}
  return b;
}
function cleanMeaning(t){return t.replace(/よって、答えは「[アイウエ]」の「([\s\S]*)」です。/,'正解は、「$1」です。')}
function expBlock(q,noSpk){
  var e=el('div','exp');
  e.appendChild(el('h3',0,'たとえ話'));lines(e,q.story);
  var mt=noSpk?q.meaning:cleanMeaning(q.meaning);e.appendChild(el('h3',0,'言葉の意味'));lines(e,mt);
  if(q.steps){var sb=el('div','steps');q.steps.forEach(function(f){var l=el('a');l.href=f;l.target='_blank';l.title='タップで拡大';var im=el('img');im.src=f;im.alt='計算の手順';l.appendChild(im);sb.appendChild(l)});sb.appendChild(el('p','meta','図をタップすると、大きく表示されます。'));e.appendChild(sb)}
  if(q.calc){e.appendChild(el('h3',0,'解き方（途中の計算）'));q.calc.forEach(function(s){var d=el('div','stepc');d.appendChild(el('p','stepT',s.t));s.l.forEach(function(t){d.appendChild(el('p',0,t))});e.appendChild(d)})}
  if(q.fin){e.appendChild(el('p','fin',finText(q,!noSpk)))}
  e.appendChild(el('p','meta',q.src?('出典：'+q.src+' 基本情報技術者試験（IPA）'):('参考書：例題'+(q.aex||q.ex))));
  if(!noSpk){var w=el('div','btns');w.appendChild(spk([q.story,mt].concat(extraText(q,true)).join('\n'),function(){return fkey(q,'_exp')}));e.appendChild(w)}
  return e;
}
/* ---------- 目次（ホーム → 科目 → 分野 → 問題集） ---------- */
function F(id,name){return {id:id,name:name}}
var SUBJ=[
  {id:'A',name:'科目A',desc:'知識を問う四択問題',groups:[
    {name:'テクノロジ系',fields:[F('kiso','基礎理論'),F('comp','コンピュータ構成要素'),F('sysk','システム構成要素'),F('soft','ソフトウェア'),F('hard','ハードウェア'),F('ui','ユーザーインタフェース'),F('media','情報メディア'),F('db','データベース'),F('net','ネットワーク'),F('sec','セキュリティ'),F('dev','システム開発技術'),F('devm','ソフトウェア開発管理技術')]},
    {name:'マネジメント系',fields:[F('pm','プロジェクトマネジメント'),F('sm','サービスマネジメント'),F('audit','システム監査')]},
    {name:'ストラテジ系',fields:[F('sstr','システム戦略'),F('splan','システム企画'),F('mgmt','経営戦略マネジメント'),F('tech','技術戦略マネジメント'),F('biz','ビジネスインダストリ'),F('corp','企業活動'),F('law','法務')]}]},
  {id:'B',name:'科目B',desc:'アルゴリズムとプログラミング',groups:[
    {name:'テクノロジ系',fields:[F('algo','アルゴリズムとプログラミング')]}]}
];
function allFields(s){return s.groups.reduce(function(a,g){return a.concat(g.fields)},[])}
function volsOf(sid,fid){return VOLS.filter(function(v){return (v.subj||'A')===sid&&(v.field||'sec')===fid})}
function qCount(vs){return vs.reduce(function(n,v){return n+v.qs.length},0)}
function crumb(parts){var p=el('p','crumb');parts.forEach(function(x,i){if(i)p.appendChild(document.createTextNode(' ＞ '));if(x[1]){var a=el('a',0,x[0]);a.href=x[1];p.appendChild(a)}else p.appendChild(el('span',0,x[0]))});var cs=slot();if(cs){cs.innerHTML='';cs.appendChild(p);return document.createTextNode('')}return p}
function volCrumb(v,last){var s=SUBJ.filter(function(x){return x.id===(v.subj||'A')})[0],f=s&&allFields(s).filter(function(x){return x.id===(v.field||'sec')})[0];var a=[['ホーム','#top']];if(s)a.push([s.name,'#subj-'+s.id]);if(s&&f)a.push([f.name,'#field-'+s.id+'-'+f.id]);a.push([last]);return crumb(a)}
function tile(title,desc,meta,href){
  var c=el('div','card');c.appendChild(el('h2',0,title));
  if(desc)c.appendChild(el('p','meta',desc));
  if(meta)c.appendChild(el('p','meta',meta));
  var b=el('div','btns');
  if(href){var a=el('a','btn primary','開く');a.href=href;b.appendChild(a)}else{b.appendChild(el('span','meta','準備中'))}
  c.appendChild(b);return c}
function random10(sid){if(location.hash==='#random-'+sid)startRandom(sid);else location.hash='#random-'+sid}
function startRandom(sid){
  var ids=[];VOLS.forEach(function(v){if((v.subj||'A')===sid)v.qs.forEach(function(q){ids.push(q.id)})});
  if(!ids.length)return;
  run(prepare(shuffle(ids).slice(0,10)),'test','random-'+sid);
}
function isRand(t){return typeof t==='string'&&t.indexOf('random')===0}

/* ===== 学習のきろく（ホームの一番下）：日ごとの問題数・カレンダー・分野ごとの完成率 ===== */
var HIK='kihon_hist2',DNK='kihon_done2',calOff=0;
function ldJ(k,m){try{var v=localStorage.getItem(k);if(v)return JSON.parse(v)}catch(e){}return m}
function svJ(k,o){try{localStorage.setItem(k,JSON.stringify(o))}catch(e){}}
function ymd(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate())}
function dayRec(h,k){return h[k]||{n:0,ok:0,s:0}}
function logAns(id,ok){var h=ldJ(HIK,{}),t=ymd(new Date()),r=h[t]||(h[t]={n:0,ok:0,s:0});r.n++;if(ok)r.ok++;svJ(HIK,h);if(ok){var d=ldJ(DNK,{});if(!d[id]){d[id]=1;svJ(DNK,d)}}}
function logStudy(){var h=ldJ(HIK,{}),t=ymd(new Date()),r=h[t]||(h[t]={n:0,ok:0,s:0});r.s=(r.s||0)+1;svJ(HIK,h)}
(function(){var st=document.createElement('style');st.textContent='.hs{margin-top:6px}.hs h3{font-size:16px;margin:18px 0 8px;color:var(--ink)}.hsum{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.hsum div{background:#eaf6f4;border-radius:12px;padding:10px 12px}.hsum b{display:block;font-size:24px;color:#14796e;line-height:1.2}.hsum span{font-size:13px;color:var(--sub)}.hmsg{background:#fff6e5;border-radius:12px;padding:10px 12px;font-weight:600;margin:12px 0 0}.hcalh{display:flex;align-items:center;justify-content:space-between;margin:6px 0}.hcalh button{font:inherit;border:1px solid var(--line);background:#fff;border-radius:8px;padding:2px 12px;cursor:pointer}.hcal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}.hcal .w{font-size:12px;color:var(--sub)}.hcal .d{aspect-ratio:1;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:#f1f3f7;color:#7a8494}.hcal .l1{background:#bfe9e3;color:#14524b}.hcal .l2{background:#79d0c5;color:#0d4a43}.hcal .l3{background:#1fa596;color:#fff}.hcal .l4{background:#14796e;color:#fff;font-weight:700}.hcal .t{outline:2px solid #e2566b}.hleg{display:flex;gap:4px;align-items:center;font-size:12px;color:var(--sub);margin-top:6px;justify-content:flex-end}.hleg i{width:14px;height:14px;border-radius:4px;display:inline-block}.hbar{display:flex;align-items:flex-end;gap:8px;height:120px;margin-top:8px}.hbar div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:12px;color:var(--sub)}.hbar i{display:block;width:100%;background:#1fa596;border-radius:6px 6px 0 0;min-height:2px}.hbar em{font-style:normal;font-size:12px;color:var(--ink);margin-bottom:2px}.hf{margin:8px 0}.hf .t{display:flex;justify-content:space-between;font-size:14px;margin-bottom:3px}.hf .t span:last-child{color:var(--sub);font-size:13px}.hf .tr{height:12px;background:#e6eaf0;border-radius:99px;overflow:hidden}.hf .tr i{display:block;height:100%;background:linear-gradient(90deg,#1fa596,#4cc7b9);border-radius:99px}.hf.full .tr i{background:linear-gradient(90deg,#f5b335,#f28c28)}.hgrp{font-size:13px;font-weight:700;color:var(--sub);margin:14px 0 2px}'
document.head.appendChild(st)})();
function historyCard(){
  var h=ldJ(HIK,{}),dn2=ldJ(DNK,{}),now=new Date(),today=ymd(now);
  var keys=Object.keys(h).filter(function(k){return h[k].n>0||h[k].s>0});
  var totN=0,totOk=0;Object.keys(h).forEach(function(k){totN+=h[k].n||0;totOk+=h[k].ok||0});
  var streak=0,d=new Date(now);if(!(dayRec(h,ymd(d)).n>0||dayRec(h,ymd(d)).s>0))d.setDate(d.getDate()-1);
  while(dayRec(h,ymd(d)).n>0||dayRec(h,ymd(d)).s>0){streak++;d.setDate(d.getDate()-1)}
  var wk=0;for(var i=0;i<7;i++){var x=new Date(now);x.setDate(x.getDate()-i);wk+=dayRec(h,ymd(x)).n}
  var allN=0,doneN=0;Object.keys(Q).forEach(function(id){allN++;if(dn2[id])doneN++});
  var c=el('div','card hs');c.appendChild(el('h2',0,'📈 学習のきろく'));
  var sm=el('div','hsum');
  [[streak+'日','連続で勉強'],[dayRec(h,today).n+'問','今日解いた問題'],[wk+'問','直近7日間'],[totN+'問','これまでの合計'],[(totN?Math.round(totOk*100/totN):0)+'%','正解率'],[doneN+'/'+allN+'問','解けた問題']].forEach(function(a){var dv=el('div');dv.appendChild(el('b',0,a[0]));dv.appendChild(el('span',0,a[1]));sm.appendChild(dv)});
  c.appendChild(sm);
  var msg=!totN?'まずは1問、解いてみましょう。ここに、あなたの努力が積み上がります。':streak>=3?streak+'日連続！　この調子で進めましょう。':doneN>=allN*0.5?'半分以上の問題が解けました。すごい！':'一歩ずつ、着実に積み上がっています。';
  c.appendChild(el('div','hmsg',msg));
  /* カレンダー */
  c.appendChild(el('h3',0,'カレンダー（色が濃いほど、たくさん解いた日）'));
  var cal=el('div'),calBox=el('div');
  function drawCal(){
    calBox.innerHTML='';var m=new Date(now.getFullYear(),now.getMonth()+calOff,1);
    var hd=el('div','hcalh'),pv=el('button',0,'◀'),nx=el('button',0,'▶');pv.onclick=function(){calOff--;drawCal()};nx.onclick=function(){if(calOff<0){calOff++;drawCal()}};nx.disabled=calOff>=0;
    hd.appendChild(pv);hd.appendChild(el('b',0,m.getFullYear()+'年'+(m.getMonth()+1)+'月'));hd.appendChild(nx);calBox.appendChild(hd);
    var g=el('div','hcal');['日','月','火','水','木','金','土'].forEach(function(w){g.appendChild(el('div','w',w))});
    for(var i=0;i<m.getDay();i++)g.appendChild(el('div'));
    var dim=new Date(m.getFullYear(),m.getMonth()+1,0).getDate();
    for(var dd=1;dd<=dim;dd++){var k=m.getFullYear()+'-'+pad2(m.getMonth()+1)+'-'+pad2(dd),r=dayRec(h,k),n=r.n,lv=n>=30?4:n>=15?3:n>=5?2:(n>0||r.s>0)?1:0;
      var cell=el('div','d'+(lv?' l'+lv:'')+(k===today?' t':''),dd);cell.title=n+'問';g.appendChild(cell)}
    calBox.appendChild(g);
    var lg=el('div','hleg');lg.appendChild(document.createTextNode('少ない '));['#f1f3f7','#bfe9e3','#79d0c5','#1fa596','#14796e'].forEach(function(col){var i2=el('i');i2.style.background=col;lg.appendChild(i2)});lg.appendChild(document.createTextNode(' 多い'));calBox.appendChild(lg)}
  drawCal();cal.appendChild(calBox);c.appendChild(cal);
  /* 直近7日のグラフ */
  c.appendChild(el('h3',0,'直近7日間に解いた問題数'));
  var days=[],mx=1;for(var j=6;j>=0;j--){var y=new Date(now);y.setDate(y.getDate()-j);var r2=dayRec(h,ymd(y));days.push([['日','月','火','水','木','金','土'][y.getDay()],r2.n]);if(r2.n>mx)mx=r2.n}
  var bar=el('div','hbar');days.forEach(function(a){var col=el('div'),em=el('em',0,a[1]||'');var bi=el('i');bi.style.height=Math.round(a[1]*88/mx)+'px';col.appendChild(em);col.appendChild(bi);col.appendChild(el('span',0,a[0]));bar.appendChild(col)});c.appendChild(bar);
  /* 分野ごとの完成率 */
  c.appendChild(el('h3',0,'分野ごとの完成率（一度でも正解できた問題の割合）'));
  SUBJ.forEach(function(s){
    s.groups.forEach(function(g){
      var rows=[];g.fields.forEach(function(f){var vs=volsOf(s.id,f.id),n=0,dd2=0;vs.forEach(function(v){v.qs.forEach(function(q){n++;if(dn2[q.id])dd2++})});if(n)rows.push([f.name,dd2,n])});
      if(!rows.length)return;
      c.appendChild(el('div','hgrp',g.name||''));
      rows.forEach(function(r){var pct=Math.round(r[1]*100/r[2]),w=el('div','hf'+(pct===100?' full':''));var t=el('div','t');t.appendChild(el('span',0,r[0]+(pct===100?' ★':'')));t.appendChild(el('span',0,r[1]+' / '+r[2]+'問　'+pct+'%'));w.appendChild(t);var tr=el('div','tr'),bi=el('i');bi.style.width=pct+'%';tr.appendChild(bi);w.appendChild(tr);c.appendChild(w)})})});
  app.appendChild(c)}
function home(){
  clear();
  app.appendChild(el('h1',0,'基本情報技術者 対策'));
  app.appendChild(el('p','lead','科目を選んで、分野、問題集の順に進みます。'));
  (function(){var hb=el('a','btn primary','📘 このサイトの使い方（PDF）');hb.href='howto.pdf';hb.target='_blank';hb.rel='noopener';var hw=el('div','btns');hw.style.marginBottom='12px';hw.appendChild(hb);app.appendChild(hw)})();
  SUBJ.forEach(function(s){
    var n=0,vs=0;allFields(s).forEach(function(f){var x=volsOf(s.id,f.id);n+=qCount(x);vs+=x.length});
    app.appendChild(tile(s.name,s.desc,vs?('問題集'+vs+'冊 ／ '+n+'問'):'',s.id==='B'||vs?'#subj-'+s.id:''));
  });
  SUBJ.forEach(function(s){
    var n=0;allFields(s).forEach(function(f){n+=qCount(volsOf(s.id,f.id))});
    var rc=el('div','card');rc.appendChild(el('h2',0,s.name+'　ランダム10問'));
    rc.appendChild(el('p','meta',n?('科目'+s.id+'だけの問題から、10問をランダムに出します。'):'問題を準備中です。'));
    var rw=el('div','btns');
    if(n){var rb=el('button','btn primary',s.name+'のランダム10問に挑戦');rb.onclick=function(){random10(s.id)};rw.appendChild(rb)}else rw.appendChild(el('span','meta','準備中'));
    rc.appendChild(rw);app.appendChild(rc)});
  try{historyCard()}catch(e){}
}
function subjPage(sid){
  var s=SUBJ.filter(function(x){return x.id===sid})[0];if(!s)return home();
  clear();
  app.appendChild(crumb([['ホーム','#top'],[s.name]]));
  app.appendChild(el('h1',0,s.name));
  app.appendChild(el('p','lead','分野を選んでください。'));
  s.groups.forEach(function(g){
    var c=el('div','card');c.appendChild(el('h2',0,g.name));
    var ul=el('ul','list');
    g.fields.forEach(function(f){
      var vs=volsOf(s.id,f.id),li=el('li');
      if(vs.length){var a=el('a',0,f.name);a.href='#field-'+s.id+'-'+f.id;a.style.fontWeight='600';li.appendChild(a);var m=el('span','meta','問題集'+vs.length+'冊 ／ '+qCount(vs)+'問');m.style.marginLeft='auto';li.appendChild(m)}
      else{li.appendChild(el('span',0,f.name));var m2=el('span','meta','準備中');m2.style.marginLeft='auto';li.appendChild(m2)}
      ul.appendChild(li)});
    c.appendChild(ul);app.appendChild(c)});
}
function fieldPage(sid,fid){
  var s=SUBJ.filter(function(x){return x.id===sid})[0],f=s&&allFields(s).filter(function(x){return x.id===fid})[0];
  if(!f)return home();
  clear();
  app.appendChild(crumb([['ホーム','#top'],[s.name,'#subj-'+s.id],[f.name]]));
  app.appendChild(el('h1',0,s.name+'　'+f.name));
  app.appendChild(el('p','lead','資料で学ぶ → テストで確認 → 間違えた問題は苦手ボックスで復習。'));
  volsOf(sid,fid).forEach(function(v){
    var c=el('div','card');
    c.appendChild(el('span','badge','第'+dn(v.vol)+'巻'));c.appendChild(starBox(v.vol,starsOf(v.vol)));
    c.appendChild(el('h2',0,v.title));
    c.appendChild(el('p','meta','学習資料 例題'+v.qs.length+'問 ／ テスト'+v.qs.length+'問'));
    var b=el('div','btns');
    var P=partsOf(v);
    if(P.length>1){
      c.appendChild(el('p','meta','5問前後ずつ、'+P.length+'つのセットに分けています。'));
      ['study','test'].forEach(function(kind){c.appendChild(el('p','meta',kind==='study'?'1. 学習資料':'2. テスト'));var d=el('div','btns');
        P.forEach(function(g,i){var a=el('a','btn'+(kind==='study'&&i===0?' primary':''),CN[i]+'（'+g.length+'問）');a.href='#'+kind+'-'+v.vol+'-'+(i+1);if(kind==='test'){a.appendChild(el('br'));var hs=el('span',0,heartStr(heartsOf(v.vol,i+1)));hs.style.color='#e2566b';hs.style.fontSize='14px';hs.title='全問正解で、♥が1つ増えます';a.appendChild(hs)}d.appendChild(a)});
        if(kind==='test'){var a=el('a','btn','全問（'+v.qs.length+'問）');a.href='#test-'+v.vol;d.appendChild(a)}
        c.appendChild(d)});
      [['3. 苦手ボックス（'+volIds(loadW(),v.vol).length+'問）','#weak-'+v.vol]].forEach(function(x){var a=el('a','btn',x[0]);a.href=x[1];b.appendChild(a)});
    }else{
    [['1. 学習資料を読む','#study-'+v.vol,1],['2. テストを受ける','#test-'+v.vol,0],['3. 苦手ボックス（'+volIds(loadW(),v.vol).length+'問）','#weak-'+v.vol,0]].forEach(function(x){var a=el('a','btn'+(x[2]?' primary':''),x[0]);a.href=x[1];b.appendChild(a)});}
    c.appendChild(b);app.appendChild(c);
  });
}
var SKEY='kihon_stars',smem={};
function loadS(){try{var v=localStorage.getItem(SKEY);if(v)return JSON.parse(v)}catch(e){}return smem}
function saveS(o){smem=o;try{localStorage.setItem(SKEY,JSON.stringify(o))}catch(e){}}
function starsOf(n){return Math.min(3,loadS()[n]||0)}
function addStar(n){var o=loadS(),c=Math.min(3,o[n]||0);if(c>=3)return 3;o[n]=c+1;saveS(o);return c+1}
function starBox(n,cnt){var w=el('span','stars');w.title='全問正解のテストを3回で、★3つ';for(var i=0;i<3;i++)w.appendChild(el('span','star'+(i<cnt?' on':''),i<cnt?'★':'☆'));return w}
var CN='①②③④⑤⑥';
function fieldHref(n){var v=volOf(n);return v?'#field-'+(v.subj||'A')+'-'+(v.field||'sec'):'#top'}
var HKEY='kihon_hearts',hmem={};
function loadH(){try{var v=localStorage.getItem(HKEY);if(v)return JSON.parse(v)}catch(e){}return hmem}
function saveH(o){hmem=o;try{localStorage.setItem(HKEY,JSON.stringify(o))}catch(e){}}
function heartsOf(n,p){return Math.min(3,loadH()[n+'-'+p]||0)}
function addHeart(n,p){var o=loadH(),k=n+'-'+p,c=Math.min(3,o[k]||0);if(c>=3)return 3;o[k]=c+1;saveH(o);return c+1}
function heartStr(c){var t='';for(var i=0;i<3;i++)t+=i<c?'♥':'♡';return t}
function partsOf(v){var a=v.qs.slice().sort(function(x,y){return x.ex-y.ex});if(a.length<=6)return [a];var k=Math.ceil(a.length/5),sz=Math.ceil(a.length/k),r=[];for(var i=0;i<a.length;i+=sz)r.push(a.slice(i,i+sz));return r}
function volIds(a,n){return a.filter(function(id){return Q[id]&&Q[id].vol===n})}
function volOf(n){for(var i=0;i<VOLS.length;i++)if(VOLS[i].vol===n)return VOLS[i];return null}
/* ---------- 学習 ---------- */
function study(n,p){logStudy();
  var v=volOf(n);if(!v)return home();
  var P=partsOf(v),pi=(p&&P.length>1&&p<=P.length)?p-1:-1,lab=pi>=0?CN[pi]:'';
  clear();app.appendChild(volCrumb(v,'第'+dn(v.vol)+'巻　学習資料'));
  app.appendChild(el('h1',0,'学習資料　第'+dn(v.vol)+'巻 '+v.title+(lab?'　'+lab:'')));
  app.appendChild(el('p','lead','読むだけ、または🔊で聞くだけで学べます。答えと解説は最初から表示しています。'));
  (pi>=0?P[pi]:v.qs.slice().sort(function(a,b){return a.ex-b.ex})).forEach(function(q){
    var c=el('div','card study');
    var top=el('div','spktop');top.appendChild(spk(readText(q,'例題'+q.ex),function(){return fkey(q,'')}));c.appendChild(top);
    c.appendChild(qBlock({q:q},'例題 '+q.ex));
    var m0=c.querySelector('.meta');if(m0)m0.style.minHeight='34px';
    var ul=el('ul','choices');
    q.choices.forEach(function(t,i){var li=el('li');var b=el('div','ch'+(i===q.ans?' right':''));b.appendChild(el('span','m',MARK[i]));b.appendChild(chBody(t));li.appendChild(b);ul.appendChild(li)});
    c.appendChild(ul);
    c.appendChild(el('div','result ok','答え：'+MARK[q.ans]));
    c.appendChild(expBlock(q,true));
    app.appendChild(c);
  });
  var a=el('a','btn primary',lab?lab+'のテストへ進む':'テストへ進む');a.href='#test-'+v.vol+(pi>=0?'-'+(pi+1):'');var w=el('div','btns');w.appendChild(a);
  if(pi>=0&&pi<P.length-1){var nx=el('a','btn','次の資料 '+CN[pi+1]);nx.href='#study-'+v.vol+'-'+(pi+2);w.appendChild(nx)}
  app.appendChild(w);
}
/* ---------- 出題（テスト・復習 共通） ---------- */
function run(items,mode,title,part){
  var queue=items.slice(),done=0,total=items.length,log={},firstTry={};
  var wrongNow=load();
  function show(){
    clear();
    (function(){var vv=volOf(parseInt(title,10));if(vv)app.appendChild(volCrumb(vv,'第'+dn(vv.vol)+'巻　'+(mode==='test'?'テスト':mode==='weak'?'苦手ボックス':'復習')));else if(isRand(title))app.appendChild(crumb([['ホーム','#top'],['ランダム10問（科目'+title.slice(-1)+'）']]))})();
    if(!queue.length)return finish();
    var it=queue[0],q=it.q,sel=-1,fixed=false;
    app.appendChild(el('h1',0,isRand(title)?'ランダム10問（科目'+title.slice(-1)+'）':mode==='test'?'テスト　第'+dn(title)+'巻'+(part?'　'+CN[part-1]:''):mode==='weak'?'第'+dn(title)+'巻　苦手ボックス':'第'+dn(title)+'巻　復習（間違えた問題）'));
    var bar=el('div','bar'),i=el('i');i.style.width=(done/total*100)+'%';bar.appendChild(i);app.appendChild(bar);
    var c=el('div','card');var ck=chk(q.id);c.appendChild(ck);
    c.appendChild(qBlock(it,qLabel(q)+(mode==='test'?'　':'（もう一度）　')+'残り'+queue.length+'問'));
    var ul=el('ul','choices'),btns=[];
    it.order.forEach(function(orig,k){
      var li=el('li'),b=el('button','ch');b.appendChild(el('span','m',MARK[k]));b.appendChild(chBody(q.choices[orig]));
      b.onclick=function(){if(fixed)return;sfxTap();sel=k;btns.forEach(function(x){x.classList.remove('sel')});b.classList.add('sel');go.disabled=false};
      btns.push(b);li.appendChild(b);ul.appendChild(li)});
    c.appendChild(ul);
    var area=el('div'),w=el('div','btns'),go=el('button','btn primary','解答する');go.disabled=true;
    w.appendChild(go);c.appendChild(w);c.appendChild(area);app.appendChild(c);
    go.onclick=function(){
      fixed=true;var ok=it.order[sel]===q.ans,corrK=it.order.indexOf(q.ans);
      btns.forEach(function(x){x.disabled=true});
      btns[corrK].classList.add('right');if(!ok)btns[sel].classList.add('wrong');
      sfx(ok);area.appendChild(el('div','result '+(ok?'ok':'ng'),ok?'○ 正解':'× 不正解　正解は '+MARK[corrK]));
      area.appendChild(expBlock(q));
      if(!(q.id in firstTry))firstTry[q.id]=ok;
      logAns(q.id,ok);
      var ws=load();
      if(ok){queue.shift();done++;ws=ws.filter(function(n){return n!==q.id})}
      else{ // 間違えたら、苦手ボックスに自動で入れる。解説のあと、選択肢の順番を変えて同じ問題をもう一度出す
        queue.shift();var again=prepare([q.id])[0];queue.push(again);
        var wk=loadW();if(wk.indexOf(q.id)<0){wk.push(q.id);saveW(wk)}ck.refresh();
      }
            save(ws);countNav();
      go.style.display='none';
      var nx=el('button','btn primary',queue.length?'次へ':'結果を見る');nx.onclick=show;
      var w2=el('div','btns');w2.appendChild(nx);area.appendChild(w2);
      if(!ok)area.appendChild(el('p','meta','この問題は、苦手ボックスに入りました。あとでもう一度出ます。'));
    };
  }
  function finish(){
    clear();
    var keys=Object.keys(firstTry),good=keys.filter(function(k){return firstTry[k]}).length;
    var c=el('div','card');
    c.appendChild(el('div','meta',mode==='test'?'テスト結果':'復習結果'));
    c.appendChild(el('p','score',good+' / '+keys.length));
    if(mode==='test'){var vv=volOf(parseInt(title,10));
      if(vv&&good===keys.length&&keys.length>=vv.qs.length){var before=starsOf(vv.vol),after=addStar(vv.vol);var sb=el('div','starres');sb.appendChild(starBox(vv.vol,after));
        sb.appendChild(el('p','lead',after>before?(after>=3?'全問正解！　★が3つそろいました。この巻はクリアです。':'全問正解！　★を1つ獲得しました（'+after+' / 3）。'):'全問正解！　この巻は、すでに★3つです。'));c.appendChild(sb);try{sfx(true)}catch(e){}}
      else if(vv){var sb2=el('div','starres');sb2.appendChild(starBox(vv.vol,starsOf(vv.vol)));if(part){var hb=heartsOf(vv.vol,part),ha=hb;if(good===keys.length)ha=addHeart(vv.vol,part);
          var hh=el('p','score',heartStr(ha));hh.style.color='#e2566b';sb2.insertBefore(hh,sb2.firstChild);sb2.removeChild(sb2.lastChild);
          sb2.appendChild(el('p','lead',good===keys.length?(ha>hb?'全問正解！　♥を1つ獲得しました（'+ha+' / 3）。':'全問正解！　このセットは、すでに♥3つです。'):'全問正解で、♥が1つ増えます（今は '+ha+' / 3）。★は、「全問」のテストで全問正解すると増えます。'));
        }else sb2.appendChild(el('p','lead','全問正解のテストを3回で、★3つです。1回目で全部当てると、★が1つ増えます。'));c.appendChild(sb2)}}
    c.appendChild(el('p','lead',mode==='test'?'1回目で正解した数です。間違えた問題は、解き直して正解するまで出しました。間違えた問題は、苦手ボックスに入っています。':mode==='weak'?'苦手ボックスの中身は、そのまま残っています。出すのは、苦手ページで外してください。':'すべて正解できました。復習の一覧は空になりました。'));
    var ul=el('ul','list');
    sortIds(keys).forEach(function(k){
      var li=el('li');li.appendChild(el('b',firstTry[k]?'o':'x',firstTry[k]?'○':'×'));li.appendChild(el('span',0,qLabel(Q[k])+'　'+qShort(Q[k])));ul.appendChild(li)});
    c.appendChild(ul);
    var w=el('div','btns'),a=el('a','btn primary',isRand(title)?'ホームへ':'目次へ');a.href=isRand(title)?'#top':fieldHref(parseInt(title,10));w.appendChild(a);
    if(mode==='test'){var r=el('button','btn',isRand(title)?'もう10問':'もう一度テスト');r.onclick=function(){if(isRand(title))random10(title.slice(-1));else test(parseInt(title,10),part)};w.appendChild(r);
      if(part){var vp=volOf(parseInt(title,10));if(vp&&part<partsOf(vp).length){var nt=el('a','btn primary','次のセット '+CN[part]);nt.href='#test-'+vp.vol+'-'+(part+1);w.insertBefore(nt,w.firstChild)}}}
    c.appendChild(w);app.appendChild(c);
  }
  show();
}
function test(n,p){
  var v=volOf(n);if(!v)return home();
  var P=partsOf(v);
  if(p&&P.length>1&&p<=P.length)return run(prepare(P[p-1].map(function(q){return q.id})),'test',String(v.vol),p);
  run(prepare(v.qs.map(function(q){return q.id})),'test',String(v.vol));
}
function review(n){
  var v=volOf(n);if(!v)return home();
  var ws=volIds(load(),n);
  if(!ws.length){clear();app.appendChild(volCrumb(v,'第'+dn(n)+'巻　復習'));app.appendChild(el('h1',0,'第'+dn(n)+'巻　復習'));var c=el('div','card');c.appendChild(el('p',0,'復習する問題はありません。テストで間違えた問題が、ここに集まります。'));var a=el('a','btn primary','テストへ');a.href='#test-'+n;c.appendChild(a);app.appendChild(c);return}
  run(prepare(ws),'review',String(n));
}
function weak(n){
  var v=volOf(n);if(!v)return home();
  clear();app.appendChild(volCrumb(v,'第'+dn(n)+'巻　苦手ボックス'));var ids=sortIds(volIds(loadW(),n));
  app.appendChild(el('h1',0,'第'+dn(n)+'巻　苦手ボックス'));
  app.appendChild(el('p','lead','テストで間違えた問題が、自動で入ります。問題の右上の「□ 苦手」で、自分で入れることもできます。ここから外すこともできます。'));
  var c=el('div','card');
  if(!ids.length){c.appendChild(el('p',0,'まだ入っていません。'));var a0=el('a','btn primary','目次へ');a0.href=fieldHref(n);c.appendChild(a0);app.appendChild(c);return}
  var ul=el('ul','list');
  ids.forEach(function(id){
    var li=el('li');li.appendChild(el('span',0,qLabel(Q[id])+'　'+qShort(Q[id])));
    var rm=el('button','btn','外す');rm.style.marginLeft='auto';rm.onclick=function(){toggleW(id);weak(n)};li.appendChild(rm);ul.appendChild(li)});
  c.appendChild(ul);
  var w=el('div','btns'),go=el('button','btn primary','苦手だけ解く（'+ids.length+'問）');go.onclick=function(){run(prepare(volIds(loadW(),n)),'weak',String(n))};
  w.appendChild(go);c.appendChild(w);app.appendChild(c);
}
var NAVSTK=[],POS={},curH=null;
window.addEventListener('scroll',function(){if(curH)POS[curH]=window.pageYOffset},{passive:true});
function route(){
  var h0=location.hash||'#top',bi=NAVSTK.lastIndexOf(h0),back=bi>=0;
  if(back)NAVSTK.length=bi+1;else NAVSTK.push(h0);
  curH=null;route2();
  if(back)window.scrollTo(0,POS[h0]||0);
  setTimeout(function(){curH=h0},50);
}
function route2(){
  var h=(location.hash||'#top').slice(1),m=/^(study|test|review|weak)-(\d+)(?:-(\d+))?$/.exec(h),ms=/^subj-([AB])$/.exec(h),mf=/^field-([AB])-(\w+)$/.exec(h),mr=/^random-([AB])$/.exec(h);
  countNav();
  if(mr)return startRandom(mr[1]);
  if(ms)return subjPage(ms[1]);
  if(mf)return fieldPage(mf[1],mf[2]);
  var n=m&&parseInt(m[2],10);
  if(m){({study:study,test:test,review:review,weak:weak})[m[1]](n,m[3]?parseInt(m[3],10):0)}
  else home();
}
// 効果音（ピンポーン／ぶっぶー）。音声ファイルは使わず、ブラウザで鳴らします
var sfxOn=true;try{sfxOn=localStorage.getItem('kihon_sfx')!=='0'}catch(e){}
var actx=null;
function ldv(k,d){try{var v=parseFloat(localStorage.getItem(k));return isNaN(v)?d:v}catch(e){return d}}
var sfxVol=ldv('kihon_sfxvol',0.5),bgmVol=ldv('kihon_bgmvol',0.5);
function slider(key,get,set){var r=document.createElement('input');r.type='range';r.min=0;r.max=1;r.step=0.05;r.value=get();r.className='vol';r.title='音量';r.oninput=function(){set(parseFloat(r.value));try{localStorage.setItem(key,r.value)}catch(e){}};return r}
function tone(f,t0,d,type,vol,lpf,att){var o=actx.createOscillator(),g=actx.createGain(),lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpf||1800;o.type=type;o.frequency.value=f;o.connect(g);g.connect(lp);lp.connect(actx.destination);var t=actx.currentTime+t0;g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol*sfxVol*2,t+(att||0.04));g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.start(t);o.stop(t+d+0.05)}
function sfxTap(){if(!sfxOn)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();[[659,0],[784,0.09],[1319,0.18]].forEach(function(a){tone(a[0],a[1],0.22,'square',0.05,3500,0.005)})}catch(e){}}
function sfx(ok){if(!sfxOn)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
 if(ok){[[1319,0],[1047,0.22]].forEach(function(a){tone(a[0],a[1],0.9,'sine',0.14,6000,0.005);tone(a[0]*2.76,a[1],0.35,'sine',0.04,8000,0.005);tone(a[0]*5.4,a[1],0.15,'sine',0.015,9000,0.005)})}
 else{tone(196,0,0.18,'triangle',0.14);tone(196,0.24,0.4,'triangle',0.14)}}catch(e){}}
(function(){var nav=document.querySelector('header nav');if(!nav)return;var l=document.createElement('label');l.className='spd';var c=document.createElement('input');c.type='checkbox';c.checked=sfxOn;c.onchange=function(){sfxOn=c.checked;try{localStorage.setItem('kihon_sfx',sfxOn?'1':'0')}catch(e){}if(sfxOn)sfx(true)};l.appendChild(c);l.appendChild(document.createTextNode('効果音'));l.appendChild(slider('kihon_sfxvol',function(){return sfxVol},function(v){sfxVol=v;clearTimeout(window.__sv);window.__sv=setTimeout(function(){if(sfxOn)sfx(true)},250)}));nav.insertBefore(l,nav.firstChild)})();
// 集中用のBGM（ピアノ＋弦のやさしい音）。曲のファイルは使わず、ブラウザで自動演奏します
var bgmOn=false;try{bgmOn=localStorage.getItem('kihon_bgm')==='1'}catch(e){}
var bgm={run:false,timer:null,master:null,bus:null,next:0,n:0,last:-1};
var TRACKS=[
{id:'field',name:'冒険のフィールド',bpm:120,p:[{b:48,c:[60,64,67],m:[72,74,76,79,84]},{b:43,c:[59,62,67],m:[71,74,79,83,86]},{b:45,c:[57,60,64],m:[72,76,81,69,84]},{b:41,c:[57,60,65],m:[72,77,81,84,69]}],
 f:function(t,s,c){if(s%8===0)bkick(t,0.45);if(s%8===4)bnz(t,0.09,0.12,'bandpass',1800);
  if(s%2===0)btn(t,c.b,'triangle',0.2,0.17,0.005,900);
  if(s%2===0&&Math.random()<0.62)btn(t,bpick(c.m),'square',0.04,0.2,0.005,2800);
  if(s%4===2)c.c.forEach(function(m){btn(t,m,'square',0.015,0.12,0.003,2500)})}},
{id:'battle',name:'戦闘（軽め）',bpm:148,p:[{b:45,c:[57,60,64],m:[81,84,88,76]},{b:41,c:[53,57,60],m:[77,81,84,72]},{b:43,c:[55,59,62],m:[79,83,86,74]},{b:40,c:[52,56,59],m:[76,80,83,71]}],
 f:function(t,s,c){if(s%8===0||s%16===6)bkick(t,0.42);if(s%8===4)bnz(t,0.1,0.1,'bandpass',2000);if(s%2===0)bnz(t,0.025,0.03,'highpass',7500);
  if(s%2===0)btn(t,c.b,'triangle',0.2,0.1,0.004,900);
  btn(t,c.c[s%3]+24,'square',0.022,0.08,0.002,3000);
  if(s%4===0&&Math.random()<0.55)btn(t,bpick(c.m),'square',0.045,0.3,0.005,3200)}},
{id:'tick',name:'ちくたく（腕時計）',bpm:60,p:[{b:0,c:[],m:[]}],
 f:function(t,s){bnz(t,s%4===0?0.75:0.55,0.022,'bandpass',5600,12)}}
];
function mf(m){return 440*Math.pow(2,(m-69)/12)}
var nbuf=null;function noise(){if(!nbuf){nbuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);var d=nbuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1}return nbuf}
function btn(t,m,type,v,dur,att,lpf){var o=actx.createOscillator(),g=actx.createGain(),lp=actx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lpf||3500;o.type=type;o.frequency.value=mf(m);o.connect(g);g.connect(lp);lp.connect(bgm.bus);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+(att||0.01));g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.start(t);o.stop(t+dur+0.05)}
function bnz(t,v,dur,ft,ff,q){var s=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();s.buffer=noise();f.type=ft;f.frequency.value=ff;if(q)f.Q.value=q;s.connect(f);f.connect(g);g.connect(bgm.bus);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.start(t);s.stop(t+dur+0.02)}
function bkick(t,v){var o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(42,t+0.12);o.connect(g);g.connect(bgm.bus);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.25);o.start(t);o.stop(t+0.28)}
function bpick(a){var k=Math.floor(Math.random()*a.length);if(k===bgm.last)k=(k+1)%a.length;bgm.last=k;return a[k]}
var bgmTrack=ldv('kihon_bgmtrack_i',0);if(!(bgmTrack>=0&&bgmTrack<TRACKS.length))bgmTrack=0;
function bsched(){if(!bgm.run)return;var T=TRACKS[bgmTrack],st=60/T.bpm/4;while(bgm.next<actx.currentTime+0.4){var c=T.p[Math.floor(bgm.n/16)%T.p.length];T.f(bgm.next,bgm.n%16,c);bgm.next+=st;bgm.n++}}
function bgmGain(){return Math.max(0.0001,1.6*bgmVol)}
function bgmStart(){if(bgm.run)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
 var m=actx.createGain(),lp=actx.createBiquadFilter(),bus=actx.createGain();lp.type='lowpass';lp.frequency.value=5000;bus.connect(lp);lp.connect(m);m.connect(actx.destination);
 m.gain.setValueAtTime(0.0001,actx.currentTime);m.gain.linearRampToValueAtTime(bgmGain(),actx.currentTime+1.5);
 bgm.master=m;bgm.bus=bus;bgm.run=true;bgm.next=actx.currentTime+0.1;bgm.n=0;bgm.last=-1;bsched();bgm.timer=setInterval(bsched,100)}catch(e){}}
function bgmStop(){if(!bgm.run)return;bgm.run=false;clearInterval(bgm.timer);try{var m=bgm.master;m.gain.cancelScheduledValues(actx.currentTime);m.gain.setValueAtTime(m.gain.value,actx.currentTime);m.gain.linearRampToValueAtTime(0.0001,actx.currentTime+1);setTimeout(function(){try{m.disconnect()}catch(e){}},1500)}catch(e){}}
(function(){var nav=document.querySelector('header nav');if(!nav)return;var l=document.createElement('label');l.className='spd';var c=document.createElement('input');c.type='checkbox';c.checked=bgmOn;c.onchange=function(){bgmOn=c.checked;try{localStorage.setItem('kihon_bgm',bgmOn?'1':'0')}catch(e){}if(bgmOn)bgmStart();else bgmStop()};l.appendChild(c);var sl=document.createElement('select');sl.className='bgmsel';sl.title='BGMの曲';TRACKS.forEach(function(t,i){var o=document.createElement('option');o.value=i;o.textContent=t.name;sl.appendChild(o)});sl.value=bgmTrack;sl.onchange=function(){bgmTrack=parseInt(sl.value,10);try{localStorage.setItem('kihon_bgmtrack_i',String(bgmTrack))}catch(e){}if(bgm.run){bgmStop();setTimeout(bgmStart,300)}};l.appendChild(document.createTextNode('BGM'));l.appendChild(slider('kihon_bgmvol',function(){return bgmVol},function(v){bgmVol=v;if(bgm.run&&bgm.master){bgm.master.gain.cancelScheduledValues(actx.currentTime);bgm.master.gain.setValueAtTime(Math.max(0.0001,1.6*v),actx.currentTime)}}));l.appendChild(sl);nav.insertBefore(l,nav.firstChild);
 if(bgmOn){var go=function(){document.removeEventListener('pointerdown',go);if(bgmOn)bgmStart()};document.addEventListener('pointerdown',go)}})();
window.addEventListener('hashchange',route);route();
})();
(function(){var f=document.querySelector('footer');if(f)f.innerHTML=f.innerHTML.replace('間違えた問題だけ復習','間違えた問題は苦手ボックスへ')})();
