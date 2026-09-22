const test=require("node:test");
const assert=require("node:assert/strict");

delete globalThis.TabuadaQuest;
require("../../web/js/content/challenge-effects.js");
require("../../web/js/core/challenge-effect-renderer.js");
require("../../web/js/screens/challenge-screen.js");
require("../../web/js/screens/special-mission-screen.js");

const TQ=globalThis.TabuadaQuest;

function feedbackSession(isCorrect){
    return {
        plannedAnswered:7,
        phase:"feedback",
        lastFeedback:{
            table:4,
            multiplier:6,
            expected:24,
            received:isCorrect?24:20,
            isCorrect
        }
    };
}

test("catálogo possui efeitos padrão independentes para acerto e erro",()=>{
    const correct=TQ.effects.resolveEquippedEffect({}, "correct");
    const wrong=TQ.effects.resolveEquippedEffect({}, "wrong");

    assert.equal(correct.id,"effect-correct-default");
    assert.equal(correct.type,"correct");
    assert.equal(correct.renderer.kind,"text");
    assert.ok(correct.renderer.durationMs>0);

    assert.equal(wrong.id,"effect-wrong-default");
    assert.equal(wrong.type,"wrong");
    assert.equal(wrong.renderer.kind,"text");
    assert.ok(wrong.renderer.durationMs>0);
});

test("resolver aceita contrato futuro de inventário e usa fallback para id inválido",()=>{
    const state={
        inventory:{
            equipped:{
                correctEffectId:"effect-correct-default",
                wrongEffectId:"nao-existe"
            }
        }
    };

    assert.equal(
        TQ.effects.resolveEquippedEffect(state,"correct").id,
        "effect-correct-default"
    );
    assert.equal(
        TQ.effects.resolveEquippedEffect(state,"wrong").id,
        "effect-wrong-default"
    );
});

test("acerto usa Efeito sem botão de continuidade",()=>{
    const html=TQ.screens.challenge.renderFeedback({},feedbackSession(true));
    assert.match(html,/data-effect-id="effect-correct-default"/);
    assert.match(html,/Muito bem!/);
    assert.doesNotMatch(html,/data-action="continue-feedback"/);
    assert.doesNotMatch(html,/Acertou|Errou/);
});

test("erro usa Efeito, mostra resposta correta e exige continuidade manual",()=>{
    const html=TQ.screens.challenge.renderFeedback({},feedbackSession(false));
    assert.match(html,/data-effect-id="effect-wrong-default"/);
    assert.match(html,/Quase!/);
    assert.match(html,/4 × 6 = 24/);
    assert.match(html,/data-action="continue-feedback"/);
    assert.doesNotMatch(html,/Acertou|Errou/);
});

test("Missão Especial reutiliza o mesmo contrato de efeitos",()=>{
    const correct=TQ.screens.specialMission.renderFeedback({},feedbackSession(true));
    const wrong=TQ.screens.specialMission.renderFeedback({},feedbackSession(false));

    assert.match(correct,/effect-correct-default/);
    assert.match(correct,/\+2 Rubis-base/);
    assert.doesNotMatch(correct,/continue-feedback/);

    assert.match(wrong,/effect-wrong-default/);
    assert.match(wrong,/4 × 6 = 24/);
    assert.match(wrong,/continue-feedback/);
});

test("renderer dispara avanço automático quando a animação de acerto termina",()=>{
    const listeners=new Map();
    const element={
        addEventListener(name,fn){listeners.set(name,fn);},
        removeEventListener(name){listeners.delete(name);}
    };
    const screen={
        isConnected:true,
        querySelector(){return element;}
    };

    const originalSetTimeout=globalThis.setTimeout;
    const originalClearTimeout=globalThis.clearTimeout;
    globalThis.setTimeout=()=>123;
    globalThis.clearTimeout=()=>{};

    try{
        let calls=0;
        const effect=TQ.effects.resolveEquippedEffect({},"correct");
        TQ.core.challengeEffectRenderer.scheduleAutoAdvance(screen,effect,()=>{calls+=1;});
        assert.equal(typeof listeners.get("animationend"),"function");
        listeners.get("animationend")();
        assert.equal(calls,1);
    } finally {
        globalThis.setTimeout=originalSetTimeout;
        globalThis.clearTimeout=originalClearTimeout;
    }
});


test("feedback de erro só avança quando a continuidade manual é acionada",()=>{
    const session={...feedbackSession(false),regionId:1,islandId:1};
    const nextSession={...session,phase:"question",plannedAnswered:8,lastFeedback:null};
    const regionState={marker:"region-state"};
    const state={learning:{activeSession:session}};
    const previousDomain=TQ.domain;
    let continueCalls=0;
    let emittedState=null;

    TQ.domain={
        gameplay:{
            createRegionState(){throw new Error("não deveria criar fallback");},
            continueAfterFeedback(receivedSession,receivedRegionState){
                continueCalls+=1;
                assert.equal(receivedSession,session);
                assert.equal(receivedRegionState,regionState);
                return {session:nextSession,regionState};
            }
        },
        playerState:{
            getRegionLearningState(){return regionState;},
            updateGameplaySession(current,updatedSession,updatedRegionState){
                assert.equal(updatedSession,nextSession);
                assert.equal(updatedRegionState,regionState);
                return {
                    ...current,
                    learning:{...current.learning,activeSession:updatedSession}
                };
            }
        }
    };

    try{
        TQ.screens.challenge.renderFeedback(state,session);
        assert.equal(continueCalls,0);

        TQ.screens.challenge.advanceAfterFeedback(
            state,
            session,
            (next)=>{emittedState=next;}
        );

        assert.equal(continueCalls,1);
        assert.equal(emittedState.learning.activeSession,nextSession);
    } finally {
        TQ.domain=previousDomain;
    }
});


test("desafio resolve Efeito customizado equipado",()=>{
    const state={
        inventory:{
            equipped:{
                correctEffectId:"effect-correct-brilho-capitao",
                wrongEffectId:"effect-wrong-quase-la"
            }
        }
    };

    const correct=TQ.screens.challenge.renderFeedback(state,feedbackSession(true));
    const wrong=TQ.screens.challenge.renderFeedback(state,feedbackSession(false));

    assert.match(correct,/effect-correct-brilho-capitao/);
    assert.match(correct,/Mandou bem, capitão!/);
    assert.match(wrong,/effect-wrong-quase-la/);
    assert.match(wrong,/Quase lá!/);
});
