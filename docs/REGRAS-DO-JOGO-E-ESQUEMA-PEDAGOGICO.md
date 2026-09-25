# Tabuada Quest 2.0 — Regras do Jogo e Esquema Pedagógico

**Status:** Fonte de verdade consolidada  
**Branch de referência:** develop  
**Data de consolidação:** 2026-09-25  
**Objetivo:** registrar em um único documento as regras centrais do jogo e o contrato pedagógico, antes de novos refactors de interface, assets ou arquitetura.

> Este documento consolida as decisões já aprovadas nas DEC-001, DEC-002, DEC-004 e DEC-005.
> Em caso de conflito com documentos anteriores, prevalecem as decisões mais recentes registradas aqui.
> Em especial, a campanha vigente possui **11 Regiões e 110 Ilhas**.

---

## 1. Princípio central do jogo

Tabuada Quest 2.0 é uma aventura pirata/marítima de prática de multiplicação.

A fantasia, os mapas, as Regiões, as Ilhas, os PETs, os baús e as recompensas existem para sustentar a jornada do jogador.

A regra pedagógica deve permanecer independente da arte e da ambientação.

Em termos conceituais:

```text
JOGO
├── Jornada / campanha
├── Regiões
├── Ilhas
├── Recompensas
├── Coleção
└── Apresentação visual

PEDAGOGIA
├── Operações de multiplicação
├── Exposições planejadas
├── Mistura de tabuadas
├── Recuperação após erro
├── Domínio por operação
└── Scheduler pedagógico
```

Uma Ilha não é “a ilha da tabuada 7”.

Uma Ilha possui identidade visual e narrativa própria, enquanto as operações são definidas pelo scheduler pedagógico.

---

## 2. Estrutura oficial da campanha

A campanha possui:

```text
11 Regiões
10 Ilhas por Região
110 Ilhas no total
```

Constantes conceituais:

```text
TOTAL_REGIONS = 11
ISLANDS_PER_REGION = 10
TOTAL_ISLANDS = 110
```

A navegação entre Regiões é sequencial.

```text
Região 1
→ Região 2
→ Região 3
→ ...
→ Região 11
```

Uma Região posterior não deve ficar livremente acessível antes do marco exigido pela campanha.

Missões especiais de mapa podem interromper temporariamente essa sequência.

---

## 3. Loop principal do jogador

Fluxo conceitual:

```text
Entrar no jogo
↓
Selecionar / continuar progresso
↓
Escolher Região disponível
↓
Escolher Ilha disponível
↓
Responder desafios de multiplicação
↓
Receber feedback de acerto ou erro
↓
Concluir a Ilha
↓
Receber / avançar marco de progressão
↓
Liberar próxima Ilha / Região / missão
```

A progressão visual nunca deve alterar as cotas pedagógicas.

---

## 4. Regra de uma Ilha comum

Toda Ilha comum possui exatamente:

```text
20 plannedExposure
```

Portanto:

```text
plannedExposure(island) = 20
```

Essas 20 exposições são a carga curricular planejada da Ilha.

Tentativas extras criadas por erro não entram nessa contagem.

---

## 5. O que é uma plannedExposure

`plannedExposure` é uma questão prevista na matriz pedagógica.

Características:

- pertence ao currículo base da Ilha;
- existe independentemente do desempenho do jogador;
- conta uma única vez como exposição planejada;
- não é criada por erro;
- não pode desaparecer para “compensar” tentativas de recuperação.

Exemplo:

```text
7 × 8 aparece na matriz da Ilha
→ plannedExposure
```

---

## 6. O que é uma recoveryAttempt

`recoveryAttempt` é uma tentativa adicional criada porque o jogador errou uma operação.

Características:

- não aumenta a carga curricular base;
- não incrementa `plannedExposure`;
- não substitui uma exposição planejada;
- pode ocorrer mais de uma vez para a mesma operação;
- pode atravessar Ilhas dentro da mesma Região;
- deixa de ser necessária quando a condição de domínio é satisfeita.

Contadores independentes:

```text
plannedExposureCount
recoveryAttemptCount
```

Regra obrigatória:

```text
recoveryAttempt NÃO altera plannedExposure
```

