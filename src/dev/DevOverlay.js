export class DevOverlay {
  constructor(root,runtime){this.root=root;this.runtime=runtime;this.mode="edit";this.selected=null;this.linkScale=true;}
  mount(){
    this.el=document.createElement("aside");this.el.className="tq-dev";
    this.el.innerHTML=`
      <div class="tq-dev__bar" role="toolbar" aria-label="Ferramentas DEV">
        <button data-drag class="tq-dev__drag" aria-label="Arrastar ferramentas" title="Arrastar">⠿</button>
        <button data-mode="edit" class="active">✥ <span>Editar</span></button>
        <button data-mode="config">⚙ <span>Config</span></button>
        <button data-mode="play">▶ <span>Play</span></button>
        <button data-export>⇩ <span>JSON</span></button>
        <button data-mold>▣ <span>Molde</span></button>
        <button data-collapse aria-label="Recolher ferramentas" title="Recolher">‹</button>
      </div>
      <section class="tq-dev__panel" hidden>
        <header><div><strong>Config</strong><small data-node-title>Nenhum nó</small></div><button data-close aria-label="Fechar">×</button></header>
        <div class="tq-dev__content"><div class="tq-dev__empty">Selecione um nó para configurar.</div></div>
      </section>`;
    this.root.append(this.el);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>this.setMode(b.dataset.mode)));
    this.el.querySelector("[data-close]").addEventListener("click",()=>this.setMode("edit"));
    this.el.querySelector("[data-export]").addEventListener("click",()=>this.exportScene());
    this.el.querySelector("[data-mold]").addEventListener("click",()=>this.toggleMold());
    this.mountMold();
    this.enableToolbarDrag();
    this.el.querySelector("[data-collapse]").addEventListener("click",()=>this.toggleCollapse());
    window.addEventListener("tq:selectionchange",e=>{this.selected=e.detail.node||null;this.renderInspector();});
    window.addEventListener("tq:nodechange",e=>{if(this.selected?.id===e.detail.node.id){this.selected=e.detail.node;this.syncInspector();}});
  }
  toggleCollapse(){
    this.el.classList.toggle("is-collapsed");
    const collapsed=this.el.classList.contains("is-collapsed");
    const b=this.el.querySelector("[data-collapse]");
    b.textContent=collapsed?"›":"‹";
    b.setAttribute("aria-label",collapsed?"Expandir ferramentas":"Recolher ferramentas");
    b.title=collapsed?"Expandir":"Recolher";
  }
  enableToolbarDrag(){
    const handle=this.el.querySelector("[data-drag]");
    let drag=null;
    const move=e=>{
      if(!drag)return;
      const maxX=Math.max(0,window.innerWidth-this.el.offsetWidth);
      const maxY=Math.max(0,window.innerHeight-this.el.offsetHeight);
      const x=Math.min(maxX,Math.max(0,drag.left+e.clientX-drag.x));
      const y=Math.min(maxY,Math.max(0,drag.top+e.clientY-drag.y));
      this.el.style.left=x+"px";this.el.style.top=y+"px";this.el.style.transform="none";
    };
    const end=e=>{
      if(!drag)return;
      try{handle.releasePointerCapture(e.pointerId)}catch{}
      drag=null;
    };
    handle.addEventListener("pointerdown",e=>{
      e.preventDefault();e.stopPropagation();
      const r=this.el.getBoundingClientRect();
      drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove",move);
    handle.addEventListener("pointerup",end);
    handle.addEventListener("pointercancel",end);
  }
  mountMold(){
    this.mold=document.createElement("div");
    this.mold.className="tq-dev-mold";
    this.mold.hidden=true;
    this.mold.setAttribute("aria-hidden","true");
    this.mold.innerHTML='<span>390 × 844</span>';
    this.runtime.stageHost.append(this.mold);
    this.positionMold();
    this.moldObserver=new ResizeObserver(()=>this.positionMold());
    this.moldObserver.observe(this.runtime.stageHost);
  }
  positionMold(){
    if(!this.mold)return;
    const s=this.runtime.viewportScale||1;
    this.mold.style.width=(this.runtime.reference.width*s)+"px";
    this.mold.style.height=(this.runtime.reference.height*s)+"px";
  }
  toggleMold(){
    if(!this.mold)return;
    this.mold.hidden=!this.mold.hidden;
    this.el.querySelector("[data-mold]").classList.toggle("active",!this.mold.hidden);
    if(!this.mold.hidden)this.positionMold();
  }
  exportScene(){
    const scene=structuredClone(this.runtime.scene||{});
    scene.reference={...this.runtime.reference};
    scene.root=scene.root||{id:"viewport",kind:"viewport",canonical:true};
    scene.nodes=[...this.runtime.nodes.values()].map(({node})=>structuredClone(node));
    scene.meta={...(scene.meta||{}),exportedFrom:"tabuada-quest-dev",schema:"tq.scene",version:1};
    const json=JSON.stringify(scene,null,2);
    const blob=new Blob([json],{type:"application/json"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    const id=(scene.id||"scene").replace(/[^a-z0-9._-]+/gi,"-");
    a.href=url;a.download=id+".scene.json";document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),0);
  }
  setMode(mode){
    this.mode=mode;this.runtime.setMode(mode);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    this.el.querySelector(".tq-dev__panel").hidden=mode!=="config";this.el.classList.toggle("is-play",mode==="play");
    if(mode==="config")this.renderInspector();
  }
  fieldsFor(node){
    const common=[
      ["x","Position X","number"],["y","Position Y","number"],
      ["scaleX","Scale X","number"],["scaleY","Scale Y","number"],
      ["rotation","Rotation","number"],["skewX","Skew X","number"],["skewY","Skew Y","number"],
      ["z","Z Index","number"],["visible","Visible","checkbox"],["locked","Locked","checkbox"]
    ];
    if(node.kind==="image")return [["src","Asset","text"],["width","Width","number"],["height","Height","number"],...common];
    if(node.kind==="text")return [["text","Texto","text"],["width","Width","number"],["height","Height","number"],...common];
    if(node.kind==="function")return [["function","Função","text"],...common];
    return common;
  }
  renderInspector(){
    const content=this.el.querySelector(".tq-dev__content"),title=this.el.querySelector("[data-node-title]");
    if(!this.selected){title.textContent="Nenhum nó";content.innerHTML='<div class="tq-dev__empty">Selecione um nó para configurar.</div>';return;}
    const n=this.selected;title.textContent=`${n.id} · ${n.kind}`;
    content.innerHTML=`<div class="tq-inspector"><div class="tq-inspector__meta"><span>Parent</span><strong>viewport</strong></div>${this.fieldsFor(n).map(([key,label,type])=>type==="checkbox"?`<label class="tq-field tq-field--check"><span>${label}</span><input data-prop="${key}" type="checkbox" ${n[key]?"checked":""}></label>`:`<label class="tq-field"><span>${label}</span><input data-prop="${key}" type="${type}" value="${n[key]??""}" ${type==="number"?'step="0.01"':""}></label>`).join("")}</div>`;
    content.querySelectorAll("[data-prop]").forEach(input=>input.addEventListener("change",()=>this.applyInput(input)));
  }
  applyInput(input){
    if(!this.selected)return;const key=input.dataset.prop;
    let value=input.type==="checkbox"?input.checked:input.type==="number"?Number(input.value):input.value;
    const patch={[key]:value};
    if(this.linkScale&&key==="scaleX")patch.scaleY=value;
    if(this.linkScale&&key==="scaleY")patch.scaleX=value;
    this.runtime.updateNode(this.selected.id,patch,true);this.selected=this.runtime.nodes.get(this.selected.id).node;this.syncInspector();
  }
  syncInspector(){
    if(!this.selected||!this.el)return;
    this.el.querySelectorAll("[data-prop]").forEach(input=>{const v=this.selected[input.dataset.prop];if(input.type==="checkbox")input.checked=Boolean(v);else if(document.activeElement!==input)input.value=v??"";});
  }
}
