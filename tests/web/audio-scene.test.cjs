const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const read=(relative)=>fs.readFileSync(path.join(__dirname,"../../",relative),"utf8");

function loadAudioScene(){
    const data=new Map();
    const context=vm.createContext({
        console,
        localStorage:{
            getItem(key){return data.has(key)?data.get(key):null;},
            setItem(key,value){data.set(key,String(value));},
            removeItem(key){data.delete(key);}
        },
        TabuadaQuest:{core:{}}
    });
    vm.runInContext(read("web/js/core/audio-scene.js"),context);
    return context.TabuadaQuest.core.audioScene;
}

test("SOM normaliza e persiste múltiplos áudios por tela",()=>{
    const audio=loadAudioScene();
    const saved=audio.saveConfig("home.background-default",{
        enabled:true,
        tracks:[
            {
                id:"waves",
                label:"Ondas",
                src:"./assets/backgrounds/default/ocean-waves.mp3",
                role:"ambient",
                enabled:true,
                autoplay:true,
                loop:true,
                volume:140
            },
            {
                id:"music",
                label:"Ambiente",
                src:"./assets/backgrounds/default/jeanmalraux-oceano-119943.mp3",
                role:"music",
                enabled:true,
                autoplay:false,
                loop:false,
                volume:30
            }
        ]
    });

    assert.equal(saved.tracks.length,2);
    assert.equal(saved.tracks[0].volume,100);
    assert.equal(saved.tracks[0].autoplay,true);
    assert.equal(saved.tracks[1].role,"music");
    assert.equal(saved.tracks[1].loop,false);

    const restored=audio.readConfig("home.background-default");
    assert.equal(restored.tracks[0].src,"./assets/backgrounds/default/ocean-waves.mp3");
    assert.equal(restored.tracks[1].src,"./assets/backgrounds/default/jeanmalraux-oceano-119943.mp3");

    audio.clearConfig("home.background-default");
    assert.equal(audio.readConfig("home.background-default").tracks.length,0);
});

test("Copiar layout inclui SOM no pacote de implementação",()=>{
    const source=read("web/js/dev/scene-editor.js");
    assert.match(source,/function readScopedAudio/);
    assert.match(source,/audio:\s*\{\s*version:\s*1,/);
    assert.match(source,/Layout \+ composição \+ CENA \+ MAR \+ SOM copiados/);
});

test("default publica os dois sons do cenário sem depender do manifesto",()=>{
    const audio=loadAudioScene();
    const config=audio.readConfig("home.background-default");
    assert.equal(config.tracks.length,2);
    assert.equal(config.tracks[0].src,"./assets/backgrounds/default/ocean-waves.mp3");
    assert.equal(config.tracks[1].src,"./assets/backgrounds/default/jeanmalraux-oceano-119943.mp3");

    const compositionSource=read("web/js/content/screen-composition.js");
    assert.match(compositionSource,/id: "ocean-waves"/);
    assert.match(compositionSource,/id: "ocean-atmosphere"/);

    const appSource=read("web/js/app.js");
    assert.match(appSource,/catalog: audioCatalog/);
});
