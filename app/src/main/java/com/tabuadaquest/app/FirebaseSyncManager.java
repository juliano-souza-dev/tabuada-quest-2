package com.tabuadaquest.app;

import android.content.Context;

import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.WriteBatch;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class FirebaseSyncManager {

    interface Callback {
        void onComplete(boolean ok, String code);
    }

    interface RestoreCallback {
        void onComplete(boolean ok, String code, String payload);
    }

    private final NativeSaveDatabase database;
    private final FirebaseApp app;
    private final FirebaseAuth auth;
    private final FirebaseFirestore firestore;

    FirebaseSyncManager(Context context, NativeSaveDatabase database) {
        this.database = database;

        if (!isConfigurationAvailable()) {
            this.app = null;
            this.auth = null;
            this.firestore = null;
            return;
        }

        FirebaseApp existing = null;
        for (FirebaseApp candidate : FirebaseApp.getApps(context)) {
            if ("[DEFAULT]".equals(candidate.getName())) {
                existing = candidate;
                break;
            }
        }

        if (existing == null) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                .setApiKey(BuildConfig.FIREBASE_API_KEY)
                .setApplicationId(BuildConfig.FIREBASE_APP_ID)
                .setProjectId(BuildConfig.FIREBASE_PROJECT_ID)
                .build();
            existing = FirebaseApp.initializeApp(context, options);
        }

        this.app = existing;
        this.auth = existing == null ? null : FirebaseAuth.getInstance(existing);
        this.firestore = existing == null ? null : FirebaseFirestore.getInstance(existing);
    }

    static boolean isConfigurationAvailable() {
        return !BuildConfig.FIREBASE_API_KEY.isBlank()
            && !BuildConfig.FIREBASE_APP_ID.isBlank()
            && !BuildConfig.FIREBASE_PROJECT_ID.isBlank();
    }

    boolean isConfigured() {
        return app != null && auth != null && firestore != null;
    }

    String getCurrentUid() {
        return auth != null && auth.getCurrentUser() != null
            ? auth.getCurrentUser().getUid()
            : "";
    }

    void signInWithEmailPassword(String email, String password, Callback callback) {
        if (!isConfigured()) {
            callback.onComplete(false, "firebase_not_configured");
            return;
        }

        auth.signInWithEmailAndPassword(email, password)
            .addOnSuccessListener(result -> callback.onComplete(true, "signed_in"))
            .addOnFailureListener(error -> callback.onComplete(false, "sign_in_failed"));
    }

    void signOut() {
        if (auth != null) auth.signOut();
    }

    void syncNow(Callback callback) {
        if (!isConfigured()) {
            callback.onComplete(false, "firebase_not_configured");
            return;
        }

        String uid = getCurrentUid();
        if (uid.isEmpty()) {
            callback.onComplete(false, "auth_required");
            return;
        }

        List<NativeSaveDatabase.SyncEvent> pending = database.getPendingEvents(100);
        String statePayload = database.getState();
        long stateUpdatedAt = database.getStateUpdatedAt();

        WriteBatch batch = firestore.batch();
        DocumentReference userRoot = firestore.collection("players").document(uid);

        if (!statePayload.isEmpty()) {
            Map<String, Object> snapshot = new HashMap<>();
            snapshot.put("payload", statePayload);
            snapshot.put("deviceUpdatedAt", stateUpdatedAt);
            snapshot.put("serverUpdatedAt", FieldValue.serverTimestamp());
            batch.set(userRoot.collection("state").document("current"), snapshot);
        }

        for (NativeSaveDatabase.SyncEvent event : pending) {
            Map<String, Object> eventDocument = new HashMap<>();
            eventDocument.put("type", event.type);
            eventDocument.put("payload", event.payload);
            eventDocument.put("createdAt", event.createdAt);
            eventDocument.put("deviceId", database.getMeta("device_id"));
            eventDocument.put("receivedAt", FieldValue.serverTimestamp());

            batch.set(
                userRoot.collection("events").document(event.id),
                eventDocument
            );
        }

        batch.commit()
            .addOnSuccessListener(unused -> {
                if (!pending.isEmpty()) {
                    database.markEventsSynced(pending, System.currentTimeMillis());
                }
                callback.onComplete(true, "synced");
            })
            .addOnFailureListener(error -> callback.onComplete(false, "sync_failed"));
    }

    void restoreLatestState(RestoreCallback callback) {
        if (!isConfigured()) {
            callback.onComplete(false, "firebase_not_configured", "");
            return;
        }

        String uid = getCurrentUid();
        if (uid.isEmpty()) {
            callback.onComplete(false, "auth_required", "");
            return;
        }

        firestore.collection("players")
            .document(uid)
            .collection("state")
            .document("current")
            .get()
            .addOnSuccessListener(snapshot -> {
                String payload = snapshot.getString("payload");
                if (payload == null || payload.isEmpty()) {
                    callback.onComplete(false, "remote_state_empty", "");
                    return;
                }
                callback.onComplete(true, "restored", payload);
            })
            .addOnFailureListener(error -> callback.onComplete(false, "restore_failed", ""));
    }
}
