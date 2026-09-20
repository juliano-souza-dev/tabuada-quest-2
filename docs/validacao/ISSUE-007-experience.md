# Issue #7 — Experience Validator do vertical slice textual

## Escopo

Validação de **clareza funcional** da interface textual temporária.

A arte final não faz parte deste gate. Os assets e hitboxes serão produzidos em etapa visual posterior mantendo os contratos de ação atuais.

## Fluxo avaliado

```text
Home
→ Regiões
→ lista de Ilhas
→ JOGAR / CONTINUAR
→ conta
→ quatro respostas
→ feedback
→ resultado
→ Ilhas ou Regiões
```

## Critérios infantis

- ação principal visível;
- uma decisão principal por tela;
- pergunta matemática isolada e grande;
- quatro respostas em botões amplos;
- feedback imediato de acerto/erro;
- resposta correta informada após erro;
- botão Continuar explícito;
- resultado curto;
- retorno às Ilhas e Regiões explícito;
- controles temporários possuem altura mínima de 48 px;
- nenhuma informação técnica do scheduler é exibida à criança.

## Observação

O texto `Tentativas extras` é usado no resultado em vez de `recoveryAttempt`, evitando terminologia técnica.

## Resultado

```text
EXPERIENCE VALIDATOR = APROVADO PARA O SLICE TEXTUAL
ARTE FINAL = FORA DESTE GATE
```
