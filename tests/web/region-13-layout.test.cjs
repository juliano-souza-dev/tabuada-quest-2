const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

delete globalThis.TabuadaQuest;
require("../../web/js/content/game-content.js");
require("../../web/js/screens/islands-screen.js");

const content=globalThis.TabuadaQuest.content;
const islands=globalThis.TabuadaQuest.screens.islands;
const assetRoot=path.join(__dirname,"../../web");

function assetPath(url){
    return path.join(assetRoot,url.split("?")[0].replace(/^\.\//,""));
}

function imageInfo(bytes){
    if(bytes.subarray(1,4).toString("ascii")==="PNG"){
        return {
            format:"png",
            width:bytes.readUInt32BE(16),
            height:bytes.readUInt32BE(20),
            hasAlpha:[4,6].includes(bytes[25])
        };
    }

    assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
    assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
    let offset=12,width=null,height=null,hasAlpha=false;
    while(offset+8<=bytes.length){
        const type=bytes.subarray(offset,offset+4).toString("ascii");
        const size=bytes.readUInt32LE(offset+4);
        const data=offset+8;
        if(type==="VP8X" && size>=10){
            hasAlpha ||= (bytes[data]&0x10)!==0;
            width=1+bytes[data+4]+(bytes[data+5]<<8)+(bytes[data+6]<<16);
            height=1+bytes[data+7]+(bytes[data+8]<<8)+(bytes[data+9]<<16);
        }else if(type==="ALPH"){
            hasAlpha=true;
        }else if(type==="VP8 " && width===null && size>=10){
            width=bytes.readUInt16LE(data+6)&0x3fff;
            height=bytes.readUInt16LE(data+8)&0x3fff;
        }else if(type==="VP8L" && width===null && size>=5){
            assert.equal(bytes[data],0x2f);
            const bits=bytes.readUInt32LE(data+1);
            width=(bits&0x3fff)+1;
            height=((bits>>>14)&0x3fff)+1;
            hasAlpha ||= ((bits>>>28)&1)===1;
        }
        offset=data+size+(size%2);
    }
    assert.ok(Number.isInteger(width)&&Number.isInteger(height));
    return {format:"webp",width,height,hasAlpha};
}

test("OBSIDIANA possui as cinco Ilhas oficiais",()=>{
    assert.deepEqual(Array.from({length:5},(_,i)=>content.getIslandIdentity(13,i+1).label),["Rocha Negra","Cinzas","Fogo Obsidiano","Cratera","Coração de Obsidiana"]);
});

test("OBSIDIANA é Região única de cinco slots",()=>{
    const visual=islands.getRegionVisualConfig(13);
    assert.equal(visual.assetKey,"region13Modular");
    assert.equal(visual.id,"obsidiana");
    assert.deepEqual(visual.islandIds,[1,2,3,4,5]);
    assert.equal("pages" in visual,false);
    const page=islands.getRegionVisualPage({},13);
    assert.equal(page.id,"obsidiana");
    assert.equal(Object.keys(page.slotLayout).length,5);
});

test("cinco Ilhas possuem assets normal e bloqueado",()=>{
    for(let i=1;i<=5;i++){
        const entry=content.assets.region13Modular.islands[i];
        assert.match(entry.unlocked,new RegExp(`island-0${i}-unlocked\\.(?:png|webp)`));
        assert.match(entry.locked,new RegExp(`island-0${i}-locked\\.(?:png|webp)`));
        assert.notEqual(entry.unlocked,entry.locked);
    }
});

test("assets preservam transparência e resolução",()=>{
    for(let i=1;i<=5;i++){
        for(const state of ["unlocked","locked"]){
            const configured=content.assets.region13Modular.islands[i][state];
            const image=imageInfo(fs.readFileSync(assetPath(configured)));
            assert.equal(image.width,256);
            assert.equal(image.height,256);
            assert.equal(image.hasAlpha,true);
        }
    }
});

test("background preserva 941x1672",()=>{
    const configured=content.assets.region13Modular.background;
    const image=imageInfo(fs.readFileSync(assetPath(configured)));
    assert.equal(image.width,941);
    assert.equal(image.height,1672);
});
