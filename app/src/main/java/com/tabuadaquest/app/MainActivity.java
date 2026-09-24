package com.tabuadaquest.app;

import android.app.Activity;
import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.net.NetworkRequest;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public final class MainActivity extends Activity {

    private static final String START_URL = "file:///android_asset/index.html";
    private static final String BRIDGE_NAME = "TabuadaQuestNative";

    private WebView webView;
    private NativeSaveDatabase nativeDatabase;
    private FirebaseSyncManager syncManager;
    private ConnectivityManager connectivityManager;
    private ConnectivityManager.NetworkCallback networkCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        enableWebViewDebuggingForDebugBuilds();

        nativeDatabase = new NativeSaveDatabase(this);
        syncManager = new FirebaseSyncManager(this, nativeDatabase);

        configureEdgeToEdge();
        webView = new WebView(this);
        configureWebView(webView);
        webView.addJavascriptInterface(
            new NativeDataBridge(this, webView, nativeDatabase, syncManager),
            BRIDGE_NAME
        );

        setContentView(webView);
        hideSystemUi();
        webView.loadUrl(START_URL);

        registerConnectivitySync();
    }

    private void configureWebView(WebView view) {
        WebSettings settings = view.getSettings();

        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        view.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView webView, String url) {
                injectSafeAreaIntoPage();
            }
        });
        view.setBackgroundColor(0xFF10172A);
        view.setOverScrollMode(View.OVER_SCROLL_NEVER);
    }

    private void configureEdgeToEdge() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        } else {
            getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            );
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode =
                    WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }
    }

    private void injectSafeAreaIntoPage() {
        if (webView == null) return;

        String script = String.format(
                Locale.US,
                "(function(){"
                        + "var r=document.documentElement;"
                        + "if(!r)return;"
                        + "r.classList.add('tq-native-runtime');"
                        + "r.style.setProperty('--tq-native-safe-top','0px');"
                        + "r.style.setProperty('--tq-native-safe-right','0px');"
                        + "r.style.setProperty('--tq-native-safe-bottom','0px');"
                        + "r.style.setProperty('--tq-native-safe-left','0px');"
                        + "window.dispatchEvent(new Event('resize'));"
                        + "})();"
        );

        webView.post(() -> {
            if (webView != null) {
                webView.evaluateJavascript(script, null);
            }
        });
    }

    private void registerConnectivitySync() {
        connectivityManager =
            (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);

        if (connectivityManager == null || syncManager == null) return;

        NetworkRequest request = new NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build();

        networkCallback = new ConnectivityManager.NetworkCallback() {
            @Override
            public void onAvailable(Network network) {
                syncManager.syncNow((ok, code) -> {
                    // Sync é best-effort. Gameplay nunca depende deste callback.
                });
            }
        };

        connectivityManager.registerNetworkCallback(request, networkCallback);
    }

    private void enableWebViewDebuggingForDebugBuilds() {
        boolean debuggable =
                (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;

        if (debuggable) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
    }

    private void hideSystemUi() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowInsetsController controller = getWindow().getInsetsController();

            if (controller != null) {
                controller.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                controller.setSystemBarsBehavior(
                        WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                );
            }
            return;
        }

        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        | View.SYSTEM_UI_FLAG_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
    }

    @Override
    protected void onResume() {
        super.onResume();

        if (syncManager != null) {
            syncManager.syncNow((ok, code) -> {
                // Best-effort ao retornar para o app.
            });
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);

        if (hasFocus) {
            hideSystemUi();
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (connectivityManager != null && networkCallback != null) {
            try {
                connectivityManager.unregisterNetworkCallback(networkCallback);
            } catch (RuntimeException ignored) {
                // Activity já pode ter perdido o callback.
            }
        }

        if (webView != null) {
            webView.removeJavascriptInterface(BRIDGE_NAME);
            webView.stopLoading();
            webView.destroy();
            webView = null;
        }

        if (nativeDatabase != null) {
            nativeDatabase.close();
            nativeDatabase = null;
        }

        super.onDestroy();
    }
}
