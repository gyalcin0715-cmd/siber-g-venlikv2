(function(){
'use strict';
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
function shuffle(arr){ const a = arr.slice(); for(let i = a.length - 1; i > 0; i--){ const j = rand(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= SES MOTORU (Web Audio) ================= */
const Snd = (function(){
  let ctx = null, master = null, muted = false;
  function init(){
    if(!ctx){
      try{
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      }catch(e){ ctx = null; }
    }
    if(ctx && ctx.state === 'suspended') ctx.resume();
  }
  function tone(f, d, type, v, delay, to){
    if(!ctx || muted) return;
    d = d || .15; type = type || 'sine'; v = v || .2; delay = delay || 0;
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if(to) o.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + d + .05);
  }
  function noise(d, v, delay, freq){
    if(!ctx || muted) return;
    d = d || .2; v = v || .15; delay = delay || 0; freq = freq || 1500;
    const t = ctx.currentTime + delay, len = Math.max(1, Math.floor(ctx.sampleRate * d));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate), data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const flt = ctx.createBiquadFilter(); flt.type = 'bandpass'; flt.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    src.connect(flt); flt.connect(g); g.connect(master); src.start(t);
  }
  return {
    init,
    toggle(){ muted = !muted; return muted; },
    click(){ tone(600, .06, 'square', .05); },
    key(){ tone(700 + Math.random() * 300, .025, 'square', .02); },
    ok(){ tone(740, .1, 'triangle', .15); tone(988, .12, 'triangle', .15, .08); },
    good(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, .2, 'triangle', .2, i * .08)); },
    bad(){ tone(220, .32, 'sawtooth', .18, 0, 70); noise(.2, .08, 0, 400); },
    tick(){ tone(1200, .04, 'square', .06); },
    done(){ [392, 523, 659, 784].forEach((f, i) => tone(f, .16, 'square', .09, i * .09)); },
    pop(){ noise(.18, .22, 0, 900); tone(320, .22, 'sine', .18, 0, 60); },
    rankUp(){
      tone(110, 1.4, 'sawtooth', .1, 0, 330);
      [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => { tone(f, .35, 'triangle', .2, .15 + i * .11); tone(f * 2, .25, 'sine', .07, .15 + i * .11); });
      noise(.9, .1, .1, 5000);
      tone(1568, 1.0, 'triangle', .18, .85); tone(2093, 1.0, 'sine', .1, .85);
    },
    fanfare(){
      [[523, 0], [659, .16], [784, .32], [1047, .5], [784, .78], [1047, .94], [1319, 1.2]].forEach(n => {
        tone(n[0], .32, 'square', .09, n[1]); tone(n[0] / 2, .32, 'sawtooth', .07, n[1]);
      });
      [523, 659, 784, 1047].forEach(f => tone(f, 1.6, 'triangle', .12, 1.5));
      for(let i = 0; i < 22; i++) noise(.1, .1, 1.5 + i * .09 + Math.random() * .05, 2500 + Math.random() * 3000);
    }
  };
})();
$('#muteBtn').addEventListener('click', () => {
  Snd.init();
  const m = Snd.toggle();
  $('#muteBtn').textContent = m ? '🔇' : '🔊';
});
document.addEventListener('click', e => {
  const b = e.target.closest('.btn');
  if(b && !b.disabled && !b.classList.contains('noclick')){ Snd.init(); Snd.click(); }
});

/* ================= MATRIX 0/1 YAĞMURU ================= */
(function(){
  const c = $('#matrix'), x = c.getContext('2d'), fs = 16;
  let w, h, cols, drops;
  function init(){
    w = c.width = innerWidth; h = c.height = innerHeight;
    cols = Math.ceil(w / fs);
    drops = Array.from({length: cols}, () => Math.random() * h / fs);
  }
  init(); addEventListener('resize', init);
  function draw(){
    x.fillStyle = 'rgba(5,8,10,0.09)'; x.fillRect(0, 0, w, h);
    x.font = fs + 'px monospace';
    for(let i = 0; i < cols; i++){
      x.fillStyle = Math.random() > 0.96 ? '#d9ffe9' : '#00ff9c';
      x.fillText(Math.random() > 0.5 ? '1' : '0', i * fs, drops[i] * fs);
      if(drops[i] * fs > h && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    }
  }
  if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ draw(); }
  else setInterval(draw, 60);
})();

/* ================= EFEKTLER: KONFETİ + HAVAİ FİŞEK ================= */
const fxc = $('#confetti'), fxx = fxc.getContext('2d');
const fx = {parts: [], running: false, emitUntil: 0};
const FXCOL = ['#00ff9c', '#00d9ff', '#ffb020', '#ff3b5c', '#ffffff', '#b66bff'];
function fxResize(){ fxc.width = innerWidth; fxc.height = innerHeight; }
addEventListener('resize', () => { if(fx.running) fxResize(); });
function fxStart(){
  if(fx.running) return;
  fx.running = true; fxResize(); fxc.style.display = 'block';
  requestAnimationFrame(fxLoop);
}
function addConf(n, burst){
  for(let i = 0; i < n; i++){
    fx.parts.push({t: 'c',
      x: burst ? fxc.width / 2 : Math.random() * fxc.width,
      y: burst ? fxc.height * 0.35 : -10,
      vx: burst ? (Math.random() - 0.5) * 18 : (Math.random() - 0.5) * 3,
      vy: burst ? -Math.random() * 15 - 2 : Math.random() * 3 + 2,
      s: Math.random() * 8 + 5, col: FXCOL[rand(0, FXCOL.length - 1)],
      r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, circle: Math.random() > 0.7});
  }
}
function fxLoop(){
  fxx.clearRect(0, 0, fxc.width, fxc.height);
  const now = performance.now();
  if(now < fx.emitUntil && Math.random() < 0.6) addConf(4, false);
  for(let i = fx.parts.length - 1; i >= 0; i--){
    const p = fx.parts[i];
    if(p.t === 'c'){
      p.vy += 0.18; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      if(p.y > fxc.height + 20){ fx.parts.splice(i, 1); continue; }
      fxx.save(); fxx.translate(p.x, p.y); fxx.rotate(p.r); fxx.fillStyle = p.col;
      if(p.circle){ fxx.beginPath(); fxx.arc(0, 0, p.s / 2, 0, 7); fxx.fill(); }
      else fxx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2);
      fxx.restore();
    } else {
      p.vx *= 0.97; p.vy = p.vy * 0.97 + 0.06; p.x += p.vx; p.y += p.vy; p.life--;
      if(p.life <= 0){ fx.parts.splice(i, 1); continue; }
      fxx.globalAlpha = Math.max(0, p.life / p.max);
      fxx.fillStyle = p.col; fxx.shadowColor = p.col; fxx.shadowBlur = 8;
      fxx.beginPath(); fxx.arc(p.x, p.y, 2.4, 0, 7); fxx.fill();
      fxx.globalAlpha = 1; fxx.shadowBlur = 0;
    }
  }
  if(fx.parts.length || now < fx.emitUntil) requestAnimationFrame(fxLoop);
  else { fxc.style.display = 'none'; fx.running = false; }
}
function confetti(ms){ fxStart(); fx.emitUntil = Math.max(fx.emitUntil, performance.now() + ms); addConf(220, true); }
function fireworks(x, y){
  fxStart();
  const base = FXCOL[rand(0, FXCOL.length - 1)], alt = FXCOL[rand(0, FXCOL.length - 1)];
  for(let i = 0; i < 80; i++){
    const a = Math.random() * 6.283, sp = Math.random() * 7 + 2, life = rand(45, 90);
    fx.parts.push({t: 's', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, col: Math.random() > .5 ? base : alt});
  }
}
function flash(kind){
  const f = $('#flash'); f.className = ''; void f.offsetWidth; f.className = kind;
}

