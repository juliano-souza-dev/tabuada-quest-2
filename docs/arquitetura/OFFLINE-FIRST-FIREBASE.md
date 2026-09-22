# Persistência offline-first + Firebase

## Objetivo

O jogo deve funcionar integralmente sem Internet. A rede é usada para sincronizar e restaurar dados.

## Fluxo Android

```text
WebView / gameplay
→ TQ.persistence.localStorage
→ TabuadaQuestNative
→ SQLite
→ fila sync
→ Firebase Auth + Firestore
```

No navegador, `TQ.persistence.localStorage` continua usando `localStorage` como fallback.

No APK, o bridge nativo tem prioridade. O `localStorage` fica como sombra de compatibilidade e migração.

## Banco local

Arquivo:

```text
tabuada_quest.db
```

Tabelas:

```text
player_state
sync_events
sync_meta
```

`player_state` mantém o snapshot operacional atual.

`sync_events` mantém operações pendentes até confirmação do backend.

`sync_meta` guarda metadados locais como `device_id`.

## Sincronização

O gameplay nunca aguarda Firebase.

Sync é disparado de forma best-effort:

- após saves, com debounce;
- quando a conexão reaparece;
- ao retornar para o app;
- manualmente via bridge.

Falha de rede ou ausência de autenticação não bloqueia o jogo.

## Firebase

SDKs Android:

```text
Firebase Authentication
Cloud Firestore
```

Configuração é externa ao repositório.

Gradle properties esperadas:

```text
TQ_FIREBASE_API_KEY
TQ_FIREBASE_APP_ID
TQ_FIREBASE_PROJECT_ID
```

Exemplo local:

```properties
TQ_FIREBASE_API_KEY=...
TQ_FIREBASE_APP_ID=...
TQ_FIREBASE_PROJECT_ID=...
```

Sem essas propriedades, o APK continua compilando e funcionando offline; apenas o sync remoto fica desativado.

## Estrutura Firestore

```text
players/{uid}
├── state/current
└── events/{eventId}
```

Cada evento usa ID único, permitindo reenvio idempotente.

## Autenticação

O bridge já expõe:

```text
signInWithEmailPassword(email, password)
signOut()
getAuthUid()
```

A UI de conta/responsável é uma etapa separada de Produto.

## Restauração

`restoreFromServer()` baixa `players/{uid}/state/current`, grava no SQLite e recarrega o WebView.

A restauração exige usuário autenticado e Internet.

## Segurança

As regras em `firebase/firestore.rules` limitam cada usuário ao próprio subtree `players/{uid}`.

Nenhuma credencial real deve entrar no Git.

## Arquivos

```text
app/src/main/java/com/tabuadaquest/app/NativeSaveDatabase.java
app/src/main/java/com/tabuadaquest/app/FirebaseSyncManager.java
app/src/main/java/com/tabuadaquest/app/NativeDataBridge.java
app/src/main/java/com/tabuadaquest/app/MainActivity.java
web/js/persistence/local-storage.js
firebase/firestore.rules
```
