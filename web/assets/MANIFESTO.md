# Manifesto de assets canônicos

Este arquivo controla o conjunto visual aprovado para produção em `web/assets/`.

## Status

**Pacote canônico inicial da V1 integrado na Issue #3.**

Somente os arquivos listados abaixo podem ser tratados como assets de produção nesta etapa.

## Avatares-base canônicos

| Personagem | Caminho | Estado |
| --- | --- | --- |
| Luna | `web/assets/avatars/avatar-luna-visual-base.webp` | APROVADO |
| Maya | `web/assets/avatars/avatar-maya-visual-base.webp` | APROVADO |
| Sofia | `web/assets/avatars/avatar-sofia-visual-base.webp` | APROVADO |

Os três arquivos são versões WebP otimizadas para uso no jogo. A identidade visual foi preservada a partir dos avatares-base do pacote de referência.

Toda moda futura deve usar estes avatares como referência canônica e respeitar `agentes/03-direcao-visual.md`.

## UI pirata aprovada

| Asset | Caminho | Estado |
| --- | --- | --- |
| Fundo padrão inicial da Home | `web/assets/ui/home-pirata-fundo-principal.webp` | APROVADO PELO USUÁRIO |
| Banner de aventura | `web/assets/ui/home-pirata-banner-aventura.webp` | APROVADO |
| Base de botão de aventura | `web/assets/ui/home-pirata-botao-aventura.webp` | APROVADO |
| Ícone de mapa/bússola | `web/assets/ui/icone-mapa-bussola.webp` | APROVADO |
| Ícone de baú | `web/assets/ui/icone-bau-tesouro.webp` | APROVADO |
| Ícone de recompensa | `web/assets/ui/icone-recompensa-magica.webp` | APROVADO |

## Não promovidos

Os itens abaixo permanecem fora do pacote canônico nesta etapa:

- `icone-axolote-capitao.webp`: pertence a uma lista de PETs posteriormente substituída;
- assets com nomenclatura Portal/Mundo: a estrutura vigente é Região/Ilha;
- artes com referências reconhecíveis a franquias existentes;
- variações de avatar que alterem identidade, rosto, cabelo, proporção ou idade visual;
- moda/roupa não validada individualmente contra o avatar-base.

## Regra de promoção

Um novo arquivo só entra neste manifesto após:

1. validação da Direção Visual;
2. validação de formato, dimensão, peso e duplicidade por Qualidade;
3. promoção física para `web/assets/`;
4. atualização deste manifesto;
5. validação do preview quando o asset for visível.


## Fundos personalizáveis da Home

O fundo da Home é selecionável pelo jogador.

Fundo padrão inicial:

```text
id = pirate-main
web/assets/ui/home-pirata-fundo-principal.webp
```

A dimensão 1080 × 1918 foi aceita explicitamente pelo usuário como arte padrão.

Outros fundos só entram no seletor após Direção Visual + Qualidade + promoção física para `web/assets/`.


## Molduras de perfil

| Asset | Caminho | Estado |
|---|---|---|
| Moldura pirata tesouro | `web/assets/frames/profile-frame-pirate-treasure.webp` | APROVADA PARA CATÁLOGO INICIAL |

A moldura do perfil é um slot cosmético selecionável e não deve conter avatar, nome, nível, XP, moedas ou gemas embutidos.
