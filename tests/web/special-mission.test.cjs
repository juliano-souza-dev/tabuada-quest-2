const test=require("node:test");
const assert=require("node:assert/strict");

delete global.TabuadaQuest;
require("../../web/js/domain/world-structure.js");
require("../../web/js/domain/scheduler.js");
require("../../web/js/domain/special-mission.js");

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
