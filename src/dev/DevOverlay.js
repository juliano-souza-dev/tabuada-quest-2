export class DevOverlay {
  constructor(root,runtime){this.root=root;this.runtime=runtime;this.mode="edit";this.selected=null;this.linkScale=true;this.waterEditSession=null;}
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
      {id:"composition",title:"Composição",fields:[field("compositionType","Tipo de composição","compositionType")]},
      ...(node.compositionType==="ocean"?[{id:"animation",title:"Animação",fields:[
        field("__oceanActive","Ativo","oceanActive"),
        field("__oceanPreset","Predefinição do oceano","oceanPreset"),
        field("__oceanSpeed","Velocidade","oceanSpeed"),
        field("__oceanMovement","Força das ondas","oceanMovement"),
        field("__oceanShine","Brilho","oceanShine"),
        field("__oceanFoam","Espuma","oceanFoam"),
        field("__oceanTouch","Ondas ao toque","oceanTouch"),
        field("__waterArea","Área do oceano","waterArea"),
        field("__oceanQuality","Qualidade","oceanQuality"),
        field("__oceanStart","Salvar e iniciar","oceanStart")
      ]}]:[]),
      {id:"behavior",title:"Comportamento",fields:[field("locked","Locked","checkbox")]},
      {id:"danger",title:"Nó",fields:[field("__delete","Excluir nó","delete")]}
    ];
    return sections.filter(section=>section.fields.length);
  }

  fieldMarkup(n,[key,label,type]){
    const animation=n.composition?.animation||{};
    if(type==="readonly")return \`<label class="tq-field"><span>\${label}</span><input value="\${n[key]??""}" readonly></label>\`;
    if(type==="checkbox")return \`<label class="tq-field tq-field--check"><span>\${label}</span><input data-prop="\${key}" type="checkbox" \${n[key]?"checked":""}></label>\`;
    if(type==="oceanActive"){const value=n.composition?.active!==false;return \`<label class="tq-field tq-field--check tq-ocean-toggle"><span>\${label}</span><input type="checkbox" data-ocean-active \${value?"checked":""}></label>\`;}
    if(type==="oceanPreset"){const value=animation.preset||"adventure";return \`<label class="tq-field"><span>\${label}</span><select data-ocean-preset><option value="adventure" \${value==="adventure"?"selected":""}>Aventura</option></select></label>\`;}
    if(type==="oceanSpeed"){const value=Number(animation.speed??44);return this.oceanRangeMarkup(label,"speed",value);}
    if(type==="oceanMovement"){const value=Number(animation.movement??52);return this.oceanRangeMarkup(label,"movement",value);}
    if(type==="oceanShine"){const value=Number(animation.shine??20);return this.oceanRangeMarkup(label,"shine",value);}
    if(type==="oceanFoam"){const value=Number(animation.foam??57);return this.oceanRangeMarkup(label,"foam",value);}
    if(type==="oceanTouch"){const value=animation.ripples!==false;return \`<label class="tq-field tq-field--check"><span>\${label}</span><input type="checkbox" data-ocean-touch \${value?"checked":""}></label>\`;}
    if(type==="waterArea"){
      const count=n.composition?.area?.points?.length||0;
      return \`<div class="tq-field tq-water-area-field"><span>\${label}</span><small>Toque no cenário para contornar somente a água.</small><button type="button" data-water-mark>Marcar oceano ponto a ponto\${count?" · "+count+" pontos":""}</button>\${count?'<button type="button" data-water-clear>Limpar área publicada</button>':""}</div>\`;
    }
    if(type==="oceanQuality"){
      const value=animation.quality||"balanced";
      return \`<label class="tq-field"><span>\${label}</span><select data-ocean-quality><option value="economy" \${value==="economy"?"selected":""}>Econômico</option><option value="balanced" \${value==="balanced"?"selected":""}>Balanceado</option><option value="high" \${value==="high"?"selected":""}>Alta</option></select></label>\`;
    }
    if(type==="oceanStart")return \`<button type="button" class="tq-ocean-start" data-ocean-start>Salvar e iniciar</button>\`;
    if(type==="compositionType"){
      const current=n[key]??"";
      return \`<label class="tq-field"><span>\${label}</span><select data-prop="\${key}"><option value="">Nenhum</option>\${(this.compositionTypes||[]).map(type=>\`<option value="\${type.id}" \${current===type.id?"selected":""}>\${type.label||type.id}</option>\`).join("")}</select></label>\`;
    }
    if(type==="delete")return \`<button type="button" class="tq-delete-node" data-delete-node>Excluir nó</button>\`;
    if(type==="layer")return \`<div class="tq-field tq-field--layer"><span>\${label}</span><div class="tq-layer-grid">\${Array.from({length:10},(_,i)=>i+1).map(value=>\`<button type="button" data-layer="\${value}" class="\${Number(n[key])===value?"active":""}">\${value}</button>\`).join("")}</div></div>\`;
    return \`<label class="tq-field"><span>\${label}</span><input data-prop="\${key}" type="\${type}" value="\${n[key]??""}" \${type==="number"?'step="0.01"':""}></label>\`;
  }

  oceanRangeMarkup(label,key,value){
    const safe=Math.max(0,Math.min(100,Number(value)||0));
    return \`<label class="tq-field tq-ocean-range"><span><b>\${label}</b><output data-ocean-output="\${key}">\${Math.round(safe)}</output></span><input type="range" min="0" max="100" step="1" value="\${safe}" data-ocean-range="\${key}"></label>\`;
  }

  ensureOceanAnimation(composition){
    composition.animation={
      preset:"adventure",
      speed:44,
      movement:52,
      shine:20,
      foam:57,
      ripples:true,
      quality:"balanced",
      ...(composition.animation||{})
    };
    return composition.animation;
  }

  renderInspector(){
    const content=this.el.querySelector(".tq-dev__content");
    const title=this.el.querySelector("[data-node-title]");
    if(!this.selected){
      title.textContent="Nenhum nó";
      content.innerHTML='<div class="tq-dev__empty">Selecione um nó para configurar.</div>';
      return;
    }

    const n=this.selected;
    title.textContent=\`\${n.id} · \${n.kind}\`;
    const sections=this.configSections(n);
    const defaultOpen=n.compositionType==="ocean"?"animation":"identity";
    content.innerHTML=\`<div class="tq-inspector">\${sections.map(section=>{
      const open=section.id===defaultOpen;
      return \`<section class="tq-config-area" data-area="\${section.id}"><button type="button" class="tq-config-area__head" data-area-toggle aria-expanded="\${open}"><strong>\${section.title}</strong><span>\${open?"▾":"▸"}</span></button><div class="tq-config-area__body" \${open?"":"hidden"}>\${section.fields.map(field=>this.fieldMarkup(n,field)).join("")}</div></section>\`;
    }).join("")}</div>\`;

    content.querySelectorAll("[data-area-toggle]").forEach(button=>button.addEventListener("click",()=>{
      const body=button.nextElementSibling;
      const open=!body.hidden;
      body.hidden=open;
      button.setAttribute("aria-expanded",String(!open));
      button.querySelector("span").textContent=open?"▸":"▾";
    }));

    content.querySelectorAll("[data-prop]").forEach(input=>input.addEventListener("change",()=>this.applyInput(input)));
    const patchOcean=(mutate,commit=false)=>{
      n.composition=n.composition||{};
      this.ensureOceanAnimation(n.composition);
      mutate(n.composition,n.composition.animation);
      this.runtime.updateNode(n.id,{composition:n.composition},commit);
    };

    content.querySelector("[data-ocean-active]")?.addEventListener("change",event=>patchOcean(composition=>composition.active=event.target.checked,true));
    content.querySelector("[data-ocean-preset]")?.addEventListener("change",event=>patchOcean((composition,animation)=>animation.preset=event.target.value,true));
    content.querySelectorAll("[data-ocean-range]").forEach(input=>{
      input.addEventListener("input",event=>{
        const key=event.target.dataset.oceanRange;
        const value=Number(event.target.value);
        patchOcean((composition,animation)=>animation[key]=value);
        const output=content.querySelector(\`[data-ocean-output="\${key}"]\`);
        if(output)output.value=String(Math.round(value));
      });
      input.addEventListener("change",event=>{
        const key=event.target.dataset.oceanRange;
        patchOcean((composition,animation)=>animation[key]=Number(event.target.value),true);
      });
    });
    content.querySelector("[data-ocean-touch]")?.addEventListener("change",event=>patchOcean((composition,animation)=>animation.ripples=event.target.checked,true));
    content.querySelector("[data-ocean-quality]")?.addEventListener("change",event=>patchOcean((composition,animation)=>animation.quality=event.target.value,true));
    content.querySelector("[data-ocean-start]")?.addEventListener("click",()=>{
      patchOcean(composition=>composition.active=true,true);
      this.selected=this.runtime.nodes.get(n.id)?.node||n;
      this.renderInspector();
    });

    content.querySelector("[data-water-mark]")?.addEventListener("click",()=>this.startWaterMarking(n));
    content.querySelector("[data-water-clear]")?.addEventListener("click",()=>{
      n.composition={...(n.composition||{}),area:{mode:"polygon",points:[]}};
      this.runtime.updateNode(n.id,{composition:n.composition},true);
      this.renderInspector();
    });

    content.querySelector("[data-delete-node]")?.addEventListener("click",()=>{
      const id=n.id;
      if(confirm("Excluir este nó da cena?")){
        this.runtime.deleteNode(id);
        this.selected=null;
        this.renderInspector();
      }
    });
    content.querySelectorAll("[data-layer]").forEach(button=>button.addEventListener("click",()=>{
      const value=Number(button.dataset.layer);
      this.runtime.updateNode(n.id,{z:value},true);
      this.selected=this.runtime.nodes.get(n.id)?.node||n;
      this.renderInspector();
    }));
  }

  startWaterMarking(node){
    const item=this.runtime.nodes.get(node.id);
    if(!item)return;
    this.cancelWaterMarking();

    const previousMode=this.runtime.mode;
    const previousPoints=(node.composition?.area?.points||[]).map(point=>({x:Number(point.x),y:Number(point.y)}));
    const draft=previousPoints.map(point=>({...point}));
    this.runtime.setMode("area");

    const overlay=document.createElementNS("http://www.w3.org/2000/svg","svg");
    overlay.dataset.waterOverlay=node.id;
    overlay.classList.add("tq-water-area-editor");
    overlay.setAttribute("preserveAspectRatio","none");

    const ox=this.runtime.sceneOffset?.x||0;
    const oy=this.runtime.sceneOffset?.y||0;
    const width=Math.max(1,node.width||item.el.offsetWidth||1);
    const height=Math.max(1,node.height||item.el.offsetHeight||1);
    Object.assign(overlay.style,{
      left:(node.x+ox)+"px",
      top:(node.y+oy)+"px",
      width:width+"px",
      height:height+"px",
      zIndex:String((node.z||0)+200000),
      transform:\`rotate(\${node.rotation||0}deg) skew(\${node.skewX||0}deg,\${node.skewY||0}deg) scale(\${node.scaleX||1},\${node.scaleY||1})\`,
      transformOrigin:"center center"
    });
    overlay.setAttribute("viewBox",\`0 0 \${width} \${height}\`);
    this.runtime.stage.append(overlay);

    const panel=document.createElement("section");
    panel.className="tq-water-editor-panel";
    panel.innerHTML=\`
      <header><strong>Área da água</strong><span data-water-count>0 pontos</span></header>
      <small>Toque no oceano para criar o contorno. O efeito só será aplicado ao concluir.</small>
      <div class="tq-water-editor-actions">
        <button type="button" data-water-undo>↶ Desfazer</button>
        <button type="button" data-water-draft-clear>Limpar</button>
        <button type="button" data-water-cancel>Cancelar</button>
        <button type="button" class="is-primary" data-water-finish>✓ Concluir</button>
      </div>\`;
    this.el.append(panel);

    const redraw=()=>{
      const polygon=draft.length>=3?\`<polygon points="\${draft.map(point=>point.x*width+","+point.y*height).join(" ")}" class="tq-water-polygon"/>\`:"";
      const polyline=draft.length?\`<polyline points="\${draft.map(point=>point.x*width+","+point.y*height).join(" ")}" class="tq-water-line"/>\`:"";
      const dots=draft.map((point,index)=>\`<g><circle cx="\${point.x*width}" cy="\${point.y*height}" r="\${index===0?7:5}" class="\${index===0?"is-first":""}"/><text x="\${point.x*width+8}" y="\${point.y*height-8}">\${index+1}</text></g>\`).join("");
      overlay.innerHTML=polygon+polyline+dots;
      panel.querySelector("[data-water-count]").textContent=\`\${draft.length} ponto\${draft.length===1?"":"s"}\`;
      const finish=panel.querySelector("[data-water-finish]");
      finish.disabled=draft.length<3;
    };

    const addPoint=event=>{
      event.preventDefault();
      event.stopPropagation();
      if(draft.length>=32)return;
      const matrix=overlay.getScreenCTM();
      if(!matrix)return;
      const point=overlay.createSVGPoint();
      point.x=event.clientX;
      point.y=event.clientY;
      const local=point.matrixTransform(matrix.inverse());
      const x=Math.max(0,Math.min(1,local.x/width));
      const y=Math.max(0,Math.min(1,local.y/height));
      draft.push({x,y});
      redraw();
    };
    overlay.addEventListener("pointerdown",addPoint);

    const close=(commit)=>{
      overlay.remove();
      panel.remove();
      this.waterEditSession=null;
      this.runtime.setMode(previousMode==="play"?"play":"config");
      if(commit){
        node.composition=node.composition||{};
        this.ensureOceanAnimation(node.composition);
        node.composition.active=true;
        node.composition.area={mode:"polygon",points:draft.map(point=>({...point}))};
        this.runtime.updateNode(node.id,{composition:node.composition},true);
        this.selected=this.runtime.nodes.get(node.id)?.node||node;
      }
      this.renderInspector();
    };

    panel.querySelector("[data-water-undo]").addEventListener("click",()=>{draft.pop();redraw();});
    panel.querySelector("[data-water-draft-clear]").addEventListener("click",()=>{draft.splice(0,draft.length);redraw();});
    panel.querySelector("[data-water-cancel]").addEventListener("click",()=>close(false));
    panel.querySelector("[data-water-finish]").addEventListener("click",()=>{if(draft.length>=3)close(true);});

    this.waterEditSession={overlay,panel,cancel:()=>close(false)};
    redraw();
  }

  cancelWaterMarking(){
    if(this.waterEditSession?.cancel)this.waterEditSession.cancel();
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
