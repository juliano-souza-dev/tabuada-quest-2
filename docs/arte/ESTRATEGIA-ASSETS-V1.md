# Estratégia de criação e reuso de assets — Tabuada Quest 2.0

**Status:** regra oficial da V1  
**Data:** 2026-09-19  
**Responsável:** Direção Visual  
**Aplicação inicial:** Issue #4 / Home V1

## Problema que esta regra resolve

Um asset existente não deve determinar a composição da tela.

A ordem correta é:

```text
experiência desejada
  ↓
composição da tela
  ↓
necessidades visuais
  ↓
inventário de assets
  ↓
REUTILIZAR / ADAPTAR / CRIAR NOVO
  ↓
validação visual
  ↓
implementação
```

É proibido desenhar uma tela ruim apenas para encaixar os assets disponíveis.

## Classificação obrigatória

Todo asset usado em uma tela deve receber uma destas decisões:

### REUTILIZAR

Usar o arquivo existente sem alterar sua identidade visual.

Só é permitido quando:

- o significado do asset continua correto;
- o tema continua correto;
- a resolução e proporção atendem à tela;
- o enquadramento funciona na composição;
- não exige deformação;
- não exige crop que destrua o foco;
- não cria aparência de material reaproveitado fora de contexto;
- o asset já está aprovado no manifesto canônico.

### ADAPTAR

Criar uma derivação visual de um asset canônico.

Usar quando:

- a identidade principal deve permanecer;
- roupa/acessório/estado visual precisa mudar;
- enquadramento precisa ser refeito;
- fundo/transparência precisa ser adequado;
- a composição exige uma variante específica.

A adaptação nunca substitui silenciosamente o original.

O original continua sendo a base canônica.

### CRIAR NOVO

Gerar/desenhar um novo asset quando o existente não atende à função.

É obrigatório criar novo quando:

- o asset atual foi feito para outro papel;
- a orientação/proporção impede boa composição;
- o foco visual está no lugar errado;
- o cenário não oferece áreas seguras para HUD/CTA;
- seria necessário esticar, repetir ou esconder grande parte da arte;
- o estilo diverge da direção vigente;
- a arte carrega nomenclatura/tema legado;
- a composição só funciona com excesso de CSS compensatório;
- o resultado parece montagem de peças desconectadas.

## Regra especial dos avatares

Os arquivos:

```text
avatar-luna-visual-base.webp
avatar-maya-visual-base.webp
avatar-sofia-visual-base.webp
```

são referências canônicas de identidade.

### Sempre preservar

- rosto;
- olhos;
- nariz;
- boca;
- tom de pele;
- cabelo;
- volume/comprimento do cabelo;
- proporções;
- idade visual;
- identidade da personagem.

### Pode variar quando explicitamente pedido

- roupa;
- acessórios;
- pose;
- enquadramento;
- iluminação compatível com a cena.

Toda variação deve ser comparada lado a lado com a base antes da aprovação.

## Cenários e fundos

Cenários devem ser criados **para a tela**, e não usados apenas por disponibilidade.

Todo briefing de cenário deve informar:

- orientação;
- resolução-alvo;
- região segura de HUD;
- região segura de CTA;
- posição esperada do personagem;
- profundidade dos planos;
- foco visual;
- necessidade ou não de alpha;
- orçamento de arquivo.

### Home

Para a Home, o cenário deve prever:

- HUD livre na faixa superior;
- espaço de marca sem poluir leitura;
- personagem como elemento central;
- área limpa para CTA JOGAR;
- faixa inferior capaz de receber progresso/atalhos;
- leitura clara em viewport vertical.

Um banner horizontal não deve ser promovido automaticamente a fundo vertical.

## Ícones

Ícones aprovados podem ser reutilizados quando seu significado permanece válido.

Exemplos atuais:

- mapa/bússola → navegação, Regiões, mapa especial;
- baú → tesouros/baús;
- recompensa → recompensa/missão, se a semântica permanecer clara.

Não reutilizar o mesmo ícone para funções diferentes apenas para economizar arte.

## Botões e molduras

Assets de botão podem ser reutilizados somente quando:

- suportam o tamanho real do CTA;
- a proporção funciona sem deformação;
- o texto cabe com margem segura;
- a leitura continua boa em celular;
- o botão parece parte da cena.

Caso contrário, criar componente/asset novo.

## Texto dentro de arte

Não embutir texto permanente em imagens.

Textos da UI devem permanecer em HTML/CSS sempre que possível.

