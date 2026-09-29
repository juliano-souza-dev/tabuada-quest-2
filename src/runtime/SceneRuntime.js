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
  applyTransform(el,node){
    el.style.left=node.x+"px";el.style.top=node.y+"px";
    if(node.width!=null)el.style.width=node.width+"px";if(node.height!=null)el.style.height=node.height+"px";
    el.style.zIndex=node.z;el.style.transform=`rotate(${node.rotation}deg) skew(${node.skewX}deg,${node.skewY}deg) scale(${node.scaleX},${node.scaleY})`;
    el.hidden=node.visible===false;
  }
  updateNode(id,patch,commit=false){const item=this.nodes.get(id);if(!item)return;Object.assign(item.node,patch);this.normalizeNode(item.node);this.applyTransform(item.el,item.node);this.dispatchEvent(commit?"nodecommit":"nodechange",{node:item.node,parentId:"viewport"});}
  select(id){
    this.selectedId=id;
    for(const [nodeId,{el}] of this.nodes)el.classList.toggle("is-selected",nodeId===id);
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
  setMode(mode){this.mode=mode;this.stage.dataset.mode=mode;if(mode==="play")this.select(null);this.dispatchEvent("modechange",{mode});}
  dispatchEvent(name,detail){window.dispatchEvent(new CustomEvent("tq:"+name,{detail}))}
}
