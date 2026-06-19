/* Suzume Doors — game engine */
(function(){
  const $=s=>document.querySelector(s);
  const LEVELS=[
    { bg:'assets/bg-greenhouse.jpg', name:'The Sunken Greenhouse', jp:'水没した温室',
      game:'chair', diff:'Medium', door:{x:46.5,y:34,w:8,h:56},
      vid:{s:8,e:25}, vidcap:'A girl named Suzume meets a young man searching for a door — and finds one standing alone in the ruins.',
      brief:'An abandoned school, drowned in still water. The ruins remember the children who ran here — listen to their voices, and echo them back, and the gate will know you mourn it.',
      quote:'I humbly return what was once yours.' },
    { bg:'assets/bg-resort.jpg', name:'The Overgrown Springs', jp:'廃れた温泉街',
      game:'daijin', diff:'Medium', door:{x:51.5,y:49,w:9,h:32},
      vid:{s:28,e:41}, vidcap:'A keystone pulled free becomes a small white cat — Daijin — and skips away laughing.',
      brief:'A resort the forest has taken back. Daijin keeps splitting into mischievous shadows here, and only the true keystone will stay long enough to catch. Read the movement, ignore the decoys, and claim the real cat before the gate slips away.',
      quote:'Suzume… I like you.' },
    { bg:'assets/bg-school.jpg', name:'The Flooded Schoolyard', jp:'水没した校庭',
      game:'voices', diff:'Low', door:{x:49.7,y:61,w:8,h:30},
      vid:{s:52,e:65}, vidcap:'Souta is bound into a little three-legged chair. To open the doors, the chair must run.',
      brief:'A glass conservatory drowned in clear water, one white door still standing within it. Daijin has lured the three-legged chair into a chase — hop the rubble, duck the crows, and reach the door across the water.',
      quote:'O wrathful spirits — calm your anger and rest.' },
    { bg:'assets/scene-flooded.png', name:'The Flooded Crossing', jp:'水底の戸口',
      game:'catrace', diff:'Hard', door:{x:49.8,y:56,w:14,h:54},
      vid:{s:76,e:89}, vidcap:'Daijin will not be caught so easily — if you want this door, you will have to outrun him.',
      brief:'A lone door on a sheet of still water, and Daijin waiting beside a track of shifting reflections. Slash through the flooded lanes, chain fish boosts, and survive the broken gates and whirlpools long enough to beat him to the threshold.',
      quote:'These mountains and rivers — I give back to their gods.' },
    { bg:'assets/bg-mountain.png', ever:true, name:'The Ever-After', jp:'常世',
      game:'finale', diff:'Hard', door:{x:50,y:62,w:10,h:33},
      vid:{s:92,e:108}, vidcap:'At the last gate all times meet at once, and every star that ever fell is still falling. Open it, and dawn will come.',
      brief:'The final door waits beneath a sky of endless stars. Break the Worm, align the hidden lock, and hold the key through the last surge. Whatever pushes back now is everything at once.',
      quote:'No matter how long the night, dawn will come. We will meet again.' }
  ];
  const sfx=SuzumeAudio.sfx;
  let levelIdx=0, charms=3, mgCleanup=null, started=false;
  let runStats=makeRunStats();
  let gateFlawless=true;
  const CAT_HTML='<svg style="width:54px;height:54px;filter:drop-shadow(0 0 12px rgba(255,255,255,.3));" viewBox="0 0 64 64" aria-hidden="true"><path d="M20 26 L17 9 L27 19 Q32 17 37 19 L47 9 L44 26 Q50 33 48 42 Q46 54 32 56 Q18 54 16 42 Q14 33 20 26 Z" fill="#f4f2ec"></path><circle cx="26" cy="34" r="2.6" fill="#243038"></circle><circle cx="38" cy="34" r="2.6" fill="#243038"></circle><path d="M29 41 Q32 44 35 41" stroke="#243038" stroke-width="1.6" fill="none"></path></svg>';

  /* ——— stage scaling ——— */
  const stage=$('#stage');
  function fit(){
    const s=Math.min(innerWidth/1920,innerHeight/1080);
    stage.style.transform=`translate(-50%,-50%) scale(${s})`;
  }
  addEventListener('resize',fit); fit();

  /* ——— helpers ——— */
  function show(id){
    document.querySelectorAll('.screen').forEach(s=>s.classList.remove('on'));
    $(id).classList.add('on');
  }
  function card(html){
    const c=$('#level-card');
    c.innerHTML=html; c.style.display='flex';
    c.classList.remove('crise'); void c.offsetWidth; c.classList.add('crise');
    return c;
  }
  function hideCard(){ $('#level-card').style.display='none'; }
  function saveProgress(n){ try{ localStorage.setItem('suzume-doors-gate',String(n)); }catch(e){} }
  function loadProgress(){ try{ return +(localStorage.getItem('suzume-doors-gate')||0); }catch(e){ return 0; } }
  function makeRunStats(){
    return { startedAt:0, fails:0, charmsSpent:0, perfectDoors:0, gatesCleared:0, continued:false };
  }
  function beginRun(continued){
    runStats=makeRunStats();
    runStats.startedAt=Date.now();
    runStats.continued=!!continued;
  }
  function formatDuration(ms){
    const total=Math.max(0,Math.round(ms/1000));
    const mins=Math.floor(total/60);
    const secs=String(total%60).padStart(2,'0');
    return `${mins}:${secs}`;
  }
  function victoryTone(){
    if(runStats.perfectDoors===LEVELS.length && runStats.fails===0) return {
      kicker:'Every door yielded in one breath',
      headline:'A flawless closing',
      copy:'You crossed the ruins without a single retreat. Even the Ever-After answered on the first try.'
    };
    if(runStats.fails >= 6) return {
      kicker:'You kept coming back',
      headline:'Morning, hard-won',
      copy:'The doors resisted, the road bit back, and you still reached the dawn. That stubbornness is what saved this world.'
    };
    return {
      kicker:'All five doors are sealed',
      headline:'The morning comes',
      copy:'The Ever-After is quiet again, and every door you touched now rests in peace.'
    };
  }
  function renderVictoryStats(){
    const tone=victoryTone();
    const elapsed=runStats.startedAt ? formatDuration(Date.now()-runStats.startedAt) : '0:00';
    $('#victory-kicker').textContent=tone.kicker;
    $('#victory-headline').textContent=tone.headline;
    $('#victory-quote').innerHTML='“No matter how long the night, dawn will come.<br>We will meet again.”';
    $('#victory-copy').textContent=tone.copy;
    $('#victory-stats').innerHTML=[
      {label:'Doors Sealed', value:String(runStats.gatesCleared || LEVELS.length)},
      {label:'Perfect Gates', value:String(runStats.perfectDoors)},
      {label:'Second Chances', value:String(runStats.fails)},
      {label:'Journey Time', value:elapsed}
    ].map(stat=>`<div class="victory-stat"><strong>${stat.value}</strong><span>${stat.label}</span></div>`).join('');
  }

  /* ——— HUD ——— */
  function renderHud(){
    const L=LEVELS[levelIdx];
    $('#hud-loc').textContent=`Gate ${levelIdx+1} — ${L.name}`;
    $('#hud-jp').textContent=L.jp;
    $('#charms').innerHTML=[0,1,2].map(i=>`<div class="charm${i>=charms?' spent':''}"></div>`).join('');
    $('#progress').innerHTML=LEVELS.map((_,i)=>
      `<div class="pdoor${i<levelIdx?' locked':''}${i===levelIdx?' now':''}"></div>`).join('');
  }

  /* ——— level flow ——— */
  function startLevel(i,skipCutscene,preserveGateState){
    levelIdx=i; charms=3;
    if(!preserveGateState) gateFlawless=true;
    const L=LEVELS[i];
    const scr=$('#screen-level');
    scr.classList.toggle('ever',!!L.ever);
    $('#level-bg').style.backgroundImage=`url('${L.bg}')`;
    $('#ever-stars').innerHTML=L.ever
      ? Array.from({length:14},(_,k)=>`<i style="left:${Math.random()*100}%;top:${Math.random()*-20}%;animation-delay:${(Math.random()*3.6).toFixed(2)}s;animation-duration:${(2.8+Math.random()*2).toFixed(2)}s"></i>`).join('')
      : '';
    const d=L.door, hs=$('#door-hotspot');
    hs.style.cssText=`left:${d.x}%;top:${d.y}%;width:${d.w*19.2}px;height:${d.h*10.8}px;display:none;`;
    const da=$('#door-anim');
    da.classList.remove('open','shut'); da.style.display='none';
    show('#screen-level'); renderHud();
    if(skipCutscene) showLevelCard(); else playCutscene(L,showLevelCard);
  }
  const DIFF_CLASS={ Low:'low', Medium:'med', Hard:'hard' };
  function showLevelCard(){
    const i=levelIdx, L=LEVELS[i], hs=$('#door-hotspot');
    card(`
      <div class="lvl">Gate ${i+1} of 5 · <span class="diff ${DIFF_CLASS[L.diff]}">${L.diff}</span></div>
      <h2>${L.name}</h2>
      <div class="jp" style="letter-spacing:.7em;">${L.jp}</div>
      <p>${L.brief}</p>
      <button class="btn primary" id="btn-approach">Approach the door</button>
    `);
    $('#btn-approach').onclick=()=>{ sfx.click(); hideCard(); hs.style.display='flex'; };
  }

  const VIDEO_SRC='assets/suzume.mp4';
  function ensureSrc(v){ if(!v.getAttribute('src')) v.src=VIDEO_SRC; }
  /* ——— video cutscene (clipped from the local film) ——— */
  function playCutscene(L,cb){
    const cs=$('#cutscene'), v=$('#cs-vid'), clip=L.vid||{s:0,e:12};
    $('#cs-cap').textContent=L.vidcap||'';
    ensureSrc(v);
    const seek=()=>{ try{ v.currentTime=clip.s; }catch(e){} };
    v.onloadedmetadata=seek; seek();
    v.ontimeupdate=()=>{ if(v.currentTime>=clip.e || v.currentTime<clip.s-0.3) v.currentTime=clip.s; };
    cs.classList.add('on');
    v.play().catch(()=>{});
    $('#cs-skip').onclick=()=>{ sfx.click(); v.pause(); v.ontimeupdate=null; v.onloadedmetadata=null; cs.classList.remove('on'); cb&&cb(); };
  }

  /* ——— door animation ——— */
  function playDoorOpen(cb){
    const d=LEVELS[levelIdx].door, da=$('#door-anim');
    da.style.cssText=`left:${d.x}%;top:${d.y}%;width:${d.w*19.2}px;height:${d.h*10.8}px;display:block;`;
    da.classList.remove('open','shut'); void da.offsetWidth;
    sfx.creak(); da.classList.add('open');
    setTimeout(cb,1600);
  }
  function playDoorClose(cb){
    const da=$('#door-anim');
    if(da.style.display!=='block'){ cb(); return; }
    da.classList.add('shut'); da.classList.remove('open');
    setTimeout(()=>{ da.style.display='none'; da.classList.remove('shut'); cb(); },650);
  }

  $('#door-hotspot').addEventListener('click',()=>{
    sfx.click(); $('#door-hotspot').style.display='none';
    openMinigame();
  });

  /* ——— minigame ——— */
  const MG_TITLES={ voices:'Voices of the Past', daijin:'Daijin Among Shadows', chair:'Run, Little Chair', catrace:'Water Mirror Rush', words:'The Words of Closing', finale:'The Last Lock' };
  function openMinigame(){
    const L=LEVELS[levelIdx];
    $('#mg-overlay').classList.add('on');
    $('#mg-title').textContent=MG_TITLES[L.game];
    $('#mg-stat').textContent=''; $('#mg-instr').textContent='';
    const body=$('#mg-body'); body.innerHTML='';
    let settled=false;
    const ctx={
      sfx,
      setStat:t=>{ $('#mg-stat').textContent=t; },
      setInstr:t=>{ $('#mg-instr').textContent=t; },
      win(){ if(settled)return; settled=true; closeMinigame(); playDoorOpen(lockSequence); },
      fail(){ if(settled)return; settled=true; closeMinigame(); failSequence(); }
    };
    mgCleanup=Minigames[L.game](body,ctx);
  }
  function closeMinigame(){
    if(mgCleanup){ try{ mgCleanup(); }catch(e){} mgCleanup=null; }
    $('#mg-overlay').classList.remove('on');
    $('#mg-body').innerHTML='';
  }

  /* ——— outcomes ——— */
  function lockSequence(){
    const L=LEVELS[levelIdx];
    runStats.gatesCleared=Math.max(runStats.gatesCleared, levelIdx+1);
    if(gateFlawless) runStats.perfectDoors++;
    sfx.lock();
    const flash=$('#lock-flash');
    flash.style.transition='none'; flash.style.opacity='.95';
    requestAnimationFrame(()=>{ flash.style.transition='opacity 1.2s ease'; flash.style.opacity='0'; });
    const stamp=$('#lock-stamp');
    stamp.classList.remove('go'); void stamp.offsetWidth; stamp.classList.add('go');
    saveProgress(levelIdx+1);
    setTimeout(()=>{
      const last=levelIdx===LEVELS.length-1;
      card(`
        <div class="lvl">Gate ${levelIdx+1} opened</div>
        <p class="quote" style="font-size:34px;color:var(--ink);">“${L.quote}”</p>
        <button class="btn primary" id="btn-next">${last?'Step into the dawn':'Journey on'}</button>
      `);
      $('#btn-next').onclick=()=>{
        sfx.click(); hideCard();
        if(last){ saveProgress(0); showVictory(); }
        else startLevel(levelIdx+1);
      };
    },1700);
  }
  function failSequence(){
    runStats.fails++;
    runStats.charmsSpent++;
    gateFlawless=false;
    charms--; renderHud();
    const tint=$('#fail-tint'); tint.classList.add('on');
    setTimeout(()=>tint.classList.remove('on'),900);
    if(charms>0){
      card(`
        <div style="display:flex;justify-content:center;">${CAT_HTML}</div>
        <div class="lvl" style="color:var(--danger);">The door held shut</div>
        <p>Every Closer gets turned away sometimes — even Souta. Take a breath; Daijin is rooting for you. ${charms===2?'Two charms remain.':'One charm left — make it count.'}</p>
        <button class="btn primary" id="btn-retry">Try again</button>
      `);
      $('#btn-retry').onclick=()=>{ sfx.click(); hideCard(); openMinigame(); };
    } else {
      card(`
        <div style="display:flex;justify-content:center;">${CAT_HTML}</div>
        <div class="lvl" style="color:var(--danger);">The door would not open</div>
        <p>Your charms are spent… but a Closer always comes back. The chair is packed, the door is waiting — let's try this gate once more.</p>
        <button class="btn primary" id="btn-restart">Return to the gate</button>
      `);
      $('#btn-restart').onclick=()=>{ sfx.click(); startLevel(levelIdx,true,true); };
    }
  }

  /* ——— victory ——— */
  function showVictory(){
    renderVictoryStats();
    show('#screen-victory');
    const v=$('#victory-vid'); ensureSrc(v); try{ v.currentTime=0; }catch(e){} v.play().catch(()=>{});
  }
  $('#btn-again').addEventListener('click',()=>{ sfx.click(); const v=$('#victory-vid'); v.pause(); beginRun(false); startLevel(0); });
  $('#btn-title').addEventListener('click',()=>{ sfx.click(); const v=$('#victory-vid'); v.pause(); showTitle(); });

  /* ——— title ——— */
  function showTitle(){
    show('#screen-title');
    const p=loadProgress();
    $('#btn-continue').style.display=p>0&&p<5?'inline-block':'none';
    $('#btn-continue').textContent=`Continue — Gate ${p+1}`;
  }
  function firstGesture(){
    if(started) return; started=true;
    SuzumeAudio.unlock(); SuzumeAudio.ambientStart();
  }
  document.addEventListener('pointerdown',firstGesture,{once:false});
  $('#btn-start').addEventListener('click',()=>{ firstGesture(); sfx.click(); saveProgress(0); beginRun(false); startLevel(0); });
  $('#btn-continue').addEventListener('click',()=>{ firstGesture(); sfx.click(); beginRun(true); startLevel(loadProgress()); });

  /* ——— video modal ——— */
  $('#btn-video').addEventListener('click',()=>{
    sfx.click();
    $('#video-modal').classList.add('on');
    const v=$('#modal-vid'); ensureSrc(v); try{ v.currentTime=0; }catch(e){} v.play().catch(()=>{});
  });
  $('#btn-close-video').addEventListener('click',()=>{
    sfx.click(); const v=$('#modal-vid'); v.pause(); $('#video-modal').classList.remove('on');
  });

  /* ——— sound + quit ——— */
  function syncSound(){ $('#btn-sound').textContent='Sound '+(SuzumeAudio.isEnabled()?'On':'Off');
    const b=$('#btn-sound2'); if(b) b.textContent='Sound '+(SuzumeAudio.isEnabled()?'On':'Off'); }
  ['#btn-sound','#btn-sound2'].forEach(s=>{ const b=$(s); if(b) b.addEventListener('click',()=>{
    SuzumeAudio.setEnabled(!SuzumeAudio.isEnabled()); syncSound(); }); });
  $('#btn-quit').addEventListener('click',()=>{ closeMinigame(); hideCard(); $('#door-anim').style.display='none'; sfx.click(); showTitle(); });
  syncSound();

  showTitle();
  window.__suzume={ startLevel, showVictory, playDoorOpen, openMinigame };
})();
