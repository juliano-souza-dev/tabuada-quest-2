plugins {
    id("com.android.application")
}

val firebaseApiKey = providers.gradleProperty("TQ_FIREBASE_API_KEY").orElse("").get()
val firebaseAppId = providers.gradleProperty("TQ_FIREBASE_APP_ID").orElse("").get()
val firebaseProjectId = providers.gradleProperty("TQ_FIREBASE_PROJECT_ID").orElse("").get()

fun quotedBuildConfig(value: String): String =
    "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\""

android {
    namespace = "com.tabuadaquest.app"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.tabuadaquest.app"
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
