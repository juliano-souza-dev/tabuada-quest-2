# Plano de assets — Home V1

**Issue:** #4  
**Status:** direção visual em preparação  
**Data:** 2026-09-19

## Regra

A composição da Home já foi definida em:

```text
docs/arte/ISSUE-004-DIRECAO-HOME-V1.md
```

Este plano aplica:

```text
docs/arte/ESTRATEGIA-ASSETS-V1.md
```

## Matriz de decisão

| Slot | Função | Decisão | Fonte/Base | Motivo | Estado |
|---|---|---|---|---|---|
| background-home | cenário vertical principal | **CRIAR NOVO** | direção pirata V1 | o banner atual é horizontal e não foi concebido como cenário vertical com safe areas para HUD, personagem e CTA | NECESSÁRIO |
| avatar-home | personagem central | **ADAPTAR** | avatar canônico selecionado | identidade deve ser preservada, mas pose/enquadramento/integração com a cena precisam ser específicos da Home | NECESSÁRIO |
| brand-home | marca Tabuada Quest | **CRIAR COMO UI/CSS** | tipografia + elementos náuticos leves | evitar texto embutido em imagem e manter responsividade | DIREÇÃO DEFINIDA |
| cta-play | botão JOGAR | **REUTILIZAR SOB VALIDAÇÃO** | `home-pirata-botao-aventura.webp` | o asset já tem função compatível, mas precisa ser testado na composição real antes de aprovação final | EM REVISÃO |
| icon-regions | atalho Regiões | **REUTILIZAR** | `icone-mapa-bussola.webp` | semântica compatível com navegação | APROVADO |
| icon-chests | atalho Baús | **REUTILIZAR** | `icone-bau-tesouro.webp` | semântica direta | APROVADO |
| icon-companions | atalho Companheiros/PETs | **CRIAR NOVO** | direção pirata V1 | não existe ícone canônico genérico aprovado para o sistema de 30 PETs | NECESSÁRIO |
| map-progress | faixa 0/4 | **CRIAR COMO UI/CSS + ÍCONE REUTILIZADO** | bússola/mapa canônico | contador e fragmentos precisam ser dinâmicos, sem texto dentro da arte | DIREÇÃO DEFINIDA |
| hud-player | avatar/nome/Região/Ilha | **CRIAR COMO UI/CSS** | avatar canônico + tokens | precisa responder a dados e tamanhos diferentes | DIREÇÃO DEFINIDA |
| hud-diamonds | moeda especial | **CRIAR COMO UI/CSS** | símbolo simples + tokens | contador é dinâmico; não precisa de asset ilustrado dedicado nesta etapa | DIREÇÃO DEFINIDA |
| decorative-foreground | integração personagem/cenário | **CRIAR SE NECESSÁRIO** | novo cenário | só entra se melhorar profundidade sem poluir a leitura | OPCIONAL |

## Assets existentes que NÃO devem controlar a composição

### `home-pirata-banner-aventura.webp`

Estado:

```text
NÃO USAR COMO FUNDO DEFINITIVO DA HOME
```

Pode permanecer no catálogo como material válido para outros usos, mas não será forçado como cenário vertical.

### `home-pirata-botao-aventura.webp`

Estado:

```text
CANDIDATO A REUSO
```

Só será mantido se:

- funcionar na largura real da Home;
- não exigir deformação;
- integrar-se ao novo cenário;
- não competir com HUD/atalhos;
- manter leitura excelente de JOGAR.

Se falhar, o slot muda para `CRIAR NOVO`.

## Novo cenário obrigatório

Brief inicial:

- formato vertical;
- alvo: 1080 × 1920;
- fundo opaco;
- aventura pirata mágica infantil;
- mar turquesa e baía/ilha/porto;
- amanhecer;
- profundidade em poucos planos;
- faixa superior limpa para HUD;
- zona média preparada para personagem;
- zona inferior central limpa para CTA;
- faixa inferior capaz de receber mapa/atalhos;
- sem texto;
- sem marca-d'água;
- sem personagens reconhecíveis;
- sem armas realistas;
- sem caveiras assustadoras;
- baixa densidade de microdetalhes;
- orçamento final até 450 KB em WebP.

## Personagem da Home

A identidade vem obrigatoriamente do avatar-base escolhido.

A Home não deve receber um personagem "parecido".

A adaptação precisa:

- usar a base canônica;
- preservar rosto, cabelo, pele, proporções e idade visual;
- criar pose adequada à aventura;
- ajustar enquadramento para a composição;
- integrar luz/sombra ao cenário;
- permanecer legível em tela pequena.

Antes de promover:

```text
base canônica ↔ variante Home
```

comparação lado a lado obrigatória.

## Ícone de Companheiros

Criar um ícone genérico do sistema de companheiros/PETs.

Não usar um PET específico como representação permanente do sistema, para evitar que um único personagem pareça ser a coleção inteira.

Direção:

- amigável;
- mágica;
- marítima;
- silhueta clara;
- sem texto;
- 512 × 512;
- WebP com alpha;
- até 100 KB.

## Ordem de produção

```text
1. cenário vertical da Home
2. variante do avatar para a Home
3. ícone genérico de Companheiros
4. composição visual estática da Home
5. validação da Direção Visual
6. Experience Validator
7. Desenvolvimento
8. Preview
```

## Gate

Desenvolvimento não deve substituir esses três itens com placeholders finais:

```text
background-home
avatar-home
icon-companions
```

Enquanto estiverem como `NECESSÁRIO`, a camada visual da Issue #4 continua aberta.
