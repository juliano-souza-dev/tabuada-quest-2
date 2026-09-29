import { OceanEffect } from "./OceanEffect.js?v=20260929-2144";
export class SceneRuntime {
  constructor(root, reference={width:390,height:844}, options={}) {
    this.root=root; this.reference=reference; this.editorEnabled=options.editorEnabled===true; this.mode=this.editorEnabled?"edit":"play";
    this.selectedId=null; this.nodes=new Map(); this.effects=new Map(); this.storageKey=null; this.mount();
  }
  mount(){
    this.root.innerHTML="";
    this.stageHost=document.createElement("main"); this.stageHost.className="tq-stage-host";
    this.stage=document.createElement("section"); this.stage.className="tq-stage";
    this.stage.dataset.nodeId="viewport"; this.stage.dataset.canonicalParent="true";
    this.stageHost.append(this.stage); this.root.append(this.stageHost);
    this.stage.addEventListener("pointerdown",e=>{if(this.mode==="edit"&&e.target===this.stage)this.select(null)});
    this.resizeObserver=new ResizeObserver(()=>this.fit()); this.resizeObserver.observe(this.stageHost); this.fit();
  }
  fit(){
    const r=this.stageHost.getBoundingClientRect();
    // The reference is a coordinate system, not the physical game boundary.
    // Keep canonical content at a contain scale while the actual stage fills the entire viewport.
    // This prevents desktop/tablet widths from inflating game nodes into giant UI.
    this.viewportScale=Math.min(r.width/this.reference.width,r.height/this.reference.height);
    this.viewportScale=Math.max(this.viewportScale,0.01);
    this.logicalViewport={width:r.width/this.viewportScale,height:r.height/this.viewportScale};
    this.sceneOffset={x:(this.logicalViewport.width-this.reference.width)/2,y:(this.logicalViewport.height-this.reference.height)/2};
    this.stage.style.width=this.logicalViewport.width+"px"; this.stage.style.height=this.logicalViewport.height+"px";
    this.stage.style.transform=`translate(-50%,-50%) scale(${this.viewportScale})`;
  }
  async load(url){
    const res=await fetch(url,{cache:"no-store"}); if(!res.ok)throw new Error(`Scene load failed: ${res.status}`);
    this.scene=await res.json();
    if(this.editorEnabled){
      this.storageKey="tq.dev.scene-draft:"+this.scene.id;
      try{const saved=localStorage.getItem(this.storageKey);if(saved){const draft=JSON.parse(saved);if(draft?.schema===this.scene.schema&&draft?.id===this.scene.id)this.scene=draft;}}catch(err){console.warn("DEV draft restore failed",err)}
    }
    this.reference=this.scene.reference||this.reference; this.fit(); this.render();
  }
  render(){
    for(const effect of this.effects.values())effect.destroy();this.effects.clear();
    this.stage.replaceChildren(); this.nodes.clear();
    for(const node of [...this.scene.nodes].sort((a,b)=>(a.z??0)-(b.z??0))) this.stage.append(this.createNode(node));
    if(this.editorEnabled) for(const {node,el} of this.nodes.values()) { this.attachEditHandles(node,el); this.attachRotateHandle(node,el); this.attachSkewHandles(node,el); }
    for(const {node} of this.nodes.values())this.syncComposition(node);
  }
  normalizeNode(node){
    node.parentId="viewport";
    node.x=Number(node.x??0); node.y=Number(node.y??0);
    node.scaleX=Number(node.scaleX??1); node.scaleY=Number(node.scaleY??1);
    node.rotation=Number(node.rotation??0); node.skewX=Number(node.skewX??0); node.skewY=Number(node.skewY??0); node.z=Number(node.z??0); node.visible=node.visible!==false; node.locked=Boolean(node.locked);
    if(node.compositionType!=null)node.compositionType=String(node.compositionType);
    return node;
  }
  createNode(raw){
    const node=this.normalizeNode(raw);
    const el=node.kind==="text"?document.createElement("div"):document.createElement("img");
    el.className="tq-node"; el.dataset.nodeId=node.id; el.dataset.parentId="viewport";
    if(node.kind==="image"){el.src=node.src;el.alt=node.alt||"";el.draggable=false}else el.textContent=node.text||"";
    this.applyTransform(el,node);
    el.addEventListener("pointerdown",e=>{
      if(!this.editorEnabled||this.mode!=="edit"||node.locked)return;
      e.preventDefault();e.stopPropagation();this.select(node.id);this.beginDrag(e,node,el);
    });
    this.nodes.set(node.id,{node,el}); return el;
  }
  attachEditHandles(node,el){
    if(node.kind!=="image")return;
    const handle=document.createElement("span");handle.className="tq-resize-handle";handle.setAttribute("aria-label","Redimensionar");
    el.addEventListener("load",()=>this.ensureNodeSize(node,el),{once:true});
    // Replaced elements cannot host children reliably, so handle is managed by the stage.
    for(const dir of ["nw","n","ne","e","se","s","sw","w"]){
      const h=document.createElement("button");h.type="button";h.className="tq-node-handle tq-resize-"+dir;h.dataset.forNode=node.id;h.dataset.resizeDir=dir;h.hidden=true;this.stage.append(h);
      h.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();this.beginResize(e,node,el,h,dir)});
    }
  }
  attachRotateHandle(node,el){
    const h=document.createElement("button");h.type="button";h.className="tq-rotate-handle";h.dataset.forNode=node.id;h.hidden=true;this.stage.append(h);
    h.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();this.beginRotate(e,node,h)});
  }
  beginRotate(event,node,handle){
    handle.setPointerCapture(event.pointerId);
    const rotate=e=>{
      const r=this.stage.getBoundingClientRect(),s=this.viewportScale||1;
      const cx=r.left+(node.x+(node.width??0)/2)*s,cy=r.top+(node.y+(node.height??0)/2)*s;
      node.rotation=Math.atan2(e.clientY-cy,e.clientX-cx)*180/Math.PI+90;
      this.applyTransform(this.nodes.get(node.id).el,node);this.dispatchEvent("nodechange",{node,parentId:"viewport"});
    };
    const end=e=>{if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);handle.removeEventListener("pointermove",rotate);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);this.dispatchEvent("nodecommit",{node,parentId:"viewport"});};
    handle.addEventListener("pointermove",rotate);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
  }
  attachSkewHandles(node,el){
    for(const axis of ["x","y"]){
      const h=document.createElement("button");h.type="button";h.className="tq-skew-handle tq-skew-"+axis;h.dataset.forNode=node.id;h.dataset.axis=axis;h.hidden=true;this.stage.append(h);
      h.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();this.beginSkew(e,node,h,axis)});
    }
  }
  beginSkew(event,node,handle,axis){
    handle.setPointerCapture(event.pointerId);
    const start={px:event.clientX,py:event.clientY,value:axis==="x"?node.skewX:node.skewY};
    const move=e=>{
      const scale=this.viewportScale||1,delta=axis==="x"?(e.clientX-start.px)/scale:(e.clientY-start.py)/scale;
      const size=Math.max(1,axis==="x"?(node.height??1):(node.width??1));
      const value=Math.max(-75,Math.min(75,start.value+Math.atan(delta/size)*180/Math.PI));
      if(axis==="x")node.skewX=value;else node.skewY=value;
      this.applyTransform(this.nodes.get(node.id).el,node);this.dispatchEvent("nodechange",{node,parentId:"viewport"});
    };
    const end=e=>{if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);this.dispatchEvent("nodecommit",{node,parentId:"viewport"});};
    handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
  }
  ensureNodeSize(node,el){
    if(node.width==null)node.width=el.naturalWidth||el.getBoundingClientRect().width/(this.viewportScale||1);
    if(node.height==null)node.height=el.naturalHeight||el.getBoundingClientRect().height/(this.viewportScale||1);
    this.applyTransform(el,node);this.positionHandle(node);
  }
  positionHandle(node){
    const ox=this.sceneOffset?.x||0,oy=this.sceneOffset?.y||0,x=node.x+ox,y=node.y+oy,w=node.width??0,h=node.height??0,show=this.selectedId===node.id&&this.mode==="edit"&&!node.locked;
    const spots={nw:[x,y],n:[x+w/2,y],ne:[x+w,y],e:[x+w,y+h/2],se:[x+w,y+h],s:[x+w/2,y+h],sw:[x,y+h],w:[x,y+h/2]};
    for(const hnd of this.stage.querySelectorAll(".tq-node-handle"))if(hnd.dataset.forNode===node.id){const p=spots[hnd.dataset.resizeDir]||spots.se;hnd.hidden=!show;hnd.style.left=p[0]+"px";hnd.style.top=p[1]+"px";hnd.style.zIndex=(node.z??0)+100000;}
    const rh=[...this.stage.querySelectorAll(".tq-rotate-handle")].find(el=>el.dataset.forNode===node.id);if(rh){rh.hidden=!show;rh.style.left=(x+w/2)+"px";rh.style.top=(y-38)+"px";rh.style.zIndex=(node.z??0)+100000;}
    for(const axis of ["x","y"]){const sh=[...this.stage.querySelectorAll(".tq-skew-handle")].find(el=>el.dataset.forNode===node.id&&el.dataset.axis===axis);if(sh){sh.hidden=!show;sh.style.left=(axis==="x"?x+w/2:x-24)+"px";sh.style.top=(axis==="x"?y+h+24:y+h/2)+"px";sh.style.zIndex=(node.z??0)+100000;}}
  }
  beginResize(event,node,el,handle,dir="se"){
    handle.setPointerCapture(event.pointerId);const scale=this.viewportScale||1,min=24;
    const start={px:event.clientX,py:event.clientY,x:node.x,y:node.y,w:node.width??el.offsetWidth,h:node.height??el.offsetHeight};
    const move=e=>{
      const dx=(e.clientX-start.px)/scale,dy=(e.clientY-start.py)/scale;
      let left=start.x,top=start.y,right=start.x+start.w,bottom=start.y+start.h;
      if(dir.includes("w"))left=Math.min(right-min,start.x+dx);
      if(dir.includes("e"))right=Math.max(left+min,start.x+start.w+dx);
      if(dir.includes("n"))top=Math.min(bottom-min,start.y+dy);
      if(dir.includes("s"))bottom=Math.max(top+min,start.y+start.h+dy);
      node.x=left;node.y=top;node.width=right-left;node.height=bottom-top;
      this.applyTransform(el,node);this.positionHandle(node);this.dispatchEvent("nodechange",{node,parentId:"viewport"});
    };
    const end=e=>{if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);this.dispatchEvent("nodecommit",{node,parentId:"viewport"});};
    handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
  }
  syncComposition(node){
    const existing=this.effects.get(node.id);
    if(node.compositionType==="ocean"){if(existing){existing.node=node;existing.sync()}else this.effects.set(node.id,new OceanEffect(this,node));}
    else if(existing){existing.destroy();this.effects.delete(node.id);}
  }
  applyTransform(el,node){
    el.style.left=(node.x+(this.sceneOffset?.x||0))+"px";el.style.top=(node.y+(this.sceneOffset?.y||0))+"px";
    if(node.width!=null)el.style.width=node.width+"px";if(node.height!=null)el.style.height=node.height+"px";
    el.style.zIndex=node.z;el.style.transform=`rotate(${node.rotation}deg) skew(${node.skewX}deg,${node.skewY}deg) scale(${node.scaleX},${node.scaleY})`;
    el.hidden=node.visible===false;this.positionHandle(node);this.effects.get(node.id)?.sync();
  }
  addNode(raw){
    if(!this.editorEnabled)return null;
    const base=(raw.id||"node").replace(/[^a-z0-9._-]+/gi,"-");
    let id=base,n=2;while(this.nodes.has(id))id=base+"-"+n++;
    const node=this.normalizeNode({...raw,id,parentId:"viewport"});
    this.scene.nodes.push(node);
    const el=this.createNode(node);this.stage.append(el);
    this.attachEditHandles(node,el);this.attachRotateHandle(node,el);this.attachSkewHandles(node,el);
    this.select(node.id);this.syncComposition(node);this.dispatchEvent("nodecommit",{node,parentId:"viewport",created:true});
    return node;
  }
  deleteNode(id){
    if(!this.editorEnabled)return false;
    const item=this.nodes.get(id);if(!item)return false;
    this.stage.querySelectorAll('[data-for-node="'+CSS.escape(id)+'"]').forEach(el=>el.remove());
    this.effects.get(id)?.destroy();this.effects.delete(id);item.el.remove();this.nodes.delete(id);
    if(this.scene?.nodes)this.scene.nodes=this.scene.nodes.filter(node=>node.id!==id);
    if(this.selectedId===id)this.select(null);
    this.persistDraft();this.dispatchEvent("nodecommit",{node:null,id,parentId:"viewport",deleted:true});
    return true;
  }
  updateNode(id,patch,commit=false){const item=this.nodes.get(id);if(!item)return;Object.assign(item.node,patch);this.normalizeNode(item.node);this.applyTransform(item.el,item.node);this.syncComposition(item.node);this.dispatchEvent(commit?"nodecommit":"nodechange",{node:item.node,parentId:"viewport"});}
  select(id){
    this.selectedId=id;
    for(const [nodeId,{el}] of this.nodes)el.classList.toggle("is-selected",nodeId===id);
    for(const {node} of this.nodes.values())this.positionHandle(node);
    this.dispatchEvent("selectionchange",{id,node:id?this.nodes.get(id)?.node:null,parentId:"viewport"});
  }
  beginDrag(event,node,el){
    el.setPointerCapture(event.pointerId);
    const start={px:event.clientX,py:event.clientY,x:node.x,y:node.y};
    const move=e=>{
      const scale=this.viewportScale||1;
      node.x=start.x+(e.clientX-start.px)/scale;node.y=start.y+(e.clientY-start.py)/scale;
      this.applyTransform(el,node);this.dispatchEvent("nodechange",{node,parentId:"viewport"});
    };
    const end=e=>{if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",end);el.removeEventListener("pointercancel",end);this.dispatchEvent("nodecommit",{node,parentId:"viewport"});};
    el.addEventListener("pointermove",move);el.addEventListener("pointerup",end);el.addEventListener("pointercancel",end);
  }
  setMode(mode){if(!this.editorEnabled&&mode!=="play")return;this.mode=mode;this.stage.dataset.mode=mode;if(mode==="play")this.select(null);else for(const {node} of this.nodes.values())this.positionHandle(node);this.dispatchEvent("modechange",{mode});}
  persistDraft(){if(!this.editorEnabled||!this.storageKey||!this.scene)return;try{localStorage.setItem(this.storageKey,JSON.stringify(this.scene))}catch(err){console.warn("DEV draft save failed",err)}}
  dispatchEvent(name,detail){if(this.editorEnabled&&(name==="nodechange"||name==="nodecommit"))this.persistDraft();window.dispatchEvent(new CustomEvent("tq:"+name,{detail}))}
}
