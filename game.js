(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dialog=$('gameDialog'), canvas=$('gameCanvas'), ctx=canvas.getContext('2d');
  let W=420; const H=720,GROUND=678,R=30,RX=42;
  let state='ready',raf=0,last=0,elapsed=0,distance=0,score=0,boost=0,passed=0,lastGateCenter=330,gateZones=[],lastZone=-1,zoneRun=0; 
  let fences=[],foods=[],particles=[],spawn=0,gateNumber=0,best=0,lastSound=-10;
  const pig={x:W*.25,y:330,vy:-80};
  const sprite=new Image(),texture=new Image();
  sprite.src='assets/cerdito-salto.png';texture.src='assets/fondo.png';
  let spriteBounds=null;
  sprite.onload=()=>{const c=document.createElement('canvas');c.width=sprite.width;c.height=sprite.height;const g=c.getContext('2d');g.drawImage(sprite,0,0);const a=g.getImageData(0,0,c.width,c.height).data;let l=c.width,t=c.height,r=0,b=0;for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(a[(y*c.width+x)*4+3]>25){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y)}spriteBounds=[l,t,r-l+1,b-t+1];if(state!=='playing')draw()};
  try{best=Number(localStorage.getItem('agrodig-game-best'))||0}catch{}
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function updateHUD(){ $('gamePoints').textContent=score; $('gameGates').textContent=passed; $('gameBest').textContent=best; $('gameBoostFill').style.width=`${boost/4*100}%`; }
  function say(text){$('gameAnnouncement').textContent=text}
  function overlay(title,text,button){$('gameOverlay').hidden=false;$('gameOverlayTitle').textContent=title;$('gameOverlayText').textContent=text;$('gameStart').querySelector('span').textContent=button;}
  function reset(){elapsed=distance=score=boost=gateNumber=passed=0;lastGateCenter=330;gateZones=[];lastZone=-1;zoneRun=0;lastSound=-10;spawn=180;fences=[];foods=[];particles=[];Object.assign(pig,{x:W*.25,y:330,vy:-80});say('Recoge harina y busca los cristales azules.');updateHUD()}
  function start(){reset();state='playing';$('gameOverlay').hidden=true;window.pigSounds.play();canvas.focus({preventScroll:true});last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
  function pause(){if(state!=='playing')return;state='paused';cancelAnimationFrame(raf);overlay('Un respiro.','Tu cerdito te espera. Continúa cuando quieras.','Continuar');say('Partida en pausa.');draw()}
  function resume(){state='playing';$('gameOverlay').hidden=true;last=performance.now();raf=requestAnimationFrame(frame);canvas.focus({preventScroll:true})}
  function finish(won=false){if(state!=='playing')return;window.pigSounds.play();state=won?'won':'over';cancelAnimationFrame(raf);best=Math.max(best,score);try{localStorage.setItem('agrodig-game-best',String(best))}catch{}updateHUD();overlay(won?'¡Ganaste!':'¡Otra vuelta!',won?`¡Superaste las 100 cercas! Recolectaste ${score} puntos. El potrero ya es tuyo.`:`Pasaste ${passed} de 100 cercas y reuniste ${score} puntos. ¡Vuelve a intentarlo!`,'Jugar otra vez');say(won?'¡Victoria! 100 cercas superadas.':`Fin de la partida: ${passed} cercas.`);draw()}
  function difficulty(){const level=Math.min(1,passed/100);return{gap:260-90*level,spacing:520-210*level,speed:220+Math.min(160,elapsed*.8+passed*.6)}}
  function nextGateZone(){
    if(lastZone>=0&&zoneRun<2&&Math.random()<.16){zoneRun++;return lastZone}
    if(!gateZones.length){gateZones=[0,1,2];for(let i=2;i>0;i--){const j=Math.floor(Math.random()*(i+1));[gateZones[i],gateZones[j]]=[gateZones[j],gateZones[i]]}}
    let index=gateZones.findIndex(z=>z!==lastZone);if(index<0){gateZones=[0,1,2].filter(z=>z!==lastZone);index=Math.floor(Math.random()*gateZones.length)}
    const zone=gateZones.splice(index,1)[0];zoneRun=zone===lastZone?zoneRun+1:1;lastZone=zone;return zone;
  }
  function addGate(){const d=difficulty(),zone=nextGateZone();const anchors=[GROUND*.31,GROUND*.5,GROUND*.69];const center=clamp(anchors[zone]+(Math.random()-.5)*36,70+d.gap/2,GROUND-d.gap/2-45);lastGateCenter=center;const x=W+65;fences.push({x,w:49,top:center-d.gap/2,bottom:center+d.gap/2,scored:false});gateNumber++;for(let i=0;i<3;i++)foods.push({x:x+15+i*49,y:center+Math.sin(i*1.9)*15,type:'food',used:false});if(gateNumber%3===1)foods.push({x:x+160,y:center-25,type:'bonus',used:false})}
  function spark(x,y,color,n=12){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.7)*140,t:.7,color})}
  function eat(item){item.used=true;if(item.type==='bonus'){boost=4;score+=20;spark(item.x,item.y,'#69b7c5',24);say('¡Turbo de sucralosa! 4 segundos a máxima velocidad.');window.pigSounds.play();lastSound=elapsed}else{score+=10;spark(item.x,item.y,'#d5a25d',9);say('¡Ñam! +10');if(elapsed-lastSound>.7){window.pigSounds.play();lastSound=elapsed}}updateHUD()}
  function hit(){spark(pig.x,pig.y,'#c67d63',18);finish()}
  function update(dt){elapsed+=dt;const speed=difficulty().speed*(boost>0?1.65:1);const travel=speed*dt;distance+=travel;boost=Math.max(0,boost-dt);spawn-=travel;if(spawn<=0){addGate();spawn=difficulty().spacing}
    pig.vy=Math.min(760,pig.vy+1250*dt);pig.y+=pig.vy*dt;
    if(pig.y+R>=GROUND||pig.y-R<=0){hit();return}
    for(const f of fences){f.x-=travel;if(pig.x+RX>=f.x&&pig.x-RX<=f.x+f.w&&(pig.y-R<=f.top||pig.y+R>=f.bottom)){hit();return}if(!f.scored&&f.x+f.w<pig.x-RX){f.scored=true;passed++;score+=5;updateHUD();if(passed>=100){finish(true);return}}}
    for(const f of foods){f.x-=travel;if(!f.used&&Math.hypot(f.x-pig.x,f.y-pig.y)<R+15)eat(f)}
    fences=fences.filter(f=>f.x>-80);foods=foods.filter(f=>f.x>-35&&!f.used);particles=particles.filter(p=>p.t>0);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=90*dt;p.t-=dt} $('gameBoostFill').style.width=`${boost/4*100}%`;
  }
  function wash(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
  function fence(x,y,h){if(h<1)return;ctx.save();ctx.beginPath();ctx.rect(x-3,y,55,h);ctx.clip();for(let i=0;i<3;i++){const px=x+i*17;ctx.fillStyle=i%2?'#ae9879':'#c1ab89';ctx.beginPath();ctx.moveTo(px,y+10);ctx.lineTo(px+7,y);ctx.lineTo(px+14,y+10);ctx.lineTo(px+13,y+h);ctx.lineTo(px+1,y+h);ctx.closePath();ctx.fill();ctx.strokeStyle='#8c785c';ctx.lineWidth=1.1;ctx.stroke();ctx.strokeStyle='#927b583f';for(let j=0;j<3;j++){ctx.beginPath();ctx.moveTo(px+3+j*3,y+15);ctx.bezierCurveTo(px+7,y+h*.3,px+4+j*3,y+h*.6,px+3+j*3,y+h);ctx.stroke()}}
    for(let yy=y+35;yy<y+h;yy+=82){ctx.fillStyle='#b59b79';ctx.fillRect(x-4,yy,57,10);ctx.strokeStyle='#7c7155';ctx.strokeRect(x-4,yy,57,10)}ctx.restore();}
  function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#edf4ef';ctx.fillRect(0,0,W,H);wash(110,110,250,150,'#b7d8e755');wash(350,60,190,110,'#b8dae74a');
    for(let i=0;i<7;i++){const x=((i*100-distance*.15)%650+650)%650-100;wash(x,GROUND+14,115,70,'#aec29b4f');wash(x+30,GROUND+30,70,56,'#8cac8455')}
    ctx.fillStyle='#dfd5ba';ctx.fillRect(0,GROUND,W,H-GROUND);for(let i=0;i<40;i++){const x=((i*29-distance*.7)%450+450)%450;ctx.strokeStyle=i%3?'#a9ad8170':'#c0a07670';ctx.beginPath();ctx.moveTo(x,GROUND+18+i%15);ctx.lineTo(x+4,GROUND+12+i%15);ctx.stroke()}
    if(texture.complete&&texture.naturalWidth){ctx.globalAlpha=.19;ctx.drawImage(texture,0,0,W,H);ctx.globalAlpha=1}
    for(const f of fences){fence(f.x,0,f.top);fence(f.x,f.bottom,GROUND-f.bottom);}
    for(const f of foods){ctx.save();ctx.translate(f.x,f.y);if(f.type==='bonus'){ctx.rotate(Math.sin(elapsed*3)*.15);wash(0,0,26,26,'#82c5d035');ctx.fillStyle='#82bcc9';ctx.strokeStyle='#376d86';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-14,-13);ctx.lineTo(7,-17);ctx.lineTo(17,0);ctx.lineTo(7,15);ctx.lineTo(-12,12);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffffc9';ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(4,-10);ctx.lineTo(9,1);ctx.moveTo(-24,-23);ctx.lineTo(-24,-15);ctx.moveTo(-28,-19);ctx.lineTo(-20,-19);ctx.stroke()}else{wash(0,4,17,8,'#b7833930');for(let i=0;i<12;i++){const a=i*2.4,r=3+i*.8;wash(Math.cos(a)*r,Math.sin(a)*r,3.4,2.5,i%2?'#c9924c':'#e3bb71')}}ctx.restore()}
    if(boost>0){for(let i=0;i<5;i++)wash(pig.x-40-i*13,pig.y+Math.sin(elapsed*9+i)*8,19-i*2,5,'#78b6c333')}
    ctx.save();ctx.translate(pig.x,pig.y);ctx.rotate(clamp(pig.vy*.0018,-.45,.65));ctx.scale(-1,1);if(sprite.complete&&sprite.naturalWidth){const b=spriteBounds||[0,0,sprite.width,sprite.height];ctx.drawImage(sprite,...b,-49,-35,98,70)}else{wash(0,0,35,22,'#d9a08b');wash(30,0,15,13,'#ddad9b')}ctx.restore();
    for(const p of particles){ctx.globalAlpha=Math.min(1,p.t*2);wash(p.x,p.y,3,3,p.color)}ctx.globalAlpha=1;
    if(boost>0){ctx.font='bold 15px Candara, sans-serif';ctx.textAlign='center';ctx.fillStyle='#356c80';ctx.fillText(`¡Impulso! ${Math.ceil(boost)} s`,W/2,78)}
  }
  function frame(t){if(state!=='playing')return;const dt=Math.min(.034,(t-last)/1000);last=t;update(dt);draw();if(state==='playing')raf=requestAnimationFrame(frame)}
  function flap(){if(state!=='playing')return;pig.vy=-480;if(elapsed-lastSound>.45){window.pigSounds.play();lastSound=elapsed}}
  canvas.addEventListener('pointerdown',e=>{if(!e.isPrimary)return;e.preventDefault();flap()});
  canvas.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)flap()}else if(e.key.startsWith('Arrow'))e.preventDefault();else if(e.key==='p'||e.key==='P'){e.preventDefault();state==='playing'?pause():state==='paused'&&resume()}});
  $('gameStart').addEventListener('click',()=>state==='paused'?resume():start());
  $('gameExit').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>{state='ready';cancelAnimationFrame(raf);window.pigSounds.stop();$('homeBtn').click()});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});window.addEventListener('blur',()=>{if(dialog.open)pause()});
  $('gameBtn').addEventListener('click',()=>{state='ready';overlay('¡Al potrero!', 'Toca para impulsarte hacia arriba. Cada toque cuenta: evita el suelo y las cercas. Supera 100 para ganar; el escenario acelera y los pasos se estrechan.','Empezar a jugar');dialog.showModal();resize();reset();draw()});
  function resize(){const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return;const old=W;W=Math.max(220,box.width/box.height*H);canvas.width=Math.round(W);canvas.height=H;if(old){pig.x*=W/old;fences.forEach(f=>f.x*=W/old);foods.forEach(f=>f.x*=W/old)}draw()}
  new ResizeObserver(()=>{if(dialog.open)resize()}).observe(canvas);
  reset();draw();
})();