---

## 7. Prática intercalada

As Ilhas não praticam uma única tabuada isoladamente.

Cada Ilha contém uma combinação planejada de tabuadas.

A quantidade de tabuadas distintas por Ilha aumenta ao longo da campanha.

| Região | Tabuadas distintas por Ilha (K) | recoveryGap alvo |
|---:|---:|---:|
| 1 | 2 | 2 |
| 2 | 2 | 2 |
| 3 | 3 | 3 |
| 4 | 3 | 3 |
| 5 | 4 | 4 |
| 6 | 4 | 4 |
| 7 | 5 | 5 |
| 8 | 5 | 5 |
| 9 | 10 | 6 |
| 10 | 10 | 6 |
| 11 | 10 | 6 |

Progressão de mistura:

```text
2 → 2 → 3 → 3 → 4 → 4 → 5 → 5 → 10 → 10 → 10
```

As Regiões finais exigem recuperação em contexto mais misto e com menos pistas implícitas.

---

## 8. Composição determinística das tabuadas por Ilha

Para cada Ilha:

```text
island = 1..10
role   = 0..K-1
```

A tabuada associada ao papel é:

```text
table = 1 + ((island - 1 + role) mod 10)
```

Consequências obrigatórias:

- cada Ilha contém exatamente K tabuadas distintas;
- cada tabuada ocupa cada papel uma vez ao longo das 10 Ilhas;
- cada tabuada recebe exatamente 20 plannedExposure por Região;
- cada operação recebe exatamente 2 plannedExposure por Região.

---

## 9. Multiplicadores por papel

### K = 2

```text
role 0 → {1,2,3,4,5,6,7,8,9,10}
role 1 → {1,2,3,4,5,6,7,8,9,10}
```

Total:

```text
10 + 10 = 20
```

### K = 3

```text
role 0 → {1,2,3,4,5,6,7}
role 1 → {4,5,6,7,8,9,10}
role 2 → {1,2,3,8,9,10}
```

Total:

```text
7 + 7 + 6 = 20
```

### K = 4

```text
role 0 → {1,2,3,4,5}
role 1 → {6,7,8,9,10}
role 2 → {1,2,3,4,5}
role 3 → {6,7,8,9,10}
```

Total:

```text
5 + 5 + 5 + 5 = 20
```

### K = 5

```text
role 0 → {1,4,6,9}
role 1 → {2,5,7,10}
role 2 → {1,3,6,8}
role 3 → {2,4,7,9}
role 4 → {3,5,8,10}
```

Total:

```text
4 + 4 + 4 + 4 + 4 = 20
```

### K = 10

```text
role 0 → {1,6}
role 1 → {2,7}
role 2 → {3,8}
role 3 → {4,9}
role 4 → {5,10}
role 5 → {1,6}
role 6 → {2,7}
role 7 → {3,8}
role 8 → {4,9}
role 9 → {5,10}
```

Total:

```text
2 × 10 papéis = 20
```

---

## 10. Ordem das questões

A matriz determina quais operações precisam existir na Ilha.

A ordem pode variar, desde que preserve o conjunto obrigatório.

Regras:

1. manter exatamente as 20 plannedExposure;
2. não adicionar nem remover operações da matriz;
3. a mesma operação não deve aparecer duas vezes seguidas;
4. evitar mais de duas questões consecutivas da mesma tabuada;
5. uma seed deve permitir ordem reproduzível em testes.

Aleatoriedade pode variar ordem.

Aleatoriedade não pode alterar cotas.

---

## 11. Resposta correta

Ao responder corretamente uma operação:

```text
correctStreak = min(2, correctStreak + 1)
```

A operação caminha em direção ao domínio regional.

---

## 12. Resposta errada

Ao errar:

```text
correctStreak = 0
scheduleRecovery(operation)
```

Fluxo:

1. registrar o erro;
2. zerar a sequência correta da operação;
3. agendar uma `recoveryAttempt`;
4. aguardar o `recoveryGap` alvo;
5. reapresentar a operação;
6. novo erro agenda nova recuperação;
7. domínio cancela recuperação pendente da mesma operação.

