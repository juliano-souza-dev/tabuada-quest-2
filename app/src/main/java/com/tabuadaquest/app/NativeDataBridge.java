package com.tabuadaquest.app;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.os.Handler;
import android.os.Looper;
import android.webkit.WebView;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.UUID;

final class NativeDataBridge {

    private final Activity activity;
    private final WebView webView;
    private final NativeSaveDatabase database;
    private final FirebaseSyncManager syncManager;
    private final Handler syncHandler = new Handler(Looper.getMainLooper());
    private final Runnable debouncedSync;

    NativeDataBridge(
        Activity activity,
        WebView webView,
        NativeSaveDatabase database,
        FirebaseSyncManager syncManager
    ) {
        this.activity = activity;
        this.webView = webView;
        this.database = database;
        this.syncManager = syncManager;
        this.debouncedSync = () ->
            this.syncManager.syncNow((ok, code) ->
                emit("tq:native-sync", ok, code)
            );

        if (database.getMeta("device_id").isEmpty()) {
            database.putMeta("device_id", UUID.randomUUID().toString());
        }
    }

    @JavascriptInterface
    public String getState() {
        return database.getState();
    }

    @JavascriptInterface
    public boolean saveState(String payload) {
        if (payload == null || payload.isEmpty()) return false;

        long now = System.currentTimeMillis();
        database.saveState(payload, now);
        database.enqueueEvent(
            UUID.randomUUID().toString(),
            "state_snapshot",
            payload,
            now
        );

        syncHandler.removeCallbacks(debouncedSync);
        syncHandler.postDelayed(debouncedSync, 2000L);
        return true;
    }

    @JavascriptInterface
    public int getPendingSyncCount() {
        return database.getPendingEventCount();
    }

    @JavascriptInterface
    public String getDeviceId() {
        return database.getMeta("device_id");
    }

    @JavascriptInterface
    public boolean isFirebaseConfigured() {
        return syncManager.isConfigured();
    }

    @JavascriptInterface
    public String getAuthUid() {
        return syncManager.getCurrentUid();
    }

    @JavascriptInterface
    public void signInWithEmailPassword(String email, String password) {
        syncManager.signInWithEmailPassword(email, password, (ok, code) ->
            emit("tq:native-auth", ok, code)
        );
    }

    @JavascriptInterface
    public void signInWithGoogle() {
        activity.runOnUiThread(() ->
            syncManager.signInWithGoogle(activity, (ok, code) ->
                emit("tq:native-auth", ok, code)
            )
        );
    }

    @JavascriptInterface
    public void signOut() {
        syncManager.signOut();
        emit("tq:native-auth", true, "signed_out");
    }

    @JavascriptInterface
    public void syncNow() {
        syncManager.syncNow((ok, code) ->
            emit("tq:native-sync", ok, code)
        );
    }

    @JavascriptInterface
    public void restoreFromServer() {
        syncManager.restoreLatestState((ok, code, payload) -> {
            if (ok) {
                database.saveState(payload);
                activity.runOnUiThread(webView::reload);
                return;
            }
            emit("tq:native-restore", false, code);
        });
    }

    @JavascriptInterface
    public String getStatus() {
        JSONObject result = new JSONObject();
        try {
            result.put("native", true);
            result.put("firebaseConfigured", syncManager.isConfigured());
            result.put("authenticated", !syncManager.getCurrentUid().isEmpty());
            result.put("uid", syncManager.getCurrentUid());
            result.put("deviceId", database.getMeta("device_id"));
            result.put("pendingSync", database.getPendingEventCount());
        } catch (JSONException ignored) {
            return "{\"native\":true}";
        }
        return result.toString();
    }

    private void emit(String eventName, boolean ok, String code) {
        JSONObject detail = new JSONObject();
        try {
            detail.put("ok", ok);
            detail.put("code", code);
        } catch (JSONException ignored) {
            return;
        }

        String script =
            "window.dispatchEvent(new CustomEvent(" +
            JSONObject.quote(eventName) +
            ",{detail:" + detail + "}));";

        activity.runOnUiThread(() -> webView.evaluateJavascript(script, null));
    }
}