/* ================= DURUM ================= */
const RANKS = [
  {name: 'ÇAYLAK', icon: '🐣'},
  {name: 'UZMAN', icon: '🛡️'},
  {name: 'AJAN', icon: '🕵️'}
];
const NEXT_HINT = ['UZMAN (Görev 2\'yi bitir)', 'AJAN (Görev 3\'ü bitir)', 'En yüksek rütbe!'];
const state = {name: '', score: 0, rank: 0, done: 0, m1Locked: false};

function show(id){
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  window.scrollTo({top: 0, behavior: 'smooth'});
}
function updateSteps(current){
  [1, 2, 3].forEach(i => {
    const el = $('#st' + i);
    el.className = 'step' + (i <= state.done ? ' done' : (i === current ? ' active' : ''));
  });
}
function updateRankHud(){
  $('#hudRank').textContent = RANKS[state.rank].name;
  $('#hudRankIcon').textContent = RANKS[state.rank].icon;
  $('#hudNext').textContent = 'Sonraki: ' + NEXT_HINT[state.rank];
}
function addScore(n){
  const from = state.score; state.score += n;
  const el = $('#hudScore'), t0 = performance.now();
  (function tick(t){
    const p = Math.min(1, (t - t0) / 700);
    el.textContent = Math.round(from + (state.score - from) * p);
    if(p < 1) requestAnimationFrame(tick);
  })(t0);
  el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  const r = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'float-score'; f.textContent = '+' + n;
  f.style.left = (r.left + r.width / 2 - 20) + 'px'; f.style.top = (r.bottom + 6) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1600);
}
function rankUp(newRank, cb){
  const old = state.rank; state.rank = newRank;
  $('#rkIcon').textContent = RANKS[newRank].icon;
  $('#rkOld').textContent = RANKS[old].name;
  $('#rkNew').textContent = RANKS[newRank].name;
  const ov = $('#rankOverlay');
  ov.classList.add('show');
  Snd.rankUp();
  const w = innerWidth, h = innerHeight;
  [[.5, .4, 100], [.25, .3, 450], [.75, .3, 800], [.5, .55, 1200]].forEach(a => {
    setTimeout(() => { fireworks(w * a[0], h * a[1]); Snd.pop(); }, a[2]);
  });
  let closed = false;
  function close(){
    if(closed) return; closed = true;
    ov.classList.remove('show'); ov.onclick = null;
    updateRankHud();
    const rs = $('#rankStat'); rs.classList.remove('glow'); void rs.offsetWidth; rs.classList.add('glow');
    if(cb) cb();
  }
  ov.onclick = close;
  setTimeout(close, 4200);
}

/* ================= GİRİŞ ================= */
$('#nameInput').addEventListener('input', e => {
  $('#startBtn').disabled = e.target.value.trim().length < 2;
});
$('#nameInput').addEventListener('keydown', e => { if(e.key === 'Enter' && !$('#startBtn').disabled) startGame(); });
$('#startBtn').addEventListener('click', startGame);
function startGame(){
  Snd.init(); Snd.done();
  state.name = $('#nameInput').value.trim();
  $('#hudName').textContent = state.name;
  updateRankHud(); updateSteps(1);
  show('screen-m1');
  setTimeout(() => $('#pw').focus(), 300);
}

