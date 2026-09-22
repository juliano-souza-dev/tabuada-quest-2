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


## Identidade Android oficial

```text
applicationId: tabuadaquest.juliano.filhas
namespace Java: com.tabuadaquest.app
```

O `applicationId` é a identidade pública/instalada do APK e deve coincidir com o app Android registrado no Firebase.

O `namespace` Java permanece independente para evitar mover classes sem necessidade.

## Projeto Firebase conectado

```text
project_id: tabuadaquest2
project_number: 489461827440
android_app_id: 1:489461827440:android:5c4feb6409dac2ae5871b5
package_name: tabuadaquest.juliano.filhas
```

A configuração padrão fica no build Android e pode ser sobrescrita por Gradle properties:

```text
TQ_FIREBASE_API_KEY
TQ_FIREBASE_APP_ID
TQ_FIREBASE_PROJECT_ID
```

O arquivo `app/google-services.json` continua ignorado pelo Git porque a inicialização atual usa `FirebaseOptions` a partir de `BuildConfig`.


## Login com Google

O APK expõe o fluxo Google Sign-In pela bridge nativa:

```text
TabuadaQuestNative.signInWithGoogle()
```

Fluxo:

```text
WebView
→ Credential Manager
→ Google ID token
→ FirebaseAuth / GoogleAuthProvider
→ UID Firebase
→ syncNow() best-effort
```

O OAuth Web Client ID usado pelo Credential Manager fica em:

```text
BuildConfig.GOOGLE_WEB_CLIENT_ID
```

e pode ser sobrescrito via Gradle property:

```text
TQ_GOOGLE_WEB_CLIENT_ID
```

O login emite:

```text
tq:native-auth
```

e, quando bem-sucedido, dispara sincronização e emite:

```text
tq:native-sync
```

O primeiro request filtra contas previamente autorizadas. Quando não há credencial elegível, o fluxo repete a solicitação permitindo todas as contas Google disponíveis no dispositivo.

O gameplay e o save local não dependem do login Google e continuam operando offline.

### Assinatura Android

Google Sign-In valida o package e o certificado do APK. Portanto, builds distribuídos precisam usar o mesmo certificado cujo SHA-1 foi cadastrado no Firebase para:

```text
tabuadaquest.juliano.filhas
```
