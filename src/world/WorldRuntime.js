import { normalizeOceanConfig, applyOceanPreset, computeOceanFrame } from "./WorldOceanEffect.mjs?v=20260930-0110";
import { normalizeEntityMotion, applyEntityMotionPreset, computeEntityMotionFrame, defaultEntityMotion } from "./WorldEntityMotion.mjs?v=20260930-0110";
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
const distance=(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));

export class WorldRuntime {
  constructor(root,config,options={}){
    this.root=root;
    this.config=structuredClone(config);
    this.config.ocean=normalizeOceanConfig(this.config.ocean||{});
    this.editorEnabled=options.editorEnabled===true;
    this.mode=this.editorEnabled?"edit":"play";
    this.onEnterScene=options.onEnterScene||null;
    this.onSelectionChange=options.onSelectionChange||null;
    this.onEntityChange=options.onEntityChange||null;
    this.state=structuredClone(options.state||{});
    this.player={
      x:Number(this.state.player?.x??config.player?.x??config.width/2),
      y:Number(this.state.player?.y??config.player?.y??config.height/2),
      rotation:Number(this.state.player?.rotation??0),
      vx:0,vy:0
    };
    this.camera={
      x:Number(config.editor?.cameraX??this.player.x),
      y:Number(config.editor?.cameraY??this.player.y)
    };
    this.zoom=Number(config.editor?.zoom??0.58);
    this.playZoom=1;
    this.collected=new Set(this.state.collected||[]);
    this.keys=new Set();
    this.pointerDirections=new Set();
    this.entities=(config.entities||[]).map((entity,index)=>({
      ...structuredClone(entity),
      index,
      anchorX:Number(entity.x??0),
      anchorY:Number(entity.y??0),
      el:null
    }));
    this.selectedId=null;
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
        <strong data-world-mode></strong>
        <span data-world-name></span>
        <span data-world-coords></span>
        <span data-world-progress></span>
        <span data-world-zoom></span>
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
    this.zoomEl=this.host.querySelector("[data-world-zoom]");
    this.modeEl=this.host.querySelector("[data-world-mode]");
    this.nameEl=this.host.querySelector("[data-world-name]");
    this.actionWrap=this.host.querySelector(".tq-world-action");
    this.actionButton=this.host.querySelector("[data-world-action]");
    this.oceanEl=this.host.querySelector(".tq-world-ocean");

    this.stage.style.width=this.config.width+"px";
    this.stage.style.height=this.config.height+"px";
    this.applyOceanStatic();
    this.playerEl.src=this.config.player?.src||"";
    this.nameEl.textContent=this.config.name||this.config.id||"Mundo";

    this.renderEntities();
    this.bindControls();
    if(this.editorEnabled)this.bindEditorCamera();
    this.resize();
    this.onResize=()=>this.resize();
    window.addEventListener("resize",this.onResize);
    this.cleanups.push(()=>window.removeEventListener("resize",this.onResize));

    this.setMode(this.mode);
    this.lastTime=performance.now();
    this.raf=requestAnimationFrame(t=>this.tick(t));
    return this;
  }

  renderEntities(){
    if(!this.entityLayer)return;
    this.entityLayer.replaceChildren();
    this.gizmoEl=null;

    for(const entity of this.entities){
      const el=document.createElement(entity.type==="location"?"article":"div");
      el.className="tq-world-entity tq-world-entity--"+(entity.type||"object");
      el.dataset.entityId=entity.id;
      el.style.zIndex=String(entity.z??10);

      if(entity.type==="location"){
        el.innerHTML='<img alt=""><span class="tq-world-location-label"></span>';
        const img=el.querySelector("img");
        img.src=entity.src||"";
        img.alt=entity.label||"Local";
        el.querySelector(".tq-world-location-label").textContent=entity.label||entity.id;
      }else{
        const img=document.createElement("img");
        img.src=entity.src||"";
        img.alt=entity.label||entity.type||"Objeto";
        el.append(img);
      }

      entity.el=el;
      this.applyEntityVisual(entity);
      if(this.collected.has(entity.id))el.hidden=true;
      if(this.editorEnabled)this.bindEntityEditing(entity);
      this.entityLayer.append(el);
    }

    this.ensureGizmo();
    this.applySelectionVisual();
    this.syncGizmo();
    this.updateProgress();
  }

