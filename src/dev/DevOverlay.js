export class DevOverlay {
  constructor(root,runtime){this.root=root;this.runtime=runtime;this.mode="edit";this.selected=null;this.linkScale=true;this.areaEditSession=null;this.assetTree=null;this.assetDirectoryPath="assets";this.assetNodeIndex=new Map();this.assetByPath=new Map();}
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
      <section class="tq-dev__assets" hidden>
        <header><div><strong>Assets</strong><small data-assets-path>assets</small></div><button data-assets-close aria-label="Fechar">×</button></header>
        <div class="tq-assets__nav">
          <button type="button" data-asset-up aria-label="Pasta anterior" title="Pasta anterior">↑</button>
          <nav class="tq-assets__breadcrumbs" data-assets-breadcrumbs aria-label="Caminho de assets"></nav>
        </div>
        <div class="tq-assets__filters"><input data-asset-search type="search" placeholder="Buscar em /assets..."></div>
        <div class="tq-assets__grid" data-assets-grid></div>
      </section>
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
    this.el.querySelector("[data-asset-up]").addEventListener("click",()=>this.navigateAssetDirectory(this.parentAssetPath(this.assetDirectoryPath)));
    this.loadAssets();
    this.loadCompositionTypes();
    this.mountMold();
    this.enableToolbarDrag();
    this.el.querySelector("[data-collapse]").addEventListener("click",()=>this.toggleCollapse());
    window.addEventListener("tq:selectionchange",e=>{this.selected=e.detail.node||null;this.renderInspector();});
    window.addEventListener("tq:nodechange",e=>{const node=e.detail?.node;if(node&&this.selected?.id===node.id){this.selected=node;this.syncInspector();}});
  }
  async loadCompositionTypes(){
    try{const r=await fetch("./src/config/composition-types.json?v=20260929-2222",{cache:"no-store"});const registry=await r.json();this.compositionTypes=registry.types||[];}catch(e){this.compositionTypes=[]}
  }
  async loadAssets(){
    try{
      const r=await fetch("./src/config/asset-tree.json?v=20260929-2222",{cache:"no-store"});
      const manifest=await r.json();
      this.assetTree=manifest.root||null;
      this.assetCatalog=manifest.assets||[];
      this.assetDirectoryPath=this.assetTree?.path||"assets";
      this.assetNodeIndex=new Map();
      this.assetByPath=new Map(this.assetCatalog.map(asset=>[asset.path,asset]));
      const indexNode=node=>{
        if(!node?.path)return;
        this.assetNodeIndex.set(node.path,node);
        if(node.type==="directory")for(const child of node.children||[])indexNode(child);
      };
      indexNode(this.assetTree);
      this.renderAssets();
    }catch(e){
      console.warn("Asset tree load failed",e);
      const grid=this.el.querySelector("[data-assets-grid]");
      if(grid)grid.textContent="Falha ao carregar a árvore real de /assets.";
    }
  }
  toggleAssets(show){
    const panel=this.el.querySelector(".tq-dev__assets");panel.hidden=!show;
    if(show){this.el.querySelector(".tq-dev__panel").hidden=true;this.renderAssets()}
  }
  escapeHtml(value){
    return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  }
  parentAssetPath(path){
    if(!path||path==="assets")return "assets";
    const parts=path.split("/");parts.pop();
    return parts.join("/")||"assets";
  }
  navigateAssetDirectory(path){
    const node=this.assetNodeIndex.get(path);
    if(!node||node.type!=="directory")return;
    this.assetDirectoryPath=path;
    const search=this.el.querySelector("[data-asset-search]");
    if(search)search.value="";
    this.renderAssets();
  }
  renderAssetBreadcrumbs(){
    const nav=this.el.querySelector("[data-assets-breadcrumbs]");
    const label=this.el.querySelector("[data-assets-path]");
    const up=this.el.querySelector("[data-asset-up]");
    if(!nav)return;
    const path=this.assetDirectoryPath||"assets";
    const parts=path.split("/");
    let current="";
    nav.innerHTML=parts.map((part,index)=>{
      current=current?current+"/"+part:part;
      const separator=index?'<span class="tq-assets__crumb-separator">›</span>':"";
      return separator+'<button type="button" data-asset-crumb="'+this.escapeHtml(current)+'">'+this.escapeHtml(part)+'</button>';
    }).join("");
    nav.querySelectorAll("[data-asset-crumb]").forEach(button=>button.addEventListener("click",()=>this.navigateAssetDirectory(button.dataset.assetCrumb)));
    if(label)label.textContent=path;
    if(up)up.disabled=path==="assets";
  }
  countAssetImages(node){
    if(!node)return 0;
    if(node.type==="image")return 1;
    return (node.children||[]).reduce((sum,child)=>sum+this.countAssetImages(child),0);
  }
  renderAssets(){
    const grid=this.el.querySelector("[data-assets-grid]");
    if(!grid||!this.assetTree)return;

    this.renderAssetBreadcrumbs();
    const query=this.el.querySelector("[data-asset-search]")?.value.trim().toLowerCase()||"";

    if(query){
      const matches=this.assetCatalog.filter(asset=>asset.path.toLowerCase().includes(query));
      grid.innerHTML=matches.length?matches.map(asset=>{
        const parent=this.parentAssetPath(asset.path);
        return '<button class="tq-asset-card" data-asset-file="'+this.escapeHtml(asset.path)+'"><img src="./'+this.escapeHtml(asset.path)+'" loading="lazy" alt=""><span>'+this.escapeHtml(asset.name)+'</span><small>'+this.escapeHtml(parent)+'</small></button>';
      }).join(""):'<div class="tq-assets__empty">Nenhuma imagem encontrada em /assets.</div>';
    }else{
      const directory=this.assetNodeIndex.get(this.assetDirectoryPath)||this.assetTree;
      const children=directory.children||[];
      grid.innerHTML=children.length?children.map(entry=>{
        if(entry.type==="directory"){
          const count=this.countAssetImages(entry);
          return '<button class="tq-asset-folder" data-asset-dir="'+this.escapeHtml(entry.path)+'"><span class="tq-asset-folder__icon" aria-hidden="true">📁</span><span>'+this.escapeHtml(entry.name)+'</span><small>'+count+' imagem'+(count===1?'':'s')+' nesta pasta</small></button>';
        }
        return '<button class="tq-asset-card" data-asset-file="'+this.escapeHtml(entry.path)+'"><img src="./'+this.escapeHtml(entry.path)+'" loading="lazy" alt=""><span>'+this.escapeHtml(entry.name)+'</span><small>'+this.escapeHtml(entry.path)+'</small></button>';
      }).join(""):'<div class="tq-assets__empty">Esta pasta não contém subpastas ou imagens.</div>';
    }

    grid.querySelectorAll("[data-asset-dir]").forEach(button=>button.addEventListener("click",()=>this.navigateAssetDirectory(button.dataset.assetDir)));
    grid.querySelectorAll("[data-asset-file]").forEach(button=>button.addEventListener("click",()=>{
      const asset=this.assetByPath.get(button.dataset.assetFile);
      if(asset)this.insertAsset(asset);
    }));
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

  compositionDefinition(node){
    return (this.compositionTypes||[]).find(type=>type.id===node?.compositionType)||null;
  }

  compositionPreset(definition,id){
    const presets=definition?.animation?.presets||[];
    return presets.find(preset=>preset.id===id)||presets[0]||null;
  }

  ensureCompositionAnimation(composition,definition){
    const controls=definition?.animation?.controls||[];
    const presetControl=controls.find(control=>control.control==="preset");
    const presetId=composition.animation?.preset||presetControl?.default||definition?.animation?.presets?.[0]?.id||null;
    const preset=this.compositionPreset(definition,presetId);
    const current=composition.animation||{};
    const defaults={...(preset?.defaults||{})};

    for(const control of controls){
      if(control.scope!=="animation"||control.control==="action"||control.control==="polygon-area")continue;
      if(control.default!==undefined&&defaults[control.id]===undefined)defaults[control.id]=control.default;
    }

    composition.animation={...defaults,...current};
    if(presetId&&!composition.animation.preset)composition.animation.preset=presetId;
    return composition.animation;
  }

  compositionControlValue(node,definition,control){
    const composition=node.composition||{};
    if(control.control==="polygon-area"||control.control==="action")return null;

    if(control.scope==="composition"){
      const value=composition[control.id];
      return value===undefined?control.default:value;
    }

    const animation=composition.animation||{};
    if(animation[control.id]!==undefined)return animation[control.id];

    const presetId=animation.preset||definition?.animation?.presets?.[0]?.id;
    const preset=this.compositionPreset(definition,presetId);
    if(preset?.defaults?.[control.id]!==undefined)return preset.defaults[control.id];
    return control.default;
  }

  configSections(node){
    const field=(key,label,type="number")=>[key,label,type];
    const definition=this.compositionDefinition(node);
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
      ...(definition?.animation?.controls?.length?[{
        id:"animation",
        title:definition.animation.sectionLabel||"Animação",
        fields:definition.animation.controls.map(control=>({compositionControl:control,definition}))
      }]:[]),
      {id:"behavior",title:"Comportamento",fields:[field("locked","Locked","checkbox")]},
      {id:"danger",title:"Nó",fields:[field("__delete","Excluir nó","delete")]}
    ];
    return sections.filter(section=>section.fields.length);
  }

  compositionControlMarkup(node,definition,control){
    const value=this.compositionControlValue(node,definition,control);
    const data=' data-composition-control="'+control.id+'"';

    if(control.control==="checkbox"){
      return '<label class="tq-field tq-field--check tq-composition-toggle"><span>'+control.label+'</span><input type="checkbox"'+data+' '+(value!==false?'checked':'')+'></label>';
    }

    if(control.control==="range"){
      const min=Number(control.min??0),max=Number(control.max??100),step=Number(control.step??1);
      const safe=Math.max(min,Math.min(max,Number(value??control.default??min)));
      return '<label class="tq-field tq-composition-range"><span><b>'+control.label+'</b><output data-composition-output="'+control.id+'">'+Math.round(safe)+'</output></span><input type="range" min="'+min+'" max="'+max+'" step="'+step+'" value="'+safe+'"'+data+'></label>';
    }

    if(control.control==="preset"){
      const presets=definition?.animation?.presets||[];
      const options=presets.map(preset=>'<option value="'+preset.id+'" '+(preset.id===value?'selected':'')+'>'+preset.label+'</option>').join("");
      return '<label class="tq-field"><span>'+control.label+'</span><select'+data+'>'+options+'</select></label>';
    }

    if(control.control==="select"){
      const options=(control.options||[]).map(option=>{
        const item=typeof option==="string"?{value:option,label:option}:option;
        return '<option value="'+item.value+'" '+(item.value===value?'selected':'')+'>'+item.label+'</option>';
      }).join("");
      return '<label class="tq-field"><span>'+control.label+'</span><select'+data+'>'+options+'</select></label>';
    }

    if(control.control==="polygon-area"){
      const points=node.composition?.[control.id]?.points||[];
      const hint=control.hint?'<small>'+control.hint+'</small>':"";
      const mark=(control.buttonLabel||"Marcar ponto a ponto")+(points.length?" · "+points.length+" pontos":"");
      const clear=points.length?'<button type="button" data-composition-area-clear="'+control.id+'">'+(control.clearLabel||"Limpar área")+'</button>':"";
      return '<div class="tq-field tq-composition-area-field"><span>'+control.label+'</span>'+hint+'<button type="button" data-composition-area="'+control.id+'">'+mark+'</button>'+clear+'</div>';
    }

    if(control.control==="action"){
      return '<button type="button" class="tq-composition-action" data-composition-action="'+(control.action||control.id)+'">'+control.label+'</button>';
    }

    return "";
  }

  fieldMarkup(node,field){
    if(field?.compositionControl)return this.compositionControlMarkup(node,field.definition,field.compositionControl);

    const [key,label,type]=field;
    if(type==="readonly")return '<label class="tq-field"><span>'+label+'</span><input value="'+(node[key]??"")+'" readonly></label>';
    if(type==="checkbox")return '<label class="tq-field tq-field--check"><span>'+label+'</span><input data-prop="'+key+'" type="checkbox" '+(node[key]?'checked':'')+'></label>';
    if(type==="compositionType"){
      const current=node[key]??"";
      const options=(this.compositionTypes||[]).map(item=>'<option value="'+item.id+'" '+(current===item.id?'selected':'')+'>'+(item.label||item.id)+'</option>').join("");
      return '<label class="tq-field"><span>'+label+'</span><select data-prop="'+key+'"><option value="">Nenhum</option>'+options+'</select></label>';
    }
    if(type==="delete")return '<button type="button" class="tq-delete-node" data-delete-node>Excluir nó</button>';
    if(type==="layer"){
      const buttons=Array.from({length:10},(_,index)=>index+1).map(value=>'<button type="button" data-layer="'+value+'" class="'+(Number(node[key])===value?'active':'')+'">'+value+'</button>').join("");
      return '<div class="tq-field tq-field--layer"><span>'+label+'</span><div class="tq-layer-grid">'+buttons+'</div></div>';
    }
    return '<label class="tq-field"><span>'+label+'</span><input data-prop="'+key+'" type="'+type+'" value="'+(node[key]??"")+'" '+(type==="number"?'step="0.01"':'')+'></label>';
  }

  applyCompositionPreset(node,definition,presetId){
    node.composition=node.composition||{};
    const preset=this.compositionPreset(definition,presetId);
    const previous=node.composition.animation||{};
    node.composition.animation={...previous,...(preset?.defaults||{}),preset:presetId};
    this.runtime.updateNode(node.id,{composition:node.composition},true);
  }

  patchCompositionControl(node,definition,control,value,commit=false){
    node.composition=node.composition||{};
    const animation=this.ensureCompositionAnimation(node.composition,definition);

    if(control.control==="preset"){
      this.applyCompositionPreset(node,definition,value);
      return;
    }

    if(control.scope==="composition")node.composition[control.id]=value;
    else animation[control.id]=value;

    this.runtime.updateNode(node.id,{composition:node.composition},commit);
  }

  renderInspector(){
    const content=this.el.querySelector(".tq-dev__content");
    const title=this.el.querySelector("[data-node-title]");

    if(!this.selected){
      title.textContent="Nenhum nó";
      content.innerHTML='<div class="tq-dev__empty">Selecione um nó para configurar.</div>';
      return;
    }

    const node=this.selected;
    const definition=this.compositionDefinition(node);
    title.textContent=node.id+" · "+node.kind;
    const sections=this.configSections(node);
    const defaultOpen=definition?.animation?"animation":"identity";

    content.innerHTML='<div class="tq-inspector">'+sections.map(section=>{
      const open=section.id===defaultOpen;
      return '<section class="tq-config-area" data-area="'+section.id+'"><button type="button" class="tq-config-area__head" data-area-toggle aria-expanded="'+open+'"><strong>'+section.title+'</strong><span>'+(open?'▾':'▸')+'</span></button><div class="tq-config-area__body" '+(open?'':'hidden')+'>'+section.fields.map(field=>this.fieldMarkup(node,field)).join("")+'</div></section>';
    }).join("")+'</div>';

    content.querySelectorAll("[data-area-toggle]").forEach(button=>button.addEventListener("click",()=>{
      const body=button.nextElementSibling;
      const open=!body.hidden;
      body.hidden=open;
      button.setAttribute("aria-expanded",String(!open));
      button.querySelector("span").textContent=open?"▸":"▾";
    }));

    content.querySelectorAll("[data-prop]").forEach(input=>input.addEventListener("change",()=>this.applyInput(input)));

    if(definition){
      const controls=new Map((definition.animation?.controls||[]).map(control=>[control.id,control]));

      content.querySelectorAll("[data-composition-control]").forEach(input=>{
        const control=controls.get(input.dataset.compositionControl);
        if(!control)return;

        const readValue=()=>input.type==="checkbox"?input.checked:(input.type==="range"?Number(input.value):input.value);
        const updateOutput=()=>{
          const output=content.querySelector('[data-composition-output="'+control.id+'"]');
          if(output)output.value=String(Math.round(Number(input.value)));
        };

        if(input.type==="range"){
          input.addEventListener("input",()=>{
            this.patchCompositionControl(node,definition,control,readValue(),false);
            updateOutput();
          });
          input.addEventListener("change",()=>this.patchCompositionControl(node,definition,control,readValue(),true));
        }else{
          input.addEventListener("change",()=>{
            this.patchCompositionControl(node,definition,control,readValue(),true);
            this.selected=this.runtime.nodes.get(node.id)?.node||node;
            if(control.control==="preset")this.renderInspector();
          });
        }
      });

      content.querySelectorAll("[data-composition-area]").forEach(button=>{
        const control=controls.get(button.dataset.compositionArea);
        if(control)button.addEventListener("click",()=>this.startCompositionAreaMarking(node,definition,control));
      });

      content.querySelectorAll("[data-composition-area-clear]").forEach(button=>{
        const control=controls.get(button.dataset.compositionAreaClear);
        if(!control)return;
        button.addEventListener("click",()=>{
          node.composition=node.composition||{};
          node.composition[control.id]={mode:control.mode||"polygon",points:[]};
          this.runtime.updateNode(node.id,{composition:node.composition},true);
          this.renderInspector();
        });
      });

      content.querySelectorAll("[data-composition-action]").forEach(button=>button.addEventListener("click",()=>{
        const action=button.dataset.compositionAction;
        if(action==="activate"){
          node.composition=node.composition||{};
          this.ensureCompositionAnimation(node.composition,definition);
          node.composition.active=true;
          this.runtime.updateNode(node.id,{composition:node.composition},true);
          this.selected=this.runtime.nodes.get(node.id)?.node||node;
          this.renderInspector();
        }
      }));
    }

    content.querySelector("[data-delete-node]")?.addEventListener("click",()=>{
      const id=node.id;
      if(confirm("Excluir este nó da cena?")){
        this.runtime.deleteNode(id);
        this.selected=null;
        this.renderInspector();
      }
    });

    content.querySelectorAll("[data-layer]").forEach(button=>button.addEventListener("click",()=>{
      const value=Number(button.dataset.layer);
      this.runtime.updateNode(node.id,{z:value},true);
      this.selected=this.runtime.nodes.get(node.id)?.node||node;
      this.renderInspector();
    }));
  }

  startCompositionAreaMarking(node,definition,control){
    const item=this.runtime.nodes.get(node.id);
    if(!item)return;

    this.cancelCompositionAreaMarking();

    const previousMode=this.runtime.mode;
    const previousPoints=(node.composition?.[control.id]?.points||[]).map(point=>({x:Number(point.x),y:Number(point.y)}));
    const draft=previousPoints.map(point=>({...point}));
    const maxPoints=Number(control.maxPoints??32);
    const minPoints=Number(control.minPoints??3);

    this.runtime.setMode("area");

    const overlay=document.createElementNS("http://www.w3.org/2000/svg","svg");
    overlay.dataset.compositionAreaOverlay=node.id;
    overlay.classList.add("tq-water-area-editor");
    overlay.setAttribute("preserveAspectRatio","none");

    const layout=this.runtime.resolveNodeLayout(node);
    const width=Math.max(1,layout.width||item.el.offsetWidth||1);
    const height=Math.max(1,layout.height||item.el.offsetHeight||1);

    Object.assign(overlay.style,{
      left:layout.x+"px",
      top:layout.y+"px",
      width:width+"px",
      height:height+"px",
      zIndex:String((node.z||0)+200000),
      transform:"rotate("+(node.rotation||0)+"deg) skew("+(node.skewX||0)+"deg,"+(node.skewY||0)+"deg) scale("+(node.scaleX||1)+","+(node.scaleY||1)+")",
      transformOrigin:"center center"
    });

    overlay.setAttribute("viewBox","0 0 "+width+" "+height);
    this.runtime.stage.append(overlay);

    const panel=document.createElement("section");
    panel.className="tq-water-editor-panel";
    panel.innerHTML=
      '<header><strong>'+(control.editorTitle||control.label||"Área")+'</strong><span data-area-count>0 pontos</span></header>'+
      '<small>'+(control.editorHint||control.hint||"Toque para criar o contorno.")+'</small>'+
      '<div class="tq-water-editor-actions">'+
        '<button type="button" data-area-undo>↶ Desfazer</button>'+
        '<button type="button" data-area-draft-clear>Limpar</button>'+
        '<button type="button" data-area-cancel>Cancelar</button>'+
        '<button type="button" class="is-primary" data-area-finish>✓ Concluir</button>'+
      '</div>';
    this.el.append(panel);

    const redraw=()=>{
      const polygon=draft.length>=minPoints?'<polygon points="'+draft.map(point=>(point.x*width)+","+(point.y*height)).join(" ")+'" class="tq-water-polygon"/>':"";
      const polyline=draft.length?'<polyline points="'+draft.map(point=>(point.x*width)+","+(point.y*height)).join(" ")+'" class="tq-water-line"/>':"";
      const dots=draft.map((point,index)=>'<g><circle cx="'+(point.x*width)+'" cy="'+(point.y*height)+'" r="'+(index===0?7:5)+'" class="'+(index===0?'is-first':'')+'"/><text x="'+(point.x*width+8)+'" y="'+(point.y*height-8)+'">'+(index+1)+'</text></g>').join("");
      overlay.innerHTML=polygon+polyline+dots;
      panel.querySelector("[data-area-count]").textContent=draft.length+" ponto"+(draft.length===1?"":"s");
      panel.querySelector("[data-area-finish]").disabled=draft.length<minPoints;
    };

    const addPoint=event=>{
      event.preventDefault();
      event.stopPropagation();
      if(draft.length>=maxPoints)return;

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

    const close=commit=>{
      overlay.remove();
      panel.remove();
      this.areaEditSession=null;
      this.runtime.setMode(previousMode==="play"?"play":"config");

      if(commit){
        node.composition=node.composition||{};
        this.ensureCompositionAnimation(node.composition,definition);
        node.composition.active=true;
        node.composition[control.id]={mode:control.mode||"polygon",points:draft.map(point=>({...point}))};
        this.runtime.updateNode(node.id,{composition:node.composition},true);
        this.selected=this.runtime.nodes.get(node.id)?.node||node;
      }

      this.renderInspector();
    };

    panel.querySelector("[data-area-undo]").addEventListener("click",()=>{draft.pop();redraw();});
    panel.querySelector("[data-area-draft-clear]").addEventListener("click",()=>{draft.splice(0,draft.length);redraw();});
    panel.querySelector("[data-area-cancel]").addEventListener("click",()=>close(false));
    panel.querySelector("[data-area-finish]").addEventListener("click",()=>{if(draft.length>=minPoints)close(true);});

    this.areaEditSession={overlay,panel,cancel:()=>close(false)};
    redraw();
  }

  cancelCompositionAreaMarking(){
    if(this.areaEditSession?.cancel)this.areaEditSession.cancel();
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
