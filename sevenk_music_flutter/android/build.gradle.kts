allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}
subprojects {
    project.evaluationDependsOn(":app")
}

subprojects {
    if (name == "on_audio_query_android") {
        plugins.withId("com.android.library") {
            val androidExt = extensions.findByName("android")
            if (androidExt != null) {
                try {
                    val setNamespace = androidExt.javaClass.getMethod("setNamespace", String::class.java)
                    setNamespace.invoke(androidExt, "com.lucasjosino.on_audio_query")
                } catch (_: Exception) {
                    // Ignore if plugin/AGP exposes namespace differently.
                }
            }

            tasks.configureEach {
                if (name.contains("kotlin", ignoreCase = true)) {
                    try {
                        val kotlinOptions = javaClass.getMethod("getKotlinOptions").invoke(this)
                        kotlinOptions.javaClass
                            .getMethod("setJvmTarget", String::class.java)
                            .invoke(kotlinOptions, "1.8")
                    } catch (_: Exception) {
                        // Ignore if task does not expose kotlinOptions.
                    }
                }
            }
        }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
