'use strict';
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const studies={
  zhang:{type:'ESTUDIO EXPERIMENTAL DE ALIMENTACIÓN',title:'¿El dulzor cambia lo que el lechón elige comer?',meta:['Zhang et al. · 2020','Sucralosa: 150 mg/kg','Preferencia y consumo'],body:'La publicación reúne tres ensayos: una prueba de elección con 48 lechones, una comparación de dosis con 180 y una evaluación con 108. En la elección, los animales prefirieron el alimento con sucralosa. En el ensayo de dosis, 150 mg/kg registraron mayor consumo y ganancia diaria de peso durante 28 días.',chart:{title:'Consumo diario medio · ensayo de dosis · días 0–28',control:551,sucralose:624,max:700,unit:'g/día'},detail:'La tabla del ensayo muestra 551 frente a 624 g/día de consumo. No se detectó una diferencia significativa en la eficiencia alimenticia; cantidades por encima de 150 mg/kg podían reducir el consumo.',meaning:'Aporta evidencia directa de preferencia y consumo para seleccionar el atributo sensorial.',url:'https://doi.org/10.5713/ajas.18.0863',label:'Leer Zhang et al. (2020)'},
  daly:{type:'INVESTIGACIÓN DEL RECEPTOR PORCINO',title:'¿Por qué la sucralosa puede producir una señal dulce?',meta:['Daly et al. · 2021','Receptor T1R2–T1R3','Mecanismo biológico'],body:'Los investigadores estudiaron la activación del receptor porcino del sabor dulce en un modelo celular y su relación con la respuesta del receptor intestinal. La sucralosa activó T1R2–T1R3; también se observó una respuesta del transportador intestinal de glucosa SGLT1.',detail:'Esta investigación ayuda a explicar la respuesta biológica a determinados edulcorantes. Su pregunta central fue el mecanismo receptor, no la preferencia por una fórmula comercial.',meaning:'Da una base biológica al interés por el sabor dulce en el cerdo.',url:'https://doi.org/10.1016/j.bbrc.2021.01.032',label:'Leer Daly et al. (2021)'},
  review:{type:'REVISIÓN SISTEMÁTICA',title:'Una mirada al conjunto de la investigación.',meta:['Jansen & Kim · 2024','Diversos edulcorantes','Síntesis de evidencia'],body:'Esta revisión integra estudios sobre edulcorantes no nutritivos en cerdos. Examina consumo, preferencia, crecimiento y respuestas fisiológicas, y reúne diseños con distintos ingredientes, dosis y edades.',detail:'La síntesis muestra que el efecto depende del edulcorante, la cantidad y las condiciones de alimentación. En la evidencia de sucralosa destaca el trabajo de Zhang y la investigación del receptor porcino.',meaning:'Permite situar los ensayos individuales dentro de un panorama científico más amplio.',url:'https://doi.org/10.3390/ani14203032',label:'Leer Jansen & Kim (2024)'},
  specht:{type:'REVISIÓN TEMÁTICA',title:'Del sabor a la adaptación al alimento sólido.',meta:['Specht et al. · 2026','Palatabilidad','Lechones recién destetados'],body:'La revisión aborda los aditivos que modifican la palatabilidad durante el destete. Conecta percepción del sabor, aceptación del alimento y adaptación a la alimentación sólida, y reúne resultados sobre distintos mejoradores sensoriales, incluida la sucralosa.',detail:'El destete implica cambios de dieta y entorno. La revisión presenta la palatabilidad como una herramienta nutricional para acompañar esa transición; sintetiza investigaciones previas.',meaning:'Ayuda a comprender por qué el atractivo sensorial importa especialmente en esta etapa.',url:'https://doi.org/10.1002/aro2.70039',label:'Leer Specht et al. (2026)'},
  jansen:{type:'ESTUDIO EXPERIMENTAL DE ALIMENTACIÓN',title:'Una respuesta de consumo al inicio del destete.',meta:['Jansen et al. · 2026','288 lechones · 48 corrales','Sucralosa: 150 mg/kg'],body:'El estudio comparó una dieta base con sucralosa, neotame y carbadox durante 28 días. La sucralosa aumentó el consumo en la primera fase, días 0–14. También se observaron indicadores favorables de estructura intestinal en el día 14.',chart:{title:'Consumo diario medio · primera fase · días 0–14',control:192,sucralose:207,max:240,unit:'g/día'},detail:'El crecimiento inicial mostró una tendencia (P = 0,093), al igual que la menor frecuencia de diarrea. El consumo fue menor entre los días 21–28 y no aumentó de forma significativa en el periodo completo.',meaning:'Refuerza el interés por el consumo temprano y muestra por qué conviene leer los resultados por fases.',url:'https://doi.org/10.1093/jas/skag005',label:'Leer Jansen et al. (2026)'}
};
let current=0, inJourney=false, sound=true, reactionTimer, navToken=0;
const titles=['Origen','Producto','Sucralosa','Estudios','Guatemala','Ruta','Entrada','ODS'];
const hints=['El producto espera del otro lado.','Descubre el ingrediente que hace la diferencia.','Sigamos la pista de los estudios.','La ciencia también dialoga con el mercado.','Ahora, acompaña el viaje del producto.','Del trayecto al primer pedido.','Conoce cómo se conecta con el desarrollo sostenible.','Llegaste al final. Puedes volver al inicio.'];
const nav=$('#chapterButtons');
titles.forEach((title,i)=>{const b=document.createElement('button');b.type='button';b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>${title}`;b.setAttribute('aria-label',`Ir al capítulo ${i+1}: ${title}`);b.addEventListener('click',()=>showChapter(i));nav.append(b)});
function reducedMotion(){return window.matchMedia('(prefers-reduced-motion: reduce)').matches}
async function showChapter(index,{animate=true,focus=true}={}){
  if(index<0||index>=titles.length)return;
  const token=++navToken;
  const changed=inJourney&&index!==current;
  if(changed&&animate&&!reducedMotion()){
    $('#chapterStage').classList.add('is-changing');
    $('#transitionPig').classList.remove('run');void $('#transitionPig').offsetWidth;$('#transitionPig').classList.add('run');
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  if(token!==navToken)return;
  current=index;inJourney=true;$('#welcome').hidden=true;$('#journey').hidden=false;
  $$('.chapter').forEach((ch,i)=>ch.hidden=i!==current);
  $$('#chapterButtons button').forEach((b,i)=>{b.classList.toggle('active',i===current);if(i===current)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
  $('#progressFill').style.width=`${(index+1)/titles.length*100}%`;
  $('#chapterCount').textContent=`${String(index+1).padStart(2,'0')} / ${String(titles.length).padStart(2,'0')}`;
  $('#nextHint').textContent=hints[index];$('#prevBtn').disabled=index===0;
  $('#nextBtn').setAttribute('aria-label',index===titles.length-1?'Volver al inicio':'Capítulo siguiente');
  $('#chapterStage').classList.remove('is-changing');
  if(focus)$(`#title-${index}`).focus({preventScroll:true});
  window.scrollTo({top:0,behavior:'instant'});
  history.replaceState(null,'',`#${titles[index].toLowerCase()}`);
  const active=$$('#chapterButtons button')[index];active.scrollIntoView({block:'nearest',inline:'center',behavior:reducedMotion()?'auto':'smooth'});
}
function showHome(){++navToken;inJourney=false;$('#journey').hidden=true;$('#welcome').hidden=false;$('#chapterStage').classList.remove('is-changing');$('#welcomeTitle').setAttribute('tabindex','-1');$('#welcomeTitle').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});history.replaceState(null,'',location.pathname+location.search)}
$('#exploreBtn').addEventListener('click',()=>{location.href='proyecto.html'});$('#homeBtn').addEventListener('click',showHome);
$('#prevBtn').addEventListener('click',()=>showChapter(current-1));$('#nextBtn').addEventListener('click',()=>current===titles.length-1?showHome():showChapter(current+1));
$('#odsLink').addEventListener('click',e=>{e.preventDefault();showChapter(titles.indexOf('ODS'))});
$('#returnStudies').addEventListener('click',()=>showChapter(3));
const pigAudioPool=[1,2,3,4].map(i=>$(`#pigAudio${i}`));
let pigSoundIndex=0;
window.pigSounds={
 stop(){pigAudioPool.forEach(a=>{a.pause();a.currentTime=0})},
 play(){if(!sound)return;this.stop();const a=pigAudioPool[pigSoundIndex++%pigAudioPool.length];a.play().catch(()=>{})}
};
$('#soundBtn').addEventListener('click',()=>{sound=!sound;$('#soundBtn').textContent=`Sonido: ${sound?'activado':'silenciado'}`;$('#soundBtn').setAttribute('aria-pressed',String(sound));if(!sound)window.pigSounds.stop()});
$$('.pig-button').forEach(b=>b.addEventListener('click',()=>{
  b.classList.remove('is-oinking');void b.offsetWidth;b.classList.add('is-oinking');
  const r=b.getBoundingClientRect(),bubble=$('#pigReaction');bubble.textContent='¡Oinc, oinc!';
  bubble.style.left=`${Math.min(innerWidth-160,Math.max(10,r.left+r.width*.53))}px`;bubble.style.top=`${Math.max(70,r.top+r.height*.27)}px`;bubble.classList.add('show');
  clearTimeout(reactionTimer);reactionTimer=setTimeout(()=>bubble.classList.remove('show'),1300);
  window.pigSounds.play();
}));
const ingredientText={energia:'El maíz amarillo y el aceite de soya aportan fuentes de energía a la mezcla.',proteina:'La pasta de soya aporta proteína. La formulación integra los nutrientes necesarios para la fase de alimentación.',nucleo:'El núcleo iniciador completa la mezcla con micronutrientes y componentes específicos. La ficha técnica identifica su función y las garantías del alimento.'};
$$('[data-ingredient]').forEach(b=>b.addEventListener('click',()=>{selectTab(b,'[data-ingredient]');$('#ingredientPanel').textContent=ingredientText[b.dataset.ingredient]}));
function selectTab(b,selector){$$(selector).forEach(x=>{const selected=x===b;x.setAttribute('aria-selected',String(selected));x.tabIndex=selected?0:-1})}
function keyboardTabs(selector){const buttons=$$(selector);buttons.forEach((b,i)=>b.addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%buttons.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+buttons.length)%buttons.length;else if(e.key==='Home')n=0;else if(e.key==='End')n=buttons.length-1;else return;e.preventDefault();buttons[n].click();buttons[n].focus()}))}
keyboardTabs('[data-ingredient]');keyboardTabs('[data-paper]');
const sensoryText=['Se incorpora en una dosis pequeña: 150 mg de sustancia activa por kilogramo de alimento.','El lechón cuenta con mecanismos de percepción del sabor dulce. Ese sabor tiene una base biológica.','La propuesta busca un alimento sensorialmente atractivo que favorezca la palatabilidad, aceptación y consumo voluntario.'];
$$('[data-sensory]').forEach(b=>b.addEventListener('click',()=>{$$('[data-sensory]').forEach(x=>x.classList.toggle('selected',x===b));$('#sensoryResult').textContent=sensoryText[+b.dataset.sensory]}));
function renderStudy(key){
  const s=studies[key],p=$('#studyPanel');
  let chart='';if(s.chart){const c=s.chart;chart=`<div class="mini-chart" role="img" aria-label="${c.title}: control ${c.control} ${c.unit}, con sucralosa ${c.sucralose} ${c.unit}"><p class="chart-title">${c.title}</p><div class="bar-row"><span>Control</span><div class="bar-track"><div class="bar-fill" style="--value:${c.control/c.max*100}%"></div></div><strong>${c.control} ${c.unit}</strong></div><div class="bar-row"><span>Sucralosa</span><div class="bar-track"><div class="bar-fill sucralose" style="--value:${c.sucralose/c.max*100}%"></div></div><strong>${c.sucralose} ${c.unit}</strong></div></div>`}
  p.innerHTML=`<div class="study-type">${s.type}</div><h3>${s.title}</h3><div class="study-meta">${s.meta.map(t=>`<span>${t}</span>`).join('')}</div><p>${s.body}</p>${chart}<p>${s.detail}</p><p class="study-bottom">${s.meaning}</p><a class="source-link" href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label} ↗</a>`;
}
$$('[data-paper]').forEach(b=>b.addEventListener('click',()=>{selectTab(b,'[data-paper]');renderStudy(b.dataset.paper)}));renderStudy('zhang');
const routeDetails=[['1. Misantla, Veracruz','La empresa prepara el pedido y organiza el traslado al lugar de entrega convenido en Tapachula.'],['2. Tapachula, Chiapas · FCA','Se entrega al transportista designado por el comprador en el punto convenido. Ese punto y las condiciones de la entrega se precisan en el contrato.'],['3. Guatemala','El comprador organiza la continuación del transporte y la importación. El distribuidor acerca la fórmula a las granjas con lechones.']];
$$('[data-route]').forEach(b=>b.addEventListener('click',()=>{$$('[data-route]').forEach(x=>x.classList.toggle('selected',x===b));const d=routeDetails[+b.dataset.route];$('#routeDetail').innerHTML=`<strong>${d[0]}</strong><p>${d[1]}</p>`}));
document.addEventListener('keydown',e=>{if(!inJourney||$('#gameDialog').open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('button,a,input,textarea,summary,[role=tablist]'))return;if(e.key==='ArrowRight'&&current<titles.length-1){e.preventDefault();showChapter(current+1)}if(e.key==='ArrowLeft'&&current>0){e.preventDefault();showChapter(current-1)}});
let swipe;
$('#chapterStage').addEventListener('touchstart',e=>{if(e.target.closest('button,a,details,nav'))return;swipe={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
$('#chapterStage').addEventListener('touchend',e=>{if(!swipe)return;const dx=e.changedTouches[0].clientX-swipe.x,dy=e.changedTouches[0].clientY-swipe.y;swipe=null;if(Math.abs(dx)>100&&Math.abs(dy)<55){if(dx<0&&current<titles.length-1)showChapter(current+1);if(dx>0&&current>0)showChapter(current-1)}},{passive:true});
const hash=decodeURIComponent(location.hash.slice(1)).toLowerCase(),initial=titles.findIndex(x=>x.toLowerCase()===hash);if(initial>=0)showChapter(initial,{animate:false,focus:false});
