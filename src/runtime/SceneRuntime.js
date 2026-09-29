export class SceneRuntime {
  constructor(root, reference = { width: 390, height: 844 }) {
    this.root = root;
    this.reference = reference;
    this.mode = "edit";
    this.selectedId = null;
    this.nodes = new Map();
    this.mount();
  }

  mount() {
    this.root.innerHTML = "";
    this.stageHost = document.createElement("main");
    this.stageHost.className = "tq-stage-host";
    this.stage = document.createElement("section");
    this.stage.className = "tq-stage";
    this.stage.style.setProperty("--scene-w", this.reference.width);
    this.stage.style.setProperty("--scene-h", this.reference.height);
    this.stageHost.append(this.stage);
    this.root.append(this.stageHost);
    this.resizeObserver = new ResizeObserver(() => this.fit());
    this.resizeObserver.observe(this.stageHost);
    this.fit();
  }

  fit() {
    const r = this.stageHost.getBoundingClientRect();
    const scale = Math.min(r.width / this.reference.width, r.height / this.reference.height);
    this.stage.style.width = this.reference.width + "px";
    this.stage.style.height = this.reference.height + "px";
    this.stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
  }

  async load(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Scene load failed: ${res.status}`);
    this.scene = await res.json();
    this.render();
  }

  render() {
    this.stage.replaceChildren();
    this.nodes.clear();
    const ordered = [...this.scene.nodes].sort((a,b)=>(a.z??0)-(b.z??0));
    for (const node of ordered) this.stage.append(this.createNode(node));
  }

  createNode(node) {
    const el = node.kind === "text" ? document.createElement("div") : document.createElement("img");
    el.className = "tq-node";
    el.dataset.nodeId = node.id;
    if (node.kind === "image") {
      el.src = node.src;
      el.alt = node.alt || "";
      el.draggable = false;
    } else {
      el.textContent = node.text || "";
    }
    this.applyTransform(el,node);
    el.addEventListener("pointerdown", e => {
      if (this.mode !== "edit") return;
      e.preventDefault();
      this.select(node.id);
      this.beginDrag(e,node,el);
    });
    this.nodes.set(node.id,{node,el});
    return el;
  }

  applyTransform(el,node) {
    el.style.left=(node.x??0)+"px";
    el.style.top=(node.y??0)+"px";
    if(node.width) el.style.width=node.width+"px";
    if(node.height) el.style.height=node.height+"px";
    el.style.zIndex=node.z??0;
    el.style.transform=`rotate(${node.rotation??0}deg) scale(${node.scaleX??1},${node.scaleY??1})`;
  }

  select(id) {
    this.selectedId=id;
    for(const [nodeId,{el}] of this.nodes) el.classList.toggle("is-selected",nodeId===id);
    this.dispatchEvent("selectionchange",{id,node:this.nodes.get(id)?.node});
  }

  beginDrag(event,node,el) {
    el.setPointerCapture(event.pointerId);
    const start={px:event.clientX,py:event.clientY,x:node.x??0,y:node.y??0};
    const scale=this.stage.getBoundingClientRect().width/this.reference.width;
    const move=e=>{
      node.x=start.x+(e.clientX-start.px)/scale;
      node.y=start.y+(e.clientY-start.py)/scale;
      this.applyTransform(el,node);
      this.dispatchEvent("nodechange",{node});
    };
    const end=()=>{el.removeEventListener("pointermove",move);el.removeEventListener("pointerup",end);};
    el.addEventListener("pointermove",move);
    el.addEventListener("pointerup",end);
  }

  setMode(mode) {
    this.mode=mode;
    this.stage.dataset.mode=mode;
    if(mode==="play") this.select(null);
    this.dispatchEvent("modechange",{mode});
  }

  dispatchEvent(name,detail){ window.dispatchEvent(new CustomEvent("tq:"+name,{detail})); }
}
