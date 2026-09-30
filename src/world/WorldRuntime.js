const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const distance=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));

export class WorldRuntime {
  constructor(root, config, options={}){
    this.root=root;
    this.config=structuredClone(config);
    this.onEnterScene=options.onEnterScene||null;
    this.state=structuredClone(options.state||{});
    this.player={
      x:Number(this.state.player?.x??config.player?.x??config.width/2),
      y:Number(this.state.player?.y??config.player?.y??config.height/2),
      rotation:Number(this.state.player?.rotation??0),
      vx:0,vy:0
    };
    this.camera={x:this.player.x,y:this.player.y};
    this.collected=new Set(this.state.collected||[]);
    this.keys=new Set();
    this.pointerDirections=new Set();
    this.entities=[];
    this.lastTime=0;
    this.raf=0;
    this.nearby=null;
    this.cleanups=[];
  }

  mount(){
    this.root.innerHTML="";
    this.root.classList.add("tq-world-test-active");

    this.host=document.createElement("main");
    this.host.className="tq-world-host";
    this.host.innerHTML=`
      <div class="tq-world-viewport">
        <div class="tq-world-stage">
          <div class="tq-world-ocean"></div>
          <div class="tq-world-entities"></div>
          <img class="tq-world-player" alt="Navio do jogador">
        </div>
      </div>
      <section class="tq-world-hud">
        <strong>PROTÓTIPO MUNDO 2D</strong>
        <span data-world-coords></span>
        <span data-world-progress></span>
      </section>
      <div class="tq-world-action" hidden>
        <button type="button" data-world-action></button>
      </div>
      <div class="tq-world-controls" aria-label="Controles de navegação">
        <div class="tq-world-dpad">
          <button type="button" data-dir="up" aria-label="Navegar para cima">▲</button>
          <button type="button" data-dir="left" aria-label="Navegar para esquerda">◀</button>
          <button type="button" data-dir="right" aria-label="Navegar para direita">▶</button>
          <button type="button" data-dir="down" aria-label="Navegar para baixo">▼</button>
        </div>
        <div class="tq-world-help">WASD / setas<br>ou controles touch</div>
      </div>`;

    this.root.append(this.host);
    this.viewport=this.host.querySelector(".tq-world-viewport");
    this.stage=this.host.querySelector(".tq-world-stage");
    this.entityLayer=this.host.querySelector(".tq-world-entities");
    this.playerEl=this.host.querySelector(".tq-world-player");
    this.coordsEl=this.host.querySelector("[data-world-coords]");
    this.progressEl=this.host.querySelector("[data-world-progress]");
    this.actionWrap=this.host.querySelector(".tq-world-action");
    this.actionButton=this.host.querySelector("[data-world-action]");

    this.stage.style.width=this.config.width+"px";
    this.stage.style.height=this.config.height+"px";
    this.playerEl.src=this.config.player.src;

    this.renderEntities();
    this.bindControls();
    this.resize();
    this.onResize=()=>this.resize();
    window.addEventListener("resize",this.onResize);
    this.cleanups.push(()=>window.removeEventListener("resize",this.onResize));

    this.lastTime=performance.now();
    this.raf=requestAnimationFrame(t=>this.tick(t));
    return this;
  }

  renderEntities(){
    this.entityLayer.replaceChildren();
    this.entities=(this.config.entities||[]).map((entity,index)=>{
      const item={...entity,index};
      const el=document.createElement(entity.type==="location"?"article":"div");
      el.className="tq-world-entity tq-world-entity--"+entity.type;
      el.dataset.entityId=entity.id;
      el.style.left=entity.x+"px";
      el.style.top=entity.y+"px";
      el.style.zIndex=String(entity.z??10);

      if(entity.type==="location"){
        el.style.width=(entity.width||300)+"px";
        el.style.height=(entity.height||210)+"px";
        el.innerHTML=`
          <img alt="">
          <span class="tq-world-location-label"></span>`;
        const img=el.querySelector("img");
        img.src=entity.src;
        img.alt=entity.label||"Local";
        el.querySelector(".tq-world-location-label").textContent=entity.label||entity.id;
      }else{
        const img=document.createElement("img");
        img.src=entity.src;
        img.alt=entity.label||entity.type;
        el.append(img);
        el.style.width=(entity.width||76)+"px";
        el.style.height=(entity.height||76)+"px";
      }

      if(this.collected.has(entity.id))el.hidden=true;
      this.entityLayer.append(el);
      item.el=el;
      item.anchorX=entity.x;
      item.anchorY=entity.y;
      return item;
    });

    this.updateProgress();
  }