Isso permite:

- tradução;
- acessibilidade;
- ajuste de tamanho;
- correção sem regenerar imagem.

## Reuso do legado

Material da branch `apoio` é referência.

Não pode ser reutilizado em produção apenas porque existe.

Antes de promover:

1. Direção Visual valida;
2. tema e nomenclatura são conferidos;
3. função atual é comparada à função original;
4. budget é validado;
5. arquivo é promovido a `web/assets/`;
6. manifesto é atualizado.

## Franquias e elementos reconhecíveis

Não reutilizar assets que dependam de:

- personagens reconhecíveis de franquias;
- símbolos protegidos;
- identidade visual de terceiros;
- imitação direta de interface de outra obra.

A referência anterior orienta UX, não identidade.

## Plano de assets por tela

Antes de Desenvolvimento implementar uma tela, Direção Visual deve produzir uma tabela deste tipo:

| Slot | Função | Decisão | Fonte/Base | Formato | Estado |
|---|---|---|---|---|---|
| background-home | cenário vertical | CRIAR NOVO | direção pirata V1 | WebP opaco | pendente |
| avatar-home | personagem | ADAPTAR ou REUTILIZAR | avatar canônico | WebP alpha | pendente |
| cta-play | CTA principal | REUTILIZAR/CRIAR | asset aprovado ou novo | WebP/CSS | pendente |
| icon-map | atalho mapa | REUTILIZAR | icone-mapa-bussola | WebP alpha | aprovado |

Nenhum slot visual obrigatório pode ficar implícito.

## Estados de aprovação

Cada asset pode estar em:

```text
NECESSÁRIO
EM CRIAÇÃO
EM REVISÃO
APROVADO
REPROVADO
PROMOVIDO
```

Somente `APROVADO` + `PROMOVIDO` pode ser usado como asset final de produção.

## Contrato de otimização

Manter o contrato vigente da Direção Visual:

- WebP;
- poucos microdetalhes;
- sem ruído/grão fotográfico;
- sem texto embutido;
- alpha apenas quando necessário;
- respeitar budgets definidos no contrato da Direção Visual.

## Regra de implementação

Desenvolvimento não pode:

- escolher um asset alternativo por conveniência;
- converter banner em fundo sem aprovação;
- usar crop extremo para “fazer caber”;
- duplicar uma arte para preencher espaço;
- trocar asset reprovado por outro sem novo handoff;
- criar composição final antes do plano de assets.

Se um asset necessário estiver ausente:

```text
Desenvolvimento → bloqueia o slot → Direção Visual
```

Não improvisar.

## Regra para a Home V1

A Home reaberta na Issue #4 deve receber um plano de assets explícito antes da próxima implementação.

A versão atual publicada não serve como referência de composição.

Em especial:

- o banner horizontal atual não deve ser tratado automaticamente como fundo definitivo;
- o botão atual só permanece se a Direção Visual aprovar sua proporção e integração;
- o avatar-base deve preservar identidade, mas pode exigir pose/enquadramento específico;
- novos cenários ou elementos devem ser criados se forem necessários para alcançar a composição aprovada.

## Princípio final

> Reutilizar economiza produção quando preserva qualidade. Quando o reuso obriga a composição a se adaptar ao arquivo, ele deixa de ser economia e vira dívida visual.


## Regra de UI com dados dinâmicos

Para telas de jogo, uma imagem de composição não deve assumir responsabilidade por conteúdo mutável.

Antes de gerar o asset final, classificar cada elemento como:

```text
FIXO
DINÂMICO
```

Elementos dinâmicos ficam em HTML/CSS/JS, mesmo quando a composição de referência os mostra preenchidos.

### Tela de Regiões

A arte-base deve fornecer:

- cenário marítimo vertical;
- 11 destinos visuais;
- rota entre destinos;
- placas vazias por Região;
- áreas vazias para progresso/estado/CTA;
- header com slots vazios coerente com a Home;
- tratamento especial da Região 11;
- 9 slots visuais do mapa final;
- slot visual da Ilha 10;
- área visual do Grande Baú Final.

A camada dinâmica fornece:

- número/nome das Regiões;
- progresso `x/10`;
- estados e cadeados;
- CTAs;
- mensagens de desbloqueio;
- `0/9...9/9` fragmentos;
- estado da Ilha 10;
- estado do Grande Baú Final;
- HUD do jogador.

Uma composição aprovada pelo líder não pode ser redesenhada quando a solicitação for apenas um complemento pontual.
