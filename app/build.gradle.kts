plugins {
    id("com.android.application")
}

val firebaseApiKey = providers.gradleProperty("TQ_FIREBASE_API_KEY")
    .orElse("AIzaSyA_fhXyVenMAtjyuva4PsxbRezkV2Z_oKo")
    .get()
val firebaseAppId = providers.gradleProperty("TQ_FIREBASE_APP_ID")
    .orElse("1:489461827440:android:5c4feb6409dac2ae5871b5")
    .get()
val firebaseProjectId = providers.gradleProperty("TQ_FIREBASE_PROJECT_ID")
    .orElse("tabuadaquest2")
    .get()
val googleWebClientId = providers.gradleProperty("TQ_GOOGLE_WEB_CLIENT_ID")
    .orElse("489461827440-rkapqc45m857of2fm4hb6tm10muhkg6c.apps.googleusercontent.com")
    .get()

fun quotedBuildConfig(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

val tqKeystorePath = providers.gradleProperty("TQ_ANDROID_KEYSTORE_PATH")
    .orElse(providers.environmentVariable("TQ_ANDROID_KEYSTORE_PATH"))
    .orElse("")
    .get()
val tqKeystorePassword = providers.gradleProperty("TQ_ANDROID_KEYSTORE_PASSWORD")
    .orElse(providers.environmentVariable("TQ_ANDROID_KEYSTORE_PASSWORD"))
    .orElse("")
    .get()
val tqKeyAlias = providers.gradleProperty("TQ_ANDROID_KEY_ALIAS")
    .orElse(providers.environmentVariable("TQ_ANDROID_KEY_ALIAS"))
    .orElse("")
    .get()
val tqKeyPassword = providers.gradleProperty("TQ_ANDROID_KEY_PASSWORD")
    .orElse(providers.environmentVariable("TQ_ANDROID_KEY_PASSWORD"))
    .orElse("")
    .get()

val hasTqSigning = listOf(
    tqKeystorePath,
    tqKeystorePassword,
    tqKeyAlias,
    tqKeyPassword
).all { it.isNotBlank() }

android {
    namespace = "com.tabuadaquest.app"
    compileSdk = 37

    defaultConfig {
        applicationId = "tabuadaquest.juliano.filhas"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "2.0.0-dev"

        buildConfigField("String", "FIREBASE_API_KEY", quotedBuildConfig(firebaseApiKey))
        buildConfigField("String", "FIREBASE_APP_ID", quotedBuildConfig(firebaseAppId))
        buildConfigField("String", "FIREBASE_PROJECT_ID", quotedBuildConfig(firebaseProjectId))
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", quotedBuildConfig(googleWebClientId))
    }

    signingConfigs {
        if (hasTqSigning) {
            create("tq") {
                storeFile = file(tqKeystorePath)
                storePassword = tqKeystorePassword
                keyAlias = tqKeyAlias
                keyPassword = tqKeyPassword
            }
        }
    }

    buildFeatures {
        buildConfig = true
    }

    sourceSets {
        getByName("main") {
            // A mesma fonte web usada no navegador é empacotada no APK.
            assets.srcDirs("../web")
        }
    }

    buildTypes {
        debug {
            if (hasTqSigning) {
                signingConfig = signingConfigs.getByName("tq")
            }
        }

        release {
            if (hasTqSigning) {
                signingConfig = signingConfigs.getByName("tq")
            }
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:34.19.0"))
    implementation("com.google.firebase:firebase-auth")
    implementation("com.google.firebase:firebase-firestore")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
}
