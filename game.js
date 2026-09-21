'use strict';
const G=GridGame,$=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),T=64,RED='#d64232',PAPER='#f4f1e8',INK='#111111',SAVE='modu-rpg-v1';
let state=G.fresh(),saveAvailable=true;
try{const raw=localStorage.getItem(SAVE);if(raw)state=G.restore(raw);}catch{saveAvailable=false;}
let px=state.x*T+32,py=state.y*T+32,bx=state.box.x*T+32,by=state.box.y*T+32,camera={x:px,y:py},cw=0,ch=0,zoom=1,last=0,clock=0,nextMove=0,keys=new Set(),started=false,toastUntil=0;
const atlas=new Image();atlas.src='assets/characters.png';
const cuts=[[175,15,265,487],[640,15,265,487],[1100,15,265,487],[640,15,265,487],[636,525,265,487],[1090,525,270,487]];
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch{saveAvailable=false;}$('saveStatus').textContent=saveAvailable?'Tersimpan otomatis di browser ini.':'Penyimpanan tidak tersedia; sesi ini tetap bisa dimainkan.';}
function updateUI(){
$('objective').textContent=G.objective(state);const stage=state.ended?4:state.delivered?3:state.card?2:state.inspected?1:0;
document.querySelectorAll('.progress i').forEach((e,i)=>e.classList.toggle('on',i<stage));
$('hint').textContent=state.delivered?'Terminal berada di sebelah kanan rak.':state.card?'Petugas menunggu di plaza barat.':state.inspected?'Dorong dengan berjalan ke arah kotak. Jika tersangkut, reset kotak dari menu bantuan.':state.quest?'Ikuti jalan ke kanan, lalu ke utara.':'Dekati NPC tanpa wajah, lalu tekan E.';
const bag=G.inventory(state);$('count').textContent=String(bag.length).padStart(2,'0');$('inventory').replaceChildren();for(const s of bag.length?bag:['Belum ada barang']){const li=document.createElement('li');li.textContent=s;$('inventory').append(li);}save();}
function toast(s){$('toast').textContent=s;$('toast').classList.add('visible');toastUntil=clock+4;}
function closeDialog(){ $('dialogue').close(); keys.clear();canvas.focus(); }
function dialogue(speaker,text,actions){keys.clear();$('speaker').textContent=speaker;$('dialogueText').textContent=text;$('choices').replaceChildren();for(const a of actions||[{label:'Mengerti →',run:closeDialog}]){const b=document.createElement('button');b.textContent=a.label;b.onclick=a.run;$('choices').append(b);}if(!$('dialogue').open)$('dialogue').showModal();}
function ending(){dialogue('01 / POSSIBILITY RECORDED','THE GRID tetap teratur. OBJECT 07 tetap menyimpan barang. Sekarang, ia juga membantu seseorang mencapai sesuatu. MODU tidak mengubah dunia menjadi yang lain—ia memberi ruang untuk satu kemungkinan lagi. A small character. A bigger perspective.',[{label:'Jelajahi lagi',run:()=>{state.ended=false;updateUI();closeDialog();}},{label:'Main dari awal',run:reset}]);}
function interact(){if(!started||$('dialogue').open)return;if(state.ended){ending();return;}const o=G.nearby(state)[0];if(!o){toast('Dekati NPC atau objek bertanda, lalu tekan E.');return;}const text=G.act(state,o.id);updateUI();if(state.ended){ending();return;}dialogue(o.name,text,o.id==='box'?[{label:'Coba →',run:closeDialog},{label:'Kembalikan posisi kotak',run:()=>{G.act(state,'box','reset');ensureBoxClear();updateUI();closeDialog();toast('Kotak kembali ke posisi awal.');}}]:undefined);}
function ensureBoxClear(){if(state.x===state.box.x&&state.y===state.box.y){state.x=15;state.y=8;px=state.x*T+32;py=state.y*T+32;}}
function reset(){state=G.fresh();px=state.x*T+32;py=state.y*T+32;bx=state.box.x*T+32;by=state.box.y*T+32;camera={x:px,y:py};updateUI();closeDialog();toast('Selamat datang kembali di Sector 07.');}
function help(){dialogue('FIELD GUIDE / CONTROLS','WASD atau tombol panah untuk berjalan. E untuk bicara, memeriksa, atau naik ke kotak. Setelah diperiksa, dorong kotak dengan berjalan ke arahnya. I membuka tas. Tujuanmu: ambil kartu, kembalikan ke petugas, lalu buka terminal arsip.',[{label:'Kembali bermain',run:closeDialog},{label:'Reset posisi kotak',run:()=>{G.act(state,'box','reset');ensureBoxClear();updateUI();closeDialog();toast('OBJECT 07 kembali ke posisi awal.');}}]);}
function inventory(){dialogue('MODU / SLING BAG',G.inventory(state).join(' · ')||'Tas masih kosong. Barang yang ditemukan akan tersimpan di sini.');}
$('helpButton').onclick=help;$('inventoryButton').onclick=inventory;$('closeDialogue').onclick=closeDialog;
$('resetButton').onclick=()=>dialogue('MULAI ULANG','Mulai cerita dari awal? Progres tersimpan untuk prototype ini akan diganti.',[{label:'Tetap bermain',run:closeDialog},{label:'Ya, mulai ulang',run:reset}]);
$('dialogue').addEventListener('close',()=>{keys.clear();canvas.focus();});
$('welcome').addEventListener('cancel',e=>e.preventDefault());$('welcome').showModal();
function ready(){const c=$('portrait').getContext('2d');c.clearRect(0,0,400,500);c.drawImage(atlas,...cuts[0],60,0,265,487);$('startButton').disabled=false;$('startButton').textContent=state.steps?'Lanjutkan eksplorasi ↗':'Masuk The Grid ↗';}
atlas.onload=ready;atlas.onerror=()=>{$('startButton').textContent='Aset tidak ditemukan';$('startButton').insertAdjacentHTML('afterend','<p>Ekstrak seluruh ZIP; folder assets harus berada di samping index.html.</p>');};if(atlas.complete&&atlas.naturalWidth)ready();
$('startButton').onclick=()=>{started=true;$('welcome').close();canvas.focus();if(state.ended)ending();else toast('Dekati petugas arsip di depanmu. Tekan E untuk bicara.');};
const dirs={KeyW:[0,-1],ArrowUp:[0,-1],KeyS:[0,1],ArrowDown:[0,1],KeyA:[-1,0],ArrowLeft:[-1,0],KeyD:[1,0],ArrowRight:[1,0]};
window.addEventListener('keydown',e=>{if(dirs[e.code]||['KeyE','KeyI'].includes(e.code)||(e.code==='Space'&&!$('dialogue').open))e.preventDefault();if($('welcome').open)return;if($('dialogue').open){if(!e.repeat&&(e.code==='KeyE'||(['Enter','Space'].includes(e.code)&&document.activeElement?.tagName!=='BUTTON'))){e.preventDefault();$('choices').querySelector('button')?.click();}return;}if(dirs[e.code]){if(!keys.has(e.code))nextMove=0;keys.add(e.code);}if(!e.repeat){if(e.code==='KeyE')interact();if(e.code==='KeyI')inventory();if(e.code==='Escape')help();}});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;});
const codes={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD'};document.querySelectorAll('[data-dir]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(codes[b.dataset.dir]);nextMove=0;};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(codes[b.dataset.dir]);});$('touchE').onclick=interact;
function resize(){const r=canvas.getBoundingClientRect();cw=r.width;ch=r.height;const d=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(cw*d);canvas.height=Math.round(ch*d);ctx.setTransform(d,0,0,d,0,0);zoom=cw<550?.78:Math.min(1.05,Math.max(.8,cw/1050));}new ResizeObserver(resize).observe(canvas);
function poly(points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function text(s,x,y,size=12,color=INK,font='monospace'){ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.fillText(s,x,y);}
function shadow(x,y,w,h){ctx.save();ctx.translate(x,y);ctx.scale(w,h);let g=ctx.createRadialGradient(0,0,0,0,0,1);g.addColorStop(0,'#0003');g.addColorStop(1,'#0000');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,7);ctx.fill();ctx.restore();}
function cube(x,y,w,d,h,color='#eeebe3'){poly([[x,y+d],[x+w,y+d],[x+w+36,y+d+22],[x+35,y+d+22]],'#0000000b');ctx.fillStyle='#c8c5bc';ctx.fillRect(x,y-h,w,d+h);ctx.fillStyle=color;ctx.fillRect(x,y-h,w,d);ctx.strokeStyle='#bcb9b0';ctx.lineWidth=1;ctx.strokeRect(x,y-h,w,d);ctx.fillStyle='#dad7ce';ctx.fillRect(x,y+d-h,w,h);ctx.strokeStyle='#c2bfb6';ctx.strokeRect(x,y+d-h,w,h);}
function building(b,i){let x=b.x*T,y=b.y*T,w=b.w*T,d=b.h*T,h=i<3?112:75;cube(x,y,w,d,h);text(String(i+1).padStart(2,'0'),x+22,y+d-h+48,34,'#aaa79e','Helvetica');text(['CIVIC RECORDS','ROUTE CONTROL','CENTRAL ARCHIVE','RESIDENTIAL','SERVICE BLOCK','TRANSIT'][i]||'',x+22,y+d-h+70,9,'#77746d');for(let k=1;k<b.w;k++){ctx.strokeStyle='#cbc8bf';ctx.beginPath();ctx.moveTo(x+k*T,y-h);ctx.lineTo(x+k*T,y+d);ctx.stroke();}if(i<3){ctx.fillStyle='#343532';ctx.fillRect(x+w-58,y+d-52,30,52);ctx.fillStyle='#e9e6dc';ctx.fillRect(x+w-51,y+d-48,2,38);}}
function sprite(id,x,y,h=102,mirror=false,bob=0){shadow(x,y+1,34,11);ctx.save();ctx.translate(x,y-bob);if(mirror)ctx.scale(-1,1);const c=cuts[id],w=h*c[2]/c[3];if(atlas.complete&&atlas.naturalWidth)ctx.drawImage(atlas,...c,-w/2,-h,w,h);ctx.restore();}
function pin(x,y,label,active=true){ctx.fillStyle=active?INK:'#99968d';ctx.beginPath();ctx.arc(x,y,10,0,7);ctx.fill();text(label,x-3,y+4,11,PAPER);}
function box(){let x=bx-25,y=by-22;cube(x,y,50,43,31,'#e8e3d9');text('07',x+12,y+43-10,17,INK);text(state.card||state.delivered?'STORAGE + STEP':'STORAGE',x-2,y-40,8,state.card||state.delivered?RED:'#67665d');if(G.positioned(state)&&!state.card&&!state.delivered)pin(bx,by-74,'E');}
function shelf(){cube(17*T+6,5*T+3,3*T-12,52,53,'#c3c0b7');ctx.fillStyle='#a8a59d';ctx.fillRect(17*T+14,5*T+9,3*T-28,25);for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#e8e5dc':'#d6d2c7';ctx.fillRect(17*T+20+i*21,5*T+12,16,20);}text('ARCHIVE / 07',17*T+20,5*T-23,10);if(!state.card&&!state.delivered){ctx.fillStyle=PAPER;ctx.fillRect(18*T+17,5*T-42,28,18);ctx.fillStyle=INK;ctx.fillRect(18*T+21,5*T-38,12,3);text('CARD',18*T+20,5*T-27,5);}}
function terminal(){cube(21*T+10,6*T+8,42,36,56,'#e9e6dd');ctx.fillStyle=INK;ctx.fillRect(21*T+17,6*T-37,28,21);text(state.delivered?'→':'—',21*T+23,6*T-21,16,state.delivered?RED:PAPER);text('ARCHIVE →',21*T-2,6*T+65,9);}
function draw(){ctx.clearRect(0,0,cw,ch);ctx.fillStyle='#e9e6dd';ctx.fillRect(0,0,cw,ch);ctx.save();ctx.translate(cw/2-camera.x*zoom,ch/2-camera.y*zoom);ctx.scale(zoom,zoom);
ctx.fillStyle='#dfdcd3';ctx.fillRect(0,0,G.W*T,G.H*T);ctx.fillStyle='#eeebe3';ctx.fillRect(T,T,(G.W-2)*T,(G.H-2)*T);
for(let y=1;y<G.H-1;y++)for(let x=1;x<G.W-1;x++){if((x*17+y*13)%7===0){ctx.fillStyle='#e9e6dd';ctx.fillRect(x*T,y*T,T,T);}ctx.strokeStyle='#dedbd2';ctx.lineWidth=.7;ctx.strokeRect(x*T,y*T,T,T);}
ctx.fillStyle='#d9d6cd';ctx.fillRect(T,10*T,22*T,3);ctx.fillRect(8*T,T,3,14*T);text('THE GRID',2*T,11*T,43,'#cfccc3','Helvetica');text('ORDER KEEPS THINGS MOVING.',2*T,11*T+24,9,'#99968d');
for(let x=10;x<21;x+=3){text('→',x*T,10*T+40,28,'#b4b1a8');}text('07',14*T,6*T+30,65,'#dedbd2','Helvetica');text('OBJECT STATION',14*T,6*T+47,9,'#99968d');
ctx.save();ctx.setLineDash([5,5]);ctx.strokeStyle=state.card||state.delivered?RED:'#89867e';ctx.lineWidth=2;ctx.strokeRect(18*T+5,6*T+5,54,54);ctx.restore();text('STEP ?',18*T+5,7*T+16,9,state.inspected?RED:'#98958c');
G.blocks.slice(0,6).forEach(building);
// The overhead transit line belongs to the far edge of the district.
ctx.fillStyle='#bbb8b0';ctx.fillRect(T,15,22*T,12);ctx.fillStyle='#f5f2e9';ctx.fillRect(T,0,22*T,14);for(let i=3;i<23;i+=5){ctx.fillStyle='#cecbc2';ctx.fillRect(i*T,27,13,32);}
let train=clock*30%(G.W*T+220)-200;ctx.fillStyle='#e9e6dd';ctx.fillRect(train,0,176,24);ctx.fillStyle='#292a27';ctx.fillRect(train+16,4,144,10);
const layers=[{y:5*T+55,run:shelf},{y:6*T+44,run:terminal},{y:by,run:box}];
for(const n of G.people){layers.push({y:n.y*T+48,run:()=>{sprite(4,n.x*T+32,n.y*T+49,103);text(n.id==='archivist'?'01 / ARCHIVIST':'02 / ROUTE KEEPER',n.x*T-20,n.y*T+70,8,'#68665e');if(!state.delivered&&n.id==='archivist')pin(n.x*T+32,n.y*T-67,state.card?'!':'·');}});}
layers.push({y:9*T,run:()=>{cube(9*T+8,8*T+13,48,29,40,'#e9e6dc');ctx.fillStyle=INK;ctx.fillRect(9*T+14,8*T-22,36,22);text('RULE',9*T+18,8*T-9,8,PAPER);}});
if(!state.stamp&&!state.stampReturned){layers.push({y:5*T+40,run:()=>{shadow(4*T+32,5*T+44,17,6);ctx.fillStyle=INK;ctx.fillRect(4*T+20,5*T+29,25,12);ctx.fillRect(4*T+28,5*T+18,9,12);pin(4*T+32,5*T-4,'·');}});}
const moving=Math.abs(px-state.x*T-32)+Math.abs(py-state.y*T-32)>2;layers.push({y:py,run:()=>{sprite({down:0,right:1,up:2,left:3}[state.face],px,py,105,state.face==='left',moving?Math.abs(Math.sin(clock*16))*3:Math.sin(clock*2)*.4);ctx.fillStyle=RED;ctx.beginPath();ctx.arc(px,py+11,2,0,7);ctx.fill();}});
layers.sort((a,b)=>a.y-b.y).forEach(l=>l.run());ctx.restore();
}
function frame(ms){const dt=Math.min((ms-last)/1000||0,.05);last=ms;clock+=dt;
if(started&&!$('dialogue').open&&!$('welcome').open&&clock>=nextMove&&keys.size){const d=dirs[[...keys].at(-1)];if(d){const oldBox={...state.box};const moved=G.move(state,...d);nextMove=clock+.16;if(moved){if(oldBox.x!==state.box.x||oldBox.y!==state.box.y){if(G.positioned(state))toast('Pijakan pas. Tekan E di dekat kotak untuk mengambil kartu.');}updateUI();}else if(!state.inspected&&Math.abs(state.x-state.box.x)+Math.abs(state.y-state.box.y)===1)toast('Tekan E untuk memeriksa OBJECT 07 terlebih dahulu.');}}
const a=1-Math.exp(-dt*18);px+=(state.x*T+32-px)*a;py+=(state.y*T+32-py)*a;bx+=(state.box.x*T+32-bx)*a;by+=(state.box.y*T+32-by)*a;
const halfW=cw/(2*zoom),halfH=ch/(2*zoom);const cx=Math.max(halfW,Math.min(G.W*T-halfW,px)),cy=Math.max(halfH,Math.min(G.H*T-halfH,py-40));camera.x+=(cx-camera.x)*(1-Math.exp(-dt*5));camera.y+=(cy-camera.y)*(1-Math.exp(-dt*5));
const o=G.nearby(state)[0];$('prompt').hidden=!o||!started||$('dialogue').open;if(o){$('prompt').replaceChildren();const b=document.createElement('b');b.textContent='E';$('prompt').append(b,document.createTextNode(o.name));}
$('place').textContent=state.x>=16?'OBJECT STATION':state.y<=6?'CIVIC WALKWAY':'THE PLAZA';$('coordinates').textContent=`GRID / ${String(state.x).padStart(2,'0')} : ${String(state.y).padStart(2,'0')}`;
if(clock>toastUntil)$('toast').classList.remove('visible');draw();requestAnimationFrame(frame);}
updateUI();resize();requestAnimationFrame(frame);