  applyEntityVisual(entity){
    const el=entity.el;
    if(!el)return;
    el.style.left=entity.x+"px";
    el.style.top=entity.y+"px";
    el.style.width=(entity.width||96)+"px";
    el.style.height=(entity.height||96)+"px";
    el.style.transform=`translate(-50%,-50%) rotate(${Number(entity.rotation||0)}deg)`;
    const label=el.querySelector(".tq-world-location-label");
    if(label)label.textContent=entity.label||entity.id;
    const img=el.querySelector("img");
    if(img&&img.getAttribute("src")!==String(entity.src||""))img.src=entity.src||"";
  }

  ensureGizmo(){
    if(!this.editorEnabled||!this.entityLayer)return null;
    if(this.gizmoEl?.isConnected)return this.gizmoEl;

    const gizmo=document.createElement("div");
    gizmo.className="tq-world-gizmo";
    gizmo.hidden=true;
    gizmo.innerHTML='<span class="tq-world-gizmo__stem"></span><button type="button" class="tq-world-gizmo__rotate" aria-label="Girar entidade" title="Girar"></button><button type="button" class="tq-world-gizmo__resize" aria-label="Redimensionar entidade" title="Redimensionar"></button>';
    this.entityLayer.append(gizmo);
    this.gizmoEl=gizmo;

    const rotate=gizmo.querySelector(".tq-world-gizmo__rotate");
    rotate.addEventListener("pointerdown",event=>{
      if(this.mode!=="edit"||!this.selectedId)return;
      const entity=this.entities.find(item=>item.id===this.selectedId);
      if(!entity)return;
      event.preventDefault();event.stopPropagation();
      const rect=entity.el?.getBoundingClientRect();
      if(!rect)return;
      const center={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
      try{rotate.setPointerCapture(event.pointerId)}catch{}

      const move=e=>{
        const angle=Math.atan2(e.clientY-center.y,e.clientX-center.x)*180/Math.PI+90;
        entity.rotation=((angle+180)%360+360)%360-180;
        this.applyEntityVisual(entity);
        this.syncGizmo();
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),false);
      };
      const end=e=>{
        try{if(rotate.hasPointerCapture(e.pointerId))rotate.releasePointerCapture(e.pointerId)}catch{}
        rotate.removeEventListener("pointermove",move);
        rotate.removeEventListener("pointerup",end);
        rotate.removeEventListener("pointercancel",end);
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),true);
      };
      rotate.addEventListener("pointermove",move);
      rotate.addEventListener("pointerup",end);
      rotate.addEventListener("pointercancel",end);
    });

    const resize=gizmo.querySelector(".tq-world-gizmo__resize");
    resize.addEventListener("pointerdown",event=>{
      if(this.mode!=="edit"||!this.selectedId)return;
      const entity=this.entities.find(item=>item.id===this.selectedId);
      if(!entity)return;
      event.preventDefault();event.stopPropagation();
      const rect=entity.el?.getBoundingClientRect();
      if(!rect)return;
      const center={x:rect.left+rect.width/2,y:rect.top+rect.height/2};
      const startDistance=Math.max(1,Math.hypot(event.clientX-center.x,event.clientY-center.y));
      const startWidth=Math.max(16,Number(entity.width||96));
      const startHeight=Math.max(16,Number(entity.height||96));
      const startAngle=Number(entity.rotation||0)*Math.PI/180;
      const start={x:event.clientX,y:event.clientY};
      try{resize.setPointerCapture(event.pointerId)}catch{}

      const move=e=>{
        if(entity.lockAspect!==false){
          const scale=Math.max(.12,Math.hypot(e.clientX-center.x,e.clientY-center.y)/startDistance);
          entity.width=clamp(startWidth*scale,16,2400);
          entity.height=clamp(startHeight*scale,16,2400);
        }else{
          const zoom=Math.max(.1,this.zoom||1);
          const dx=(e.clientX-start.x)/zoom;
          const dy=(e.clientY-start.y)/zoom;
          const localX=dx*Math.cos(-startAngle)-dy*Math.sin(-startAngle);
          const localY=dx*Math.sin(-startAngle)+dy*Math.cos(-startAngle);
          entity.width=clamp(startWidth+localX*2,16,2400);
          entity.height=clamp(startHeight+localY*2,16,2400);
        }
        this.applyEntityVisual(entity);
        this.syncGizmo();
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),false);
      };
      const end=e=>{
        try{if(resize.hasPointerCapture(e.pointerId))resize.releasePointerCapture(e.pointerId)}catch{}
        resize.removeEventListener("pointermove",move);
        resize.removeEventListener("pointerup",end);
        resize.removeEventListener("pointercancel",end);
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),true);
      };
      resize.addEventListener("pointermove",move);
      resize.addEventListener("pointerup",end);
      resize.addEventListener("pointercancel",end);
    });

    return gizmo;
  }

  syncGizmo(){
    const gizmo=this.ensureGizmo();
    if(!gizmo)return;
    const entity=this.entities.find(item=>item.id===this.selectedId);
    const visible=this.mode==="edit"&&entity&&!this.collected.has(entity.id);
    gizmo.hidden=!visible;
    if(!visible)return;

    gizmo.style.left=entity.x+"px";
    gizmo.style.top=entity.y+"px";
    gizmo.style.width=Math.max(16,Number(entity.width||96))+"px";
    gizmo.style.height=Math.max(16,Number(entity.height||96))+"px";
    gizmo.style.transform="translate(-50%,-50%) rotate("+Number(entity.rotation||0)+"deg)";
    const size=22/Math.max(.25,this.zoom||1);
    gizmo.style.setProperty("--gizmo-handle-size",size+"px");
    gizmo.style.setProperty("--gizmo-line-width",Math.max(1,2/Math.max(.25,this.zoom||1))+"px");
  }

  bindEntityEditing(entity){
    const el=entity.el;
    if(!el)return;

    el.addEventListener("pointerdown",event=>{
      if(this.mode!=="edit")return;
      event.preventDefault();
      event.stopPropagation();
      this.selectEntity(entity.id);

      const start={
        px:event.clientX,
        py:event.clientY,
        x:Number(entity.x||0),
        y:Number(entity.y||0)
      };
      try{el.setPointerCapture(event.pointerId)}catch{}

      const move=e=>{
        const zoom=Math.max(.1,this.zoom||1);
        entity.x=clamp(start.x+(e.clientX-start.px)/zoom,0,this.config.width);
        entity.y=clamp(start.y+(e.clientY-start.py)/zoom,0,this.config.height);
        entity.anchorX=entity.x;
        entity.anchorY=entity.y;
        this.applyEntityVisual(entity);
        this.syncGizmo();
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),false);
      };

      const end=e=>{
        try{if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId)}catch{}
        el.removeEventListener("pointermove",move);
        el.removeEventListener("pointerup",end);
        el.removeEventListener("pointercancel",end);
        this.onEntityChange?.(structuredClone(this.cleanEntity(entity)),true);
      };

      el.addEventListener("pointermove",move);
      el.addEventListener("pointerup",end);
      el.addEventListener("pointercancel",end);
    });
  }

  bindEditorCamera(){
    let pan=null;

    const down=event=>{
      if(this.mode!=="edit")return;
      if(event.target.closest?.(".tq-world-entity"))return;
      event.preventDefault();
      pan={
        px:event.clientX,
        py:event.clientY,
        x:this.camera.x,
        y:this.camera.y
      };
      try{this.viewport.setPointerCapture(event.pointerId)}catch{}
      this.selectEntity(null);
    };

    const move=event=>{
      if(!pan||this.mode!=="edit")return;
      const zoom=Math.max(.1,this.zoom||1);
      this.camera.x=pan.x-(event.clientX-pan.px)/zoom;
      this.camera.y=pan.y-(event.clientY-pan.py)/zoom;
      this.clampEditorCamera();
      this.updateCamera(true);
    };

    const end=event=>{
      if(!pan)return;
      pan=null;
      try{if(this.viewport.hasPointerCapture(event.pointerId))this.viewport.releasePointerCapture(event.pointerId)}catch{}
    };

    const wheel=event=>{
      if(this.mode!=="edit")return;
      event.preventDefault();
      const before=this.zoom;
      const factor=event.deltaY>0?.9:1.1;
      this.zoom=clamp(this.zoom*factor,.25,1.5);
      if(Math.abs(before-this.zoom)>.0001){
        this.clampEditorCamera();
        this.updateCamera(true);
      }
    };

    this.viewport.addEventListener("pointerdown",down);
    this.viewport.addEventListener("pointermove",move);
    this.viewport.addEventListener("pointerup",end);
    this.viewport.addEventListener("pointercancel",end);
    this.viewport.addEventListener("wheel",wheel,{passive:false});

    this.cleanups.push(()=>{
      this.viewport.removeEventListener("pointerdown",down);
      this.viewport.removeEventListener("pointermove",move);
      this.viewport.removeEventListener("pointerup",end);
      this.viewport.removeEventListener("pointercancel",end);
      this.viewport.removeEventListener("wheel",wheel);
    });
  }

  bindControls(){
    const keyMap={
      ArrowUp:"up",KeyW:"up",
      ArrowDown:"down",KeyS:"down",
      ArrowLeft:"left",KeyA:"left",
      ArrowRight:"right",KeyD:"right"
    };

    const keydown=e=>{
      if(this.mode!=="play")return;
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
        if(this.mode!=="play")return;
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

  setMode(mode){
    if(!this.editorEnabled&&mode!=="play")return;
    this.mode=mode==="play"?"play":"edit";
    this.host?.classList.toggle("is-editor",this.mode==="edit");
    this.host?.classList.toggle("is-play",this.mode==="play");
    if(this.modeEl)this.modeEl.textContent=this.mode==="edit"?"MUNDO · EDITAR":"MUNDO · PLAY";
    if(this.mode==="play"){
      this.keys.clear();
      this.pointerDirections.clear();
      this.zoom=this.playZoom;
      this.selectEntity(null);
    }else{
      this.nearby=null;
      if(this.actionWrap)this.actionWrap.hidden=true;
      this.zoom=clamp(Number(this.zoom||.58),.25,1.5);
    }
    this.resize();
    this.syncGizmo();
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
    this.clampEditorCamera();
    this.updateCamera(true);
  }

  clampEditorCamera(){
    if(!this.viewportSize)return;
    const zoom=Math.max(.1,this.zoom||1);
    const halfW=Math.min(this.config.width/2,this.viewportSize.width/(2*zoom));
    const halfH=Math.min(this.config.height/2,this.viewportSize.height/(2*zoom));
    this.camera.x=clamp(this.camera.x,halfW,this.config.width-halfW);
    this.camera.y=clamp(this.camera.y,halfH,this.config.height-halfH);
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
  }

  updatePlayerVisual(){
    this.playerEl.style.left=this.player.x+"px";
    this.playerEl.style.top=this.player.y+"px";
    this.playerEl.style.transform=`translate(-50%,-50%) rotate(${this.player.rotation}deg)`;
  }

  getEntityMotion(id){
    const entity=this.entities.find(item=>item.id===id);
    if(!entity)return null;
    return normalizeEntityMotion(entity.motion||defaultEntityMotion(entity.type),entity.type);
  }

  updateEntityMotion(id,patch={},commit=true){
    const entity=this.entities.find(item=>item.id===id);
    if(!entity)return null;
    const current=this.getEntityMotion(id)||defaultEntityMotion(entity.type);
    const next=patch.preset&&patch.preset!==current.preset
      ? applyEntityMotionPreset(current,patch.preset,entity.type)
      : current;
    entity.motion=normalizeEntityMotion({...next,...structuredClone(patch)},entity.type);
    this.applyEntityVisual(entity);
    this.syncGizmo();
    const clean=this.getEntity(id);
    this.onEntityChange?.(clean,commit);
    return structuredClone(entity.motion);
  }

  updateEntityMotionFrame(time){
    for(const entity of this.entities){
      if(this.collected.has(entity.id)||!entity.el)continue;
      const motion=this.getEntityMotion(entity.id);
      if(!motion?.active){
        this.applyEntityVisual(entity);
        continue;
      }
      const frame=computeEntityMotionFrame(motion,time,(entity.index+1)*1.71,entity.type);
      entity.el.style.left=(entity.x+frame.offsetX)+"px";
      entity.el.style.top=(entity.y+frame.offsetY)+"px";
      entity.el.style.transform=`translate(-50%,-50%) rotate(${Number(entity.rotation||0)+frame.rotation}deg) scale(1,${frame.scaleY})`;
    }
  }

  updateCamera(immediate=false){
    if(!this.viewportSize)return;
    const vw=this.viewportSize.width;
    const vh=this.viewportSize.height;

    if(this.mode==="play"){
      const zoom=this.playZoom;
      const halfW=Math.min(this.config.width/2,vw/(2*zoom));
      const halfH=Math.min(this.config.height/2,vh/(2*zoom));
      const targetX=clamp(this.player.x,halfW,this.config.width-halfW);
      const targetY=clamp(this.player.y,halfH,this.config.height-halfH);
      const factor=immediate?1:.12;
      this.camera.x+=(targetX-this.camera.x)*factor;
      this.camera.y+=(targetY-this.camera.y)*factor;
      this.zoom=zoom;
    }else{
      this.clampEditorCamera();
    }

    const zoom=Math.max(.1,this.zoom||1);
    const tx=Math.round(vw/2-this.camera.x*zoom);
    const ty=Math.round(vh/2-this.camera.y*zoom);
    this.stage.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${zoom})`;
    this.syncGizmo();
  }

  updateNearby(){
    if(this.mode!=="play"){
      this.nearby=null;
      this.actionWrap.hidden=true;
      return;
    }

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
      : "Coletar "+(best.label||best.type||"objeto");
  }

  activateNearby(){
    const entity=this.nearby;
    if(!entity||this.mode!=="play")return;

    if(["barrel","treasure","object"].includes(entity.type)){
      this.collected.add(entity.id);
      if(entity.el)entity.el.hidden=true;
      this.updateProgress();
      this.updateNearby();
      return;
    }

    if(entity.type==="location"&&entity.scene&&this.onEnterScene){
      this.onEnterScene(this.cleanEntity(entity),this.getState());
    }
  }

  cleanEntity(entity){
    const {el,index,anchorX,anchorY,...data}=entity;
    return data;
  }

  getOcean(){
    return structuredClone(normalizeOceanConfig(this.config.ocean||{}));
  }

  updateWorld(patch={},commit=true){
    if(patch.name!==undefined)this.config.name=String(patch.name||this.config.id||"Mundo");
    if(patch.width!==undefined)this.config.width=clamp(Number(patch.width)||390,390,20000);
    if(patch.height!==undefined)this.config.height=clamp(Number(patch.height)||844,844,20000);
    if(this.stage){
      this.stage.style.width=this.config.width+"px";
      this.stage.style.height=this.config.height+"px";
    }
    this.player.x=clamp(this.player.x,55,this.config.width-55);
    this.player.y=clamp(this.player.y,70,this.config.height-70);
    for(const entity of this.entities){
      entity.x=clamp(Number(entity.x||0),0,this.config.width);
      entity.y=clamp(Number(entity.y||0),0,this.config.height);
      entity.anchorX=entity.x;
      entity.anchorY=entity.y;
      this.applyEntityVisual(entity);
    }
    this.clampEditorCamera();
    this.updateCamera(true);
    if(this.nameEl)this.nameEl.textContent=this.config.name||this.config.id||"Mundo";
    return this.getWorld();
  }

  updateOcean(patch={}){
    const current=this.config.ocean||{};
    const preset=patch.preset;
    const base=preset&&preset!==current.preset?applyOceanPreset(current,preset):current;
    this.config.ocean=normalizeOceanConfig({...base,...structuredClone(patch)});
    this.applyOceanStatic();
    return this.getOcean();
  }

  applyOceanStatic(){
    if(!this.oceanEl)return;
    const ocean=normalizeOceanConfig(this.config.ocean||{});
    this.config.ocean=ocean;
    const safeBackground=String(ocean.background||"").replace(/["\\]/g,"");
    this.oceanEl.style.backgroundImage=safeBackground?'url("'+safeBackground+'")':"none";
    this.oceanEl.style.backgroundSize=ocean.tileSize+"px auto";
    this.oceanEl.style.backgroundRepeat="repeat";
    this.oceanEl.style.transformOrigin="center center";
  }

  updateOceanFrame(time){
    if(!this.oceanEl)return;
    const ocean=normalizeOceanConfig(this.config.ocean||{});
    const frame=computeOceanFrame(ocean,time);
    this.oceanEl.style.backgroundPosition=frame.offsetX.toFixed(2)+"px "+frame.offsetY.toFixed(2)+"px";
    this.oceanEl.style.transform="scale("+frame.scale.toFixed(5)+")";
    this.oceanEl.style.filter="brightness("+frame.brightness.toFixed(2)+"%) saturate("+frame.saturation+"%)";
  }

  getWorld(){
    const world=structuredClone(this.config);
    world.entities=this.entities.map(entity=>structuredClone(this.cleanEntity(entity)));
    world.editor={
      ...(world.editor||{}),
      cameraX:this.camera.x,
      cameraY:this.camera.y,
      zoom:this.mode==="edit"?this.zoom:(world.editor?.zoom??.58)
    };
    return world;
  }

  getEntity(id){
    const entity=this.entities.find(item=>item.id===id);
    return entity?structuredClone(this.cleanEntity(entity)):null;
  }

  getSelected(){
    return this.selectedId?this.getEntity(this.selectedId):null;
  }

  selectEntity(id){
    this.selectedId=id&&this.entities.some(entity=>entity.id===id)?id:null;
    this.applySelectionVisual();
    this.syncGizmo();
    this.onSelectionChange?.(this.getSelected());
  }

  applySelectionVisual(){
    for(const entity of this.entities){
      entity.el?.classList.toggle("is-selected",entity.id===this.selectedId&&this.mode==="edit");
    }
  }

  updateEntity(id,patch={},commit=true){
    const entity=this.entities.find(item=>item.id===id);
    if(!entity)return null;
    const previousType=entity.type;
    Object.assign(entity,structuredClone(patch));
    entity.x=clamp(Number(entity.x??0),0,this.config.width);
    entity.y=clamp(Number(entity.y??0),0,this.config.height);
    entity.width=clamp(Number(entity.width??96),16,2400);
    entity.height=clamp(Number(entity.height??96),16,2400);
    entity.rotation=Number(entity.rotation||0);
    entity.anchorX=entity.x;
    entity.anchorY=entity.y;
    if(previousType!==entity.type)this.renderEntities();
    else{
      this.applyEntityVisual(entity);
      this.syncGizmo();
    }
    this.selectedId=id;
    this.applySelectionVisual();
    const clean=this.getEntity(id);
    this.onSelectionChange?.(clean);
    this.onEntityChange?.(clean,commit);
    return clean;
  }

  addEntity(raw){
    const base=String(raw.id||"entity").replace(/[^a-z0-9._-]+/gi,"-");
    let id=base,n=2;
    while(this.entities.some(entity=>entity.id===id))id=base+"-"+n++;

    const entity={
      ...structuredClone(raw),
      id,
      x:clamp(Number(raw.x??this.camera.x),0,this.config.width),
      y:clamp(Number(raw.y??this.camera.y),0,this.config.height),
      index:this.entities.length,
      anchorX:0,
      anchorY:0,
      el:null
    };
    entity.anchorX=entity.x;
    entity.anchorY=entity.y;
    this.entities.push(entity);
    this.renderEntities();
    this.selectEntity(id);
    const clean=this.getEntity(id);
    this.onEntityChange?.(clean,true);
    return clean;
  }

  deleteEntity(id){
    const index=this.entities.findIndex(entity=>entity.id===id);
    if(index<0)return false;
    this.entities.splice(index,1);
    this.entities.forEach((entity,i)=>entity.index=i);
    if(this.selectedId===id)this.selectedId=null;
    this.renderEntities();
    this.onSelectionChange?.(null);
    this.onEntityChange?.(null,true);
    return true;
  }

  getCameraCenter(){
    return {x:this.camera.x,y:this.camera.y,zoom:this.zoom};
  }

  updateProgress(){
    const total=this.entities.filter(e=>e.type==="barrel").length;
    const collected=this.entities.filter(e=>e.type==="barrel"&&this.collected.has(e.id)).length;
    if(this.progressEl)this.progressEl.textContent=`Barris: ${collected}/${total}`;
  }

  tick(time){
    const dt=Math.min(.04,Math.max(.001,(time-this.lastTime)/1000));
    this.lastTime=time;
    if(this.mode==="play")this.updatePlayer(dt);
    this.updatePlayerVisual();
    this.updateOceanFrame(time);
    this.updateEntityMotionFrame(time);
    this.updateCamera();
    this.updateNearby();

    if(this.coordsEl){
      const target=this.mode==="edit"?this.camera:this.player;
      this.coordsEl.textContent=`x ${Math.round(target.x)} · y ${Math.round(target.y)}`;
    }
    if(this.zoomEl)this.zoomEl.textContent=this.mode==="edit"?`zoom ${Math.round(this.zoom*100)}%`:"";

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
