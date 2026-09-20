# DEC-005 — Jornada sequencial de 11 Regiões e Grande Baú Final

**Status:** Aprovado para o produto  
**Data:** 2026-09-19  
**Responsáveis:** Produto + Game Design e Aprendizagem + Direção Visual  
**Impacta:** campanha, navegação, scheduler, mapa de Regiões, recompensas e estado persistente

## Decisão

A campanha do Tabuada Quest 2.0 passa a possuir 11 Regiões com 10 Ilhas cada.

```text
TOTAL_REGIONS = 11
ISLANDS_PER_REGION = 10
TOTAL_ISLANDS = 110
```

A navegação é sequencial: a jornada deve transmitir a sensação de viajar progressivamente pelo mundo pirata.

## Regiões 1 a 10

São o corpo principal da viagem.

A próxima Região é liberada pelo avanço da Região anterior, respeitando eventuais gates de missão especial já definidos pelos mapas fragmentados.

## Região 11

É o arco final da campanha.

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

## Grande Baú Final

O Grande Baú Final é uma recompensa especial fora do sistema dos 30 baús.

```text
30 baús normais permanecem inalterados
Grande Baú Final ≠ baú 31
```

Seu conteúdo será definido posteriormente.

## Mapa Final x mapas especiais

São sistemas distintos.

```text
5 mapas especiais:
4 fragmentos cada
missões intermediárias

Mapa Final:
9 fragmentos
exclusivo da Região 11
desbloqueia a Ilha 10
```

## Impacto pedagógico

A criação da Região 11 invalida a distribuição numérica fechada na primeira versão da DEC-004.

A nova matriz precisa ser recalculada antes da implementação da Issue #6.

Permanecem obrigatórios:

- prática intercalada;
- cobertura completa das operações;
- plannedExposure separado de recoveryAttempt;
- recuperação após erro;
- invariantes automatizáveis.

## Impacto visual

A tela de Regiões deve comunicar uma viagem contínua.

Direção Visual deve prever:

- 11 destinos;
- rota progressiva;
- estados bloqueado/disponível/em progresso/concluído;
- Região 11 visualmente especial;
- nove slots de fragmentos do Mapa Final;
- Ilha 10 inicialmente bloqueada;
- Grande Baú Final como recompensa culminante.

Todos os textos, números, progressos, cadeados, CTAs e estados são dados dinâmicos e não devem ser rasterizados na arte-base.
