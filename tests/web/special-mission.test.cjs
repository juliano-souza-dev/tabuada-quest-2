const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/scheduler.js");
require("../../web/js/domain/special-mission.js");
require("../../web/js/content/game-content.js");
require("../../web/js/domain/player-state.js");

const TQ=global.TabuadaQuest;
const d=TQ.domain.specialMission;

test("Mapa 1 cria 20 questões somente com operações já introduzidas até a global 10",()=>{
    const introduced=new Set(d.getIntroducedOperations(1).map((x)=>x.key));
    const mission=d.createMission(1,"test-map-1");
    assert.equal(mission.questions.length,20);
    for(const q of mission.questions){
        assert.ok(introduced.has(`${q.table}x${q.multiplier}`));
    }
});

test("Missão Especial dá uma única chance por questão",()=>{
    let mission=d.createMission(1,"one-chance");
    const q=d.currentQuestion(mission);
    mission=d.answer(mission,-999);
    assert.equal(mission.wrongAnswers,1);
    assert.equal(mission.correctAnswers,0);
    assert.equal(mission.totalAnswered,1);
    assert.equal(mission.cursor,1);
    assert.equal(mission.phase,"feedback");
    assert.equal(mission.lastFeedback.expected,q.table*q.multiplier);
    mission=d.continueAfterFeedback(mission);
    assert.equal(mission.phase,"question");
    assert.equal(mission.cursor,1);
});

test("20 respostas encerram a missão sem recovery",()=>{
    let mission=d.createMission(1,"finish");
    while(mission.phase!=="complete"){
        if(mission.phase==="question"){
            const q=d.currentQuestion(mission);
            mission=d.answer(mission,q.table*q.multiplier);
        }else{
            mission=d.continueAfterFeedback(mission);
        }
    }
    const result=d.buildResult(mission);
    assert.equal(result.totalQuestions,20);
    assert.equal(result.correctAnswers,20);
    assert.equal(result.wrongAnswers,0);
});


test("concluir missão paga 2 Rubis-base por acerto e libera próximo gate",()=>{
    const ps=TQ.domain.playerState;
    let state=ps.createInitialState();
    state={
        ...state,
        campaign:{
            ...state.campaign,
            unlockedRegionIds:[1,2],
            completedRegionIds:[1,2],
            specialMaps:{
                ...state.campaign.specialMaps,
                "1":{
                    ...state.campaign.specialMaps["1"],
                    fragments:4,
                    missionStatus:"map_complete_mission_pending"
                }
            }
        }
    };
    let mission=d.createMission(1,"reward");
    state=ps.startSpecialMapMission(state,1,mission);
    while(mission.phase!=="complete"){
        if(mission.phase==="question"){
            const q=d.currentQuestion(mission);
            const answer=mission.correctAnswers<15 ? q.table*q.multiplier : -1;
            mission=d.answer(mission,answer);
        }else{
            mission=d.continueAfterFeedback(mission);
        }
    }
    state=ps.updateSpecialMapMission(state,1,mission);
    const result=d.buildResult(mission);
    state=ps.completeSpecialMapMission(
        state,
        result,
        TQ.content.crewMembers,
        TQ.content.gameplayRewards,
        TQ.content
    );
    assert.equal(result.correctAnswers,15);
    assert.equal(state.campaign.specialMaps["1"].missionStatus,"mission_completed");
    assert.equal(state.campaign.specialMaps["1"].lastMissionResult.reward.base.gems,30);
    assert.equal(state.wallet.gems,30);
    assert.ok(state.campaign.unlockedRegionIds.includes(3));
});
