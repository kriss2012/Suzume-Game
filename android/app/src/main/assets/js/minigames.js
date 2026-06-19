/* Suzume Doors - five minigames.
   Each: Minigames.<name>(body, ctx) -> cleanup()
   ctx = { sfx, setStat(txt), setInstr(txt), win(), fail() } */
(function(){
  const raf=requestAnimationFrame;
  function el(tag,cls,html){ const e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }
  function clamp(v,a,b){ return v<a?a:(v>b?b:v); }
  const CAT_SVG = shadow=>`
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M20 26 L17 9 L27 19 Q32 17 37 19 L47 9 L44 26 Q50 33 48 42 Q46 54 32 56 Q18 54 16 42 Q14 33 20 26 Z"
        fill="${shadow?'#2a1638':'#f4f2ec'}" stroke="${shadow?'#9c5fd0':'#ffffff'}" stroke-width="1.5"/>
      <circle cx="26" cy="34" r="2.6" fill="${shadow?'#c79cf0':'#243038'}"/>
      <circle cx="38" cy="34" r="2.6" fill="${shadow?'#c79cf0':'#243038'}"/>
      <path d="M29 41 Q32 44 35 41" stroke="${shadow?'#c79cf0':'#243038'}" stroke-width="1.6" fill="none"/>
    </svg>`;

  function voices(body,ctx){
    let dead=false, timers=[];
    const T=(fn,ms)=>{ const t=setTimeout(fn,ms); timers.push(t); return t; };
    const field=el('div','wisp-field'); body.appendChild(field);
    const note=el('div','mg-center-note','Listen...'); field.appendChild(note);
    const FACE='<svg class="wface" viewBox="0 0 40 40" aria-hidden="true"><circle cx="14" cy="17" r="2.2" fill="#16323a"></circle><circle cx="26" cy="17" r="2.2" fill="#16323a"></circle><path d="M13 25 Q20 30 27 25" stroke="#16323a" stroke-width="2" fill="none" stroke-linecap="round"></path></svg>';
    const N=6, wisps=[];
    for(let i=0;i<N;i++){
      const w=el('div','wisp',FACE);
      const ang=-90+i*(360/N), r=42;
      w.style.left=(50+r*Math.cos(ang*Math.PI/180)*0.92)+'%';
      w.style.top=(50+r*Math.sin(ang*Math.PI/180)*0.78)+'%';
      field.appendChild(w); wisps.push(w);
    }
    const ROUNDS=[3,4]; let round=0, seq=[], idx=0, accepting=false, strikes=0;
    function lit(i,ms){
      wisps[i].classList.add('lit'); ctx.sfx.wisp(i);
      T(()=>wisps[i].classList.remove('lit'),ms);
    }
    function stat(){ ctx.setStat(`VERSE ${Math.min(round+1,ROUNDS.length)} / ${ROUNDS.length}    ·    SLIPS ${strikes} / 3`); }
    function playSeq(fresh){
      accepting=false; idx=0;
      note.textContent=fresh?'Listen...':'Once more - listen...';
      if(fresh) seq=Array.from({length:ROUNDS[round]},()=>Math.floor(Math.random()*N));
      const gap=Math.max(800-round*120,560);
      seq.forEach((s,k)=>T(()=>lit(s,gap*.55),800+k*gap));
      T(()=>{ accepting=true; note.textContent='Echo the voices'; },800+seq.length*gap+250);
      stat();
    }
    wisps.forEach((w,i)=>w.addEventListener('click',()=>{
      if(!accepting||dead) return;
      if(i===seq[idx]){
        lit(i,260); idx++;
        w.classList.remove('pop'); void w.offsetWidth; w.classList.add('pop');
        if(idx===seq.length){
          accepting=false; round++;
          if(round===ROUNDS.length){ T(()=>!dead&&ctx.win(),650); }
          else { note.textContent='Lovely - one more verse'; ctx.sfx.good(); T(()=>playSeq(true),1300); }
        }
      } else {
        accepting=false; strikes++; w.classList.add('err'); ctx.sfx.bad(); stat();
        T(()=>w.classList.remove('err'),700);
        if(strikes>=3){ T(()=>{ if(!dead) ctx.fail(); },800); }
        else T(()=>playSeq(false),1100);
      }
    }));
    ctx.setInstr('The ruins remember those who lived here. Watch the smiling spirit-lights, then echo their song in the same order. Two verses are enough, and three slips are forgiven.');
    T(()=>playSeq(true),900);
    return ()=>{ dead=true; timers.forEach(clearTimeout); };
  }

  function daijin(body,ctx){
    let dead=false, timers=[], raf_=null, time=90, got=0, combo=0, nextWaveQueued=false;
    const NEED=3, MAX_TIME=90;
    const T=(fn,ms)=>{ const t=setTimeout(fn,ms); timers.push(t); return t; };
    const field=el('div','hunt-field'); body.appendChild(field);
    const stage=el('div','hunt-stage'); field.appendChild(stage);
    const note=el('div','mg-center-note','Find the real Daijin'); field.appendChild(note);
    const burst=el('div','hunt-burst','Shadow!'); field.appendChild(burst);
    let targets=[];
    function pulse(msg,cls){
      burst.textContent=msg;
      burst.className='hunt-burst '+cls;
      burst.classList.remove('show'); void burst.offsetWidth; burst.classList.add('show');
    }
    function update(){ ctx.setStat(`CAUGHT ${got} / ${NEED}    ·    ${Math.max(0,time).toFixed(1)}s    ·    COMBO ${combo}`); }
    function clearTargets(){ targets.forEach(t=>t.el.remove()); targets=[]; }
    function queueWave(delay){
      if(nextWaveQueued || dead) return;
      nextWaveQueued=true;
      T(()=>{ if(!dead) spawnWave(); },delay);
    }
    function makeTarget(real){
      const size=(real?102:96)-Math.min(got*3,18);
      const t=el('button','hunt-cat'+(real?' real':' shadow'));
      t.type='button';
      t.innerHTML='<div class="glowring"></div>'+CAT_SVG(!real);
      stage.appendChild(t);
      const bounds={ w:stage.clientWidth||1120, h:stage.clientHeight||620 };
      const obj={
        el:t, real, size,
        x:110+Math.random()*(bounds.w-220),
        y:110+Math.random()*(bounds.h-220),
        vx:(Math.random()>.5?1:-1)*(real?210:170+Math.random()*70),
        vy:(Math.random()>.5?1:-1)*(real?190:150+Math.random()*70),
        ttl:1.95-Math.min(got*0.06,.45),
        hit:false, juke:.35+Math.random()*.45
      };
      t.style.width=size+'px';
      t.style.height=size+'px';
      t.addEventListener('click',ev=>{
        ev.stopPropagation();
        if(dead || obj.hit) return;
        obj.hit=true;
        if(obj.real){
          got++; combo++; time=Math.min(MAX_TIME,time+.55);
          ctx.sfx.meow();
          note.textContent=combo>=3?'You found him again':'There!';
          pulse(combo>=4?'Combo!':'Caught!','good');
          t.classList.add('got');
          update();
          if(got>=NEED){ dead='won'; return T(()=>ctx.win(),420); }
          queueWave(260);
        } else {
          combo=0; time-=2.4; ctx.sfx.decoy();
          note.textContent='Shadow double';
          pulse('-2.4s','bad');
          field.classList.remove('shake'); void field.offsetWidth; field.classList.add('shake');
          t.classList.add('bad');
          update();
          T(()=>{ if(!dead) t.classList.remove('bad'); },180);
        }
      });
      raf(()=>t.classList.add('in'));
      return obj;
    }
    function spawnWave(){
      if(dead) return;
      clearTargets(); nextWaveQueued=false;
      note.textContent=got>=6?'Too many shadows...':'Find the real Daijin';
      const total=got>=6?5:(got>=3?4:3);
      const realIndex=Math.floor(Math.random()*total);
      for(let i=0;i<total;i++) targets.push(makeTarget(i===realIndex));
      update();
    }
    stage.addEventListener('click',e=>{
      if(dead || e.target!==stage) return;
      combo=0; time-=.9; ctx.sfx.bad(); pulse('Miss','bad'); update();
    });
    let last=performance.now();
    function loop(now){
      if(dead) return;
      const dt=Math.min((now-last)/1000,.05); last=now;
      time-=dt;
      if(time<=0){ ctx.sfx.bad(); return ctx.fail(); }
      const bw=stage.clientWidth||1120, bh=stage.clientHeight||620;
      let realAlive=false;
      for(const obj of targets){
        if(obj.hit) continue;
        if(obj.real) realAlive=true;
        obj.ttl-=dt;
        obj.juke-=dt;
        if(obj.juke<=0){
          obj.juke=.3+Math.random()*.42;
          obj.vx+=(Math.random()-.5)*120;
          obj.vy+=(Math.random()-.5)*120;
          const limit=obj.real?260:220;
          obj.vx=clamp(obj.vx,-limit,limit);
          obj.vy=clamp(obj.vy,-limit,limit);
        }
        obj.x+=obj.vx*dt;
        obj.y+=obj.vy*dt;
        const pad=obj.size*.55;
        if(obj.x<pad){ obj.x=pad; obj.vx=Math.abs(obj.vx); }
        if(obj.x>bw-pad){ obj.x=bw-pad; obj.vx=-Math.abs(obj.vx); }
        if(obj.y<pad){ obj.y=pad; obj.vy=Math.abs(obj.vy); }
        if(obj.y>bh-pad){ obj.y=bh-pad; obj.vy=-Math.abs(obj.vy); }
        obj.el.style.left=obj.x+'px';
        obj.el.style.top=obj.y+'px';
        obj.el.style.opacity=obj.ttl<.5 ? String(.45+obj.ttl*.9) : '';
      }
      const realTarget=targets.find(obj=>obj.real && !obj.hit);
      if(realTarget && realTarget.ttl<=0){
        combo=0; time-=1.4; ctx.sfx.bad(); note.textContent='He slipped away'; pulse('Too slow','bad'); queueWave(220);
      } else if(!realAlive && !nextWaveQueued && got<NEED){
        queueWave(220);
      }
      update();
      raf_=raf(loop);
    }
    ctx.setInstr('Daijin now hides among moving shadows. Catch the real white cat 9 times before time runs out. The wrong cat costs 2.4 seconds, a miss costs 0.9, and if the real one escapes you lose 1.4.');
    spawnWave(); raf_=raf(loop);
    return ()=>{ dead=true; timers.forEach(clearTimeout); cancelAnimationFrame(raf_); };
  }

  function chair(body,ctx){
    let dead=false, raf_=null, timers=[];
    const T=(fn,ms)=>{ const t=setTimeout(fn,ms); timers.push(t); return t; };
    const field=el('div','run-field'); body.appendChild(field);
    field.appendChild(el('div','run-ground'));
    const hint=el('div','mg-center-note','Tap or SPACE to jump'); field.appendChild(hint);
    T(()=>hint.style.opacity='0',2600);
    const chairEl=el('div','run-chair',`
      <svg viewBox="0 0 90 104" aria-hidden="true">
        <rect x="16" y="4" width="54" height="46" rx="9" fill="#e3b33f" stroke="#96701e" stroke-width="3.5"></rect>
        <circle cx="43" cy="24" r="7.5" fill="#10202c"></circle>
        <rect x="8" y="48" width="72" height="15" rx="5" fill="#edc257" stroke="#96701e" stroke-width="3.5"></rect>
        <rect x="15" y="62" width="9" height="40" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>
        <rect x="63" y="62" width="9" height="40" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>
        <rect x="39" y="62" width="9" height="33" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>
      </svg>`);
    field.appendChild(chairEl);
    const GROUND=96, CHAIR_X=150, CHAIR_W=78, CHAIR_H=96;
    let y=0, vy=0, passed=0, bumps=0, speed=430, obs=[], nextSpawn=1.0, fw=1192;
    const NEED=10, MAXB=3;
    function jump(e){
      if(e&&e.code&&e.code!=='Space')return;
      if(e&&e.code==='Space')e.preventDefault();
      if(dead)return;
      if(y<=0.5){ vy=940; ctx.sfx.jump(); }
    }
    window.addEventListener('keydown',jump);
    body.addEventListener('pointerdown',jump);
    function stat(){ ctx.setStat(`PASSED ${passed} / ${NEED}    ·    BUMPS ${bumps} / ${MAXB}`); }
    function spawn(){
      const fwid=field.clientWidth||1192, roll=Math.random();
      const add=(o,x,w,y0,h)=>{ field.appendChild(o); obs.push({el:o,x,w,y0,h,counted:false,hit:false}); };
      if(roll<0.20 && passed>=2){
        const w=60,h=30,y0=120+Math.random()*46;
        const o=el('div','run-obs bird','<svg viewBox="0 0 60 30" aria-hidden="true"><path d="M4 22 Q16 4 30 17 Q44 4 56 22" fill="none" stroke="#15110d" stroke-width="4" stroke-linecap="round"></path></svg>');
        o.style.cssText=`width:${w}px;height:${h}px;left:${fwid+60}px;bottom:${GROUND+y0}px;`;
        add(o,fwid+60,w,y0,h);
      } else if(roll<0.44 && passed>=3){
        let lx=fwid+60;
        for(let k=0;k<2;k++){
          const w=44+Math.random()*22,h=46+Math.random()*26;
          const o=el('div','run-obs');
          o.style.cssText=`width:${w}px;height:${h}px;left:${lx}px;bottom:${GROUND}px;`;
          add(o,lx,w,0,h); lx+=w+26;
        }
      } else {
        const tall=roll>0.80, h=tall?(88+Math.random()*20):(46+Math.random()*30), w=52+Math.random()*40;
        const o=el('div','run-obs'+(tall?' tall':''));
        o.style.cssText=`width:${w}px;height:${h}px;left:${fwid+60}px;bottom:${GROUND}px;`;
        add(o,fwid+60,w,0,h);
      }
    }
    function loop(now){
      if(dead)return;
      const dt=Math.min((now-(loop.last||now))/1000,.05); loop.last=now;
      fw=field.clientWidth||1192;
      vy-=2600*dt; y+=vy*dt; if(y<0){ y=0; vy=0; }
      chairEl.style.transform=`translateY(${-y}px) rotate(${y>2?-7:0}deg)`;
      speed+=dt*8;
      nextSpawn-=dt;
      if(nextSpawn<=0){ spawn(); nextSpawn=0.92+Math.random()*0.7; }
      const cl=CHAIR_X, cr=CHAIR_X+CHAIR_W;
      for(const o of obs){
        o.x-=speed*dt; o.el.style.left=o.x+'px';
        if(!o.counted && o.x+o.w<cl){
          o.counted=true; passed++; ctx.sfx.tickup(); stat();
          if(passed>=NEED){ dead='won'; ctx.sfx.good(); T(()=>ctx.win(),450); return; }
        }
        if(!o.hit && !o.counted && o.x<cr && o.x+o.w>cl && y < (o.y0+o.h-6) && (y+CHAIR_H) > (o.y0+6)){
          o.hit=true; bumps++; ctx.sfx.bad(); stat();
          chairEl.classList.remove('hit'); void chairEl.offsetWidth; chairEl.classList.add('hit');
          o.el.style.opacity='.25';
          if(bumps>=MAXB){ dead='lost'; T(()=>ctx.fail(),500); return; }
        }
      }
      obs=obs.filter(o=>{ if(o.x+o.w<-80){ o.el.remove(); return false; } return true; });
      raf_=raf(loop);
    }
    stat();
    ctx.setInstr('Daijin has lured the little three-legged chair into a chase. Tap anywhere or press SPACE to hop the rubble, but stay grounded under the ducking crows. Clear 10 obstacles; three bumps are forgiven.');
    raf_=raf(loop);
    return ()=>{ dead=true; timers.forEach(clearTimeout); cancelAnimationFrame(raf_); window.removeEventListener('keydown',jump); };
  }

  function words(body,ctx){
    let dead=false, timers=[], raf_=null;
    const T=(fn,ms)=>{ const t=setTimeout(fn,ms); timers.push(t); return t; };
    const CHANT=['I humbly return','what was once yours.','O wrathful spirits -','calm your anger','and rest.','These mountains and rivers','I give back','to their gods.'];
    const field=el('div','words-field'); body.appendChild(field);
    const prev=el('div','chant-preview');
    prev.appendChild(el('div','line',CHANT.slice(0,5).join(' ')));
    prev.appendChild(el('div','line',CHANT.slice(5).join(' ')));
    const cnt=el('div','count','MEMORISE - 10'); prev.appendChild(cnt);
    field.appendChild(prev);
    let left=10;
    const cd=setInterval(()=>{ left--; cnt.textContent='MEMORISE - '+left; if(left<=0){ clearInterval(cd); begin(); } },1000);
    timers.push(cd);

    let time=60, idx=0, tiles=[], last=null;
    function place(t){
      t.style.left=(14+Math.random()*72)+'%';
      t.style.top=(12+Math.random()*76)+'%';
    }
    function untangle(){
      for(let k=0;k<60;k++){
        let moved=false;
        const live=tiles.filter(t=>!t.classList.contains('got'));
        for(let i=0;i<live.length;i++) for(let j=i+1;j<live.length;j++){
          const a=live[i].getBoundingClientRect(), b=live[j].getBoundingClientRect();
          if(!(a.right<b.left-8||b.right<a.left-8||a.bottom<b.top-6||b.bottom<a.top-6)){ place(live[j]); moved=true; }
        }
        if(!moved) break;
      }
    }
    function begin(){
      prev.remove();
      CHANT.forEach((w,i)=>{
        const t=el('div','word-tile',w); t.dataset.i=i; place(t);
        t.addEventListener('click',()=>{
          if(dead||t.classList.contains('got')) return;
          if(+t.dataset.i===idx){
            idx++; t.classList.add('got'); ctx.sfx.tickup();
            ctx.setStat(`WORDS ${idx} / 8    ·    ${Math.max(0,time).toFixed(0)}s`);
            if(idx===8){ dead='won'; ctx.sfx.good(); T(()=>ctx.win(),450); }
          } else {
            time-=2; t.classList.add('err'); ctx.sfx.bad();
            T(()=>t.classList.remove('err'),400);
          }
        });
        field.appendChild(t); tiles.push(t);
      });
      untangle();
      last=performance.now();
      const loop=now=>{
        if(dead) return;
        time-=(now-last)/1000; last=now;
        ctx.setStat(`WORDS ${idx} / 8    ·    ${Math.max(0,time).toFixed(0)}s`);
        if(time<=0){ ctx.sfx.bad(); return ctx.fail(); }
        raf_=raf(loop);
      };
      raf_=raf(loop);
    }
    ctx.setStat('MEMORISE THE CHANT');
    ctx.setInstr('Only the Words of Closing can seal this gate. Memorise the chant, then click its eight fragments in true order. A wrong word costs 2 seconds, and the words stay put.');
    return ()=>{ dead=true; timers.forEach(clearTimeout); clearInterval(cd); cancelAnimationFrame(raf_); };
  }


  function catrace(body, ctx){
    let dead=false, raf_=null;
    const field=el('div','race3'); body.appendChild(field);
    field.innerHTML =
      '<div class="r3-hud">'+
        '<div class="r3-pos" id="r3pos">SIDE BY SIDE</div>'+
        '<div class="r3-charge"><span>BURST</span><div class="r3-chargebar"><i id="r3charge"></i></div></div>'+
      '</div>'+
      '<div class="r3-track" id="r3track">'+
        '<div class="r3-water"></div>'+
        '<div class="r3-lines">'+
          '<div class="r3-line" style="top:25%"></div>'+
          '<div class="r3-line" style="top:50%"></div>'+
          '<div class="r3-line" style="top:75%"></div>'+
        '</div>'+
        '<div class="r3-goal" id="r3goal"><span>戸</span></div>'+
        '<div class="r3-cat riv" id="r3riv"><div class="r3-wake"></div><div class="r3-tag">DAIJIN</div>'+CAT_SVG(false)+'</div>'+
        '<div class="r3-cat you" id="r3you"><div class="r3-wake"></div><div class="r3-tag">YOU</div>'+CAT_SVG(false)+'</div>'+
        '<div class="r3-alert" id="r3alert"></div>'+
        '<div class="r3-flag" id="r3flag">UP / DOWN · or TAP TOP / BOTTOM to switch lanes</div>'+
      '</div>';

    const track  = field.querySelector('#r3track');
    const youEl  = field.querySelector('#r3you');
    const rivEl  = field.querySelector('#r3riv');
    const chargeEl=field.querySelector('#r3charge');
    const alertEl= field.querySelector('#r3alert');
    const flag   = field.querySelector('#r3flag');
    const posEl  = field.querySelector('#r3pos');
    const goalEl = field.querySelector('#r3goal');

    const LANES=4, GOAL=1000;
    // horizontal screen positions (fraction of track width) the cats sit at
    const YOU_X=0.20, RIV_BASE_X=0.30;

    let lane=1, catY=1, started=false;
    let yourM=0, rivM=0;
    let baseSpd=42, boost=0, slow=0, controlLock=0, charge=0;
    let items=[], spawnT=.5, world=300;
    let rivLane=2, rivCatY=2, rivLaneT=0;     // Daijin weaves between lanes too
    let alertT=0;

    function laneY(l){ return (l+0.5)/LANES; }
    function popAlert(msg,cls){
      alertEl.textContent=msg;
      alertEl.className='r3-alert '+cls;
      alertEl.classList.remove('show'); void alertEl.offsetWidth; alertEl.classList.add('show');
      alertT=0.9;
    }
    function setLane(n){
      if(controlLock>0 || dead) return;
      lane=clamp(n,0,LANES-1);
      if(!started){ started=true; flag.style.opacity='0'; popAlert('Go!','good'); }
    }
    function onKey(e){
      if(e.code==='ArrowUp'||e.code==='KeyW'){ e.preventDefault(); setLane(lane-1); }
      else if(e.code==='ArrowDown'||e.code==='KeyS'){ e.preventDefault(); setLane(lane+1); }
    }
    function onTap(e){
      const r=track.getBoundingClientRect();
      const y=(e.clientY-r.top)/r.height;
      setLane(y<.5 ? lane-1 : lane+1);
    }
    window.addEventListener('keydown',onKey);
    track.addEventListener('pointerdown',onTap);

    const FISH='<svg viewBox="0 0 40 28" aria-hidden="true"><path d="M3 14 Q14 2 28 14 Q14 26 3 14Z" fill="#8df0dc" stroke="#3ec9ae" stroke-width="2"></path><path d="M28 14 L39 7 L37 14 L39 21Z" fill="#8df0dc"></path><circle cx="11" cy="12" r="1.6" fill="#06231d"></circle></svg>';
    const ROCK='<svg viewBox="0 0 40 34" aria-hidden="true"><path d="M5 31 Q1 16 12 12 Q16 2 26 8 Q39 8 35 23 L34 31Z" fill="#5a4636" stroke="#9c7b63" stroke-width="2"></path></svg>';
    const EDDY='<svg viewBox="0 0 44 44" aria-hidden="true"><path d="M22 6 C30 6 36 11 36 18 C36 24 31 28 25 28 C20 28 17 25 17 21 C17 18 19 15 23 15 C26 15 28 17 28 20 C28 23 26 24 24 24" fill="none" stroke="#8db8ff" stroke-width="4" stroke-linecap="round"></path><path d="M21 38 C13 38 7 33 7 26 C7 20 12 16 18 16 C23 16 26 19 26 23" fill="none" stroke="#cfe4ff" stroke-width="4" stroke-linecap="round"></path></svg>';
    const LANT='<svg viewBox="0 0 42 52" aria-hidden="true"><path d="M21 4 L31 22 L21 48 L11 22 Z" fill="#ffd98c" stroke="#e8c98a" stroke-width="2"></path><circle cx="21" cy="22" r="5" fill="#fff1c8"></circle></svg>';

    function spawn(){
      const roll=Math.random();
      let item;
      if(started && yourM>180 && roll>.82){
        // broken gate spanning two lanes
        const start=Math.floor(Math.random()*(LANES-1));
        const gate=el('div','r3-item r3-gate','<span></span><span></span>');
        gate.style.left='106%';
        gate.style.top=(((laneY(start)+laneY(start+1))/2)*100)+'%';
        gate.style.height=(100/LANES*1.7)+'%';
        track.appendChild(gate);
        item={ el:gate, kind:'gate', lanes:[start,start+1], x:1.06, hit:false, w:.085 };
      } else {
        const laneId=Math.floor(Math.random()*LANES);
        const kind = roll<.40?'fish' : roll<.66?'rock' : roll<.86?'eddy' : 'lantern';
        const svg = kind==='fish'?FISH : kind==='rock'?ROCK : kind==='eddy'?EDDY : LANT;
        const node=el('div','r3-item r3-'+kind,svg);
        node.style.left='106%';
        node.style.top=(laneY(laneId)*100)+'%';
        track.appendChild(node);
        item={ el:node, kind, lane:laneId, x:1.06, hit:false, w:kind==='lantern'?.045:.05 };
      }
      items.push(item);
    }

    let last=performance.now();
    function loop(now){
      if(dead) return;
      const dt=Math.min((now-last)/1000,.05); last=now;

      // smooth your lane glide
      catY+=(lane-catY)*Math.min(1,dt*16);
      youEl.style.top=(laneY(catY)*100)+'%';

      if(started){
        boost=Math.max(0,boost-dt);
        slow=Math.max(0,slow-dt);
        controlLock=Math.max(0,controlLock-dt);
        alertT=Math.max(0,alertT-dt);

        const spd=baseSpd*(boost>0?1.55:1)*(slow>0?.58:1);
        yourM+=spd*dt;
        world=280+spd*7;

        // ---- Daijin rubber-bands: keep him within a tight band ----
        const gap=yourM-rivM;                  // +ve = you lead
        // rival target speed pulls him toward you. Lead big -> he speeds; trail -> he eases.
        const pull = clamp(gap*0.9, -10, 16);
        const rivSpd = 40 + pull + Math.sin(now/600)*1.4 + (boost>0?2:0);
        rivM += Math.max(8, rivSpd) * dt;

        // Daijin weaves lanes to look alive
        rivLaneT-=dt;
        if(rivLaneT<=0){ rivLaneT=0.7+Math.random()*0.8; rivLane=clamp(rivLane+(Math.random()<.5?-1:1),0,LANES-1); }
        rivCatY+=(rivLane-rivCatY)*Math.min(1,dt*8);
        rivEl.style.top=(laneY(rivCatY)*100)+'%';

        // rival horizontal position reflects the gap (dramatic but bounded)
        const rivX=clamp(RIV_BASE_X + (-gap/GOAL)*0.55, 0.04, 0.62);
        rivEl.style.left=(rivX*100)+'%';
        youEl.style.left=(YOU_X*100)+'%';

        spawnT-=dt;
        if(spawnT<=0){ spawn(); spawnT=0.34+Math.random()*0.26; }
      }

      const trackW=track.clientWidth||1180;
      for(const it of items){
        it.x-=world*dt/trackW;
        it.el.style.left=(it.x*100)+'%';
        if(!it.hit){
          const hitX=Math.abs(it.x-YOU_X)<it.w;
          const myLane=Math.round(catY);
          const hitLane = it.kind==='gate' ? it.lanes.includes(myLane) : it.lane===myLane;
          if(hitX && hitLane){
            it.hit=true; it.el.classList.add('got');
            if(it.kind==='fish'){
              charge=Math.min(100,charge+34); yourM+=10; ctx.sfx.meow(); popAlert('Fish +boost','good');
              youEl.classList.remove('pop'); void youEl.offsetWidth; youEl.classList.add('pop');
              if(charge>=100){ charge=0; boost=1.4; ctx.sfx.good(); popAlert('BURST!','good'); track.classList.add('burst'); }
            } else if(it.kind==='lantern'){
              boost=1.15; yourM+=6; ctx.sfx.good(); popAlert('Lantern dash','good');
            } else if(it.kind==='eddy'){
              controlLock=.7; slow=1.1; charge=Math.max(0,charge-18); ctx.sfx.bad(); popAlert('Caught in the whirlpool','bad');
              track.classList.remove('hit'); void track.offsetWidth; track.classList.add('hit');
            } else if(it.kind==='gate'){
              slow=1.2; yourM=Math.max(0,yourM-16); ctx.sfx.bad(); popAlert('Broken gate','bad');
              track.classList.remove('hit'); void track.offsetWidth; track.classList.add('hit');
            } else {
              slow=.9; yourM=Math.max(0,yourM-9); ctx.sfx.bad(); popAlert('Rubble','bad');
              track.classList.remove('hit'); void track.offsetWidth; track.classList.add('hit');
            }
          }
        }
      }
      items=items.filter(it=>{ if(it.x<-.14){ it.el.remove(); return false; } return true; });
      if(boost<=0) track.classList.remove('burst');

      chargeEl.style.width=charge+'%';

      // goal marker creeps toward you as the finish nears
      const prog=Math.max(yourM,rivM)/GOAL;
      goalEl.style.right=(2 + (1-Math.min(1,prog))*0)+'%';

      const lead=yourM-rivM;
      if(started){
        if(Math.abs(lead)<12) posEl.textContent='NECK AND NECK';
        else posEl.textContent=(lead>0?'LEADING ':'BEHIND ')+Math.abs(Math.round(lead))+'m';
        ctx.setStat(`${Math.min(100,Math.round(yourM/GOAL*100))}% to the door  ·  BURST ${Math.round(charge)}%`);
      }

      if(yourM>=GOAL){ dead='won'; ctx.sfx.good(); youEl.classList.add('win'); return ctx.win(); }
      if(rivM>=GOAL){ dead='lost'; ctx.sfx.bad(); rivEl.classList.add('win'); return ctx.fail(); }

      raf_=raf(loop);
    }

    ctx.setStat('READY');
    ctx.setInstr('Race Daijin across the flooded mirror — he stays right on your tail. Switch lanes with UP / DOWN or by tapping the top and bottom of the track. Chain fish to fill the Burst meter, grab lanterns for a quick dash, and dodge rubble, whirlpools, and broken gates. Beat him to the door.');
    // place cats at start
    youEl.style.left=(YOU_X*100)+'%';
    rivEl.style.left=(RIV_BASE_X*100)+'%';
    youEl.style.top=(laneY(catY)*100)+'%';
    rivEl.style.top=(laneY(rivCatY)*100)+'%';
    raf_=raf(loop);

    return ()=>{ dead=true; cancelAnimationFrame(raf_); window.removeEventListener('keydown',onKey); };
  }


  /* ============================================================
     THE EVER-AFTER  (rebuilt finale)
     Two movements, balanced — challenging but moving:
     I.  THROUGH THE WORM  — the Worm pours down from the sky in
         great red coils. Move your keystone (the chair) between
         three channels to slip through the gaps. Touch a coil and
         you're thrown back (lose a star). Survive the descent to
         reach the lock buried beneath it.
     II. SET THE KEYSTONE  — a slow sweep crosses the lock face;
         press when it's inside the gold gate. Three clean sets
         seat the keystone, the closing key is granted, and the
         gate seals on its own.
     Cinematic backdrop: parallax falling stars + the Ever-After sky.
     ============================================================ */
  function finale(body, ctx){
    let dead=false, raf_=null, timers=[], phase='descent';
    const T=(fn,ms)=>{ const t=setTimeout(fn,ms); timers.push(t); return t; };

    const field=el('div','ever'); body.appendChild(field);
    field.innerHTML =
      '<div class="ev-sky"></div>'+
      '<div class="ev-stars" id="evstars"></div>'+
      '<div class="ev-hud">'+
        '<div class="ev-stage" id="evstage">I · THROUGH THE WORM</div>'+
        '<div class="ev-hearts" id="evhearts"></div>'+
      '</div>'+
      '<div class="ev-field" id="evfield">'+
        '<div class="ev-worm" id="evworm"></div>'+        /* coil container */
        '<div class="ev-lanes" id="evlanes">'+
          '<div class="ev-chair" id="evchair">'+
            '<svg viewBox="0 0 90 104" aria-hidden="true">'+
              '<rect x="16" y="4" width="54" height="46" rx="9" fill="#e3b33f" stroke="#96701e" stroke-width="3.5"></rect>'+
              '<circle cx="43" cy="24" r="7.5" fill="#10202c"></circle>'+
              '<rect x="8" y="48" width="72" height="15" rx="5" fill="#edc257" stroke="#96701e" stroke-width="3.5"></rect>'+
              '<rect x="15" y="62" width="9" height="40" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>'+
              '<rect x="63" y="62" width="9" height="40" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>'+
              '<rect x="39" y="62" width="9" height="33" rx="3.5" fill="#d9a93c" stroke="#96701e" stroke-width="2.5"></rect>'+
            '</svg>'+
          '</div>'+
        '</div>'+
        '<div class="ev-lock" id="evlock">'+
          '<svg viewBox="0 0 220 220">'+
            '<circle cx="110" cy="110" r="96" fill="none" stroke="rgba(141,240,220,.16)" stroke-width="2"></circle>'+
            '<circle cx="110" cy="110" r="78" fill="none" stroke="rgba(230,239,239,.12)" stroke-width="1"></circle>'+
            /* gold gate marker at top */
            '<path d="M110 8 L118 26 L102 26 Z" fill="#e8c98a"></path>'+
            '<g id="ev-gate"><path d="M110 14 A96 96 0 0 1 110 14" fill="none"></path>'+
              '<path id="ev-gatearc" d="" fill="none" stroke="rgba(232,201,138,.30)" stroke-width="10"></path></g>'+
            /* sweeping pointer */
            '<g id="ev-sweep"><line x1="110" y1="110" x2="110" y2="20" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"></line>'+
              '<circle cx="110" cy="20" r="6" fill="var(--accent)"></circle></g>'+
            /* the key (revealed in phase III) */
            '<g id="ev-key" opacity="0"><rect x="106" y="62" width="8" height="64" rx="3" fill="#e8c98a"></rect>'+
              '<circle cx="110" cy="54" r="14" fill="none" stroke="#e8c98a" stroke-width="6"></circle>'+
              '<rect x="110" y="110" width="16" height="7" fill="#e8c98a"></rect>'+
              '<rect x="110" y="96" width="11" height="7" fill="#e8c98a"></rect></g>'+
          '</svg>'+
        '</div>'+
      '</div>'+
      '<div class="ev-side" id="evside">'+
        '<div class="ev-note" id="evnote"></div>'+
        '<div class="ev-meterwrap" id="evmeterwrap"><div class="ev-meter"><i id="evmeter"></i></div></div>'+
        '<div class="ev-key-hint" id="evkeyhint">CLICK / SPACE</div>'+
      '</div>'+
      '<div class="ev-flash" id="evflash"></div>'+
      '<div class="ev-msg" id="evmsg"></div>';

    const fieldEl  = field.querySelector('#evfield');
    const wormEl   = field.querySelector('#evworm');
    const lanesEl  = field.querySelector('#evlanes');
    const chairEl  = field.querySelector('#evchair');
    const lockEl   = field.querySelector('#evlock');
    const heartsEl = field.querySelector('#evhearts');
    const stageEl  = field.querySelector('#evstage');
    const noteEl   = field.querySelector('#evnote');
    const meterWrap= field.querySelector('#evmeterwrap');
    const meter    = field.querySelector('#evmeter');
    const keyHint  = field.querySelector('#evkeyhint');
    const flashEl  = field.querySelector('#evflash');
    const msgEl    = field.querySelector('#evmsg');
    const starsEl  = field.querySelector('#evstars');
    const sweepG   = field.querySelector('#ev-sweep');
    const gateArc  = field.querySelector('#ev-gatearc');
    const keyG     = field.querySelector('#ev-key');

    // parallax stars
    starsEl.innerHTML=Array.from({length:26},()=>{
      const x=(Math.random()*100).toFixed(1), d=(Math.random()*4).toFixed(2), dur=(3+Math.random()*3).toFixed(2);
      const far=Math.random()<.5;
      return `<i class="${far?'far':''}" style="left:${x}%;animation-delay:${d}s;animation-duration:${dur}s"></i>`;
    }).join('');

    // ---- shared state ----
    let hearts=3;
    function renderHearts(){ heartsEl.innerHTML=[0,1,2].map(i=>`<span class="${i<hearts?'on':'off'}"></span>`).join(''); }
    function setMsg(t){ msgEl.textContent=t; }
    function flash(){ flashEl.classList.remove('go'); void flashEl.offsetWidth; flashEl.classList.add('go'); }
    renderHearts();

    /* ---------- PHASE I — THROUGH THE WORM ---------- */
    const LANES=3;
    let lane=1, chairX=1;
    let coils=[], coilTimer=0, descend=0;       // descend 0->1 = progress to lock
    const DESCEND_NEED=18;                        // coils to survive
    let coilsPassed=0;
    let invuln=0;

    function laneX(l){ return (l+0.5)/LANES; }
    function setLane(n){
      if(phase!=='descent'||dead) return;
      lane=clamp(n,0,LANES-1);
    }
    function spawnCoil(){
      // a coil is a red band blocking 1 (sometimes the gap is 1 lane wide)
      const openLane=Math.floor(Math.random()*LANES);
      const coil=el('div','ev-coil');
      // build 3 segments, hide the open one
      let segs='';
      for(let i=0;i<LANES;i++){
        if(i===openLane) segs+=`<span class="gap" style="left:${(laneX(i)*100)}%"></span>`;
        else segs+=`<span class="seg" style="left:${(laneX(i)*100)}%"></span>`;
      }
      coil.innerHTML=segs;
      wormEl.appendChild(coil);
      coils.push({ el:coil, y:-0.12, open:openLane, scored:false });
    }

    /* ---------- PHASE II — SET THE KEYSTONE ---------- */
    let sweep=0, sweepSpeed=120, sets=0, misses=0;
    // gold gate occupies a wedge near the top (around angle 0 = up)
    const GATE_HALF=20; // degrees tolerance
    function drawGateArc(){
      // arc centered at top (-90deg in svg terms handled by sweep math); draw a faint wedge
      const r=90, cx=110, cy=110;
      const a0=(-90-GATE_HALF)*Math.PI/180, a1=(-90+GATE_HALF)*Math.PI/180;
      const x0=cx+r*Math.cos(a0), y0=cy+r*Math.sin(a0);
      const x1=cx+r*Math.cos(a1), y1=cy+r*Math.sin(a1);
      gateArc.setAttribute('d',`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    }
    drawGateArc();

    /* ---------- the closing key is granted after three sets ---------- */

    /* ---------- transitions ---------- */
    function toAlign(){
      phase='align';
      coils.forEach(c=>c.el.remove()); coils=[];
      wormEl.classList.add('receding');
      lanesEl.style.opacity='0';
      T(()=>{ chairEl.style.display='none'; },500);
      lockEl.classList.add('show');
      stageEl.textContent='II · SET THE KEYSTONE';
      noteEl.textContent='The lock turns slowly. Press when the teal hand crosses the gold gate at the top. Three clean sets seat the keystone.';
      meterWrap.style.display='none';
      keyHint.style.display='block';
      setMsg('The Worm draws back. Beneath it, the true lock rises.');
      ctx.sfx.lock();
      ctx.setStat('SET 0 / 3   ·   SLIPS 0 / 4');
      ctx.setInstr('The keystone is in. Stop the slow hand on the gold gate three times to claim the closing key and seal the gate.');
    }
    function finish(){
      if(dead) return;
      phase='done';
      sweepG.style.opacity='0';
      keyG.setAttribute('opacity','1');
      lockEl.classList.remove('hit'); void lockEl.offsetWidth; lockEl.classList.add('hit');
      meterWrap.style.display='none';
      keyHint.style.display='none';
      stageEl.textContent='THE KEY IS YOURS';
      noteEl.textContent='The keystone is seated. The closing key turns of its own will, and the gate gives way.';
      setMsg('At last the key is in your hand. The door will close.');
      flash();
      ctx.sfx.lock();
      ctx.setStat('GATE SEALED');
      dead='won';
      T(()=>ctx.win(),1100);
    }

    /* ---------- input ---------- */
    function press(){
      if(dead) return;
      if(phase==='align'){
        const a=((sweep%360)+360)%360;   // 0..360, 0 = up
        const diff=Math.min(a,360-a);     // distance from top
        if(diff<=GATE_HALF){
          sets++; sweepSpeed+=24; ctx.sfx.good(); flash();
          lockEl.classList.remove('hit'); void lockEl.offsetWidth; lockEl.classList.add('hit');
          ctx.setStat(`SET ${sets} / 3   ·   SLIPS ${misses} / 4`);
          if(sets>=3) T(finish,420);
        } else {
          misses++; ctx.sfx.bad();
          lockEl.classList.remove('whiff'); void lockEl.offsetWidth; lockEl.classList.add('whiff');
          ctx.setStat(`SET ${sets} / 3   ·   SLIPS ${misses} / 4`);
          if(misses>=4){ dead='lost'; T(()=>ctx.fail(),420); }
        }
      }
    }
    function onDown(e){
      if(e&&e.code&&e.code!=='Space') return;
      if(e&&e.code==='Space') e.preventDefault();
      press();
    }
    function onKeyMove(e){
      if(phase!=='descent') return;
      if(e.code==='ArrowLeft'||e.code==='KeyA'){ e.preventDefault(); setLane(lane-1); }
      else if(e.code==='ArrowRight'||e.code==='KeyD'){ e.preventDefault(); setLane(lane+1); }
    }
    function onTapMove(e){
      if(phase!=='descent') return;
      const r=fieldEl.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width;
      setLane(x<.34?lane-1 : x>.66?lane+1 : lane);
    }
    window.addEventListener('keydown',onKeyMove);
    window.addEventListener('keydown',onDown);
    fieldEl.addEventListener('pointerdown',e=>{
      if(phase==='descent') onTapMove(e);
      else press();
    });

    /* ---------- main loop ---------- */
    let last=performance.now();
    function loop(now){
      if(dead) return;
      const dt=Math.min((now-last)/1000,.05); last=now;

      if(phase==='descent'){
        chairX+=(lane-chairX)*Math.min(1,dt*16);
        chairEl.style.left=(laneX(chairX)*100)+'%';
        invuln=Math.max(0,invuln-dt);

        coilTimer-=dt;
        const spawnGap=Math.max(0.62, 1.05 - coilsPassed*0.02);
        if(coilTimer<=0){ spawnCoil(); coilTimer=spawnGap; }

        const speed=0.55+coilsPassed*0.012;       // coil fall speed (frac/sec)
        const myLane=Math.round(chairX);
        for(const c of coils){
          c.y+=speed*dt;
          c.el.style.top=(c.y*100)+'%';
          // collision band around chair (chair sits ~78% down)
          if(!c.scored && c.y>0.86){
            c.scored=true; coilsPassed++;
            if(c.open!==myLane && invuln<=0){
              hearts--; renderHearts(); ctx.sfx.bad(); invuln=0.8;
              fieldEl.classList.remove('shk'); void fieldEl.offsetWidth; fieldEl.classList.add('shk');
              chairEl.classList.remove('hurt'); void chairEl.offsetWidth; chairEl.classList.add('hurt');
              if(hearts<=0){ dead='lost'; return T(()=>ctx.fail(),420); }
            } else if(c.open===myLane){
              ctx.sfx.tickup&&ctx.sfx.tickup();
            }
          }
        }
        coils=coils.filter(c=>{ if(c.y>1.15){ c.el.remove(); return false; } return true; });

        descend=Math.min(1,coilsPassed/DESCEND_NEED);
        ctx.setStat(`DESCENT ${Math.round(descend*100)}%   ·   ${hearts} ♥`);
        if(coilsPassed>=DESCEND_NEED){ phase='gap'; return T(toAlign,300); }

      } else if(phase==='align'){
        sweep=(sweep+sweepSpeed*dt)%360;
        sweepG.setAttribute('transform',`rotate(${sweep} 110 110)`);
      }
      raf_=raf(loop);
    }

    setMsg('The Worm pours down from the endless sky. Steer the keystone into the open channel of each coil and slip through to the lock below.');
    ctx.setStat('DESCENT 0%   ·   3 ♥');
    ctx.setInstr('The last gate opens onto the Ever-After, where all time falls at once. Steer the keystone (LEFT / RIGHT or tap the sides) through the gaps in the Worm\u2019s coils, then set the keystone three times to claim the closing key and seal the door.');
    raf_=raf(loop);

    return ()=>{
      dead=true;
      timers.forEach(clearTimeout);
      cancelAnimationFrame(raf_);
      window.removeEventListener('keydown',onKeyMove);
      window.removeEventListener('keydown',onDown);
    };
  }

  window.Minigames={ voices, daijin, chair, catrace, words, finale };
})();