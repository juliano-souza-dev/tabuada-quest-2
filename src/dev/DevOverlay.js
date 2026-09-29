export class DevOverlay {
  constructor(root,runtime){this.root=root;this.runtime=runtime;this.mode="edit";}
  mount(){
    this.el=document.createElement("aside");
    this.el.className="tq-dev";
    this.el.innerHTML=`
      <div class="tq-dev__bar" role="toolbar" aria-label="Ferramentas DEV">
        <button data-mode="edit" class="active">✥ <span>Editar</span></button>
        <button data-mode="config">⚙ <span>Config</span></button>
        <button data-mode="play">▶ <span>Play</span></button>
      </div>
      <section class="tq-dev__panel" hidden>
        <header><strong>Config</strong><button data-close aria-label="Fechar">×</button></header>
        <div class="tq-dev__empty">Selecione um elemento para configurar.</div>
      </section>`;
    this.root.append(this.el);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>this.setMode(b.dataset.mode)));
    this.el.querySelector("[data-close]").addEventListener("click",()=>this.setMode("edit"));
  }
  setMode(mode){
    this.mode=mode; this.runtime.setMode(mode);
    this.el.querySelectorAll("[data-mode]").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));
    this.el.querySelector(".tq-dev__panel").hidden=mode!=="config";
    this.el.classList.toggle("is-play",mode==="play");
  }
}
