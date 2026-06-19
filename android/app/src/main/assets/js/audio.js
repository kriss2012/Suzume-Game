/* Suzume Doors — WebAudio synth sfx + ambience */
(function(){
  let ctx=null, master=null, ambGain=null, ambNodes=[], enabled=true, rumble=null;
  function ac(){
    if(!ctx){
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain(); master.gain.value=.9; master.connect(ctx.destination);
    }
    if(ctx.state==='suspended') ctx.resume();
    return ctx;
  }
  function out(){ ac(); return master; }
  function env(g,t0,a,peak,d,sus,r,end){
    g.gain.setValueAtTime(0,t0);
    g.gain.linearRampToValueAtTime(peak,t0+a);
    g.gain.linearRampToValueAtTime(sus,t0+a+d);
    g.gain.linearRampToValueAtTime(0,t0+a+d+r+(end||0));
  }
  function tone(freq,type,dur,vol,bendTo){
    if(!enabled) return; const c=ac(),t=c.currentTime;
    const o=c.createOscillator(),g=c.createGain();
    o.type=type||'sine'; o.frequency.setValueAtTime(freq,t);
    if(bendTo) o.frequency.exponentialRampToValueAtTime(bendTo,t+dur);
    env(g,t,.008,vol,dur*.3,vol*.4,dur*.7);
    o.connect(g); g.connect(out()); o.start(t); o.stop(t+dur+.1);
  }
  function bell(freq,dur,vol){
    if(!enabled) return; const c=ac(),t=c.currentTime;
    [1,2.76,5.4].forEach((m,i)=>{
      const o=c.createOscillator(),g=c.createGain();
      o.type='sine'; o.frequency.value=freq*m;
      const v=vol/(i*2+1);
      g.gain.setValueAtTime(v,t);
      g.gain.exponentialRampToValueAtTime(.0001,t+dur*(1-i*.18));
      o.connect(g); g.connect(out()); o.start(t); o.stop(t+dur);
    });
  }
  function noiseBuf(c,len){
    const b=c.createBuffer(1,c.sampleRate*len,c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    return b;
  }
  const SFX={
    click(){ tone(620,'triangle',.07,.10); },
    good(){ bell(740,.9,.16); setTimeout(()=>bell(988,1.1,.13),90); },
    bad(){ tone(190,'sawtooth',.3,.12,120); tone(96,'sine',.4,.14,70); },
    wisp(n){ bell(392*Math.pow(2,n/6),.7,.14); },
    jump(){ tone(440,'triangle',.16,.12,880); },
    meow(){ tone(880,'sine',.16,.12,1320); setTimeout(()=>tone(1180,'sine',.12,.08,900),120); },
    decoy(){ tone(150,'square',.22,.10,80); },
    creak(){
      tone(210,'sawtooth',1.2,.045,85);
      setTimeout(()=>tone(150,'sawtooth',.9,.035,65),350);
      setTimeout(()=>{ bell(1046,1.4,.09); bell(1318,1.6,.06); },750);
    },
    tickup(){ tone(980,'triangle',.05,.07); },
    lock(){
      if(!enabled) return; const c=ac(),t=c.currentTime;
      const o=c.createOscillator(),g=c.createGain();
      o.type='sine'; o.frequency.setValueAtTime(70,t); o.frequency.exponentialRampToValueAtTime(38,t+.5);
      g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.0001,t+.6);
      o.connect(g); g.connect(out()); o.start(t); o.stop(t+.7);
      const s=c.createBufferSource(); s.buffer=noiseBuf(c,.18);
      const f=c.createBiquadFilter(); f.type='bandpass'; f.frequency.value=2400;
      const ng=c.createGain(); ng.gain.setValueAtTime(.18,t); ng.gain.exponentialRampToValueAtTime(.0001,t+.16);
      s.connect(f); f.connect(ng); ng.connect(out()); s.start(t);
      setTimeout(()=>{ bell(523.25,1.6,.18); setTimeout(()=>bell(784,2,.14),160); },340);
    },
    rumbleStart(){
      if(!enabled||rumble) return; const c=ac(),t=c.currentTime;
      const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=34;
      const o2=c.createOscillator(); o2.type='sine'; o2.frequency.value=27;
      const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=120;
      const g=c.createGain(); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.16,t+.8);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(out());
      o.start(); o2.start(); rumble={o,o2,g};
    },
    rumbleStop(){
      if(!rumble) return; const c=ac(),t=c.currentTime;
      rumble.g.gain.linearRampToValueAtTime(0,t+.5);
      const r=rumble; rumble=null;
      setTimeout(()=>{ try{r.o.stop();r.o2.stop();}catch(e){} },700);
    }
  };
  function ambientStart(){
    if(!enabled||ambNodes.length) return; const c=ac(),t=c.currentTime;
    ambGain=c.createGain(); ambGain.gain.setValueAtTime(0,t);
    ambGain.gain.linearRampToValueAtTime(.05,t+3); ambGain.connect(out());
    [[110,'sine',0],[110.7,'sine',0],[220,'sine',-6],[330.2,'sine',-12]].forEach(([f,ty])=>{
      const o=c.createOscillator(),g=c.createGain();
      o.type=ty; o.frequency.value=f; g.gain.value=.25;
      const lfo=c.createOscillator(),lg=c.createGain();
      lfo.frequency.value=.07+Math.random()*.08; lg.gain.value=.12;
      lfo.connect(lg); lg.connect(g.gain); lfo.start();
      o.connect(g); g.connect(ambGain); o.start();
      ambNodes.push(o,lfo);
    });
  }
  function setEnabled(v){
    enabled=v;
    if(!v){ if(ambGain) ambGain.gain.value=0; SFX.rumbleStop(); }
    else { if(ctx&&ambGain) ambGain.gain.value=.05; else ambientStart(); }
  }
  window.SuzumeAudio={ sfx:SFX, ambientStart, setEnabled, isEnabled:()=>enabled, unlock:ac };
})();
