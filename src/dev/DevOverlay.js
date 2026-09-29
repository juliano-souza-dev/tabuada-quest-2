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
        <button data-assets>▦ <span>Assets</span></button>
        <button data-collapse aria-label="Recolher ferramentas" title="Recolher">‹</button>
      </div>
      <section class="tq-dev__assets" hidden><header><div><strong>Assets</strong><small>Biblioteca do repositório</small></div><button data-assets-close aria-label="Fechar">×</button></header><div class="tq-assets__filters"><input data-asset-search type="search" placeholder="Buscar asset..."><select data-asset-category><option value="">Todas as categorias</option></select></div><div class="tq-assets__grid" data-assets-grid></div></section>
      <section class="tq-dev__panel" hidden>
        <header><div><strong>Config</strong><small data-node-title>Nenhum nó</small></div><button data-close aria-label="Fechar">×</button></header>
        <div class="tq-dev__content"><div class="tq-dev__empty">Selecione um nó para configurar.</div></div>
      </section>`;
    this.root.append(this.el);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>this.setMode(b.dataset.mode)));
    this.el.querySelector("[data-close]").addEventListener("click",()=>this.setMode("edit"));
    this.el.querySelector("[data-export]").addEventListener("click",()=>this.exportScene());
    this.el.querySelector("[data-mold]").addEventListener("click",()=>this.toggleMold());
    this.el.querySelector("[data-assets]").addEventListener("click",()=>this.toggleAssets(true));
    this.el.querySelector("[data-assets-close]").addEventListener("click",()=>this.toggleAssets(false));
    this.el.querySelector("[data-asset-search]").addEventListener("input",()=>this.renderAssets());
    this.el.querySelector("[data-asset-category]").addEventListener("change",()=>this.renderAssets());
    this.loadAssets();
    this.loadCompositionTypes();
    this.mountMold();
    this.enableToolbarDrag();
    this.el.querySelector("[data-collapse]").addEventListener("click",()=>this.toggleCollapse());
    window.addEventListener("tq:selectionchange",e=>{this.selected=e.detail.node||null;this.renderInspector();});
    window.addEventListener("tq:nodechange",e=>{if(this.selected?.id===e.detail.node.id){this.selected=e.detail.node;this.syncInspector();}});
  }
  async loadCompositionTypes(){
    try{const r=await fetch("./src/config/composition-types.json",{cache:"no-store"});const registry=await r.json();this.compositionTypes=registry.types||[];}catch(e){this.compositionTypes=[]}
  }
  async loadAssets(){
    try{
      const r=await fetch("./src/config/asset-catalog.json?v=20260929-1946",{cache:"no-store"});
      const catalog=await r.json();this.assetCatalog=catalog.assets||[];
      const select=this.el.querySelector("[data-asset-category]");
      [...new Set(this.assetCatalog.map(a=>a.category))].sort().forEach(cat=>{const o=document.createElement("option");o.value=cat;o.textContent=cat;select.append(o)});
      this.renderAssets();
    }catch(e){this.el.querySelector("[data-assets-grid]").textContent="Falha ao carregar biblioteca de assets."}
  }
  toggleAssets(show){
    const panel=this.el.querySelector(".tq-dev__assets");panel.hidden=!show;
    if(show){this.el.querySelector(".tq-dev__panel").hidden=true;this.renderAssets()}
  }
  renderAssets(){
    const grid=this.el.querySelector("[data-assets-grid]");if(!grid||!this.assetCatalog)return;
    const q=this.el.querySelector("[data-asset-search]").value.trim().toLowerCase(),cat=this.el.querySelector("[data-asset-category]").value;
    const list=this.assetCatalog.filter(a=>(!cat||a.category===cat)&&(!q||a.path.toLowerCase().includes(q)));
    grid.innerHTML=list.map((a,i)=>`<button class="tq-asset-card" data-asset-index="${this.assetCatalog.indexOf(a)}"><img src="./${a.path}" loading="lazy" alt=""><span>${a.name}</span><small>${a.category}</small></button>`).join("");
    grid.querySelectorAll("[data-asset-index]").forEach(b=>b.addEventListener("click",()=>this.insertAsset(this.assetCatalog[Number(b.dataset.assetIndex)])));
  }
  insertAsset(asset){
    const src="./"+asset.path;
    const stem=asset.name.replace(/\.[^.]+$/,"").replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase();
    const size=128,x=(this.runtime.reference.width-size)/2,y=(this.runtime.reference.height-size)/2;
    const node=this.runtime.addNode({id:`${this.runtime.scene?.id||"scene"}.${stem}`,kind:"image",src,x,y,width:size,height:size,scaleX:1,scaleY:1,rotation:0,skewX:0,skewY:0,z:this.runtime.nodes.size+1,visible:true,locked:false,alt:asset.name});
    if(node){this.selected=node;this.toggleAssets(false);this.setMode("edit")}
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
    const handle=this.el.querySelector("[data-drag]"),bar=this.el.querySelector(".tq-dev__bar");
    let drag=null;
    const move=e=>{
      if(!drag)return;
      const maxX=Math.max(0,window.innerWidth-bar.offsetWidth);
      const maxY=Math.max(0,window.innerHeight-bar.offsetHeight);
      const x=Math.min(maxX,Math.max(0,drag.left+e.clientX-drag.x));
      const y=Math.min(maxY,Math.max(0,drag.top+e.clientY-drag.y));
      bar.style.left=x+"px";bar.style.top=y+"px";bar.style.transform="none";
    };
    const end=e=>{if(!drag)return;try{handle.releasePointerCapture(e.pointerId)}catch{}drag=null;};
    handle.addEventListener("pointerdown",e=>{
      e.preventDefault();e.stopPropagation();
      const r=bar.getBoundingClientRect();drag={x:e.clientX,y:e.clientY,left:r.left,top:r.top};
      bar.style.position="fixed";bar.style.margin="0";bar.style.right="auto";
      handle.setPointerCapture(e.pointerId);
    });
    handle.addEventListener("pointermove",move);handle.addEventListener("pointerup",end);handle.addEventListener("pointercancel",end);
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
    if(mode==="config"){this.el.querySelector(".tq-dev__assets").hidden=true;this.renderInspector();}
  }
  configSections(node){
    const field=(key,label,type="number")=>[key,label,type];
    const sections=[
      {id:"identity",title:"Identificação",fields:[
        field("id","ID","readonly"),field("kind","Tipo","readonly"),field("parentId","Parent","readonly"),
        ...(node.kind==="image"?[field("src","Asset","text")]:[]),
        ...(node.kind==="function"?[field("function","Função","text")]:[])
      ]},
      {id:"transform",title:"Transformação",fields:[
        field("x","Position X"),field("y","Position Y"),
        ...(["image","text"].includes(node.kind)?[field("width","Width"),field("height","Height")]:[]),
        field("scaleX","Scale X"),field("scaleY","Scale Y"),field("rotation","Rotation"),
        field("skewX","Skew X"),field("skewY","Skew Y")
      ]},
      {id:"appearance",title:"Aparência",fields:[
        ...(node.kind==="text"?[field("text","Texto","text")]:[]),
        field("visible","Visible","checkbox")
      ]},
      {id:"layer",title:"Camada",fields:[field("z","Camada","layer")]},
      {id:"composition",title:"Composição",fields:[field("compositionType","Tipo de composição","compositionType"),...(node.compositionType==="ocean"?[field("__waterArea","Área de água","waterArea"),field("__rippleStrength","Ondulação","ripple")]:[])]},
      {id:"behavior",title:"Comportamento",fields:[field("locked","Locked","checkbox")]},
      {id:"danger",title:"Nó",fields:[field("__delete","Excluir nó","delete")]}
    ];
    return sections.filter(s=>s.fields.length);
  }
  fieldMarkup(n,[key,label,type]){
    if(type==="readonly")return `<label class="tq-field"><span>${label}</span><input value="${n[key]??""}" readonly></label>`;
    if(type==="checkbox")return `<label class="tq-field tq-field--check"><span>${label}</span><input data-prop="${key}" type="checkbox" ${n[key]?"checked":""}></label>`;
    if(type==="waterArea"){const count=n.composition?.area?.points?.length||0;return `<div class="tq-field"><span>${label}</span><button type="button" data-water-mark>Marcar ponto a ponto (${count})</button><button type="button" data-water-clear>Limpar área</button></div>`;}
    if(type==="ripple"){const v=n.composition?.effects?.ripple?.strength??.65;return `<label class="tq-field"><span>Intensidade <small data-ripple-value>${Math.round(Number(v)*100)}%</small></span><input type="range" min="0" max="3" step="0.05" value="${v}" data-ripple-strength></label>`;}
    if(type==="compositionType"){const current=n[key]??"";return `<label class="tq-field"><span>${label}</span><select data-prop="${key}"><option value="">Nenhum</option>${(this.compositionTypes||[]).map(t=>`<option value="${t.id}" ${current===t.id?"selected":""}>${t.label||t.id}</option>`).join("")}</select></label>`;}
    if(type==="delete")return `<button type="button" class="tq-delete-node" data-delete-node>Excluir nó</button>`;
    if(type==="layer")return `<div class="tq-field tq-field--layer"><span>${label}</span><div class="tq-layer-grid">${Array.from({length:10},(_,i)=>i+1).map(v=>`<button type="button" data-layer="${v}" class="${Number(n[key])===v?"active":""}">${v}</button>`).join("")}</div></div>`;
    return `<label class="tq-field"><span>${label}</span><input data-prop="${key}" type="${type}" value="${n[key]??""}" ${type==="number"?'step="0.01"':""}></label>`;
  }
  renderInspector(){
    const content=this.el.querySelector(".tq-dev__content"),title=this.el.querySelector("[data-node-title]");
    if(!this.selected){title.textContent="Nenhum nó";content.innerHTML='<div class="tq-dev__empty">Selecione um nó para configurar.</div>';return;}
    const n=this.selected;title.textContent=`${n.id} · ${n.kind}`;
    const sections=this.configSections(n);
    content.innerHTML=`<div class="tq-inspector">${sections.map((s,i)=>`<section class="tq-config-area" data-area="${s.id}"><button type="button" class="tq-config-area__head" data-area-toggle aria-expanded="${i===0?"true":"false"}"><strong>${s.title}</strong><span>${i===0?"▾":"▸"}</span></button><div class="tq-config-area__body" ${i===0?"":"hidden"}>${s.fields.map(f=>this.fieldMarkup(n,f)).join("")}</div></section>`).join("")}</div>`;
    content.querySelectorAll("[data-area-toggle]").forEach(b=>b.addEventListener("click",()=>{
      const body=b.nextElementSibling,open=!body.hidden;body.hidden=open;b.setAttribute("aria-expanded",String(!open));b.querySelector("span").textContent=open?"▸":"▾";
    }));
    content.querySelectorAll("[data-prop]").forEach(input=>input.addEventListener("change",()=>this.applyInput(input)));
    content.querySelector("[data-water-mark]")?.addEventListener("click",()=>this.startWaterMarking(n));
    content.querySelector("[data-water-clear]")?.addEventListener("click",()=>{n.composition={...(n.composition||{}),area:{mode:"polygon",points:[]}};this.runtime.updateNode(n.id,{composition:n.composition},true);this.renderInspector();});
    content.querySelector("[data-ripple-strength]")?.addEventListener("input",e=>{n.composition=n.composition||{};n.composition.effects=n.composition.effects||{};n.composition.effects.ripple={...(n.composition.effects.ripple||{}),strength:Number(e.target.value)};this.runtime.updateNode(n.id,{composition:n.composition});const out=content.querySelector("[data-ripple-value]");if(out)out.textContent=Math.round(Number(e.target.value)*100)+"%";});
    content.querySelector("[data-delete-node]")?.addEventListener("click",()=>{
      const id=n.id;if(confirm("Excluir este nó da cena?")){this.runtime.deleteNode(id);this.selected=null;this.renderInspector();}
    });
    content.querySelectorAll("[data-layer]").forEach(button=>button.addEventListener("click",()=>{
      const value=Number(button.dataset.layer);this.runtime.updateNode(n.id,{z:value},true);this.selected=this.runtime.nodes.get(n.id)?.node||n;this.renderInspector();
    }));
  }
  startWaterMarking(node){
    const item=this.runtime.nodes.get(node.id);if(!item)return;
    this.runtime.setMode("area");
    let overlay=this.runtime.stage.querySelector('[data-water-overlay="'+node.id+'"]');if(overlay)overlay.remove();
    overlay=document.createElementNS("http://www.w3.org/2000/svg","svg");overlay.dataset.waterOverlay=node.id;overlay.classList.add("tq-water-area-editor");
    const ox=this.runtime.sceneOffset?.x||0,oy=this.runtime.sceneOffset?.y||0,w=node.width||item.el.offsetWidth,h=node.height||item.el.offsetHeight;
    Object.assign(overlay.style,{left:(node.x+ox)+"px",top:(node.y+oy)+"px",width:w+"px",height:h+"px",zIndex:String((node.z||0)+200000)});overlay.setAttribute("viewBox",`0 0 ${w} ${h}`);this.runtime.stage.append(overlay);
    node.composition=node.composition||{};node.composition.area={mode:"polygon",points:[]};
    const redraw=()=>{const pts=node.composition.area.points;overlay.innerHTML=`<polygon points="${pts.map(p=>p.x*w+','+p.y*h).join(' ')}" fill="rgba(30,180,255,.16)" stroke="#5de1ff" stroke-width="2"/>${pts.map((p,i)=>`<circle cx="${p.x*w}" cy="${p.y*h}" r="5" fill="#fff" stroke="#00bde8" stroke-width="2"/>`).join("")}`;};
    redraw();
    const add=e=>{e.preventDefault();e.stopPropagation();const r=overlay.getBoundingClientRect();const x=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(node.composition.area.points.length<32){node.composition.area.points.push({x,y});redraw();this.runtime.updateNode(node.id,{composition:node.composition});}};
    overlay.addEventListener("pointerdown",add);
    const finish=document.createElement("button");finish.type="button";finish.className="tq-water-area-finish";finish.textContent="Concluir área";this.el.append(finish);
    finish.addEventListener("click",()=>{if(node.composition.area.points.length<3)return;overlay.remove();finish.remove();this.runtime.setMode("config");this.runtime.updateNode(node.id,{composition:node.composition},true);this.selected=node;this.renderInspector();});
  }
  applyInput(input){
    if(!this.selected)return;const key=input.dataset.prop;
    let value=input.type==="checkbox"?input.checked:input.type==="number"?Number(input.value):input.value;
    if(key==="compositionType"&&!value)value=null;
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
