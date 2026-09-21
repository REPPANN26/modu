// Integration smoke test with a minimal DOM/Canvas host, not a browser visual test.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const events={},store={},ids={};let width=1100,height=770,frame;
const context2d=new Proxy({createRadialGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function element(){return {textContent:'',dataset:{},children:[],open:false,tagName:'DIV',classList:{add(){},remove(){},toggle(){}},append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},getContext:()=>context2d,getBoundingClientRect:()=>({width,height}),addEventListener(k,f){this["event_"+k]=f},showModal(){this.open=true},close(){this.open=false},focus(){},querySelector(){return this.children[0]},setPointerCapture(){},click(){this.onclick?.()}};}
const document={getElementById:id=>ids[id]||(ids[id]=element()),querySelectorAll:()=>[],createElement:element,createTextNode:s=>s,addEventListener(){},activeElement:{tagName:'CANVAS'}};
const box={console,document,localStorage:{getItem:k=>store[k],setItem:(k,v)=>store[k]=v},devicePixelRatio:1,ResizeObserver:class{observe(){}},Image:class{complete=true;naturalWidth=1536;},requestAnimationFrame:f=>frame=f,Math,Set};box.window=box;box.addEventListener=(k,f)=>events[k]=f;
vm.createContext(box);vm.runInContext(fs.readFileSync(__dirname+'/engine.js','utf8'),box);vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),box);
assert(ids.welcome.open);assert.equal(ids.startButton.disabled,false);ids.startButton.click();assert(!ids.welcome.open);frame(16);frame(32);assert(store['modu-rpg-v1']);
const key=code=>events.keydown({code,repeat:false,preventDefault(){}});key('KeyI');assert(ids.dialogue.open);assert(ids.dialogueText.textContent.includes('kosong'));key('KeyE');assert(!ids.dialogue.open);
vm.runInContext('state.x=6;state.y=9;',box);key('KeyE');assert(ids.dialogue.open);assert(ids.dialogueText.textContent.includes('Kartu arsipku'));key('KeyE');
vm.runInContext('state.x=16;state.y=9;',box);key('KeyE');assert(ids.dialogueText.textContent.includes('Kotak ini kosong'));key('KeyE');key('ArrowUp');frame(1000);events.keyup({code:'ArrowUp'});assert.equal(JSON.parse(store['modu-rpg-v1']).box.y,7);
vm.runInContext('state.box={x:18,y:6};state.x=18;state.y=7;',box);key('KeyE');assert(ids.dialogueText.textContent.includes('meraih kartu'));key('KeyE');
vm.runInContext('state.x=6;state.y=9;',box);key('KeyE');key('KeyE');vm.runInContext('state.x=21;state.y=7;',box);key('KeyE');assert(ids.dialogueText.textContent.includes('THE GRID tetap teratur'));assert.equal(ids.choices.children[0].textContent,'Jelajahi lagi');ids.choices.children[0].click();assert(!ids.dialogue.open);
width=390;height=540;vm.runInContext('resize()',box);frame(1050);ids.helpButton.click();assert(ids.dialogueText.textContent.includes('WASD'));ids.choices.children[1].click();assert.deepEqual(JSON.parse(store['modu-rpg-v1']).box,{x:16,y:8});
console.log('PASS: UI initialization, assets ready, canvas frame at desktop/mobile sizes, keyboard dialogue, bag, box movement, full quest/ending UI, reset box and persistence. Visual browser QA remains unverified.');
