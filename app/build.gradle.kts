plugins {
    id("com.android.application")
}

android {
    namespace = "com.tabuadaquest.app"
    compileSdk = 37

    defaultConfig {
        applicationId = "com.tabuadaquest.app"
        minSdk = 24
        targetSdk = 37
        versionCode = 1
        versionName = "2.0.0-dev"
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
