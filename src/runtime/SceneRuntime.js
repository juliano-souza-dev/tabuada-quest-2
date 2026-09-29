export class SceneRuntime {
  constructor(root, reference={width:390,height:844}) {
    this.root=root; this.reference=reference; this.mode="edit";
    this.selectedId=null; this.nodes=new Map(); this.mount();
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
    this.viewportScale=Math.min(r.width/this.reference.width,r.height/this.reference.height);
    this.stage.style.width=this.reference.width+"px"; this.stage.style.height=this.reference.height+"px";
    this.stage.style.transform=`translate(-50%,-50%) scale(${this.viewportScale})`;
  }
  async load(url){
    const res=await fetch(url,{cache:"no-store"}); if(!res.ok)throw new Error(`Scene load failed: ${res.status}`);
    this.scene=await res.json(); this.reference=this.scene.reference||this.reference; this.fit(); this.render();
  }
  render(){
    this.stage.replaceChildren(); this.nodes.clear();
    for(const node of [...this.scene.nodes].sort((a,b)=>(a.z??0)-(b.z??0))) this.stage.append(this.createNode(node));
    for(const {node,el} of this.nodes.values()) { this.attachEditHandles(node,el); this.attachRotateHandle(node,el); this.attachSkewHandles(node,el); }
  }
  normalizeNode(node){
    node.parentId="viewport";
    node.x=Number(node.x??0); node.y=Number(node.y??0);
    node.scaleX=Number(node.scaleX??1); node.scaleY=Number(node.scaleY??1);
    node.rotation=Number(node.rotation??0); node.skewX=Number(node.skewX??0); node.skewY=Number(node.skewY??0); node.z=Number(node.z??0); node.visible=node.visible!==false; node.locked=Boolean(node.locked);
    return node;
  }
  createNode(raw){
    const node=this.normalizeNode(raw);
    const el=node.kind==="text"?document.createElement("div"):document.createElement("img");
    el.className="tq-node"; el.dataset.nodeId=node.id; el.dataset.parentId="viewport";
    if(node.kind==="image"){el.src=node.src;el.alt=node.alt||"";el.draggable=false}else el.textContent=node.text||"";
    this.applyTransform(el,node);
    el.addEventListener("pointerdown",e=>{
      if(this.mode!=="edit"||node.locked)return;
      e.preventDefault();e.stopPropagation();this.select(node.id);this.beginDrag(e,node,el);
    });
    this.nodes.set(node.id,{node,el}); return el;
  }
  attachEditHandles(node,el){
    if(node.kind!=="image")return;
    const handle=document.createElement("span");handle.className="tq-resize-handle";handle.setAttribute("aria-label","Redimensionar");
    el.addEventListener("load",()=>this.ensureNodeSize(node,el),{once:true});
    // Replaced elements cannot host children reliably, so handle is managed by the stage.
    const h=document.createElement("button");h.type="button";h.className="tq-node-handle";h.dataset.forNode=node.id;h.hidden=true;this.stage.append(h);
    h.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();this.beginResize(e,node,el,h)});
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
    const h=[...this.stage.querySelectorAll(".tq-node-handle")].find(el=>el.dataset.forNode===node.id);if(!h)return;
    h.hidden=this.selectedId!==node.id||this.mode!=="edit"||node.locked;
    h.style.left=(node.x+(node.width??0))+"px";h.style.top=(node.y+(node.height??0))+"px";h.style.zIndex=(node.z??0)+100000;
    const rh=[...this.stage.querySelectorAll(".tq-rotate-handle")].find(el=>el.dataset.forNode===node.id);if(rh){rh.hidden=this.selectedId!==node.id||this.mode!=="edit"||node.locked;rh.style.left=(node.x+(node.width??0)/2)+"px";rh.style.top=(node.y-38)+"px";rh.style.zIndex=(node.z??0)+100000;}
    for(const axis of ["x","y"]){const sh=[...this.stage.querySelectorAll(".tq-skew-handle")].find(el=>el.dataset.forNode===node.id&&el.dataset.axis===axis);if(sh){sh.hidden=this.selectedId!==node.id||this.mode!=="edit"||node.locked;sh.style.left=(axis==="x"?node.x+(node.width??0)/2:node.x-24)+"px";sh.style.top=(axis==="x"?node.y+(node.height??0)+24:node.y+(node.height??0)/2)+"px";sh.style.zIndex=(node.z??0)+100000;}}
  }
  beginResize(event,node,el,handle){
    handle.setPointerCapture(event.pointerId);const scale=this.viewportScale||1;
    const start={px:event.clientX,py:event.clientY,w:node.width??el.offsetWidth,h:node.height??el.offsetHeight,ratio:(node.width ?? el.offsetWidth) / ((node.height ?? el.offsetHeight) || 1)};
    const move=e=>{let w=Math.max(24,start.w+(e.clientX-start.px)/scale);let h=Math.max(24,start.h+(e.clientY-start.py)/scale);
      if(!e.shiftKey){const byW=w/start.ratio,byH=h*start.ratio;if(Math.abs(w-start.w)>=Math.abs(h-start.h)){h=byW}else{w=byH}}
      node.width=w;node.height=h;this.applyTransform(el,node);this.positionHandle(node);this.dispatchEvent("nodechange",{node,parentId:"viewport"});
    };
    const end=e=>{if(handle.hasPointerCapture(e.pointerId))handle.releasePointerCapture(e.pointerId);handle.removeEventListener("pointermove",move);handle.removeEventListener("pointerup",end);handle.removeEventListener("pointercancel",end);this.dispatchEvent("nodecommit",{node,parentId:"viewport"});};
    handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
  }
  applyTransform(el,node){
    el.style.left=node.x+"px";el.style.top=node.y+"px";
    if(node.width!=null)el.style.width=node.width+"px";if(node.height!=null)el.style.height=node.height+"px";
    el.style.zIndex=node.z;el.style.transform=`rotate(${node.rotation}deg) skew(${node.skewX}deg,${node.skewY}deg) scale(${node.scaleX},${node.scaleY})`;
    el.hidden=node.visible===false;this.positionHandle(node);
  }
  updateNode(id,patch,commit=false){const item=this.nodes.get(id);if(!item)return;Object.assign(item.node,patch);this.normalizeNode(item.node);this.applyTransform(item.el,item.node);this.dispatchEvent(commit?"nodecommit":"nodechange",{node:item.node,parentId:"viewport"});}
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
  setMode(mode){this.mode=mode;this.stage.dataset.mode=mode;if(mode==="play")this.select(null);else for(const {node} of this.nodes.values())this.positionHandle(node);this.dispatchEvent("modechange",{mode});}
  dispatchEvent(name,detail){window.dispatchEvent(new CustomEvent("tq:"+name,{detail}))}
}
