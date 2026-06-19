/* Suzume Doors — ambient particles */
(function(){
  const canvas=document.getElementById('particle-canvas');
  if(!canvas) return;
  const ctx=canvas.getContext('2d');
  let W,H,particles=[];

  function resize(){ W=canvas.width=window.innerWidth; H=canvas.height=window.innerHeight; }
  window.addEventListener('resize',resize); resize();

  function rand(a,b){ return a+Math.random()*(b-a); }

  function Particle(){
    this.reset=function(){
      this.x=rand(0,W); this.y=rand(-20,H+20);
      this.r=rand(0.5,2.2); this.alpha=0;
      this.targetAlpha=rand(0.08,0.22);
      this.vx=rand(-0.12,0.12); this.vy=rand(0.08,0.32);
      this.life=0; this.maxLife=rand(180,340);
      this.hue=rand(170,210);
    };
    this.reset();
    this.life=rand(0,this.maxLife);
  }

  for(let i=0;i<80;i++) particles.push(new Particle());

  function frame(){
    requestAnimationFrame(frame);
    ctx.clearRect(0,0,W,H);
    for(const p of particles){
      p.life++;
      const t=p.life/p.maxLife;
      p.alpha= t<0.2 ? p.targetAlpha*(t/0.2) : t>0.8 ? p.targetAlpha*((1-t)/0.2) : p.targetAlpha;
      p.x+=p.vx; p.y+=p.vy;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`hsla(${p.hue},70%,80%,${p.alpha})`;
      ctx.fill();
      if(p.life>=p.maxLife) p.reset();
    }
  }
  frame();

  /* Sakura petals on title screen */
  function spawnPetals(){
    const layer=document.getElementById('petal-layer');
    if(!layer) return;
    layer.innerHTML='';
    for(let i=0;i<18;i++){
      const p=document.createElement('div');
      p.className='sakura-petal';
      const size=rand(6,14);
      p.style.cssText=`
        width:${size}px;height:${size*0.6}px;
        left:${rand(0,100)}%;
        top:${rand(-20,110)}%;
        animation-delay:${rand(0,8)}s;
        animation-duration:${rand(6,14)}s;
        opacity:${rand(0.15,0.45)};
        transform:rotate(${rand(0,360)}deg);
      `;
      layer.appendChild(p);
    }
  }
  spawnPetals();

  /* Dust motes on level screen */
  function spawnMotes(){
    const layer=document.getElementById('mote-layer');
    if(!layer) return;
    layer.innerHTML='';
    for(let i=0;i<14;i++){
      const m=document.createElement('div');
      m.className='dust-mote';
      m.style.cssText=`
        left:${rand(5,95)}%;top:${rand(10,90)}%;
        width:${rand(2,4)}px;height:${rand(2,4)}px;
        animation-delay:${rand(0,6)}s;
        animation-duration:${rand(5,12)}s;
      `;
      layer.appendChild(m);
    }
  }
  spawnMotes();

  /* Victory fireflies */
  function spawnFireflies(){
    const layer=document.getElementById('victory-fireflies');
    if(!layer) return;
    layer.innerHTML='';
    for(let i=0;i<22;i++){
      const f=document.createElement('div');
      f.className='firefly';
      f.style.cssText=`
        left:${rand(2,98)}%;top:${rand(5,90)}%;
        animation-delay:${rand(0,5)}s;
        animation-duration:${rand(3,7)}s;
      `;
      layer.appendChild(f);
    }
  }
  spawnFireflies();

  /* Victory falling stars */
  function spawnVictoryStars(){
    const layer=document.getElementById('victory-stars');
    if(!layer) return;
    layer.innerHTML='';
    for(let i=0;i<20;i++){
      const s=document.createElement('i');
      s.style.cssText=`
        left:${rand(0,100)}%;
        animation-delay:${rand(0,6)}s;
        animation-duration:${rand(3,7)}s;
      `;
      layer.appendChild(s);
    }
  }
  spawnVictoryStars();

})();
