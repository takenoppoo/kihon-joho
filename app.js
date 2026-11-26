(function(){
var VOLS=(window.VOLS||[]).slice().sort(function(a,b){return a.vol-b.vol}), MARK=['ア','イ','ウ','エ'], KEY='kihon_wrong2';
var Q={};VOLS.forEach(function(v){v.qs.forEach(function(q,i){q.dno=i+1;q.vol=v.vol;q.id='v'+v.vol+'-'+q.no;Q[q.id]=q})});
function getQ(id){return Q[id]}
function sortIds(a){return a.slice().sort(function(x,y){var p=Q[x],r=Q[y];return p.vol-r.vol||p.no-r.no})}
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
  b.onclick=function(){toggleW(no);draw()};draw();return b;
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
function fkey(q,suf){var k='v'+pad2(q.vol)+'_ex'+q.ex+suf;if(!manifest[k]&&q.vol===1)k='ex'+q.ex+suf;return k}
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
  e.appendChild(el('p','meta',q.src?('出典：'+q.src+' 基本情報技術者試験（IPA）'):('参考書：例題'+q.ex)));
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
function home(){
  clear();
  app.appendChild(el('h1',0,'基本情報技術者 対策'));
  app.appendChild(el('p','lead','科目を選んで、分野、問題集の順に進みます。'));
  SUBJ.forEach(function(s){
    var n=0,vs=0;allFields(s).forEach(function(f){var x=volsOf(s.id,f.id);n+=qCount(x);vs+=x.length});
    app.appendChild(tile(s.name,s.desc,vs?('問題集'+vs+'冊 ／ '+n+'問'):'',s.id==='B'||vs?'#subj-'+s.id:''));
  });
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
  app.appendChild(el('p','lead','資料で学ぶ → テストで確認 → 間違えた問題だけ復習。'));
  volsOf(sid,fid).forEach(function(v){
    var c=el('div','card');
    c.appendChild(el('span','badge','第'+dn(v.vol)+'巻'));
    c.appendChild(el('h2',0,v.title));
    c.appendChild(el('p','meta','学習資料 例題'+v.qs.length+'問 ／ テスト'+v.qs.length+'問'));
    var b=el('div','btns');
    [['1. 学習資料を読む','#study-'+v.vol,1],['2. テストを受ける','#test-'+v.vol,0],['3. 間違えた問題を復習（'+volIds(load(),v.vol).length+'問）','#review-'+v.vol,0],['4. 苦手ボックス（'+volIds(loadW(),v.vol).length+'問）','#weak-'+v.vol,0]].forEach(function(x){var a=el('a','btn'+(x[2]?' primary':''),x[0]);a.href=x[1];b.appendChild(a)});
    c.appendChild(b);app.appendChild(c);
  });
}
function volIds(a,n){return a.filter(function(id){return Q[id]&&Q[id].vol===n})}
function volOf(n){for(var i=0;i<VOLS.length;i++)if(VOLS[i].vol===n)return VOLS[i];return null}
/* ---------- 学習 ---------- */
function study(n){
  var v=volOf(n);if(!v)return home();
  clear();app.appendChild(volCrumb(v,'第'+dn(v.vol)+'巻　学習資料'));
  app.appendChild(el('h1',0,'学習資料　第'+dn(v.vol)+'巻 '+v.title));
  app.appendChild(el('p','lead','読むだけ、または🔊で聞くだけで学べます。答えと解説は最初から表示しています。'));
  v.qs.slice().sort(function(a,b){return a.ex-b.ex}).forEach(function(q){
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
  var a=el('a','btn primary','テストへ進む');a.href='#test-'+v.vol;var w=el('div','btns');w.appendChild(a);app.appendChild(w);
}
/* ---------- 出題（テスト・復習 共通） ---------- */
function run(items,mode,title){
  var queue=items.slice(),done=0,total=items.length,log={},firstTry={};
  var wrongNow=load();
  function show(){
    clear();
    (function(){var vv=volOf(parseInt(title,10));if(vv)app.appendChild(volCrumb(vv,'第'+dn(vv.vol)+'巻　'+(mode==='test'?'テスト':mode==='weak'?'苦手ボックス':'復習')))})();
    if(!queue.length)return finish();
    var it=queue[0],q=it.q,sel=-1,fixed=false;
    app.appendChild(el('h1',0,mode==='test'?'テスト　第'+dn(title)+'巻':mode==='weak'?'第'+dn(title)+'巻　苦手ボックス':'第'+dn(title)+'巻　復習（間違えた問題）'));
    var bar=el('div','bar'),i=el('i');i.style.width=(done/total*100)+'%';bar.appendChild(i);app.appendChild(bar);
    var c=el('div','card');c.appendChild(chk(q.id));
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
      var ws=load();
      if(ok){queue.shift();done++;ws=ws.filter(function(n){return n!==q.id})}
      else{ // 間違えたら解説のあと、選択肢の順番を変えて同じ問題をもう一度出す
        queue.shift();var again=prepare([q.id])[0];queue.push(again);
        if(ws.indexOf(q.id)<0)ws.push(q.id);
      }
            save(ws);countNav();
      go.style.display='none';
      var nx=el('button','btn primary',queue.length?'次へ':'結果を見る');nx.onclick=show;
      var w2=el('div','btns');w2.appendChild(nx);area.appendChild(w2);
      if(!ok)area.appendChild(el('p','meta','この問題は、あとでもう一度出ます。'));
    };
  }
  function finish(){
    clear();
    var keys=Object.keys(firstTry),good=keys.filter(function(k){return firstTry[k]}).length;
    var c=el('div','card');
    c.appendChild(el('div','meta',mode==='test'?'テスト結果':'復習結果'));
    c.appendChild(el('p','score',good+' / '+keys.length));
    c.appendChild(el('p','lead',mode==='test'?'1回目で正解した数です。間違えた問題は、解き直して正解するまで出しました。解けた問題は、復習の一覧から消えます。':mode==='weak'?'苦手ボックスの中身は、そのまま残っています。出すのは、苦手ページで外してください。':'すべて正解できました。復習の一覧は空になりました。'));
    var ul=el('ul','list');
    sortIds(keys).forEach(function(k){
      var li=el('li');li.appendChild(el('b',firstTry[k]?'o':'x',firstTry[k]?'○':'×'));li.appendChild(el('span',0,qLabel(Q[k])+'　'+qShort(Q[k])));ul.appendChild(li)});
    c.appendChild(ul);
    var w=el('div','btns'),a=el('a','btn primary','目次へ');a.href='#field-A-sec';w.appendChild(a);
    if(mode==='test'){var r=el('button','btn','もう一度テスト');r.onclick=function(){test(parseInt(title,10))};w.appendChild(r)}
    c.appendChild(w);app.appendChild(c);
  }
  show();
}
function test(n){
  var v=volOf(n);if(!v)return home();
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
  app.appendChild(el('p','lead','テストや復習の右上の「□ 苦手」にチェックした問題が入ります。ここから外すこともできます。'));
  var c=el('div','card');
  if(!ids.length){c.appendChild(el('p',0,'まだ入っていません。'));var a0=el('a','btn primary','目次へ');a0.href='#field-A-sec';c.appendChild(a0);app.appendChild(c);return}
  var ul=el('ul','list');
  ids.forEach(function(id){
    var li=el('li');li.appendChild(el('span',0,qLabel(Q[id])+'　'+qShort(Q[id])));
    var rm=el('button','btn','外す');rm.style.marginLeft='auto';rm.onclick=function(){toggleW(id);weak(n)};li.appendChild(rm);ul.appendChild(li)});
  c.appendChild(ul);
  var w=el('div','btns'),go=el('button','btn primary','苦手だけ解く（'+ids.length+'問）');go.onclick=function(){run(prepare(volIds(loadW(),n)),'weak',String(n))};
  w.appendChild(go);c.appendChild(w);app.appendChild(c);
}
function route(){
  var h=(location.hash||'#top').slice(1),m=/^(study|test|review|weak)-(\d+)$/.exec(h),ms=/^subj-([AB])$/.exec(h),mf=/^field-([AB])-(\w+)$/.exec(h);
  countNav();
  if(ms)return subjPage(ms[1]);
  if(mf)return fieldPage(mf[1],mf[2]);
  var n=m&&parseInt(m[2],10);
  if(m){({study:study,test:test,review:review,weak:weak})[m[1]](n)}
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
var bgm={run:false,timer:null,master:null,next:0,ci:0};
var BPM=104,BT=60/BPM,CH=[{b:48,c:[60,64,67],m:[67,72,76,79,81]},{b:43,c:[59,62,67],m:[71,74,79,67,83]},{b:45,c:[57,60,64],m:[72,76,81,69,79]},{b:41,c:[57,60,65],m:[72,77,81,69,76]}];
function mf(m){return 440*Math.pow(2,(m-69)/12)}
var nbuf=null;function noise(){if(!nbuf){nbuf=actx.createBuffer(1,actx.sampleRate,actx.sampleRate);var d=nbuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1}return nbuf}
function bnote(f,t,vol,dur,type,att){var o=actx.createOscillator(),g=actx.createGain();o.type=type;o.frequency.value=f;o.connect(g);g.connect(bgm.bus);g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(vol,t+att);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);o.start(t);o.stop(t+dur+0.05)}
function bkick(t,v){var o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);o.connect(g);g.connect(bgm.bus);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);o.start(t);o.stop(t+0.3)}
function bnz(t,v,dur,ft,ff,q){var s=actx.createBufferSource(),f=actx.createBiquadFilter(),g=actx.createGain();s.buffer=noise();f.type=ft;f.frequency.value=ff;if(q)f.Q.value=q;s.connect(f);f.connect(g);g.connect(bgm.bus);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.start(t);s.stop(t+dur+0.02)}
function bsched(){if(!bgm.run)return;while(bgm.next<actx.currentTime+2.5){var c=CH[bgm.ci%CH.length],t0=bgm.next,E=BT/2,last=-1;
 for(var j=0;j<8;j++){var t=t0+j*E;
  if(j===0||j===4)bkick(t,0.5);
  if(j===2||j===6)bnz(t,0.1,0.14,'bandpass',1600,0.8);
  bnz(t,j%2?0.05:0.028,0.05,'highpass',7000);
  if(j===0||j===3||j===4||j===6)bnote(mf(c.b),t,0.22,j===0?0.5:0.26,'triangle',0.01);
  if(j%2===1)c.c.forEach(function(m){bnote(mf(m),t,0.045,0.2,'square',0.005)});
  if(Math.random()<(j%2?0.4:0.55)){var k=Math.floor(Math.random()*c.m.length);if(k===last)k=(k+1)%c.m.length;last=k;var f=mf(c.m[k]);bnote(f,t,0.07,0.5,'triangle',0.008);bnote(f*2,t,0.015,0.25,'sine',0.008)}}
 bgm.next+=BT*4;bgm.ci++}}
function bgmStart(){if(bgm.run)return;try{actx=actx||new (window.AudioContext||window.webkitAudioContext)();if(actx.state==='suspended')actx.resume();
 var m=actx.createGain(),lp=actx.createBiquadFilter(),d=actx.createDelay(1),fb=actx.createGain(),wet=actx.createGain();lp.type='lowpass';lp.frequency.value=5000;d.delayTime.value=BT*0.75;fb.gain.value=0.25;wet.gain.value=0.22;
 var bus=actx.createGain();bus.connect(lp);bus.connect(d);d.connect(fb);fb.connect(d);d.connect(wet);wet.connect(lp);lp.connect(m);m.connect(actx.destination);
 m.gain.setValueAtTime(0.0001,actx.currentTime);m.gain.linearRampToValueAtTime(Math.max(0.0001,1.1*bgmVol),actx.currentTime+2);
 bgm.master=m;bgm.bus=bus;bgm.run=true;bgm.next=actx.currentTime+0.2;bgm.ci=0;bsched();bgm.timer=setInterval(bsched,500)}catch(e){}}
function bgmStop(){if(!bgm.run)return;bgm.run=false;clearInterval(bgm.timer);try{var m=bgm.master;m.gain.cancelScheduledValues(actx.currentTime);m.gain.setValueAtTime(m.gain.value,actx.currentTime);m.gain.linearRampToValueAtTime(0.0001,actx.currentTime+1);setTimeout(function(){try{m.disconnect()}catch(e){}},1500)}catch(e){}}
(function(){var nav=document.querySelector('header nav');if(!nav)return;var l=document.createElement('label');l.className='spd';var c=document.createElement('input');c.type='checkbox';c.checked=bgmOn;c.onchange=function(){bgmOn=c.checked;try{localStorage.setItem('kihon_bgm',bgmOn?'1':'0')}catch(e){}if(bgmOn)bgmStart();else bgmStop()};l.appendChild(c);l.appendChild(document.createTextNode('BGM'));l.appendChild(slider('kihon_bgmvol',function(){return bgmVol},function(v){bgmVol=v;if(bgm.run&&bgm.master){bgm.master.gain.cancelScheduledValues(actx.currentTime);bgm.master.gain.setValueAtTime(Math.max(0.0001,1.1*v),actx.currentTime)}}));nav.insertBefore(l,nav.firstChild);
 if(bgmOn){var go=function(){document.removeEventListener('pointerdown',go);if(bgmOn)bgmStart()};document.addEventListener('pointerdown',go)}})();
window.addEventListener('hashchange',route);route();
})();