/* ================= GÖREV 1: ŞİFRE ================= */
function norm(s){ return s.toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function fmtTime(s){
  if(s < 1.5) return '1 saniye';
  if(s < 60) return Math.round(s) + ' saniye';
  if(s < 3600) return Math.round(s / 60) + ' dakika';
  if(s < 86400) return Math.round(s / 3600) + ' saat';
  if(s < 86400 * 30) return Math.round(s / 86400) + ' gün';
  if(s < 86400 * 365) return Math.round(s / (86400 * 30)) + ' ay';
  return Math.max(1, Math.round(s / (86400 * 365))) + ' yıl';
}
const COMMON = /(123|234|345|456|567|678|789|890|qwe|asd|zxc|abc|bcd|cde|pass|parola|sifre|admin|siber|ajan|agent|1111|0000|password)/;
let prevMet = 0, prevTimeTxt = '';
function evalPw(sound){
  const v = $('#pw').value;
  const nv = norm(v);
  const nn = norm(state.name || '');
  const res = {
    len: v.length >= 12,
    up: /\p{Lu}/u.test(v),
    low: /\p{Ll}/u.test(v),
    num: /\d/.test(v),
    sp: /[^\p{L}\p{N}\s]/u.test(v),
    com: v.length > 0 && !COMMON.test(nv) && !/(.)\1\1/.test(v),
    nm: v.length > 0 && (nn.length < 3 || !nv.includes(nn))
  };
  const met = Object.values(res).filter(Boolean).length;
  $$('#checks li').forEach(li => {
    const ok = res[li.dataset.k];
    if(ok && !li.classList.contains('ok')){ li.classList.remove('pop'); void li.offsetWidth; li.classList.add('pop'); }
    li.classList.toggle('ok', ok);
  });
  $('#strCount').textContent = met + ' / 7 kural';
  if(sound && met > prevMet) Snd.ok();
  if(sound && met < prevMet) Snd.tick();
  prevMet = met;

  const full = met === 7;
  let secs;
  if(v.length === 0) secs = 1;
  else if(full) secs = 100 * 365 * 86400;
  else {
    const p = (met / 7) * 0.85 + Math.min(v.length, 12) / 12 * 0.15;
    secs = Math.pow(10, p * 9.4);
  }
  const t = $('#crackTime'), txt = fmtTime(secs);
  if(txt !== prevTimeTxt){ t.classList.remove('tick'); void t.offsetWidth; t.classList.add('tick'); prevTimeTxt = txt; }
  t.textContent = txt;

  const bar = $('#bar');
  bar.style.width = (v.length === 0 ? 0 : Math.round(met / 7 * 100)) + '%';
  let label, color;
  if(v.length === 0){ label = 'Henüz şifre yok'; color = 'var(--muted)'; }
  else if(met <= 2){ label = 'ÇOK ZAYIF'; color = '#ff3b5c'; }
  else if(met <= 3){ label = 'ZAYIF'; color = '#ff7a3b'; }
  else if(met <= 5){ label = 'ORTA'; color = '#ffb020'; }
  else if(met === 6){ label = 'GÜÇLÜ'; color = '#b6ff3b'; }
  else { label = 'KIRILMAZ! 🛡️'; color = '#00ff9c'; }
  bar.style.background = color;
  $('#strLabel').textContent = label; $('#strLabel').style.color = color;
  t.style.color = color;
  const btn = $('#m1Done');
  btn.disabled = !full || state.m1Locked;
  btn.classList.toggle('ready', full && !state.m1Locked);
  window.__pwMet = met; window.__pwLen = v.length;
}
$('#pw').addEventListener('input', () => { Snd.init(); Snd.key(); evalPw(true); });
$('#eye').addEventListener('click', () => { const p = $('#pw'); p.type = p.type === 'password' ? 'text' : 'password'; });
// kaba kuvvet saldırı simülasyonu
setInterval(() => {
  const el = $('#bf');
  if(!el || !$('#screen-m1').classList.contains('active')) return;
  const len = window.__pwLen || 0, met = window.__pwMet || 0;
  if(!len){ el.textContent = ''; return; }
  if(met === 7){ el.innerHTML = '🛡️ <b style="color:var(--green)">SALDIRI BAŞARISIZ</b> — şifre kırılamadı!'; return; }
  const cs = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$';
  let s = ''; for(let i = 0; i < Math.max(len, 8); i++) s += cs[rand(0, cs.length - 1)];
  if(met <= 2) el.innerHTML = '⚠ <b style="color:var(--red)">ŞİFRE KIRILDI (simülasyon)</b> — saldırgan denemesi: ' + s;
  else el.innerHTML = '⚡ Kaba kuvvet saldırısı deneniyor: <b>' + s + '</b>';
}, 90);

$('#m1Done').addEventListener('click', () => {
  if(state.m1Locked) return;
  state.m1Locked = true;
  $('#m1Done').disabled = true; $('#m1Done').classList.remove('ready'); $('#pw').disabled = true;
  addScore(100); Snd.good(); flash('good');
  fireworks(innerWidth / 2, innerHeight * .4);
  $('#m1Msg').classList.add('show');
  state.done = 1; updateSteps(2);
  setTimeout(() => { show('screen-m2'); startMission2(); }, 2800);
});

/* ================= GÖREV 2: OLTALAMA (10'dan 6 rastgele) ================= */
const MAIL_COUNT = 6, MAIL_TIME = 35, SPEED_BONUS_SEC = 12;
const MAILS = [
  { fromName:'Anadolu Banka Güvenlik', fromAddr:'guvenlik@anadolu-banka-dogrulama.xyz',
    subject:'ACİL!!! Hesabınız 24 saat içinde askıya alınacak', date:'12 Kasım 2026, 03:17',
    body:'<p>Sayın Müşterimz,</p><p>Hesabınızda şupheli bir işlem tespıt edildi. Hesabınız <b>24 saat içinde kalıcı olarak askıya alınacaktır!!!</b></p><p>Askıya alınmaması için aşağıdaki bağlantıya tıklayıp kart numaranızı ve internet bankacılığı şifrenizi acilen giriniz.</p><p>Saygılarımızla,<br>Anadolu Banka Güvenlk Birimi</p>',
    linkText:'https://www.anadolubanka.com.tr/hesabimi-dogrula', linkReal:'http://anadolu-banka-giris.xyz/dogrula?id=8372', phish:true,
    good:'Doğru! Bu bir oltalama e-postası. ① Gönderici alan adı (.xyz uzantılı "anadolu-banka-dogrulama") bankanın resmi adresi değil. ② "Müşterimz", "şupheli", "tespıt" gibi yazım hataları var. ③ Linkin görünen adresi ile gerçek adresi farklı ve güvensiz "http://" kullanıyor. ④ Acele ettirip tehdit ediyor, şifre ve kart bilgisi istiyor. Bankalar e-postayla asla şifre istemez!',
    hint:'Gönderici adresinin alan adına ve linkin gerçek hedefine dikkatlice bak. Metindeki yazım hataları ve acele ettiren dile de göz at.' },
  { fromName:'Cumhuriyet Anadolu Lisesi Müdürlüğü', fromAddr:'duyuru@cumhuriyetanadolu.meb.k12.tr',
    subject:'1. Dönem Veli Toplantısı Duyurusu', date:'12 Kasım 2026, 09:05',
    body:'<p>Sayın Velilerimiz,</p><p>2026-2027 eğitim öğretim yılı 1. dönem veli toplantısı <b>21 Kasım 2026 Cumartesi günü saat 10:00\'da</b> okulumuzda yapılacaktır.</p><p>Toplantı gündemi ve sınıf listeleri okul web sitemizin duyurular bölümünde yayımlanmıştır. Katılımınızı rica ederiz.</p><p>Saygılarımızla,<br>Cumhuriyet Anadolu Lisesi Müdürlüğü</p>',
    linkText:'https://cumhuriyetanadolu.meb.k12.tr/duyurular', linkReal:'https://cumhuriyetanadolu.meb.k12.tr/duyurular', phish:false,
    good:'Doğru! Bu e-posta güvenli. ① Gönderici adresi resmi okul alan adını (meb.k12.tr) taşıyor. ② Yazım hatası yok. ③ Linkin görünen ve gerçek adresi aynı, güvenli "https://" kullanıyor. ④ Senden şifre, kart ya da kişisel bilgi istemiyor, sadece duyuru yapıyor.',
    hint:'Her e-posta tuzak değildir! Gönderici alan adı resmi bir okul uzantısı mı? Linkin gerçek adresi görünen adresle aynı mı? Senden gizli bilgi isteniyor mu?' },
  { fromName:'HızlıKargo Teslimat', fromAddr:'teslimat@hizlikargo-takip.top',
    subject:'Paketiniz teslım edilemedi - 15 TL ödeme gerekli', date:'13 Kasım 2026, 23:48',
    body:'<p>Sayin müşterimiz,</p><p>Adınıza gelen kargo, adres hatası nedeniyle <b>teslım edilemedi</b>. Kargonuzun tekrar gönderilmesi için 15,00 TL işlem ücretini <b>12 saat içinde</b> ödeyiniz aksı halde paketiniz iade edilecektir.</p><p>Ödeme için kart bilgilerinizi giriniz. Takip no: (belirtilmemiş)</p>',
    linkText:'https://hizlikargo.com.tr/odeme', linkReal:'http://hizlikargo-odeme.top/tl/8x2', phish:true,
    good:'Doğru! Bu bir sahte kargo e-postası. ① Gönderici adresi ".top" gibi şüpheli bir uzantıya sahip. ② "teslım", "aksı halde", "Sayin" gibi yazım hataları var. ③ Link gerçekte farklı bir siteye gidiyor. ④ Küçük bir ücret karşılığında kart bilgisi isteyip süre baskısı yapıyor.',
    hint:'Gönderici alan adının uzantısına, yazım hatalarına ve linkin gerçek adresine bak. Küçük bir ödeme isteyip "12 saat" gibi süre baskısı yapılması normal mi?' },
  { fromName:'Bulutdepo Destek', fromAddr:'destek@bulutdepo.com.destek-giris.net',
    subject:'Depolama alanınız doldu - hesabınızı yükseltin', date:'14 Kasım 2026, 10:41',
    body:'<p>Merhaba,</p><p>Bulutdepo hesabınızın depolama alanı <b>%98 doluluğa</b> ulaştı. Dosyalarınızın silinmemesi için 48 saat içinde planınızı yükseltmeniz gerekmektedir.</p><p>Giriş yaparak size uygun planı seçebilirsiniz.</p><p>Teşekkürler,<br>Bulutdepo Destek Ekibi</p>',
    linkText:'https://bulutdepo.com/yukselt', linkReal:'https://bulutdepo.com.destek-giris.net/login', phish:true,
    good:'Doğru! Bu çok ustaca bir tuzak: yazım hatası yok ve "https://" kullanıyor. Ama alan adı SAĞDAN okunur: gerçek site "destek-giris.net", "bulutdepo.com" ise sadece bir alt alan adı. Gönderici adresi de aynı hileyi kullanıyor. Hatasız yazılmış olması bir e-postayı güvenli yapmaz!',
    hint:'Bu e-postada yazım hatası yok! Alan adını sağdan sola doğru okumayı dene: asıl site hangisi? Linkin gerçek hedefine bak.' },
  { fromName:'Anadolu Banka', fromAddr:'bilgi@anadolubanka.com.tr',
    subject:'Şifre değişikliği bilgilendirmesi', date:'14 Kasım 2026, 18:23',
    body:'<p>Sayın Müşterimiz,</p><p>İnternet bankacılığı şifreniz 14 Kasım 2026 saat 18:22\'de değiştirilmiştir. Bu işlemi siz yaptıysanız herhangi bir işlem yapmanıza gerek yoktur.</p><p>İşlemi siz yapmadıysanız kartınızın arkasındaki müşteri hizmetleri numarasını arayınız. Bankamız e-posta veya SMS ile şifrenizi asla istemez.</p><p>Saygılarımızla,<br>Anadolu Banka</p>',
    linkText:null, linkReal:null, phish:false,
    good:'Doğru! Bu e-posta güvenli. ① Gönderici alan adı bankanın resmi adresi (anadolubanka.com.tr). ② Bağlantı ve ek dosya yok. ③ Senden şifre ya da bilgi istemiyor, sadece bilgilendiriyor. ④ Şüphelenirsen kartın arkasındaki resmi numarayı aramanı söylüyor. Güvenlik uyarısı olması tek başına tuzak göstergesi değildir.',
    hint:'Bu e-posta senden bir şey yapmanı ya da bilgi vermeni istiyor mu? Link ya da ek dosya var mı? Gönderici alan adı resmi mi?' },
  { fromName:'Kariyer Merkezi İK', fromAddr:'ik.muduru.kariyer@gmail.com',
    subject:'Evden çalış, günde 5.000 TL kazan!', date:'14 Kasım 2026, 02:09', attach:'sozlesme.pdf.exe',
    body:'<p>Merhaba,</p><p>Profilinizi beğendik! Evden, günde sadece <b>1 saat</b> çalışarak <b>5.000 TL</b> kazanabilirsiniz. Eklenen sözleşmeyi açıp imzalayarak hemen başlayın.</p><p>Kontenjan sınırlıdır, bugün cevap vermezseniz teklif başka adaya verilecektir.</p>',
    linkText:null, linkReal:null, phish:true,
    good:'Doğru! Bu bir oltalama/zararlı yazılım tuzağı. ① Kurumsal bir şirket yerine ücretsiz bir e-posta (gmail.com) kullanıyor. ② Ek dosyanın adı "sozlesme.pdf.exe": aslında çalıştırılabilir bir program (.exe), PDF değil! ③ Gerçek olamayacak kadar iyi bir teklif. ④ Acele ettiriyor. Bu tür ekleri asla açma!',
    hint:'Ek dosyanın tam adına dikkatle bak, uzantısı gerçekten bir belge uzantısı mı? Teklifin kendisi ve gönderici adresi de gerçekçi mi?' },
  { fromName:'Cumhuriyet Anadolu Lisesi Burs Birimi', fromAddr:'burs@cumhuriyetanad0lu.meb.k12.tr',
    subject:'Burs başvurusu için SON GÜN: yarın!', date:'14 Kasım 2026, 21:30',
    body:'<p>Sayın Öğrenci/Velimiz,</p><p>Okulumuz burs başvuruları <b>yarın sona erecektir</b>. Başvurunuzu tamamlamak için <b>TC kimlik numaranızı ve banka IBAN bilginizi</b> aşağıdaki formdan paylaşınız.</p><p>Saygılarımızla,<br>Burs Birimi</p>',
    linkText:'https://cumhuriyetanadolu.meb.k12.tr/burs-formu', linkReal:'http://cumhuriyetanad0lu-burs.com/form', phish:true,
    good:'Doğru! Bu bir tuzak. ① Gönderici adresinde "cumhuriyetanad0lu" yazıyor: "o" harfi yerine sıfır (0) kullanılmış, taklit alan adı! ② Link gerçekte başka bir siteye ve güvensiz "http://" adresine gidiyor. ③ TC kimlik no ve IBAN gibi hassas bilgiler istiyor. ④ "Son gün yarın" diyerek acele ettiriyor.',
    hint:'Gönderici adresindeki harfleri tek tek, dikkatlice oku. Linkin gerçek adresi görünen adresle aynı mı? Hangi bilgiler isteniyor?' },
  { fromName:'Bilişim Kulübü', fromAddr:'bilisim.kulubu@cumhuriyetanadolu.meb.k12.tr',
    subject:'Siber Güvenlik Atölyesi - son 5 kontenjan!', date:'13 Kasım 2026, 14:12',
    body:'<p>Merhaba arkadaşlar,</p><p>Cuma günü 15:30\'da bilgisayar laboratuvarında <b>siber güvenlik atölyesi</b> yapacağız. Kontenjan 30 kişi ile sınırlı ve son 5 yer kaldı!</p><p>Katılmak istiyorsan okul sitemizdeki kulüpler sayfasından kaydını yapabilirsin.</p><p>Bilişim Kulübü</p>',
    linkText:'https://cumhuriyetanadolu.meb.k12.tr/kulupler', linkReal:'https://cumhuriyetanadolu.meb.k12.tr/kulupler', phish:false,
    good:'Doğru! Bu e-posta güvenli. "Son 5 kontenjan" gibi bir aciliyet dili var ama bu tek başına tuzak göstergesi değil. ① Gönderici alan adı resmi okul alan adı (meb.k12.tr). ② Linkin görünen ve gerçek adresi aynı ve "https://". ③ Yazım hatası yok. ④ Şifre ya da kişisel bilgi istemiyor.',
    hint:'Aciliyet dili tek başına tuzak demek değildir. Alan adı resmi mi, link aynı yere mi gidiyor, gizli bilgi isteniyor mu? Hepsine tek tek bak.' },
  { fromName:'TeknoMarket Çekiliş', fromAddr:'odul@teknomarket-kazandin.click',
    subject:'TEBRİKLER!! 50.000 TL hediye çeki kazandınız', date:'14 Kasım 2026, 04:55',
    body:'<p>Sayın kullanıcı,</p><p>1 milyonuncu ziyaretçimiz olduğunuz için <b>50.000 TL</b> değerinde hediye çeki kazandınız! Ödülünüzü teslım almak için 25 TL kargo bedelini kart ile ödeyiniz.</p><p>Bu fırsat sadece 1 saat geçerlidir!</p>',
    linkText:'https://teknomarket.com.tr/odul', linkReal:'http://teknomarket-kazandin.click/odeme', phish:true,
    good:'Doğru! Bu bir sahte çekiliş tuzağı. ① Katılmadığın bir çekilişi kazanman mümkün değil. ② ".click" uzantılı şüpheli bir alan adından geliyor. ③ Link gerçekte başka sitede. ④ Ödül için önce para (kart bilgisi) istiyor ve süre baskısı yapıyor. Gerçek ödüller para ödemeden verilir.',
    hint:'Hiç katılmadığın bir çekilişi kazanman mümkün mü? Ödül için senden para ve kart bilgisi isteniyor, linkin gerçek adresi nereye gidiyor?' },
  { fromName:'HızlıKargo Bilgilendirme', fromAddr:'bilgilendirme@hizlikargo.com.tr',
    subject:'Kargonuz yola çıktı - Takip No: HK4821937', date:'14 Kasım 2026, 11:20',
    body:'<p>Merhaba,</p><p><b>HK4821937</b> takip numaralı gönderiniz kargoya verilmiştir ve tahmini <b>2 iş günü</b> içinde teslim edilecektir.</p><p>Gönderi durumunuzu takip numaranızla web sitemizden sorgulayabilirsiniz. Bu e-posta bilgilendirme amaçlıdır; ödeme veya kişisel bilgi talep etmez.</p>',
    linkText:'https://hizlikargo.com.tr/takip/HK4821937', linkReal:'https://hizlikargo.com.tr/takip/HK4821937', phish:false,
    good:'Doğru! Bu e-posta güvenli. ① Gönderici alan adı kargo şirketinin resmi adresi (hizlikargo.com.tr). ② Gerçek bir takip numarası içeriyor. ③ Link görünen adresle aynı ve "https://". ④ Ödeme ya da kişisel bilgi istemiyor. Sahte kargo e-postasından farkı tam olarak bu.',
    hint:'Önceki sahte kargo e-postasıyla karşılaştır: alan adı resmi mi, link aynı yere mi gidiyor, senden ödeme ya da bilgi isteniyor mu?' }
];
const mst = {list: [], idx: 0, attempts: 0, solved: false, timer: null, left: MAIL_TIME, startedAt: 0, timedOut: false};

function pickMails(){
  const idxs = MAILS.map((_, i) => i);
  for(let tries = 0; tries < 100; tries++){
    const s = shuffle(idxs).slice(0, MAIL_COUNT);
    const ph = s.filter(i => MAILS[i].phish).length;
    if(ph >= 2 && MAIL_COUNT - ph >= 2) return s;
  }
  return shuffle(idxs).slice(0, MAIL_COUNT);
}
function startMission2(){
  mst.list = pickMails(); mst.idx = 0;
  loadMail();
}
function stopTimer(){ if(mst.timer){ clearInterval(mst.timer); mst.timer = null; } }
function startTimer(){
  stopTimer();
  mst.left = MAIL_TIME; mst.startedAt = performance.now(); mst.timedOut = false;
  const bar = $('#timerBar'); bar.classList.remove('low'); bar.style.width = '100%';
  $('#timeLeft').textContent = MAIL_TIME;
  let lastSec = MAIL_TIME;
  mst.timer = setInterval(() => {
    const el = (performance.now() - mst.startedAt) / 1000;
    mst.left = Math.max(0, MAIL_TIME - el);
    bar.style.width = (mst.left / MAIL_TIME * 100) + '%';
    const sec = Math.ceil(mst.left);
    $('#timeLeft').textContent = sec;
    if(sec <= 8) bar.classList.add('low');
    if(sec !== lastSec){ lastSec = sec; if(sec <= 5 && sec > 0) Snd.tick(); }
    if(mst.left <= 0){
      stopTimer();
      if(!mst.solved){
        mst.timedOut = true; mst.attempts++;
        const h = $('#mailHint');
        h.textContent = '⏰ Süre doldu! Bu e-postayı artık en fazla 50 puanla çözebilirsin. Yine de karar ver.';
        h.classList.add('show'); Snd.bad(); flash('bad');
      }
    }
  }, 100);
}
function loadMail(){
  const m = MAILS[mst.list[mst.idx]];
  mst.attempts = 0; mst.solved = false;
  $('#mailCounter').textContent = 'E-POSTA ' + (mst.idx + 1) + ' / ' + mst.list.length;
  $('#mFromName').textContent = m.fromName;
  $('#mFromAddr').textContent = m.fromAddr;
  $('#mSubject').textContent = m.subject;
  $('#mDate').textContent = m.date;
  $('#mBody').innerHTML = m.body;
  $('#mAttRow').style.display = m.attach ? 'block' : 'none';
  $('#mAtt').textContent = m.attach ? '📎 ' + m.attach : '';
  const lb = $('#linkBox');
  if(m.linkText){
    lb.className = 'linkbox';
    lb.innerHTML = '🔗 Görünen bağlantı: <a href="#" id="mLink"></a><br>⚠ Gerçek hedef adres: <span class="real" id="mReal"></span>';
    $('#mLink').textContent = m.linkText; $('#mReal').textContent = m.linkReal;
    $('#mLink').addEventListener('click', e => {
      e.preventDefault();
      const h = $('#mailHint');
      h.textContent = '🔒 Güvenlik için bağlantılar bu oyunda kapalı. Gerçek hedef adresi kutuda yazıyor!';
      h.classList.add('show');
    });
  } else {
    lb.className = 'linkbox none';
    lb.textContent = '🔗 Bu e-postada bağlantı yok.';
  }
  $('#mailHint').classList.remove('show'); $('#mailGood').classList.remove('show');
  $('#btnSafe').disabled = false; $('#btnPhish').disabled = false;
  $('#mailNext').style.display = 'none';
  $('#mailNext').textContent = mst.idx === mst.list.length - 1 ? 'GÖREVİ BİTİR ▶' : 'SONRAKİ E-POSTA ▶';
  const card = $('#mailCard'); card.classList.remove('enter'); void card.offsetWidth; card.classList.add('enter');
  startTimer();
}
function answerMail(guessPhish){
  if(mst.solved) return;
  const m = MAILS[mst.list[mst.idx]];
  if(guessPhish === m.phish){
    mst.solved = true; stopTimer();
    const elapsed = (performance.now() - mst.startedAt) / 1000;
    let pts = mst.attempts === 0 ? 100 : 50, bonus = 0;
    if(mst.attempts === 0 && elapsed <= SPEED_BONUS_SEC) bonus = 20;
    addScore(pts + bonus); Snd.good(); flash('good');
    $('#mailHint').classList.remove('show');
    const g = $('#mailGood');
    g.innerHTML = '✅ <b>+' + pts + ' puan' + (bonus ? ' + ' + bonus + ' hız bonusu ⚡' : '') + '!</b> ' + m.good;
    g.classList.add('show');
    $('#btnSafe').disabled = true; $('#btnPhish').disabled = true;
    $('#mailNext').style.display = 'inline-block';
  } else {
    mst.attempts++;
    const h = $('#mailHint');
    h.textContent = '❌ Yanlış cevap! İpucu: ' + m.hint + ' (Doğru bilirsen artık 50 puan kazanırsın.)';
    h.classList.add('show');
    h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake');
    Snd.bad(); flash('bad');
  }
}
$('#btnSafe').addEventListener('click', () => answerMail(false));
$('#btnPhish').addEventListener('click', () => answerMail(true));
$('#mailNext').addEventListener('click', () => {
  if(mst.idx < mst.list.length - 1){ mst.idx++; loadMail(); }
  else {
    state.done = 2; updateSteps(3);
    rankUp(1, () => { show('screen-m3'); startMission3(); });
  }
});

/* ================= GÖREV 3: SEZAR (10'dan 3 rastgele, 3 tur) ================= */
const CAESAR_MSGS = ['SIBER KALKAN', 'GIZLI AJAN', 'VIRUS TEMIZLE', 'SIFRE KIR', 'ANAHTAR BULUNDU',
  'KOD ADI GOLGE', 'DOSYA SIFRELI', 'ZAMAN KAPSULU', 'UZAK SUNUCU', 'AGA SIZILDI'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function caesar(str, k){
  return str.replace(/[A-Z]/g, ch => String.fromCharCode((ch.charCodeAt(0) - 65 + k % 26 + 26) % 26 + 65));
}
const c3 = {rounds: [], idx: 0, k: 1, wrong: 0, solved: false, sel: null, tiles: []};

function startMission3(){
  const msgs = shuffle(CAESAR_MSGS).slice(0, 3);
  const k2 = rand(2, 5);
  let k3 = rand(3, 9); while(k3 === k2) k3 = rand(3, 9);
  c3.rounds = [
    {plain: msgs[0], key: 1, mode: 'locked'},
    {plain: msgs[1], key: k2, mode: 'known'},
    {plain: msgs[2], key: k3, mode: 'unknown'}
  ];
  c3.idx = 0; loadRound();
}
function renderRuler(hlLetter){
  const k = c3.k;
  let top = '<div class="line top"><span class="lab">ŞİFRELİ ▼</span>';
  let bot = '<div class="line bot slide"><span class="lab">GERÇEK ▲</span>';
  ALPHA.split('').forEach((a, i) => {
    const hl = hlLetter && hlLetter === a ? ' hl' : '';
    top += '<span class="cell' + hl + '">' + a + '</span>';
    bot += '<span class="cell' + hl + '">' + ALPHA[(i - k + 26) % 26] + '</span>';
  });
  $('#ruler').innerHTML = top + '</div><div class="arrow">⟲ her şifreli harf alfabede ' + k + ' harf geri gider ⟲</div>' + bot + '</div>';
  $('#kVal').textContent = 'Kaydırma: ' + k;
}
function updateSel(){
  $$('.tile').forEach(t => { const d = t.querySelector('.d'); if(d) d.textContent = ''; });
  if(c3.sel){
    c3.sel.el.classList.add('sel');
    c3.sel.el.querySelector('.d').textContent = caesar(c3.sel.ch, -c3.k);
  }
}
function loadRound(){
  const r = c3.rounds[c3.idx];
  c3.k = 1; c3.wrong = 0; c3.solved = false; c3.sel = null; c3.tiles = [];
  $('#m3Counter').textContent = 'MESAJ ' + (c3.idx + 1) + ' / ' + c3.rounds.length;
  const info = $('#keyInfo');
  if(r.mode === 'locked') info.textContent = '🔑 Anahtar: 1 (cetvel kilitli, ısınma turu)';
  else if(r.mode === 'known') info.textContent = '🔑 Anahtar: ' + r.key + ' — cetveli bu değere ayarla';
  else info.textContent = '🔑 Anahtar: ??? — cetveli kaydırarak kendin bul!';
  const locked = r.mode === 'locked';
  $('#kPrev').disabled = locked; $('#kNext').disabled = locked;
  const enc = caesar(r.plain, r.key);
  const cw = $('#cipher'); cw.innerHTML = '';
  enc.split('').forEach((ch, i) => {
    const d = document.createElement('div');
    if(ch === ' '){ d.className = 'tile gap'; cw.appendChild(d); return; }
    d.className = 'tile in';
    d.style.animationDelay = (i * 60) + 'ms';
    d.innerHTML = '<span class="c">' + ch + '</span><span class="d"></span>';
    d.addEventListener('click', () => {
      Snd.init(); Snd.tick();
      $$('.tile').forEach(t => t.classList.remove('sel'));
      c3.sel = {el: d, ch};
      renderRuler(ch); updateSel();
    });
    cw.appendChild(d);
    c3.tiles.push({el: d, plain: r.plain[i]});
  });
  renderRuler(null);
  $('#ans').value = ''; $('#ans').disabled = false;
  $('#m3Done').disabled = false; $('#m3Done').style.display = 'inline-block';
  $('#m3Next').style.display = 'none';
  $('#m3Hint').classList.remove('show'); $('#m3Good').classList.remove('show');
  setTimeout(() => $('#ans').focus(), 400);
}
function changeK(d){
  if(c3.rounds[c3.idx].mode === 'locked') return;
  c3.k = ((c3.k - 1 + d + 25) % 25) + 1; // 1..25
  Snd.tick();
  renderRuler(c3.sel ? c3.sel.ch : null); updateSel();
}
$('#kPrev').addEventListener('click', () => changeK(-1));
$('#kNext').addEventListener('click', () => changeK(1));
function normalizeAns(s){ return s.trim().replace(/\s+/g, ' ').toLocaleUpperCase('en-US').replace(/İ/g, 'I'); }
function checkM3(){
  if(c3.solved) return;
  const r = c3.rounds[c3.idx];
  const v = normalizeAns($('#ans').value);
  const h = $('#m3Hint');
  if(v === r.plain){
    c3.solved = true;
    $('#ans').disabled = true; $('#m3Done').style.display = 'none';
    h.classList.remove('show');
    const pts = Math.max(50, 150 - 25 * c3.wrong);
    addScore(pts); Snd.good(); flash('good');
    c3.tiles.forEach((t, i) => setTimeout(() => {
      t.el.classList.remove('in', 'sel'); t.el.classList.add('flipped');
      t.el.querySelector('.c').textContent = t.plain;
      t.el.querySelector('.d').textContent = '';
      Snd.tick();
    }, i * 90));
    const g = $('#m3Good');
    g.innerHTML = '🔓 <b>+' + pts + ' puan!</b> Mesaj çözüldü: <b>' + r.plain + '</b> (anahtar: ' + r.key + '). Sezar şifresi harfleri sabit sayıda kaydırır; sadece 25 ihtimal olduğu için kolayca kırılır!';
    g.classList.add('show');
    setTimeout(() => fireworks(innerWidth / 2, innerHeight * .4), 500);
    if(c3.idx < c3.rounds.length - 1){
      $('#m3Next').style.display = 'inline-block';
    } else {
      state.done = 3; updateSteps(0);
      setTimeout(() => rankUp(2, showCertificate), 2600);
    }
  } else {
    c3.wrong++;
    h.textContent = v ? '❌ Yanlış çözüm! (Her yanlışta bu turun puanı 25 düşer, en az 50.) İpucu: cetveli ayarla, harflere tıklayarak karşılıklarını gör.' : 'Önce çözdüğün mesajı kutuya yaz.';
    if(r.mode === 'unknown' && c3.wrong >= 2) h.textContent += ' Büyük bir ipucu: anahtar 3 ile 9 arasında.';
    h.classList.add('show');
    h.classList.remove('shake'); void h.offsetWidth; h.classList.add('shake');
    Snd.bad(); flash('bad');
  }
}
$('#m3Done').addEventListener('click', checkM3);
$('#ans').addEventListener('keydown', e => { if(e.key === 'Enter') checkM3(); });
$('#m3Next').addEventListener('click', () => { c3.idx++; loadRound(); });

/* ================= SERTİFİKA ================= */
function celebrate(){
  confetti(8000);
  Snd.fanfare();
  [200, 700, 1300, 2000, 2800, 3600].forEach(t => setTimeout(() => {
    fireworks(rand(innerWidth * .15, innerWidth * .85), rand(innerHeight * .15, innerHeight * .5)); Snd.pop();
  }, t));
}
function showCertificate(){
  $('#certName').textContent = state.name.toLocaleUpperCase('tr-TR');
  $('#certScore').textContent = state.score;
  $('#certDate').textContent = 'Tarih: ' + new Date().toLocaleDateString('tr-TR', {day: 'numeric', month: 'long', year: 'numeric'});
  $('#certNo').textContent = 'Belge No: SA-' + rand(100000, 999999);
  show('screen-cert');
  celebrate();
}
$('#printBtn').addEventListener('click', () => window.print());
$('#confBtn').addEventListener('click', celebrate);
$('#restartBtn').addEventListener('click', () => {
  stopTimer();
  state.score = 0; state.rank = 0; state.done = 0; state.m1Locked = false;
  $('#hudScore').textContent = '0';
  $('#pw').value = ''; $('#pw').disabled = false; $('#pw').type = 'password';
  $('#m1Msg').classList.remove('show'); prevMet = 0; evalPw(false);
  updateRankHud();
  $$('.step').forEach(s => s.className = 'step');
  show('screen-intro');
});

updateRankHud(); updateSteps(0); evalPw(false);
})();