A recuperação pertence à Região, não obrigatoriamente à Ilha onde o erro ocorreu.

---

## 13. Regra de domínio por operação

Cada operação mantém:

```text
correctStreak = 0..2
```

Condição de domínio:

```text
correctStreak = 2
```

Isso significa dois acertos consecutivos da mesma operação.

Como cada operação possui exatamente duas exposições planejadas por Região, a matriz curricular é compatível com essa regra sem precisar transformar recoveryAttempt em carga curricular.

---

## 14. Conclusão pedagógica de uma Região

Uma Região só está pedagogicamente concluída quando:

```text
200 plannedExposure apresentados
AND
nenhuma recoveryAttempt pendente
AND
100 operações com correctStreak = 2
```

São 100 operações porque o domínio cobre:

```text
10 tabuadas × 10 multiplicadores
```

No final da Região, se não houver questões suficientes para cumprir integralmente o recoveryGap sem gerar deadlock, o gap pode ser reduzido progressivamente.

Essa redução não cria plannedExposure.

---

## 15. Totais pedagógicos por Região

Cada Região contém:

```text
10 Ilhas
20 plannedExposure por Ilha
200 plannedExposure por Região
```

Distribuição:

```text
20 plannedExposure por tabuada / Região
2 plannedExposure por operação / Região
```

Conferência:

```text
10 tabuadas × 20 = 200
100 operações × 2 = 200
```

---

## 16. Totais pedagógicos da campanha

A campanha completa possui:

```text
110 Ilhas × 20 = 2.200 plannedExposure
```

Por tabuada:

```text
220 plannedExposure
```

Por operação individual:

```text
22 plannedExposure
```

Conferências:

```text
10 tabuadas × 220 = 2.200
100 operações × 22 = 2.200
11 Regiões × 200 = 2.200
110 Ilhas × 20 = 2.200
```

---

## 17. Estrutura da tela de desafio

Uma questão comum deve possuir, conceitualmente:

```text
Texto da conta
Alternativa 1
Alternativa 2
Alternativa 3
Alternativa 4
Área de feedback de acerto
Área de feedback de erro
Ação de continuar
```

Exemplo:

```text
7 × 8 = ?

[42] [56] [64] [48]
```

O texto matemático e as alternativas são conteúdo dinâmico.

Eles não devem ser rasterizados na arte-base da tela.

---

## 18. Feedback de acerto e erro

### Acerto

O jogador recebe feedback visual de acerto.

A experiência pode usar um efeito equipado ou definido pelo jogo, desde que não interfira na regra pedagógica.

O fluxo pode avançar automaticamente quando o efeito permitir.

### Erro

O jogador recebe:

- feedback visual de erro;
- a operação;
- a resposta correta;
- ação para continuar.

O erro também aciona a lógica de recuperação pedagógica descrita anteriormente.

---

## 19. Regras de interface que não podem alterar a pedagogia

São livres para mudar:

- tema visual;
- fundo;
- navio;
- nuvens;
- animações;
- disposição de elementos;
- efeitos;
- personagens;
- sons;
- decoração.

Não podem mudar silenciosamente:

- quantidade de plannedExposure;
- composição da matriz;
- cotas por tabuada;
- cotas por operação;
- regra de recoveryAttempt;
- condição de domínio;
- condição de conclusão pedagógica da Região.

A pedagogia não depende do asset.

---

## 20. PETs

A campanha possui:

```text
TOTAL_PETS = 30
```

Regras:

- total global fechado em 30;
- PET resgatado entra para a coleção;
- PET e baú são trilhas independentes por padrão;
- um PET não implica automaticamente um baú;
- criar um 31º PET exige nova decisão de Produto.

---

## 21. Baús normais

A campanha possui:

```text
TOTAL_CHESTS = 30
```

Regras:

- são 30 baús normais em toda a campanha;
- cada baú pode conter um ou mais tesouros;
- recompensa simples não é automaticamente um baú;
- PET não equivale automaticamente a baú;
- criar um 31º baú normal exige nova decisão de Produto.

O conteúdo final dos baús depende da economia aprovada.

---

## 22. Mapas especiais

Existem:

```text
5 mapas especiais
4 fragmentos por mapa
20 fragmentos no total
```

