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

fun quotedBuildConfig(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

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
        release {
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
}
