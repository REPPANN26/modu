(function(root){
'use strict';
const W=24,H=16;
const blocks=[{x:1,y:1,w:5,h:3},{x:9,y:1,w:5,h:3},{x:16,y:1,w:7,h:3},{x:1,y:13,w:7,h:2},{x:10,y:12,w:4,h:3},{x:20,y:10,w:3,h:5},{x:17,y:5,w:3,h:1}];
const people=[{id:'archivist',x:6,y:8,name:'Petugas arsip'},{id:'keeper',x:11,y:5,name:'Penjaga jalur'}];
const objects=[{id:'shelf',x:18,y:5,name:'Rak arsip'},{id:'sign',x:9,y:8,name:'Papan aturan'},{id:'stamp',x:4,y:5,name:'Stempel rute'},{id:'exit',x:21,y:6,name:'Terminal arsip'}];
function fresh(){return {version:1,x:5,y:11,face:'down',box:{x:16,y:8},quest:false,inspected:false,card:false,delivered:false,stamp:false,stampReturned:false,ended:false,steps:0};}
function wall(x,y){return x<1||y<1||x>=W-1||y>=H-1||blocks.some(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h)||people.some(p=>p.x===x&&p.y===y)||objects.some(p=>p.id!=='stamp'&&p.x===x&&p.y===y);}
function positioned(s){return s.box.x===18&&s.box.y===6;}
function move(s,dx,dy){if(s.ended)return false;s.face=dx>0?'right':dx<0?'left':dy<0?'up':'down';const x=s.x+dx,y=s.y+dy;if(wall(x,y))return false;if(x===s.box.x&&y===s.box.y){if(!s.inspected)return false;let bx=x+dx,by=y+dy;if(wall(bx,by)||(bx===18&&by===6&&s.card))return false;s.box={x:bx,y:by};}s.x=x;s.y=y;s.steps++;return true;}
function nearby(s){return [...people,...objects.filter(o=>o.id!=='stamp'||!s.stamp&&!s.stampReturned),{id:'box',...s.box,name:'OBJECT 07'}].filter(o=>Math.abs(o.x-s.x)+Math.abs(o.y-s.y)<=1).sort((a,b)=>{const d={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[s.face];return Number(b.x===s.x+d[0]&&b.y===s.y+d[1])-Number(a.x===s.x+d[0]&&a.y===s.y+d[1]);});}
function act(s,id,choice){
if(id==='archivist'){if(s.card&&!s.delivered){s.delivered=true;return 'Kartu sudah kembali. Terima kasih, MODU. Aku tambahkan “step” pada fungsi kotak itu. Ini izin aksesmu. Terminal arsip di timur sekarang bisa dibuka.';}if(s.delivered)return 'Penyimpanan tetap berguna. Pijakan juga. Dua fungsi bisa berbagi satu bentuk. Terminal arsip menunggumu di timur.';s.quest=true;return 'Kartu arsipku tertinggal di rak tinggi, di timur laut. Tangga sedang dipakai. Bisa bantu mengambilnya? Di dekat sana ada OBJECT 07, tapi labelnya hanya “storage”.';}
if(id==='keeper'){if(s.stamp){s.stamp=false;s.stampReturned=true;return 'Stempel ruteku! Terima kasih. Simpan catatan ini: “Jalur yang teratur masih punya ruang untuk berhenti dan melihat.”';}return s.stampReturned?'Hari ini jalurnya sama. Cara melihatnya berbeda.':'Aku kehilangan stempel rute di dekat blok 01, sebelah barat. Kalau menemukannya, bawa kemari. Oh, kotak kosong itu cukup kuat untuk dijadikan pijakan.';}
if(id==='stamp'){if(s.stamp||s.stampReturned)return 'Sudah diambil.';s.stamp=true;return 'Stempel rute ditemukan. Ada nomor petugas 02. Mungkin milik penjaga jalur di utara plaza.';}
if(id==='sign')return 'THE GRID = ORDER. Setiap benda mempunyai fungsi. OBJECT 07 — STORAGE ONLY. MODU berhenti sejenak: “Apakah satu fungsi berarti satu-satunya fungsi?”';
if(id==='shelf')return s.card||s.delivered?'Rak arsip sudah kosong. Satu pertanyaan kecil membuka jalan.':'Kartu terlihat, tapi terlalu tinggi. Garis putus-putus tepat di depan rak cocok untuk sebuah pijakan. Dorong OBJECT 07 ke sana.';
if(id==='box'){if(choice==='reset'){s.box={x:16,y:8};return 'OBJECT 07 kembali ke posisi awal. Coba dekati dari sisi yang berbeda.';}if(positioned(s)&&!s.card&&!s.delivered){s.card=true;return 'MODU naik ke atas kotak dan meraih kartu arsip. STORAGE + STEP. Fungsi lama tetap ada. Kemungkinan baru ditemukan. Bawa kartu kembali ke petugas arsip.';}s.inspected=true;return s.card||s.delivered?'OBJECT 07 — STORAGE + STEP. Satu benda. Lebih dari satu kemungkinan.':'Kotak ini kosong, kokoh, dan bisa digeser. Dekati dari sisi berlawanan, lalu berjalan ke arah kotak untuk mendorongnya. Bawa ke tanda di depan rak. Tekan E lagi di sana untuk naik.';}
if(id==='exit'){if(!s.delivered)return 'ARSIP / AKSES TERBATAS. Izin tersedia dari petugas arsip setelah kartu dikembalikan.';s.ended=true;return 'THE GRID tetap teratur. Satu kemungkinan baru kini tercatat.';}
return '';
}
function objective(s){return s.ended?'Kemungkinan baru tercatat.':s.delivered?'Gunakan terminal arsip di timur.':s.card?'Kembalikan kartu ke petugas arsip.':s.inspected?'Dorong OBJECT 07 ke tanda depan rak.':s.quest?'Cari OBJECT 07 di timur plaza.':'Bicara dengan petugas arsip di plaza.';}
function inventory(s){return [...(s.card&&!s.delivered?['Kartu arsip']:[]),...(s.delivered?['Izin akses','Catatan: STORAGE + STEP']:[]),...(s.stamp?['Stempel rute']:[]),...(s.stampReturned?['Catatan penjaga jalur']:[])];}
function restore(raw){try{const s=JSON.parse(raw);if(!s||s.version!==1||!Number.isInteger(s.x)||!Number.isInteger(s.y)||wall(s.x,s.y)||!s.box||!Number.isInteger(s.box.x)||!Number.isInteger(s.box.y)||wall(s.box.x,s.box.y))return fresh();const n=fresh();for(const k of Object.keys(n))if(typeof n[k]==='boolean'&&typeof s[k]!=='boolean')return fresh();if(!['up','down','left','right'].includes(s.face))return fresh();return {...n,...s};}catch{return fresh();}}
root.GridGame={W,H,blocks,people,objects,fresh,move,nearby,act,objective,inventory,positioned,restore};
if(typeof module!=='undefined')module.exports=root.GridGame;
})(typeof window!=='undefined'?window:globalThis);