Distribuição aprovada:

```text
Região 1  → Mapa 1: fragmentos 1, 2, 3 e 4
Região 2  → Mapa 2: fragmentos 1 e 2
Região 3  → Mapa 2: fragmentos 3 e 4

Região 4  → Mapa 3: fragmentos 1 e 2
Região 5  → Mapa 3: fragmentos 3 e 4

Região 6  → Mapa 4: fragmentos 1 e 2
Região 7  → Mapa 4: fragmentos 3 e 4

Região 8  → Mapa 5: fragmentos 1 e 2
Região 9  → Mapa 5: fragmento 3
Região 10 → Mapa 5: fragmento 4
```

Mapas completos nas Regiões:

```text
1, 3, 5, 7 e 10
```

---

## 23. Gate de missão especial

Ao obter o quarto fragmento de um mapa especial:

```text
Mapa completo
↓
Progressão normal temporariamente bloqueada
↓
Missão especial obrigatória
↓
Conclusão
↓
Progressão normal liberada
```

Enquanto a missão estiver pendente, o jogador não deve simplesmente ignorá-la e seguir para a campanha normal.

Estados conceituais:

```text
LOCKED
COLLECTING
MAP_COMPLETE_MISSION_PENDING
MISSION_IN_PROGRESS
MISSION_COMPLETED
```

---

## 24. Missão especial de mapa

A missão especial:

- não é uma Região;
- não é uma Ilha comum;
- usa ambientação temática própria;
- utiliza tabuada mista;
- não pode alterar silenciosamente as cotas curriculares da campanha.

O texto-base aprovado para apresentar a missão é:

> Você encontrou todas as partes do mapa. Viaje nessa aventura!

A ação principal pode ser apresentada como:

> Ir

A quantidade definitiva de questões da missão especial ainda precisa de decisão específica de Produto/Game Design.

---

## 25. Recompensa das missões especiais

Cada mapa especial concluído concede:

```text
1.000 Diamantes
```

A recompensa é concedida uma única vez por mapa.

Total possível:

```text
5 × 1.000 = 5.000 Diamantes
```

Regras:

- Diamantes são persistentes;
- repetir missão não duplica a recompensa;
- Diamantes não consomem os 30 baús;
- Diamantes são uma moeda própria;
- Loja Especial e preços são especificações futuras.

---

## 26. Região 1 — cadência estrutural aprovada

A Região 1 distribui:

```text
3 PETs
3 baús normais
4 fragmentos do Mapa 1
```

Distribuição:

| Ilha | Marco |
|---:|---|
| 1 | PET 1 |
| 2 | Mapa 1 — fragmento 1/4 |
| 3 | Baú normal R1-1 |
| 4 | PET 2 |
| 5 | Mapa 1 — fragmento 2/4 |
| 6 | Baú normal R1-2 |
| 7 | PET 3 |
| 8 | Mapa 1 — fragmento 3/4 |
| 9 | Baú normal R1-3 |
| 10 | Mapa 1 — fragmento 4/4 |

Cadência:

```text
PET → MAPA → BAÚ
PET → MAPA → BAÚ
PET → MAPA → BAÚ
MAPA COMPLETO
```

Depois da Ilha 10, ocorre a missão especial do Mapa 1.

---

## 27. Região 11 — arco final

A Região 11 possui 10 Ilhas e participa integralmente do scheduler pedagógico.

Parâmetros:

```text
K = 10
20 plannedExposure por Ilha
200 plannedExposure na Região
2 plannedExposure por operação
recoveryGap = 6
```

Nas Ilhas 1 a 9:

```text
cada Ilha concluída → 1 fragmento do Mapa Final
```

Ao concluir a Ilha 9:

```text
9/9 fragmentos
→ Mapa Final completo
→ Ilha 10 desbloqueada
```

Ao concluir a Ilha 10:

```text
Grande Baú Final desbloqueado
```

---

## 28. Grande Baú Final

O Grande Baú Final é separado dos 30 baús normais.

```text
30 baús normais continuam existindo
Grande Baú Final ≠ baú 31
```

Estados mínimos:

```text
finalMapFragments = 0..9
finalMapCompleted
region11Island10Unlocked
region11Island10Completed
finalGrandChestUnlocked
finalGrandChestClaimed
```

Seu conteúdo final ainda precisa de decisão específica.

---

## 29. Mapa Final x mapas especiais

São sistemas distintos.

```text
5 mapas especiais
├── 4 fragmentos cada
└── missões intermediárias

Mapa Final
├── 9 fragmentos
├── Região 11
└── desbloqueia Ilha 10
```

O Mapa Final não substitui os 5 mapas especiais.

---

## 30. Identidade visual e propriedade intelectual

A direção é:

```text
aventura pirata mágica / marítima
```

Regiões, Ilhas, personagens, símbolos e nomes devem possuir identidade própria.

Não devem ser copiados:

- personagens de franquias existentes;
- nomes protegidos;
- mapas reconhecíveis;
- bandeiras/logotipos de terceiros;
- composições que reproduzam diretamente universos existentes.

---

## 31. Dados dinâmicos x assets

### Assets

São arquivos visuais, por exemplo:

- oceano;
- nuvens;
- navio;
- Ilha;
- pier;
- fundo;
- logo;
- avatar;
- moldura.

### Dados dinâmicos

São produzidos pelo jogo durante a execução, por exemplo:

- operação matemática;
- alternativas;
- número da questão;
- progresso;
- estado de acerto/erro;
- quantidade de fragmentos;
- cadeado/liberação;
- recompensas contabilizadas.

Regra:

> Dados dinâmicos não devem ser incorporados permanentemente na arte-base quando precisam variar durante o jogo.

---

## 32. Fonte de verdade pedagógica

A ordem de precedência para o modelo pedagógico vigente é:

1. este documento consolidado;
2. DEC-005 — jornada de 11 Regiões;
3. DEC-004 — Scheduler pedagógico para 11 Regiões;
4. DEC-002 — Regiões, Ilhas, PETs, baús e mapas;
5. DEC-001 — prática intercalada.

Documentos anteriores que mencionem campanha de 10 Regiões devem ser interpretados à luz da expansão posterior para 11 Regiões.

---

## 33. Invariantes obrigatórios para testes

### Por Ilha

```text
plannedExposure = 20
tabuadas distintas = K da Região
```

### Por Região

```text
Ilhas = 10
plannedExposure = 200
plannedExposure por tabuada = 20
plannedExposure por operação = 2
```

### Por campanha

```text
Regiões = 11
Ilhas = 110
plannedExposure total = 2.200
plannedExposure por tabuada = 220
plannedExposure por operação = 22
```

### Erros

```text
recoveryAttempt >= 0
recoveryAttempt NÃO altera plannedExposure
```

### Cobertura

Para toda tabuada `n ∈ [1,10]` e todo multiplicador `m ∈ [1,10]`:

```text
plannedExposure(n,m,Região) = 2
plannedExposure(n,m,campanha) = 22
```

---

## 34. Pontos ainda não fechados

Este documento não deve inventar o que Produto ainda não decidiu.

Continuam abertos ou dependentes de especificação própria:

- conteúdo exato dos 30 baús;
- distribuição completa dos 30 PETs;
- economia final;
- preços e catálogo da Loja Especial;
- quantidade definitiva de questões das missões especiais;
- efeito das missões especiais sobre domínio/revisão, caso passem a contar pedagogicamente;
- recompensa do Grande Baú Final;
- conteúdo final de inventário/coleção;
- regras finais de XP/níveis, caso sejam retomadas.

Esses itens exigem decisão explícita antes de implementação definitiva.

---

## 35. Regra para novos refactors

Antes de alterar arquitetura, tela, assets ou pipeline, verificar:

1. a mudança preserva as regras deste documento?
2. altera alguma cota pedagógica?
3. altera Região/Ilha/progressão?
4. mistura regra visual com regra de domínio?
5. cria comportamento que não foi decidido por Produto?

Se a resposta exigir uma nova regra de jogo ou pedagógica, a decisão deve ser documentada antes do refactor.

> Interface pode ser refeita. Assets podem ser substituídos. O contrato do jogo e da pedagogia não deve mudar por acidente.