  bindControls(){
    const keyMap={
      ArrowUp:"up",KeyW:"up",
      ArrowDown:"down",KeyS:"down",
      ArrowLeft:"left",KeyA:"left",
      ArrowRight:"right",KeyD:"right"
    };

    const keydown=e=>{
      const dir=keyMap[e.code];
      if(!dir)return;
      e.preventDefault();
      this.keys.add(dir);
    };
    const keyup=e=>{
      const dir=keyMap[e.code];
      if(dir)this.keys.delete(dir);
    };
    window.addEventListener("keydown",keydown,{passive:false});
    window.addEventListener("keyup",keyup);
    this.cleanups.push(()=>{
      window.removeEventListener("keydown",keydown);
      window.removeEventListener("keyup",keyup);
    });

    for(const button of this.host.querySelectorAll("[data-dir]")){
      const dir=button.dataset.dir;
      const start=e=>{
        e.preventDefault();
        this.pointerDirections.add(dir);
        try{button.setPointerCapture(e.pointerId)}catch{}
      };
      const end=e=>{
        this.pointerDirections.delete(dir);
        try{if(button.hasPointerCapture(e.pointerId))button.releasePointerCapture(e.pointerId)}catch{}
      };
      button.addEventListener("pointerdown",start);
      button.addEventListener("pointerup",end);
      button.addEventListener("pointercancel",end);
      button.addEventListener("pointerleave",end);
      this.cleanups.push(()=>{
        button.removeEventListener("pointerdown",start);
        button.removeEventListener("pointerup",end);
        button.removeEventListener("pointercancel",end);
        button.removeEventListener("pointerleave",end);
      });
    }

    const action=()=>this.activateNearby();
    this.actionButton.addEventListener("click",action);
    this.cleanups.push(()=>this.actionButton.removeEventListener("click",action));
  }

  inputVector(){
    const active=new Set([...this.keys,...this.pointerDirections]);
    let x=(active.has("right")?1:0)-(active.has("left")?1:0);
    let y=(active.has("down")?1:0)-(active.has("up")?1:0);
    if(x||y){
      const length=Math.hypot(x,y)||1;
      x/=length;y/=length;
    }
    return {x,y};
  }

  resize(){
    const rect=this.viewport.getBoundingClientRect();
    this.viewportSize={width:rect.width,height:rect.height};
    this.updateCamera(true);
  }

  updatePlayer(dt){
    const input=this.inputVector();
    const accel=520;
    const maxSpeed=250;
    const drag=Math.pow(0.0008,dt);

    this.player.vx=(this.player.vx+input.x*accel*dt)*drag;
    this.player.vy=(this.player.vy+input.y*accel*dt)*drag;

    const speed=Math.hypot(this.player.vx,this.player.vy);
    if(speed>maxSpeed){
      const scale=maxSpeed/speed;
      this.player.vx*=scale;
      this.player.vy*=scale;
    }

    this.player.x=clamp(this.player.x+this.player.vx*dt,55,this.config.width-55);
    this.player.y=clamp(this.player.y+this.player.vy*dt,70,this.config.height-70);

    if(speed>8){
      this.player.rotation=Math.atan2(this.player.vy,this.player.vx)*180/Math.PI+90;
    }

    this.playerEl.style.left=this.player.x+"px";
    this.playerEl.style.top=this.player.y+"px";
    this.playerEl.style.transform=`translate(-50%,-50%) rotate(${this.player.rotation}deg)`;
  }

