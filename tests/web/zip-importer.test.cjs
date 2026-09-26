const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const read=(p)=>fs.readFileSync(path.join(__dirname,"../../",p),"utf8");

function loadZipImporter(){
  const context=vm.createContext({
    console,
    TabuadaQuest:{dev:{}},
    TextDecoder,
    Blob,
    Response,
    Uint8Array,
    DataView,
    Object,
    String,
    Number,
    Array,
    Set,
    Map
  });
  vm.runInContext(read("web/js/dev/zip-importer.js"),context);
  return context.TabuadaQuest.dev.zipImporter;
}

const slots=[
  {id:"home.header.frame",label:"Placa moldura",group:"header",semanticType:"frame",required:true},
  {id:"home.header.avatar",label:"Avatar rosto",group:"header",semanticType:"avatar",required:true},
  {id:"home.header.logo",label:"Logo",group:"header",semanticType:"logo",required:true},
  {id:"home.header.level-plate",label:"Plaquinha de nível",group:"header",semanticType:"level_plate",required:true},
  {id:"home.background.ocean",label:"Oceano",group:"background-ocean",semanticType:"ocean",required:true},
  {id:"home.background.pier",label:"Pier",group:"background-pier",semanticType:"pier",required:true},
  {id:"home.background.ship.1",label:"Navio 1",group:"background-ships",semanticType:"ship",required:true},
  {id:"home.background.cloud.1",label:"Nuvem 1",group:"background-clouds",semanticType:"cloud",required:false},
  {id:"home.background.scenery.1",label:"Item de cenário 1",group:"background-scenery",semanticType:"environment",required:false},
  {id:"home.button.play",label:"Jogar",group:"buttons",semanticType:"ui_button",required:true},
  {id:"home.button.crew",label:"Tripulação",group:"buttons",semanticType:"ui_button",required:true},
  {id:"home.button.shop",label:"Loja",group:"buttons",semanticType:"ui_button",required:true}
];

function fake(name){
  return {path:name,name,file:{name}};
}

test("grupo Cenário contém oceano e pier, mantendo tipos internos",()=>{
  const zip=loadZipImporter();
  const scene=zip.groupSlots(slots,"scene");
  assert.ok(scene.some((slot)=>slot.id==="home.background.ocean"));
  assert.ok(scene.some((slot)=>slot.id==="home.background.pier"));
  assert.ok(!scene.some((slot)=>slot.group==="header"));
  assert.ok(!scene.some((slot)=>slot.group==="buttons"));
});

test("classificação sugere slots antes da confirmação",()=>{
  const zip=loadZipImporter();
  const suggestions=zip.suggestAssignments([
    fake("oceano.webp"),
    fake("pier-madeira.webp"),
    fake("navio-vermelho.webp"),
    fake("nuvem-01.webp"),
    fake("bau-cenario.webp")
  ],slots,"scene");

  assert.deepEqual(
    suggestions.map((item)=>item.slotId),
    [
      "home.background.ocean",
      "home.background.pier",
      "home.background.ship.1",
      "home.background.cloud.1",
      "home.background.scenery.1"
    ]
  );
});

test("Cenário exige ao menos um pier no estado final",()=>{
  const zip=loadZipImporter();
  const assignments=zip.suggestAssignments([
    fake("oceano.webp"),
    fake("navio.webp")
  ],slots,"scene");
  const result=zip.validateAssignments({
    assignments,
    slots,
    groupId:"scene",
    occupiedSlotIds:[],
    limits:{
      "background-ocean":{label:"Oceano",min:1,max:1},
      "background-pier":{label:"Pier",min:1,max:1},
      "background-ships":{label:"Navios",min:1,max:5}
    }
  });

  assert.equal(result.valid,false);
  assert.ok(result.errors.some((message)=>message.includes("Pier")));
});

test("UI Buttons usa nomes para sugerir destinos",()=>{
  const zip=loadZipImporter();
  const suggestions=zip.suggestAssignments([
    fake("btn-jogar.webp"),
    fake("tripulacao.webp"),
    fake("loja.webp")
  ],slots,"buttons");

  assert.deepEqual(
    suggestions.map((item)=>item.slotId),
    ["home.button.play","home.button.crew","home.button.shop"]
  );
});

test("UP só aplica ZIP depois da revisão e confirmação",()=>{
  const source=read("web/js/dev/asset-uploader.js");
  assert.match(source,/data-zip-group/);
  assert.match(source,/data-zip-review/);
  assert.match(source,/Destino sugerido · confirme antes de importar/);
  assert.match(source,/function validateZipReview\(\)/);
  assert.match(source,/async function confirmZipImport\(\)/);
  assert.match(source,/await addLocalLayer\(assignment\.entry\.file, intent\)/);
  assert.match(source,/suppressSelection: true/);
});


test("Cenário ignora limite obrigatório de Avatar completo",()=>{
  const zip=loadZipImporter();
  const assignments=zip.suggestAssignments([
    fake("oceano.webp"),
    fake("pier.webp"),
    fake("navio.webp")
  ],slots,"scene");

  const result=zip.validateAssignments({
    assignments,
    slots,
    groupId:"scene",
    occupiedSlotIds:[],
    limits:{
      "background-ocean":{label:"Oceano",min:1,max:1},
      "background-pier":{label:"Pier",min:1,max:1},
      "background-ships":{label:"Navios",min:1,max:5},
      "character":{label:"Avatar completo",min:1,max:1}
    }
  });

  assert.equal(result.valid,true);
  assert.ok(!result.errors.some((message)=>message.includes("Avatar completo")));
});
