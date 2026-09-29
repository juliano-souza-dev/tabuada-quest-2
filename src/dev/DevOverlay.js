export class DevOverlay {
  constructor(root,runtime){this.root=root;this.runtime=runtime;this.mode="edit";this.selected=null;this.linkScale=true;}
  mount(){
    this.el=document.createElement("aside");this.el.className="tq-dev";
    this.el.innerHTML=`
      <div class="tq-dev__bar" role="toolbar" aria-label="Ferramentas DEV">
        <button data-mode="edit" class="active">✥ <span>Editar</span></button>
        <button data-mode="config">⚙ <span>Config</span></button>
        <button data-mode="play">▶ <span>Play</span></button>
      </div>
      <section class="tq-dev__panel" hidden>
        <header><div><strong>Config</strong><small data-node-title>Nenhum nó</small></div><button data-close aria-label="Fechar">×</button></header>
        <div class="tq-dev__content"><div class="tq-dev__empty">Selecione um nó para configurar.</div></div>
      </section>`;
    this.root.append(this.el);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>this.setMode(b.dataset.mode)));
    this.el.querySelector("[data-close]").addEventListener("click",()=>this.setMode("edit"));
    window.addEventListener("tq:selectionchange",e=>{this.selected=e.detail.node||null;this.renderInspector();});
    window.addEventListener("tq:nodechange",e=>{if(this.selected?.id===e.detail.node.id){this.selected=e.detail.node;this.syncInspector();}});
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