  updateFloating(time){
    for(const entity of this.entities){
      if(entity.type!=="barrel"||this.collected.has(entity.id))continue;
      const phase=(entity.index+1)*1.71;
      const drift=Number(entity.drift??20);
      const bob=Number(entity.bob??9);
      const x=entity.anchorX+Math.sin(time*.00032+phase)*drift;
      const y=entity.anchorY+Math.cos(time*.00047+phase)*bob;
      entity.x=x;entity.y=y;
      entity.el.style.left=x+"px";
      entity.el.style.top=y+"px";
      entity.el.style.transform=`translate(-50%,-50%) rotate(${Math.sin(time*.0007+phase)*5}deg)`;
    }
  }

  updateCamera(immediate=false){
    if(!this.viewportSize)return;
    const vw=this.viewportSize.width;
    const vh=this.viewportSize.height;
    const targetX=this.config.width<=vw?this.config.width/2:clamp(this.player.x,vw/2,this.config.width-vw/2);
    const targetY=this.config.height<=vh?this.config.height/2:clamp(this.player.y,vh/2,this.config.height-vh/2);
    const factor=immediate?1:.12;
    this.camera.x+=(targetX-this.camera.x)*factor;
    this.camera.y+=(targetY-this.camera.y)*factor;
    const tx=Math.round(vw/2-this.camera.x);
    const ty=Math.round(vh/2-this.camera.y);
    this.stage.style.transform=`translate3d(${tx}px,${ty}px,0)`;
  }

  updateNearby(){
    let best=null;
    let bestDistance=Infinity;
    for(const entity of this.entities){
      if(this.collected.has(entity.id))continue;
      const threshold=entity.interactionRadius??(entity.type==="location"?230:105);
      const d=distance(this.player,entity);
      if(d<=threshold&&d<bestDistance){
        best=entity;
        bestDistance=d;
      }
    }

    this.nearby=best;
    if(!best){
      this.actionWrap.hidden=true;
      return;
    }

    this.actionWrap.hidden=false;
    this.actionButton.textContent=best.type==="location"
      ? "Entrar: "+(best.label||best.id)
      : "Coletar "+(best.label||"barril");
  }

  activateNearby(){
    const entity=this.nearby;
    if(!entity)return;
    if(entity.type==="barrel"){
      this.collected.add(entity.id);
      entity.el.hidden=true;
      this.updateProgress();
      this.updateNearby();
      return;
    }
    if(entity.type==="location"&&entity.scene&&this.onEnterScene){
      this.onEnterScene(entity,this.getState());
    }
  }

  updateProgress(){
    const total=this.entities.filter(e=>e.type==="barrel").length;
    const collected=this.entities.filter(e=>e.type==="barrel"&&this.collected.has(e.id)).length;
    if(this.progressEl)this.progressEl.textContent=`Barris: ${collected}/${total}`;
  }

  tick(time){
    const dt=Math.min(.04,Math.max(.001,(time-this.lastTime)/1000));
    this.lastTime=time;
    this.updatePlayer(dt);
    this.updateFloating(time);
    this.updateCamera();
    this.updateNearby();
    if(this.coordsEl)this.coordsEl.textContent=`x ${Math.round(this.player.x)} · y ${Math.round(this.player.y)}`;
    this.raf=requestAnimationFrame(t=>this.tick(t));
  }

  getState(){
    return {
      player:{x:this.player.x,y:this.player.y,rotation:this.player.rotation},
      collected:[...this.collected]
    };
  }

  destroy(){
    cancelAnimationFrame(this.raf);
    for(const cleanup of this.cleanups.splice(0))cleanup();
    this.root.classList.remove("tq-world-test-active");
    this.root.innerHTML="";
  }
}
