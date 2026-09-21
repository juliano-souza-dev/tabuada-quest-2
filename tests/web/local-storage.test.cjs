const test=require("node:test");
const assert=require("node:assert/strict");
global.TabuadaQuest={};
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/player-state.js");
require("../../web/js/persistence/local-storage.js");
const p=global.TabuadaQuest.persistence.localStorage;
const d=global.TabuadaQuest.domain.playerState;
function memory(seed={}){const m=new Map(Object.entries(seed));return{getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v))}}
function legacyV8(){
    const progress=Object.fromEntries(Array.from({length:11},(_,i)=>[String(i+1),{islandsCompleted:0,islandsTotal:10}]));
    const maps=Object.fromEntries(Array.from({length:5},(_,i)=>[String(i+1),{fragments:0,missionStatus:"collecting",rewardClaimed:false}]));
    return {schemaVersion:8,player:{id:"local-player",displayName:"Explorador",avatarId:"luna",profileFrameId:"simple"},progression:{level:1,xpCurrent:0,xpRequired:100},wallet:{coins:0,gems:0},crew:{hiredIds:[]},campaign:{currentRegionId:1,currentIslandId:1,unlockedRegionIds:[1],completedRegionIds:[],completedIslandIds:[],travelPlayedIslandIds:[],regionProgress:progress,finalJourney:{finalMapFragments:0,finalMapCompleted:false,island10Unlocked:false,island10Completed:false,finalGrandChestUnlocked:false,finalGrandChestClaimed:false},petsRescuedIds:[],claimedChestIds:[],specialMaps:maps,diamonds:0},learning:{activeSession:null,regionStates:{},lastResult:null},ui:{lastScreen:"home",homeBackgroundId:"pirate-main"}};
}
test("sem persistência carrega v10",()=>{const s=p.loadState(memory());assert.equal(s.schemaVersion,10);assert.equal(Object.keys(s.campaign.regionProgress).length,22)});
test("persiste HUD e personalização",()=>{const st=memory();let s=d.createInitialState();s.player.displayName="Alana";s.player.profileFrameId="tide-wheel";s.wallet.coins=64;p.saveState(st,s);const l=p.loadState(st);assert.equal(l.player.displayName,"Alana");assert.equal(l.player.profileFrameId,"tide-wheel");assert.equal(l.wallet.coins,64)});
test("loadState migra save v8 para posição global equivalente",()=>{const old=legacyV8();old.campaign.currentIslandId=6;old.campaign.regionProgress["1"].islandsCompleted=6;old.campaign.completedIslandIds=Array.from({length:6},(_,i)=>`region-1-island-${i+1}`);const st=memory({[p.STORAGE_KEY]:JSON.stringify(old)});const l=p.loadState(st);assert.equal(l.schemaVersion,10);assert.equal(l.campaign.currentRegionId,2);assert.equal(l.campaign.currentIslandId,1);assert.equal(l.campaign.regionProgress["1"].islandsCompleted,5);assert.equal(l.campaign.regionProgress["2"].islandsCompleted,1)});
test("persiste arco final sem tocar ledger normal",()=>{const st=memory();let s=d.createInitialState();s={...s,campaign:{...s.campaign,unlockedRegionIds:Array.from({length:22},(_,i)=>i+1)}};for(let i=1;i<=5;i++)s=d.completeIsland(s,21,i);for(let i=1;i<=5;i++)s=d.completeIsland(s,22,i);s=d.claimFinalGrandChest(s);p.saveState(st,s);const l=p.loadState(st);assert.equal(l.campaign.finalJourney.finalMapFragments,9);assert.equal(l.campaign.finalJourney.finalGrandChestClaimed,true);assert.equal(l.campaign.claimedChestIds.length,0)});
test("JSON corrompido volta ao inicial",()=>{const s=p.loadState(memory({[p.STORAGE_KEY]:"{broken"}));assert.equal(s.schemaVersion,10);assert.equal(s.wallet.gems,0)});
