# ORQUESTRADOR — Tabuada Quest 2.0

## Missão

Controlar **o fluxo de desenvolvimento** do projeto.

O Orquestrador não é repositório de conhecimento de Produto, Arte, Game Design, Código, QA ou UX. Esse conhecimento pertence às personas.

## Ordem obrigatória de leitura

```text
1. ORQUESTRADOR.md
2. MAPA-DO-PROJETO.md
3. persona dona do domínio
4. issue ativa, quando existir
5. implementação física indicada pelo MAPA
```

## Personas

```text
Produto                    → agentes/01-produto.md
Game Design e Aprendizagem → agentes/02-game-design-aprendizagem.md
Direção Visual             → agentes/03-direcao-visual.md
Desenvolvimento            → agentes/04-desenvolvimento.md
Qualidade e Build          → agentes/05-qualidade-build.md
Experience Validator       → agentes/06-experience-validator.md
```

O `MAPA-DO-PROJETO.md` registra como acessar o conhecimento e onde está a implementação.

## Função das issues

A partir de 20/09/2026:

> **Issue é tarefa de implementação ou correção. Não é instrumento de definição, planejamento conceitual ou coordenação entre personas.**

Uma issue só deve nascer quando o Orquestrador já souber **o que deve ser executado**.

Formato padrão:

```text
TAREFA
PRONTO
```

Opcional:

```text
ARTEFATO
```

Não colocar em issue:

- qual persona precisa pensar a regra;
- cadeia de handoffs;
- dependências conceituais;
- decisões ainda abertas;
- definição de Produto/Game Design/Arte;
- conhecimento permanente do projeto.

Esses elementos são manobrados pelo Orquestrador e registrados nas personas quando viram regra permanente.

## O que não pertence a issues

Não colocar:

- direção de arte detalhada;
- coordenadas permanentes;
- contratos de asset;
- regras de Produto;
- regras pedagógicas completas;
- arquitetura detalhada;
- documentação de código implantado;
- contratos de persistência;
- manuais de QA;
- histórico de commits;
- logs extensos;
- checkpoint de sessão;
- conhecimento que uma IA futura precise para entender o produto.

Esses dados pertencem às personas e ao MAPA.

## Regra de migração de conhecimento

Se durante uma execução surgir uma nova regra permanente:

```text
1. pausar a decisão na issue
2. Orquestrador chama a persona dona
3. atualizar a persona
4. atualizar MAPA-DO-PROJETO.md se paths/acesso mudaram
5. voltar para a issue somente com a tarefa executável
```

A issue nunca vira repositório de decisão.

## Coordenação e dependências

A ordem de trabalho pertence ao Orquestrador.

Ele deve controlar:

```text
qual persona atua
→ qual definição precisa fechar
→ qual handoff vem depois
→ quando uma tarefa concreta pode virar issue
→ qual issue pode entrar em execução
```

Dependências conceituais não devem ser empurradas para o corpo das issues.

Issues podem coexistir abertas como tarefas futuras, mas só entram em execução quando o Orquestrador liberar.

## Handoff

Fluxo padrão:

```text
Pedido
→ Orquestrador
→ persona dona
→ personas auxiliares necessárias
→ Desenvolvimento quando aplicável
→ Direção Visual/Qualidade/Experience conforme gate
→ líder quando validação manual for necessária
→ Orquestrador
```

Nem todo trabalho exige todas as personas.

## Fluxo visual

Toda criação ou edição de arte passa obrigatoriamente pela Direção Visual **antes da geração**.

```text
Produto/Regra
→ Direção Visual identifica o tipo de arte
→ Direção Visual aplica as regras específicas daquele tipo
→ prompt é montado
→ líder revisa e aprova o prompt
→ geração/edição da arte
→ Direção Visual valida o asset
→ Desenvolvimento, quando aplicável
→ Direção Visual valida fidelidade
→ Qualidade
→ Experience Validator
→ líder
```

A etapa `prompt → aprovação do líder` não pode ser pulada, mesmo quando a arte parecer simples ou já existir uma referência anterior.

A ordem pode ser reduzida quando a mudança não atravessa todos esses domínios, mas **consulta à Direção Visual e aprovação prévia do prompt permanecem obrigatórias sempre que houver geração ou edição de imagem**.

## Gate de fidelidade

Quando aplicável:

```text
FIDELIDADE_VISUAL >= 75%
```

é o gate mínimo antes da validação técnica/experiência.

A aprovação final visual continua sendo do líder.

## Milestones

Milestone é agrupamento de planejamento, não fonte de verdade nem ordem automática.

Não associar issue a milestone sem necessidade explícita de planejamento.

## Fila operacional atual

Contrato estrutural executável:

```text
22 Regiões
×
5 Ilhas por Região
=
110 Ilhas
sem sub-regiões
```

A implementação estrutural usa índice global de Ilha, `world-structure.js`, save schema v9 e scheduler contínuo.

Após a consolidação da migração estrutural, a sequência recomendada é:

```text
1. validar/fechar a migração 22×5
2. manter a distribuição canônica das 110 recompensas sincronizada entre Game Design, catálogo e Direção Visual
3. continuar a expansão visual das Regiões usando a recompensa canônica para definir o badge de cada Ilha
4. remover assets históricos não referenciados somente quando a limpeza física for segura
```

Nenhuma nova tarefa pode recriar sub-regiões, segunda página de Região ou dependência funcional 11×10.

Para expansões futuras:

```text
Produto + Game Design fecham regras nas personas
→ Orquestrador transforma somente trabalho executável em issue
→ Desenvolvimento
→ gates aplicáveis
```

## Estado após reset de issues

Em 20/09/2026 foi determinado:

```text
issues antigas
→ deixam de ser documentação
→ conhecimento valioso migra para personas
→ MAPA passa a indexar as fontes
→ fluxo de issues será reconstruído de forma enxuta
```

Após a limpeza, não existe issue antiga que deva ser usada como fonte de requisitos.

O próximo fluxo será criado a partir do estado real do produto e das dependências vigentes, usando as personas como conhecimento canônico.

## Regra de fechamento

Antes de encerrar uma issue:

- implementação/artefato esperado existe;
- validações necessárias passaram;
- qualquer conhecimento permanente novo foi migrado para a persona responsável;
- MAPA foi atualizado se houve mudança física;
- a issue continua curta.

## Regra absoluta

```text
PERSONA      = conhecimento
MAPA         = acesso/localização
ISSUE        = implementação/correção
ORQUESTRADOR = coordenação, dependências e ordem
```
