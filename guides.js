(() => {
  'use strict';
  const KEY='close-no-shape-guides-v1';
  const root=document.querySelector('#guides'),tab=document.querySelector('#guide-tab');
  const cardio={id:'cardio',name:'Cardio · Esteira',kind:'Protocolo de 20 minutos',steps:[[6,4.5],[8,4.8],[10,4.5],[12,4.5],[6,4.5]].map(([incline,speed],i)=>({name:`Etapa ${i+1} · ${i*4}–${(i+1)*4} min`,seconds:240,incline,speed,instruction:'Ajuste manualmente a esteira aos valores indicados.'}))};
  const plans=[cardio,...window.SHAPE_GUIDES.map(g=>({...g,steps:g.items.flatMap(item=>item.both?['direito','esquerdo'].map(side=>({...item,side,name:`${item.name} · lado ${side}`})):[item])}))];
  const find=id=>plans.find(p=>p.id===id),fmt=n=>`${Math.floor(Math.max(0,n)/60)}:${String(Math.max(0,n)%60).padStart(2,'0')}`;
  let session=null,error='',visible=false;
  try { const s=JSON.parse(localStorage.getItem(KEY));const p=s&&find(s.plan);
    if(p&&Number.isInteger(s.index)&&s.index>=0&&s.index<p.steps.length&&['running','paused','completed','ended'].includes(s.status)&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=p.steps[s.index].seconds&&Number.isFinite(s.end))session=s;
  }catch{}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(session));error='';}catch{error='Não foi possível salvar esta sequência no dispositivo. O cronômetro continua nesta página.';}const el=root.querySelector('#guide-error');if(el)el.textContent=error;}
  function sync(){if(!session||session.status!=='running')return false;let changed=false;const p=find(session.plan),now=Date.now();
    while(now>=session.end&&session.status==='running'){
      changed=true;if(session.index===p.steps.length-1){session.status='completed';session.remaining=0;break;}
      session.index++;session.remaining=p.steps[session.index].seconds;session.end+=session.remaining*1000;
    }
    if(changed)save();return changed;
  }
  function remaining(){return session.status==='running'?Math.max(0,Math.ceil((session.end-Date.now())/1000)):session.remaining;}
  function render(){
    sync();root.innerHTML=`<h2 id="guide-heading">Cardio e Mobilidade</h2><p class="muted">Sequências guiadas, disponíveis offline após o primeiro carregamento completo.</p><div class="guide-options">${plans.map(p=>`<button type="button" class="secondary" data-plan="${p.id}" aria-pressed="${session?.plan===p.id}">${p.name}<small>${fmt(p.steps.reduce((n,s)=>n+s.seconds,0))} · ${p.kind}</small></button>`).join('')}</div><div id="guide-player"></div><p id="guide-error" role="alert">${error}</p>`;
    if(!session)return;const p=find(session.plan),s=p.steps[session.index],done=['completed','ended'].includes(session.status);
    const player=root.querySelector('#guide-player');player.innerHTML=`<article class="card guide-player"><p class="number">${p.name}</p><h3 tabindex="-1" id="guide-step" aria-live="polite">${done?(session.status==='completed'?'Sequência concluída':'Sequência encerrada'):s.name}</h3>${done?'<p>Você pode escolher outra sequência quando quiser.</p>':`${s.image?`<button type="button" class="exercise-image" data-image="${s.image}" data-image-title="${s.name}" aria-label="Ampliar ${s.name}"><img src="${s.image}" alt="${s.instruction}"><span class="guide-image-note">${s.side?'Ilustração de um lado; execute o lado '+s.side+'.':'Ilustração do movimento'} · toque para ampliar</span></button>`:''}${p.id==='cardio'?`<div class="guide-metrics"><div><strong>${s.incline}%</strong><span>Inclinação</span></div><div><strong>${s.speed.toLocaleString('pt-BR')} km/h</strong><span>Velocidade</span></div></div>`:`<p class="detail">${p.kind}${s.side?' · lado '+s.side:''} · ${s.seconds} segundos${p.id.startsWith('pre')?' · movimente-se sem sustentar a posição':' · sustente sem rebotes'}</p>`}<p>${s.instruction}</p><div class="guide-clock" role="timer" aria-label="Tempo restante da etapa" aria-live="off"></div><p class="guide-progress"></p><progress id="guide-progress" max="${p.steps.length}" value="${session.index}" aria-label="Progresso da sequência"></progress><div class="guide-controls"><button type="button" class="secondary" data-guide-action="pause">${session.status==='paused'?'Retomar':'Pausar'}</button><button type="button" class="secondary" data-guide-action="next">Avançar</button><button type="button" class="secondary" data-guide-action="end">Encerrar</button></div>`}<p class="muted guide-note">${p.id==='cardio'?'O guia indica as etapas; não controla a esteira.':'Use uma amplitude confortável, sem forçar nem provocar dor.'}</p></article>`;
    if(!done){const next=p.steps[session.index+1];player.insertAdjacentHTML('beforeend',`<p class="muted">${next?'A seguir: '+next.name:'Última etapa desta sequência.'}</p>`);}
    updateClock();
  }
  function updateClock(){if(!session)return;const el=root.querySelector('.guide-clock');if(!el)return;el.textContent=fmt(remaining());const p=find(session.plan);root.querySelector('.guide-progress').textContent=`Etapa ${session.index+1} de ${p.steps.length} · ${session.status==='paused'?'Pausado':'Em andamento'}`;}
  function start(id){const p=find(id);if(!p)return;if(session&&['running','paused'].includes(session.status)&&!confirm('Encerrar a sequência atual e iniciar esta?'))return;
    session={plan:id,index:0,status:'running',remaining:p.steps[0].seconds,end:Date.now()+p.steps[0].seconds*1000};save();render();root.querySelector('#guide-step')?.focus();
  }
  tab.addEventListener('click',()=>{visible=true;document.querySelector('#home').hidden=true;document.querySelector('#history').hidden=true;root.hidden=false;document.querySelectorAll('.nav').forEach(b=>b.classList.toggle('active',b===tab));render();});
  document.addEventListener('click',e=>{if(e.target.closest('[data-view]')){visible=false;root.hidden=true;tab.classList.remove('active');}});
  root.addEventListener('click',e=>{const plan=e.target.closest('[data-plan]');if(plan){start(plan.dataset.plan);return;}const action=e.target.closest('[data-guide-action]')?.dataset.guideAction;if(!action||!session)return;sync();if(!['running','paused'].includes(session.status)){render();return;}
    if(action==='pause'){if(session.status==='running'){session.remaining=remaining();session.status='paused';}else{session.end=Date.now()+session.remaining*1000;session.status='running';}}
    if(action==='next'){const p=find(session.plan);if(session.index===p.steps.length-1){session.status='completed';session.remaining=0;}else{session.index++;session.remaining=p.steps[session.index].seconds;session.end=Date.now()+session.remaining*1000;}}
    if(action==='end'){session.remaining=remaining();session.status='ended';}
    save();render();
  });
  setInterval(()=>{const changed=sync();if(visible){if(changed)render();else updateClock();}},250);
  document.addEventListener('visibilitychange',()=>{sync();if(visible)render();});
  sync();
})();
