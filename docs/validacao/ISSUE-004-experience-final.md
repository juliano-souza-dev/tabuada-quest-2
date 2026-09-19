# Issue #4 — Experience Validator final

## Fluxo avaliado

Home V1 publicada após correções #22 e #23.

## Critérios avaliados

### A criança sabe onde tocar?

Sim. O CTA JOGAR é o principal ponto de ação e os atalhos inferiores têm áreas de toque independentes.

### Estado do jogador é legível?

Sim. Avatar, nome, nível, XP, moedas e gemas permanecem agrupados no HUD superior e foram calibrados sobre os slots do overlay.

### Há rolagem para encontrar a ação principal?

Não. Home, CTA e atalhos principais ocupam o viewport inicial mobile.

### Hierarquia e densidade

A composição prioriza:

1. estado do jogador;
2. identidade do jogo;
3. personagem/portal;
4. JOGAR;
5. recompensa/progresso;
6. atalhos secundários;
7. PETS e itens.

### Próximo passo

O CTA principal é inequívoco. Os elementos secundários não substituem a ação central.

### Risco de frustração / dead end

Nenhum bloqueador identificado na Home. Ações ainda não implementadas retornam feedback em vez de navegação silenciosa.

## Evidência complementar

O líder de equipe aprovou explicitamente a calibração pixel-perfect (#23) e o refino visual completo (#22).

## Decisão

```text
EXPERIENCE_VALIDATOR = APROVADO
```

Sem bloqueio de experiência para o encerramento da Issue #4.
