import { AndroidProjectFile } from '../types';

export const ANDROID_PROJECT_FILES: AndroidProjectFile[] = [
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts (Project)',
    language: 'kotlin',
    category: 'build',
    description: 'Configuración raíz de Gradle con plugins de Android y Kotlin.',
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.3.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.23" apply false
}
`,
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'build',
    description: 'Repositorios Maven y configuración de inclusión de módulos.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "CuttedVideo"
include(":app")
`,
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    category: 'build',
    description: 'Configuración de memoria de la JVM y flags de compilación de AndroidX.',
    content: `# Gradle memory settings
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`,
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'properties',
    category: 'build',
    description: 'Catálogo de versiones de librerías y plugins para AndroidX Media3 y Compose.',
    content: `[versions]
agp = "8.3.2"
kotlin = "1.9.23"
coreKtx = "1.13.1"
composeBom = "2024.05.00"
media3 = "1.3.1"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-media3-transformer = { group = "androidx.media3", name = "media3-transformer", version.ref = "media3" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
`,
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'build',
    description: 'Dependencias de AndroidX Media3 Transformer 1.3.1, Jetpack Compose y Material 3.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.cuttedvideo.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.cuttedvideo.app"
        minSdk = 26 // Media3 Transformer soporta API 21+, recomendado API 26+
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
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
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Core Android & Lifecycle
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.activity:activity-compose:1.9.0")

    // Jetpack Compose & Material 3
    implementation(platform("androidx.compose:compose-bom:2024.05.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3:1.2.1")
    implementation("androidx.compose.material:material-icons-extended")

    // AndroidX Media3 Transformer & ExoPlayer (Motor principal de video y reproducción)
    implementation("androidx.media3:media3-transformer:1.3.1")
    implementation("androidx.media3:media3-effect:1.3.1")
    implementation("androidx.media3:media3-common:1.3.1")
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")

    // Coil para carga eficiente de miniaturas de video
    implementation("io.coil-kt:coil-compose:2.6.0")
    implementation("io.coil-kt:coil-video:2.6.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
`,
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'res',
    description: 'Manifiesto de la aplicación con soporte para Photo Picker y MediaStore.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- En Android 13+ (API 33), el Photo Picker no requiere permisos de almacenamiento -->
    <!-- Para Android 10-12 (API 29-32) se declara READ_EXTERNAL_STORAGE con maxSdkVersion -->
    <uses-permission
        android:name="android.permission.READ_EXTERNAL_STORAGE"
        android:maxSdkVersion="32" />

    <!-- Para escribir en MediaStore (Movies/VideoSplit) no se requiere permiso en Android 10+ -->
    <uses-permission
        android:name="android.permission.WRITE_EXTERNAL_STORAGE"
        android:maxSdkVersion="28" />

    <application
        android:name=".CuttedVideoApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:label="CuttedVideo"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@android:style/Theme.Material.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/CuttedVideoApp.kt',
    name: 'CuttedVideoApp.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Clase Application que inicializa Coil con decodificador de video para miniaturas.',
    content: `package com.cuttedvideo.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.decode.VideoFrameDecoder

class CuttedVideoApp : Application(), ImageLoaderFactory {
    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .components {
                // Habilita extracción de fotogramas de video nativamente con Coil
                add(VideoFrameDecoder.Factory())
            }
            .crossfade(true)
            .build()
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/data/model/VideoModels.kt',
    name: 'VideoModels.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Modelos de datos para metadatos de video, perfiles, velocidades y resoluciones.',
    content: `package com.cuttedvideo.app.data.model

import android.net.Uri

data class VideoMetadata(
    val uri: Uri,
    val name: String,
    val durationMs: Long,
    val width: Int,
    val height: Int,
    val sizeBytes: Long,
    val mimeType: String
) {
    val durationSeconds: Float
        get() = durationMs / 1000f

    val isPortrait: Boolean
        get() = height > width
}

enum class PlaybackSpeed(val multiplier: Float, val label: String) {
    SPEED_0_5X(0.5f, "0,5x"),
    SPEED_0_75X(0.75f, "0,75x"),
    SPEED_1_0X(1.0f, "1x"),
    SPEED_1_25X(1.25f, "1,25x"),
    SPEED_1_5X(1.5f, "1,5x"),
    SPEED_2_0X(2.0f, "2x")
}

enum class OutputResolution(val label: String, val maxDimension: Int) {
    ORIGINAL("Original", 0),
    RES_1080P("1080p (FHD)", 1920),
    RES_720P("720p (HD)", 1280),
    RES_480P("480p (SD)", 854),
    CUSTOM("Personalizada", 0)
}

data class SplitProfile(
    val id: String,
    val name: String,
    val platform: String,
    val maxDurationSeconds: Int,
    val isEditable: Boolean = true
)

data class SegmentPlan(
    val index: Int,
    val fileName: String,
    val startMs: Long,
    val endMs: Long,
    val outputDurationSeconds: Float
)

data class ExportedClip(
    val uri: Uri,
    val fileName: String,
    val index: Int
)

sealed interface ExportState {
    data object Idle : ExportState
    data class Exporting(
        val currentSegmentIndex: Int,
        val totalSegments: Int,
        val currentSegmentProgress: Float,
        val overallProgress: Float
    ) : ExportState
    data class Completed(
        val totalSavedClips: Int,
        val destinationFolder: String = "Movies/VideoSplit",
        val savedClips: List<ExportedClip> = emptyList()
    ) : ExportState
    data class Error(val message: String) : ExportState
    data object Cancelled : ExportState
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/domain/transformer/VideoTransformerEngine.kt',
    name: 'VideoTransformerEngine.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Motor de procesamiento nativo basado en AndroidX Media3 Transformer con control de velocidad, recorte y resolución.',
    content: `package com.cuttedvideo.app.domain.transformer

import android.content.Context
import android.net.Uri
import androidx.media3.common.Effect
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.audio.SonicAudioProcessor
import androidx.media3.effect.Presentation
import androidx.media3.effect.ScaleAndRotateTransformation
import androidx.media3.effect.SpeedChangeEffect
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.EditedMediaItemSequence
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.ProgressHolder
import androidx.media3.transformer.Transformer
import com.cuttedvideo.app.data.model.OutputResolution
import com.cuttedvideo.app.data.model.PlaybackSpeed
import com.cuttedvideo.app.data.model.SegmentPlan
import com.cuttedvideo.app.data.model.VideoMetadata
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.io.File
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

class VideoTransformerEngine(private val context: Context) {

    private var currentTransformer: Transformer? = null

    /**
     * Procesa un segmento individual utilizando Media3 Transformer.
     * Aplica recorte exacto de tiempo, factor de velocidad personalizado,
     * opción de silenciar audio (mute) y escala de resolución/altura personalizada.
     */
    suspend fun exportSegment(
        sourceMetadata: VideoMetadata,
        segment: SegmentPlan,
        speedMultiplier: Float = 1.0f,
        resolution: OutputResolution,
        customHeight: Int = 1080,
        muteAudio: Boolean = false,
        tempOutputFile: File,
        onProgress: (Float) -> Unit
    ) = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { continuation ->
            // 1. Configuración de recorte de medios (ClippingConfiguration)
            val clippingConfig = MediaItem.ClippingConfiguration.Builder()
                .setStartPositionMs(segment.startMs)
                .setEndPositionMs(segment.endMs)
                .setStartsAtKeyFrame(false)
                .build()

            val mediaItem = MediaItem.Builder()
                .setUri(sourceMetadata.uri)
                .setClippingConfiguration(clippingConfig)
                .build()

            // 2. Efectos de video (Escala, Resolución y Velocidad)
            val videoEffects = mutableListOf<Effect>()
            if (resolution == OutputResolution.CUSTOM) {
                videoEffects.add(Presentation.createForHeight(customHeight))
            } else if (resolution != OutputResolution.ORIGINAL) {
                val maxDim = resolution.maxDimension
                val targetHeight = if (sourceMetadata.isPortrait) {
                    maxDim
                } else {
                    (maxDim * sourceMetadata.height) / sourceMetadata.width
                }
                videoEffects.add(Presentation.createForHeight(targetHeight))
            }

            // Aplicar velocidad al video para sincronización perfecta
            if (speedMultiplier != 1.0f) {
                videoEffects.add(SpeedChangeEffect(speedMultiplier))
            }

            // 3. Procesamiento de audio para velocidad con Sonic (o silenciado)
            val audioProcessors = mutableListOf<androidx.media3.common.audio.AudioProcessor>()
            if (!muteAudio && speedMultiplier != 1.0f) {
                val sonic = SonicAudioProcessor().apply {
                    setSpeed(speedMultiplier)
                    setPitch(1.0f) // Conserva el tono natural sin distorsión de voz
                }
                audioProcessors.add(sonic)
            }

            // 4. Construcción de EditedMediaItem con efectos y opción de mute
            val effects = Effects(audioProcessors, videoEffects)
            val editedMediaItem = EditedMediaItem.Builder(mediaItem)
                .setEffects(effects)
                .setRemoveAudio(muteAudio) // Silencia completamente si se solicitó
                .build()

            var progressJob: kotlinx.coroutines.Job? = null

            // 5. Construir Transformer con listener compatible con Media3 1.3+
            val transformer = Transformer.Builder(context)
                .setVideoMimeType(MimeTypes.VIDEO_H264)
                .setAudioMimeType(MimeTypes.AUDIO_AAC)
                .addListener(object : Transformer.Listener {
                    override fun onCompleted(composition: Composition, exportResult: ExportResult) {
                        progressJob?.cancel()
                        onProgress(1f)
                        currentTransformer = null
                        if (continuation.isActive) {
                            continuation.resume(Unit)
                        }
                    }

                    override fun onError(
                        composition: Composition,
                        exportResult: ExportResult,
                        exportException: ExportException
                    ) {
                        progressJob?.cancel()
                        currentTransformer = null
                        if (continuation.isActive) {
                            continuation.resumeWithException(exportException)
                        }
                    }
                })
                .build()

            currentTransformer = transformer

            val progressScope = kotlinx.coroutines.CoroutineScope(kotlinx.coroutines.Dispatchers.Default)
            progressJob = progressScope.launch {
                val progressHolder = ProgressHolder()
                var simulatedProgress = 0.05f
                while (kotlinx.coroutines.isActive && currentTransformer != null) {
                    val state = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.Main) {
                        try {
                            transformer.getProgress(progressHolder)
                        } catch (_: Exception) {
                            Transformer.PROGRESS_STATE_NOT_STARTED
                        }
                    }
                    if (state == Transformer.PROGRESS_STATE_AVAILABLE) {
                        onProgress((progressHolder.progress / 100f).coerceIn(0f, 1f))
                    } else {
                        simulatedProgress = (simulatedProgress + 0.04f).coerceAtMost(0.96f)
                        onProgress(simulatedProgress)
                    }
                    kotlinx.coroutines.delay(100)
                }
            }

            // Manejo de cancelación coroutine segura
            continuation.invokeOnCancellation {
                progressJob.cancel()
                transformer.cancel()
                currentTransformer = null
                if (tempOutputFile.exists()) {
                    tempOutputFile.delete()
                }
            }

            // Iniciar transformación
            transformer.start(editedMediaItem, tempOutputFile.absolutePath)
        }
    }

    /**
     * Monitorea el progreso del Transformer activo mediante sondeo continuo.
     * Si el hardware encoder no reporta porcentaje exacto de inmediato, provee interpolación suave.
     */
    suspend fun pollProgress(onProgress: (Float) -> Unit) = withContext(Dispatchers.Default) {
        val progressHolder = ProgressHolder()
        var estimatedProgress = 0.08f
        while (currentCoroutineContext().isActive && currentTransformer != null) {
            val transformer = currentTransformer ?: break
            val state = withContext(Dispatchers.Main) {
                transformer.getProgress(progressHolder)
            }
            if (state == Transformer.PROGRESS_STATE_AVAILABLE) {
                onProgress(progressHolder.progress / 100f)
            } else {
                estimatedProgress = (estimatedProgress + 0.05f).coerceAtMost(0.95f)
                onProgress(estimatedProgress)
            }
            delay(150)
        }
    }

    fun cancelCurrent() {
        currentTransformer?.cancel()
        currentTransformer = null
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/domain/mediastore/MediaStoreExporter.kt',
    name: 'MediaStoreExporter.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Guarda los clips procesados en Movies/VideoSplit en la galería con nombres secuenciales y prevención de sobreescritura.',
    content: `package com.cuttedvideo.app.domain.mediastore

import android.content.ContentValues
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream

class MediaStoreExporter(private val context: Context) {

    companion object {
        const val SUBDIRECTORY = "Movies/VideoSplit"
    }

    /**
     * Genera un nombre de archivo secuencial único que no sobrescriba archivos existentes.
     * Ejemplo: clip_001.mp4, clip_002.mp4, etc.
     */
    suspend fun generateUniqueFilename(baseName: String, index: Int): String = withContext(Dispatchers.IO) {
        val formattedIndex = String.format("%03d", index)
        var candidateName = "\${baseName}_\${formattedIndex}.mp4"
        var counter = 1

        while (fileExistsInMediaStore(candidateName)) {
            candidateName = "\${baseName}_\${formattedIndex}_\${counter}.mp4"
            counter++
        }
        candidateName
    }

    /**
     * Copia un archivo MP4 temporal exportado por Media3 a la galería mediante MediaStore.
     * Utiliza IS_PENDING para evitar que la galería muestre archivos incompletos.
     */
    suspend fun saveToMediaStore(tempFile: File, displayName: String): Uri = withContext(Dispatchers.IO) {
        val resolver = context.contentResolver

        val contentValues = ContentValues().apply {
            put(MediaStore.Video.Media.DISPLAY_NAME, displayName)
            put(MediaStore.Video.Media.MIME_TYPE, "video/mp4")
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/VideoSplit")
                put(MediaStore.Video.Media.IS_PENDING, 1)
            }
        }

        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }

        val itemUri = resolver.insert(collection, contentValues)
            ?: throw IllegalStateException("No se pudo crear entrada en MediaStore para: \$displayName")

        try {
            resolver.openOutputStream(itemUri)?.use { outputStream ->
                FileInputStream(tempFile).use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            } ?: throw IllegalStateException("No se pudo abrir OutputStream para \$itemUri")

            // Marcar como listo en la galería
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                contentValues.clear()
                contentValues.put(MediaStore.Video.Media.IS_PENDING, 0)
                resolver.update(itemUri, contentValues, null, null)
            }

            itemUri
        } catch (e: Exception) {
            // Limpieza en caso de fallo para no dejar archivos corruptos
            resolver.delete(itemUri, null, null)
            throw e
        }
    }

    private fun fileExistsInMediaStore(displayName: String): Boolean {
        val projection = arrayOf(MediaStore.Video.Media._ID)
        val selection = "\${MediaStore.Video.Media.DISPLAY_NAME} = ?"
        val selectionArgs = arrayOf(displayName)

        val collection = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
        } else {
            MediaStore.Video.Media.EXTERNAL_CONTENT_URI
        }

        context.contentResolver.query(collection, projection, selection, selectionArgs, null)?.use { cursor ->
            return cursor.count > 0
        }
        return false
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/data/repository/ProfilesRepository.kt',
    name: 'ProfilesRepository.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Repositorio para perfiles de división editables (WhatsApp Status, Instagram Reels, etc.).',
    content: `package com.cuttedvideo.app.data.repository

import com.cuttedvideo.app.data.model.SplitProfile
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class ProfilesRepository {

    private val _profiles = MutableStateFlow(
        listOf(
            SplitProfile("wa_30", "WhatsApp Estados (30s)", "WhatsApp", 30),
            SplitProfile("wa_60", "WhatsApp Estados (60s)", "WhatsApp", 60),
            SplitProfile("ig_reels_90", "Instagram Reels (90s)", "Instagram", 90),
            SplitProfile("ig_stories_60", "Instagram Historias (60s)", "Instagram", 60),
            SplitProfile("tiktok_60", "TikTok (60s)", "TikTok", 60),
            SplitProfile("custom", "Personalizado", "Personalizado", 15)
        )
    )
    val profiles: StateFlow<List<SplitProfile>> = _profiles.asStateFlow()

    fun updateProfile(id: String, newDurationSeconds: Int) {
        _profiles.value = _profiles.value.map { profile ->
            if (profile.id == id) {
                profile.copy(maxDurationSeconds = newDurationSeconds.coerceAtLeast(1))
            } else {
                profile
            }
        }
    }

    fun addCustomProfile(name: String, maxDurationSeconds: Int) {
        val newProfile = SplitProfile(
            id = "custom_\${System.currentTimeMillis()}",
            name = name,
            platform = "Personalizado",
            maxDurationSeconds = maxDurationSeconds.coerceAtLeast(1)
        )
        _profiles.value = _profiles.value + newProfile
    }

    fun deleteProfile(id: String) {
        _profiles.value = _profiles.value.filter { it.id != id }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/ui/viewmodel/VideoSplitterViewModel.kt',
    name: 'VideoSplitterViewModel.kt',
    language: 'kotlin',
    category: 'source',
    description: 'ViewModel que orquesta la selección Photo Picker, el cálculo con velocidad y la ejecución de Media3 Transformer.',
    content: `package com.cuttedvideo.app.ui.viewmodel

import android.app.Application
import android.content.Context
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.cuttedvideo.app.data.model.ExportState
import com.cuttedvideo.app.data.model.OutputResolution
import com.cuttedvideo.app.data.model.PlaybackSpeed
import com.cuttedvideo.app.data.model.SegmentPlan
import com.cuttedvideo.app.data.model.SplitProfile
import com.cuttedvideo.app.data.model.VideoMetadata
import com.cuttedvideo.app.data.repository.ProfilesRepository
import com.cuttedvideo.app.domain.mediastore.MediaStoreExporter
import com.cuttedvideo.app.domain.transformer.VideoTransformerEngine
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.io.File
import kotlin.math.ceil

class VideoSplitterViewModel(application: Application) : AndroidViewModel(application) {

    private val context = application.applicationContext
    private val prefs = application.getSharedPreferences("cuttedvideo_user_config", Context.MODE_PRIVATE)
    private val transformerEngine = VideoTransformerEngine(context)
    private val mediaStoreExporter = MediaStoreExporter(context)
    val profilesRepository = ProfilesRepository()

    private val _themeMode = MutableStateFlow(prefs.getString("theme_mode", "auto") ?: "auto")
    val themeMode: StateFlow<String> = _themeMode.asStateFlow()

    private val _selectedVideo = MutableStateFlow<VideoMetadata?>(null)
    val selectedVideo: StateFlow<VideoMetadata?> = _selectedVideo.asStateFlow()

    private val _selectedSpeedMultiplier = MutableStateFlow(prefs.getFloat("speed_multiplier", 1.0f))
    val selectedSpeedMultiplier: StateFlow<Float> = _selectedSpeedMultiplier.asStateFlow()

    // Compatibilidad para evitar errores en llamadas existentes
    val selectedSpeed: StateFlow<PlaybackSpeed> = MutableStateFlow(PlaybackSpeed.SPEED_1_0X).asStateFlow()

    private val _muteAudio = MutableStateFlow(prefs.getBoolean("mute_audio", false))
    val muteAudio: StateFlow<Boolean> = _muteAudio.asStateFlow()

    private val _selectedResolution = MutableStateFlow(
        runCatching {
            OutputResolution.valueOf(prefs.getString("selected_resolution", "ORIGINAL") ?: "ORIGINAL")
        }.getOrDefault(OutputResolution.ORIGINAL)
    )
    val selectedResolution: StateFlow<OutputResolution> = _selectedResolution.asStateFlow()

    private val _customHeight = MutableStateFlow(prefs.getInt("custom_height", 1080))
    val customHeight: StateFlow<Int> = _customHeight.asStateFlow()

    private val _selectedProfile = MutableStateFlow<SplitProfile?>(null)
    val selectedProfile: StateFlow<SplitProfile?> = _selectedProfile.asStateFlow()

    private val _customDurationSeconds = MutableStateFlow(prefs.getInt("custom_duration_seconds", 30))
    val customDurationSeconds: StateFlow<Int> = _customDurationSeconds.asStateFlow()

    private val _exportState = MutableStateFlow<ExportState>(ExportState.Idle)
    val exportState: StateFlow<ExportState> = _exportState.asStateFlow()

    private var exportJob: Job? = null

    init {
        viewModelScope.launch {
            profilesRepository.profiles.collect { list ->
                if (_selectedProfile.value == null && list.isNotEmpty()) {
                    _selectedProfile.value = list.first()
                }
            }
        }
    }

    /**
     * Procesa la URI recibida desde Android Photo Picker.
     */
    fun onVideoPicked(uri: Uri) {
        viewModelScope.launch {
            try {
                val metadata = extractMetadataFromUri(uri)
                _selectedVideo.value = metadata
                // Conserva la última configuración de velocidad elegida por el usuario
            } catch (e: Exception) {
                _exportState.value = ExportState.Error("No se pudieron leer los metadatos del video: \${e.localizedMessage}")
            }
        }
    }

    fun clearVideo() {
        _selectedVideo.value = null
    }

    fun setThemeMode(mode: String) {
        _themeMode.value = mode
        prefs.edit().putString("theme_mode", mode).apply()
    }

    fun setSpeedMultiplier(multiplier: Float) {
        val rounded = (multiplier * 100).toInt() / 100f
        _selectedSpeedMultiplier.value = rounded
        prefs.edit().putFloat("speed_multiplier", rounded).apply()
    }

    fun setSpeed(speed: PlaybackSpeed) {
        setSpeedMultiplier(speed.multiplier)
    }

    fun setMuteAudio(mute: Boolean) {
        _muteAudio.value = mute
        prefs.edit().putBoolean("mute_audio", mute).apply()
    }

    fun setResolution(res: OutputResolution) {
        _selectedResolution.value = res
        prefs.edit().putString("selected_resolution", res.name).apply()
    }

    fun setCustomHeight(height: Int) {
        _customHeight.value = height
        prefs.edit().putInt("custom_height", height).apply()
    }

    fun selectProfile(profile: SplitProfile) {
        _selectedProfile.value = profile
        if (profile.id == "custom") {
            _customDurationSeconds.value = profile.maxDurationSeconds
        }
    }

    fun setCustomDuration(seconds: Int) {
        val clamped = seconds.coerceAtLeast(1)
        _customDurationSeconds.value = clamped
        prefs.edit().putInt("custom_duration_seconds", clamped).apply()
    }

    /**
     * Calcula la lista de segmentos considerando la duración estimada tras aplicar la velocidad.
     */
    fun calculateSegmentPlans(): List<SegmentPlan> {
        val video = _selectedVideo.value ?: return emptyList()
        val speedMultiplier = _selectedSpeedMultiplier.value
        val maxDurationSec = _customDurationSeconds.value.coerceAtLeast(5)

        val sourceChunkSec = maxDurationSec * speedMultiplier
        val totalSourceSec = video.durationSeconds
        val numSegments = ceil(totalSourceSec / sourceChunkSec).toInt()

        val plans = mutableListOf<SegmentPlan>()
        val baseCleanName = video.name.substringBeforeLast(".").replace("[^a-zA-Z0-9]".toRegex(), "_")

        for (i in 0 until numSegments) {
            val startSourceMs = (i * sourceChunkSec * 1000).toLong()
            val endSourceMs = minOf(video.durationMs, ((i + 1) * sourceChunkSec * 1000).toLong())
            val actualSourceSec = (endSourceMs - startSourceMs) / 1000f
            val outputDuration = actualSourceSec / speedMultiplier

            plans.add(
                SegmentPlan(
                    index = i + 1,
                    fileName = "\${baseCleanName}_\${String.format(\"%03d\", i + 1)}.mp4",
                    startMs = startSourceMs,
                    endMs = endSourceMs,
                    outputDurationSeconds = outputDuration
                )
            )
        }
        return plans
    }

    /**
     * Inicia el procesamiento secuencial con Media3 Transformer y guardado en MediaStore.
     */
    fun startExport() {
        val video = _selectedVideo.value ?: return
        val segments = calculateSegmentPlans()
        if (segments.isEmpty()) return

        exportJob?.cancel()
        exportJob = viewModelScope.launch {
            _exportState.value = ExportState.Exporting(
                currentSegmentIndex = 1,
                totalSegments = segments.size,
                currentSegmentProgress = 0f,
                overallProgress = 0f
            )

            var savedCount = 0
            val total = segments.size
            val savedClipsList = mutableListOf<com.cuttedvideo.app.data.model.ExportedClip>()

            for (seg in segments) {
                val tempFile = File(context.cacheDir, \"temp_clip_\${seg.index}.mp4\")
                if (tempFile.exists()) tempFile.delete()

                try {
                    // Ejecución real de Media3 Transformer con velocidad, calidad y mute
                    transformerEngine.exportSegment(
                        sourceMetadata = video,
                        segment = seg,
                        speedMultiplier = _selectedSpeedMultiplier.value,
                        resolution = _selectedResolution.value,
                        customHeight = _customHeight.value,
                        muteAudio = _muteAudio.value,
                        tempOutputFile = tempFile,
                        onProgress = { segProg ->
                            val segProgressFraction = segProg.coerceIn(0f, 1f)
                            val overall = ((savedCount + segProgressFraction) / total).coerceIn(0f, 1f)
                            _exportState.value = ExportState.Exporting(
                                currentSegmentIndex = seg.index,
                                totalSegments = total,
                                currentSegmentProgress = segProgressFraction,
                                overallProgress = overall
                            )
                        }
                    )

                    // Guardar en MediaStore (Movies/VideoSplit) sin sobrescribir
                    val uniqueName = mediaStoreExporter.generateUniqueFilename(
                        baseName = video.name.substringBeforeLast("."),
                        index = seg.index
                    )
                    val itemUri = mediaStoreExporter.saveToMediaStore(tempFile, uniqueName)
                    savedClipsList.add(
                        com.cuttedvideo.app.data.model.ExportedClip(
                            uri = itemUri,
                            fileName = uniqueName,
                            index = seg.index
                        )
                    )

                    tempFile.delete()
                    savedCount++
                } catch (e: Exception) {
                    if (tempFile.exists()) tempFile.delete()
                    if (e is kotlinx.coroutines.CancellationException) {
                        _exportState.value = ExportState.Cancelled
                        return@launch
                    }
                    _exportState.value = ExportState.Error("Error exportando clip \${seg.index}: \${e.localizedMessage}")
                    return@launch
                }
            }

            _exportState.value = ExportState.Completed(
                totalSavedClips = savedCount,
                savedClips = savedClipsList
            )
        }
    }

    fun cancelExport() {
        exportJob?.cancel()
        transformerEngine.cancelCurrent()
        _exportState.value = ExportState.Cancelled
    }

    fun resetExportState() {
        _exportState.value = ExportState.Idle
    }

    private fun extractMetadataFromUri(uri: Uri): VideoMetadata {
        val resolver = context.contentResolver
        var name = "video_\${System.currentTimeMillis()}.mp4"
        var size = 0L

        resolver.query(uri, null, null, null, null)?.use { cursor ->
            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
            val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
            if (cursor.moveToFirst()) {
                if (nameIndex != -1) name = cursor.getString(nameIndex) ?: name
                if (sizeIndex != -1) size = cursor.getLong(sizeIndex)
            }
        }

        val retriever = MediaMetadataRetriever()
        retriever.setDataSource(context, uri)

        val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
        val widthStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)
        val heightStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)
        val mimeType = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_MIMETYPE) ?: "video/mp4"

        val durationMs = durationStr?.toLongOrNull() ?: 0L
        val width = widthStr?.toIntOrNull() ?: 1080
        val height = heightStr?.toIntOrNull() ?: 1920

        retriever.release()

        return VideoMetadata(
            uri = uri,
            name = name,
            durationMs = durationMs,
            width = width,
            height = height,
            sizeBytes = size,
            mimeType = mimeType
        )
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/ui/screens/HomeScreen.kt',
    name: 'HomeScreen.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Pantalla minimalista sin scroll con selector de tema, previsualización de video y hojas modales inferiores (Velocidad, Calidad, Cortes).',
    content: `package com.cuttedvideo.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackParameters
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import coil.compose.AsyncImage
import coil.request.ImageRequest
import coil.request.videoFrameMillis
import com.cuttedvideo.app.data.model.ExportState
import com.cuttedvideo.app.data.model.OutputResolution
import com.cuttedvideo.app.data.model.PlaybackSpeed
import com.cuttedvideo.app.data.model.SegmentPlan
import com.cuttedvideo.app.data.model.VideoMetadata
import com.cuttedvideo.app.ui.viewmodel.VideoSplitterViewModel
import java.util.Locale
import kotlin.math.roundToInt
private enum class ActiveBottomSheet {
    NONE,
    SPEED,
    QUALITY,
    CUTS
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: VideoSplitterViewModel
) {
    val selectedVideo by viewModel.selectedVideo.collectAsState()
    val speedMultiplier by viewModel.selectedSpeedMultiplier.collectAsState()
    val muteAudio by viewModel.muteAudio.collectAsState()
    val resolution by viewModel.selectedResolution.collectAsState()
    val customHeight by viewModel.customHeight.collectAsState()
    val customDuration by viewModel.customDurationSeconds.collectAsState()
    val exportState by viewModel.exportState.collectAsState()
    val themeMode by viewModel.themeMode.collectAsState()

    var activeSheet by remember { mutableStateOf(ActiveBottomSheet.NONE) }
    var isPlayingPreview by remember { mutableStateOf(false) }

    // Launcher de Android Photo Picker nativo (sin permisos invasivos)
    val photoPickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia()
    ) { uri: Uri? ->
        uri?.let { viewModel.onVideoPicked(it) }
    }

    val plans = remember(selectedVideo, speedMultiplier, customDuration) {
        viewModel.calculateSegmentPlans()
    }

    if (selectedVideo == null) {
        // ==========================================
        // PANTALLA 1: PRINCIPAL / SUBIR ARCHIVO (Sin Scroll)
        // ==========================================
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = MaterialTheme.colorScheme.primaryContainer,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        Icons.Default.ContentCut,
                                        contentDescription = "Logo CuttedVideo",
                                        tint = MaterialTheme.colorScheme.onPrimaryContainer,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                            Text(
                                "CuttedVideo",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    },
                    actions = {
                        // Selector superior derecho: "Auto", "Claro", "Oscuro" con iconos
                        Row(
                            modifier = Modifier
                                .padding(end = 8.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                                .padding(2.dp),
                            horizontalArrangement = Arrangement.spacedBy(2.dp)
                        ) {
                            listOf(
                                Triple("auto", "Auto", Icons.Default.BrightnessAuto),
                                Triple("claro", "Claro", Icons.Default.LightMode),
                                Triple("oscuro", "Oscuro", Icons.Default.DarkMode)
                            ).forEach { (key, label, icon) ->
                                val selected = themeMode == key
                                Surface(
                                    shape = RoundedCornerShape(16.dp),
                                    color = if (selected) MaterialTheme.colorScheme.primary else Color.Transparent,
                                    contentColor = if (selected) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(16.dp))
                                        .clickable { viewModel.setThemeMode(key) }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(icon, contentDescription = null, modifier = Modifier.size(13.dp))
                                        Text(
                                            text = label,
                                            style = MaterialTheme.typography.labelSmall,
                                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal
                                        )
                                    }
                                }
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            }
        ) { innerPadding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(24.dp)),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(28.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                            modifier = Modifier.size(76.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    Icons.Default.VideoLibrary,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(40.dp)
                                )
                            }
                        }

                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                "Comienza seleccionando un video",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                "Divide tus videos automáticamente en fragmentos continuos con audio 100% sincronizado.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                textAlign = TextAlign.Center
                            )
                        }

                        Button(
                            onClick = {
                                photoPickerLauncher.launch(
                                    PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(16.dp)
                        ) {
                            Icon(Icons.Default.Upload, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Subir / Seleccionar Video", fontWeight = FontWeight.SemiBold)
                        }

                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.8f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Icon(
                                    Icons.Default.Info,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary,
                                    modifier = Modifier.size(20.dp)
                                )
                                Text(
                                    "Formatos compatibles: MP4, MOV, MKV · Cortes exactos para WhatsApp (30s), Historias (60s) y Reels (90s).",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }
        }
    } else if (exportState !is ExportState.Idle) {
        // ==========================================
        // PANTALLA 3: PROCESAMIENTO Y RESULTADO FINAL (Última pantalla continua)
        // ==========================================
        ProcessingAndResultScreen(
            state = exportState,
            videoMetadata = selectedVideo!!,
            plans = plans,
            speedMultiplier = speedMultiplier,
            onCancel = { viewModel.cancelExport() },
            onNewVideo = { viewModel.clearVideo() }
        )
    } else {
        // ==========================================
        // PANTALLA 2: EDITOR CON VIDEO SIEMPRE EN PANTALLA
        // ==========================================
        val video = selectedVideo!!
        val context = LocalContext.current
        val effectiveDuration = (video.durationSeconds / speedMultiplier)

        Scaffold(
            topBar = {
                TopAppBar(
                    navigationIcon = {
                        OutlinedButton(
                            onClick = { viewModel.clearVideo() },
                            shape = RoundedCornerShape(14.dp),
                            contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                            modifier = Modifier.padding(start = 12.dp)
                        ) {
                            Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Cambiar Video", style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        }
                    },
                    title = { /* Sin nombre de archivo en la barra superior */ },
                    actions = {
                        // Botón superior derecho: "Cortar y Procesar"
                        Button(
                            onClick = { viewModel.startExport() },
                            enabled = exportState is ExportState.Idle,
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.padding(end = 12.dp)
                        ) {
                            Icon(Icons.Default.ContentCut, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(6.dp))
                            Text("Cortar y Procesar", fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    )
                )
            },
            bottomBar = {
                // Menú inferior con 3 iconos: Velocidad, Calidad y Cortes
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    tonalElevation = 6.dp
                ) {
                    NavigationBarItem(
                        selected = activeSheet == ActiveBottomSheet.SPEED,
                        onClick = { activeSheet = ActiveBottomSheet.SPEED },
                        icon = { Icon(Icons.Default.Speed, contentDescription = "Velocidad") },
                        label = { Text("Velocidad (\${String.format(Locale.US, \"%.1f\", speedMultiplier)}x)") }
                    )
                    NavigationBarItem(
                        selected = activeSheet == ActiveBottomSheet.QUALITY,
                        onClick = { activeSheet = ActiveBottomSheet.QUALITY },
                        icon = { Icon(Icons.Default.HighQuality, contentDescription = "Calidad") },
                        label = { Text("Calidad") }
                    )
                    NavigationBarItem(
                        selected = activeSheet == ActiveBottomSheet.CUTS,
                        onClick = { activeSheet = ActiveBottomSheet.CUTS },
                        icon = { Icon(Icons.Default.ContentCut, contentDescription = "Cortes") },
                        label = { Text("Cortes (\${customDuration}s)") }
                    )
                }
            }
        ) { innerPadding ->
            // Área de contenido sin scroll (Video siempre visible)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(innerPadding)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Reproductor / Previsualización de video con controles
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color.Black),
                    contentAlignment = Alignment.Center
                ) {
                    // Reproductor de video real con ExoPlayer y velocidad de reproducción
                    val exoPlayer = remember(video.uri) {
                        ExoPlayer.Builder(context).build().apply {
                            setMediaItem(MediaItem.fromUri(video.uri))
                            repeatMode = Player.REPEAT_MODE_ONE
                            playbackParameters = PlaybackParameters(speedMultiplier)
                            prepare()
                        }
                    }
                    DisposableEffect(exoPlayer) {
                        onDispose {
                            exoPlayer.release()
                        }
                    }
                    LaunchedEffect(speedMultiplier) {
                        exoPlayer.playbackParameters = PlaybackParameters(speedMultiplier)
                    }

                    AndroidView(
                        factory = { ctx ->
                            PlayerView(ctx).apply {
                                player = exoPlayer
                                useController = true
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                    // Insignia flotante con resolución y duración
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color.Black.copy(alpha = 0.7f),
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "\${video.width}x\${video.height}",
                                color = Color.White,
                                style = MaterialTheme.typography.labelSmall
                            )
                            Text("•", color = Color.Gray, style = MaterialTheme.typography.labelSmall)
                            Text(
                                "\${String.format(Locale.US, \"%.1f\", video.durationSeconds)}s orig.",
                                color = Color.White,
                                style = MaterialTheme.typography.labelSmall
                            )
                            if (speedMultiplier != 1.0f) {
                                Text("•", color = Color.Gray, style = MaterialTheme.typography.labelSmall)
                                Text(
                                    "\${String.format(Locale.US, \"%.1f\", effectiveDuration)}s a \${String.format(Locale.US, \"%.2f\", speedMultiplier)}x",
                                    color = MaterialTheme.colorScheme.primary,
                                    style = MaterialTheme.typography.labelSmall,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Tarjeta resumen limpia con datos clave
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)
                    ),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceAround,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Clips", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("\${plans.size}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Divider(modifier = Modifier.height(28.dp).width(1.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Corte Máx.", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text("\${customDuration}s", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Divider(modifier = Modifier.height(28.dp).width(1.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Audio", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(if (muteAudio) "Muteado" else "Activo", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                        Divider(modifier = Modifier.height(28.dp).width(1.dp))
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text("Calidad", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(if (resolution == OutputResolution.CUSTOM) "\${customHeight}p" else resolution.label, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // ==========================================
        // HOJAS MODALES INFERIORES (MODAL BOTTOM SHEETS)
        // ==========================================

        // 1. MODAL DE VELOCIDAD
        if (activeSheet == ActiveBottomSheet.SPEED) {
            ModalBottomSheet(
                onDismissRequest = { activeSheet = ActiveBottomSheet.NONE },
                sheetState = rememberModalBottomSheetState()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .padding(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Velocidad de Reproducción", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { activeSheet = ActiveBottomSheet.NONE }) {
                            Icon(Icons.Default.Close, contentDescription = "Cerrar")
                        }
                    }

                    // Dos hileras de 4 botones: 0.5x, 0.75x, 1.0x, 1.25x / 1.5x, 1.7x, 2.0x, Personalizada
                    val standardSpeeds = listOf(0.5f, 0.75f, 1.0f, 1.25f, 1.5f, 1.7f, 2.0f)
                    var isCustomSpeedSelected by remember { mutableStateOf(!standardSpeeds.any { kotlin.math.abs(speedMultiplier - it) < 0.01f }) }

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        // Hilera 1
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(0.5f to "0.5x", 0.75f to "0.75x", 1.0f to "1.0x", 1.25f to "1.25x").forEach { (s, label) ->
                                val isSelected = !isCustomSpeedSelected && (kotlin.math.abs(speedMultiplier - s) < 0.01f)
                                FilterChip(
                                    selected = isSelected,
                                    onClick = {
                                        isCustomSpeedSelected = false
                                        viewModel.setSpeedMultiplier(s)
                                    },
                                    label = { Text(label, maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }

                        // Hilera 2
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(1.5f to "1.5x", 1.7f to "1.7x", 2.0f to "2.0x").forEach { (s, label) ->
                                val isSelected = !isCustomSpeedSelected && (kotlin.math.abs(speedMultiplier - s) < 0.01f)
                                FilterChip(
                                    selected = isSelected,
                                    onClick = {
                                        isCustomSpeedSelected = false
                                        viewModel.setSpeedMultiplier(s)
                                    },
                                    label = { Text(label, maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            FilterChip(
                                selected = isCustomSpeedSelected,
                                onClick = { isCustomSpeedSelected = true },
                                label = { Text("Personalizada", maxLines = 1, textAlign = TextAlign.Center, style = MaterialTheme.typography.labelSmall, modifier = Modifier.fillMaxWidth()) },
                                modifier = Modifier.weight(1.3f)
                            )
                        }
                    }

                    // Barra Slider visible únicamente si se pulsa personalizada
                    if (isCustomSpeedSelected) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Velocidad Personalizada (pasos de 0.05):", style = MaterialTheme.typography.bodySmall)
                                Text(
                                    "\${String.format(Locale.US, \"%.2f\", speedMultiplier)}x",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                            Slider(
                                value = speedMultiplier,
                                onValueChange = { newVal ->
                                    val stepped = (newVal * 20).roundToInt() / 20f
                                    viewModel.setSpeedMultiplier(stepped)
                                },
                                valueRange = 0.25f..3.00f,
                                steps = 54
                            )
                        }
                    }

                    // Información comparativa: Duración original vs Duración resultante
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text("Duración original: \${String.format(Locale.US, \"%.1f\", video.durationSeconds)} segundos", style = MaterialTheme.typography.bodySmall)
                            Text(
                                "Duración con velocidad seleccionada: \${String.format(Locale.US, \"%.1f\", effectiveDuration)} segundos",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }

                    // Checkbox para mutear el video (Default: NO)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .clickable { viewModel.setMuteAudio(!muteAudio) }
                            .padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = muteAudio,
                            onCheckedChange = { viewModel.setMuteAudio(it) }
                        )
                        Spacer(Modifier.width(8.dp))
                        Column {
                            Text("Silenciar audio (Mute)", style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.SemiBold)
                            Text("Elimina la pista de sonido de los clips exportados (Default: No)", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }
        }

        // 2. MODAL DE CALIDAD
        if (activeSheet == ActiveBottomSheet.QUALITY) {
            ModalBottomSheet(
                onDismissRequest = { activeSheet = ActiveBottomSheet.NONE },
                sheetState = rememberModalBottomSheetState()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .padding(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Calidad y Resolución", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { activeSheet = ActiveBottomSheet.NONE }) {
                            Icon(Icons.Default.Close, contentDescription = "Cerrar")
                        }
                    }

                    // 4 botones: 1080, 720, 480 y personalizada en dos hileras espaciosas
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = resolution == OutputResolution.RES_1080P,
                                onClick = { viewModel.setResolution(OutputResolution.RES_1080P) },
                                label = { Text("1080p (FHD)", maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = resolution == OutputResolution.RES_720P,
                                onClick = { viewModel.setResolution(OutputResolution.RES_720P) },
                                label = { Text("720p (HD)", maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = resolution == OutputResolution.RES_480P,
                                onClick = { viewModel.setResolution(OutputResolution.RES_480P) },
                                label = { Text("480p (SD)", maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = resolution == OutputResolution.CUSTOM || resolution == OutputResolution.ORIGINAL,
                                onClick = { viewModel.setResolution(OutputResolution.CUSTOM) },
                                label = { Text("Personalizada", maxLines = 1, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth()) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Si se seleccionó personalizada: Slider y botoncito más pequeño "Original"
                    if (resolution == OutputResolution.CUSTOM || resolution == OutputResolution.ORIGINAL) {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Resolución vertical deseada:", style = MaterialTheme.typography.bodySmall)
                                    Text(
                                        if (resolution == OutputResolution.ORIGINAL) "\${video.height}p (Original)" else "\${customHeight}p",
                                        style = MaterialTheme.typography.titleSmall,
                                        fontWeight = FontWeight.Bold,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }

                                // Botoncito más pequeño que dice "Original"
                                OutlinedButton(
                                    onClick = { viewModel.setResolution(OutputResolution.ORIGINAL) },
                                    shape = RoundedCornerShape(10.dp),
                                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                                    colors = if (resolution == OutputResolution.ORIGINAL) {
                                        ButtonDefaults.outlinedButtonColors(
                                            containerColor = MaterialTheme.colorScheme.primaryContainer,
                                            contentColor = MaterialTheme.colorScheme.onPrimaryContainer
                                        )
                                    } else {
                                        ButtonDefaults.outlinedButtonColors()
                                    }
                                ) {
                                    Icon(Icons.Default.AutoAwesome, contentDescription = null, modifier = Modifier.size(14.dp))
                                    Spacer(Modifier.width(4.dp))
                                    Text("Original", style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Bold)
                                }
                            }

                            Slider(
                                value = (if (resolution == OutputResolution.ORIGINAL) video.height else customHeight).toFloat(),
                                onValueChange = {
                                    viewModel.setResolution(OutputResolution.CUSTOM)
                                    viewModel.setCustomHeight(((it / 60).roundToInt() * 60).coerceIn(360, 2160))
                                },
                                valueRange = 360f..2160f,
                                steps = 29
                            )
                        }
                    }

                    // Información útil de la sección de Calidad
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                "Resolución actual del video: \${video.width} x \${video.height} píxeles",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                "Consejo: Usar Original preserva la nitidez exacta sin reescalado innecesario. Reducir la resolución a 720p acelerará notablemente el tiempo de exportación en dispositivos con procesadores ajustados.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }

        // 3. MODAL DE CORTES
        if (activeSheet == ActiveBottomSheet.CUTS) {
            ModalBottomSheet(
                onDismissRequest = { activeSheet = ActiveBottomSheet.NONE },
                sheetState = rememberModalBottomSheetState()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp)
                        .padding(bottom = 32.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Duración de los Cortes", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        IconButton(onClick = { activeSheet = ActiveBottomSheet.NONE }) {
                            Icon(Icons.Default.Close, contentDescription = "Cerrar")
                        }
                    }

                    // 4 botones: 30s, 60s, 90s y personalizada
                    val isPreset = (customDuration == 30 || customDuration == 60 || customDuration == 90)
                    var isCustomSelected by remember { mutableStateOf(!isPreset) }

                    // Dos hileras de dos cada uno con botones más grandes
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = (!isCustomSelected && customDuration == 30),
                                onClick = {
                                    isCustomSelected = false
                                    viewModel.setCustomDuration(30)
                                },
                                label = { Text("30 segundos", maxLines = 1, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) },
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = (!isCustomSelected && customDuration == 60),
                                onClick = {
                                    isCustomSelected = false
                                    viewModel.setCustomDuration(60)
                                },
                                label = { Text("60 segundos", maxLines = 1, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) },
                                modifier = Modifier.weight(1f)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            FilterChip(
                                selected = (!isCustomSelected && customDuration == 90),
                                onClick = {
                                    isCustomSelected = false
                                    viewModel.setCustomDuration(90)
                                },
                                label = { Text("90 segundos", maxLines = 1, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) },
                                modifier = Modifier.weight(1f)
                            )
                            FilterChip(
                                selected = isCustomSelected,
                                onClick = { isCustomSelected = true },
                                label = { Text("Personalizada", maxLines = 1, textAlign = TextAlign.Center, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Slider si se toca personalizada
                    if (isCustomSelected) {
                        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Duración máxima por clip:", style = MaterialTheme.typography.bodySmall)
                                Text(
                                    "\${customDuration} seg",
                                    style = MaterialTheme.typography.titleSmall,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                            Slider(
                                value = customDuration.toFloat(),
                                onValueChange = { viewModel.setCustomDuration(((it / 5).roundToInt() * 5).coerceIn(5, 180)) },
                                valueRange = 5f..180f,
                                steps = 34
                            )
                        }
                    }

                    // Información útil de la sección de Cortes
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                "Resultado estimado: \${plans.size} clips de máximo \${customDuration}s cada uno.",
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                "30s es ideal para estados de WhatsApp. 60s para Historias de Instagram. 90s para Reels y TikTok.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}
`,
  },
  {
    path: 'app/src/main/java/com/cuttedvideo/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'source',
    description: 'Actividad principal con tema Material 3, diálogo de progreso y botón para compartir clips ordenados.',
    content: `package com.cuttedvideo.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.cuttedvideo.app.data.model.ExportState
import com.cuttedvideo.app.data.model.ExportedClip
import com.cuttedvideo.app.ui.screens.HomeScreen
import com.cuttedvideo.app.ui.viewmodel.VideoSplitterViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: VideoSplitterViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            val themeMode by viewModel.themeMode.collectAsState()
            val systemDark = isSystemInDarkTheme()
            val useDark = when (themeMode) {
                "claro" -> false
                "oscuro" -> true
                else -> systemDark
            }

            MaterialTheme(
                colorScheme = if (useDark) darkColorScheme() else lightColorScheme()
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val exportState by viewModel.exportState.collectAsState()

                    HomeScreen(
                        viewModel = viewModel
                    )

                    if (exportState !is ExportState.Idle) {
                        ProcessingDialog(
                            state = exportState,
                            onCancel = { viewModel.cancelExport() },
                            onDismiss = { viewModel.resetExportState() }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProcessingDialog(
    state: ExportState,
    onCancel: () -> Unit,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current

    when (state) {
        is ExportState.Exporting -> {
            val progressPercent = (state.overallProgress * 100).toInt()
            AlertDialog(
                onDismissRequest = {},
                title = { Text("Dividiendo y exportando clips...") },
                text = {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                "Clip \${state.currentSegmentIndex} de \${state.totalSegments}",
                                style = MaterialTheme.typography.bodyMedium
                            )
                            Text(
                                "\$progressPercent%",
                                style = MaterialTheme.typography.titleSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        LinearProgressIndicator(
                            progress = { state.overallProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                        )
                        Text(
                            "Guardando en Galería",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                confirmButton = {},
                dismissButton = {
                    TextButton(onClick = onCancel) {
                        Text("Cancelar")
                    }
                }
            )
        }
        is ExportState.Completed -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = { Text("¡Clips listos en tu galería!") },
                text = {
                    Column(
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            "Se guardaron \${state.totalSavedClips} clips en la Galería de fotos.",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.SemiBold
                        )

                        // Botón principal para compartir todos los clips juntos y en estricto orden
                        Button(
                            onClick = {
                                val sortedClips = state.savedClips.sortedBy { it.index }
                                val uris = ArrayList(sortedClips.map { it.uri })
                                val intent = Intent(Intent.ACTION_SEND_MULTIPLE).apply {
                                    type = "video/mp4"
                                    putParcelableArrayListExtra(Intent.EXTRA_STREAM, uris)
                                    putExtra(Intent.EXTRA_SUBJECT, "Clips ordenados (1 al \${state.totalSavedClips})")
                                    putExtra(
                                        Intent.EXTRA_TEXT,
                                        "Clips ordenados del 1 al \${state.totalSavedClips} listos para publicar (CuttedVideo)"
                                    )
                                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                }
                                context.startActivity(Intent.createChooser(intent, "Compartir clips en orden correlativo"))
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Share, contentDescription = null)
                            Spacer(Modifier.width(8.dp))
                            Text("Compartir todos los clips en orden (1 al \${state.totalSavedClips})")
                        }
                    }
                },
                confirmButton = {
                    Button(onClick = onDismiss) {
                        Text("Listo")
                    }
                }
            )
        }
        is ExportState.Error -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = { Text("Error al procesar") },
                text = { Text(state.message) },
                confirmButton = {
                    Button(onClick = onDismiss) {
                        Text("Cerrar")
                    }
                }
            )
        }
        is ExportState.Cancelled -> {
            AlertDialog(
                onDismissRequest = onDismiss,
                title = { Text("Exportación cancelada") },
                text = { Text("El proceso se detuvo y no se guardaron archivos incompletos.") },
                confirmButton = {
                    Button(onClick = onDismiss) {
                        Text("Aceptar")
                    }
                }
            )
        }
        else -> Unit
    }
}
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_background.xml',
    name: 'ic_launcher_background.xml',
    language: 'xml',
    category: 'res',
    description: 'Fondo del icono adaptativo de la app con gradiente índigo y slate.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0B0F19"
        android:pathData="M0,0h108v108h-108z" />
    <path
        android:fillColor="#312E81"
        android:pathData="M16,16h76v76h-76z" />
    <path
        android:fillColor="#4F46E5"
        android:pathData="M24,24h60v60h-60z" />
</vector>
`,
  },
  {
    path: 'app/src/main/res/drawable/ic_launcher_foreground.xml',
    name: 'ic_launcher_foreground.xml',
    language: 'xml',
    category: 'res',
    description: 'Primer plano del icono adaptativo con tijera y corte de fotograma de video.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Marco de cinta de video -->
    <path
        android:fillColor="#FFFFFF"
        android:pathData="M32,32 C29.79,32 28,33.79 28,36 L28,72 C28,74.21 29.79,76 32,76 L76,76 C78.21,76 80,74.21 80,72 L80,36 C80,33.79 78.21,32 76,32 Z M34,36 L40,36 L40,42 L34,42 Z M44,36 L64,36 L64,72 L44,72 Z M68,36 L74,36 L74,42 L68,42 Z M74,46 L74,62 L68,62 L68,46 Z M74,66 L74,72 L68,72 L68,66 Z M34,46 L40,46 L40,62 L34,62 Z M34,66 L40,66 L40,72 L34,72 Z" />
    <!-- Línea de corte cian brillante central -->
    <path
        android:fillColor="#38BDF8"
        android:pathData="M52,26 L56,26 L56,82 L52,82 Z" />
    <!-- Destello central de tijera -->
    <path
        android:fillColor="#A5B4FC"
        android:pathData="M48,50 L60,50 L60,58 L48,58 Z" />
</vector>
`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml',
    name: 'ic_launcher.xml',
    language: 'xml',
    category: 'res',
    description: 'Icono adaptativo de inicio para Android 8.0+.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`,
  },
  {
    path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml',
    name: 'ic_launcher_round.xml',
    language: 'xml',
    category: 'res',
    description: 'Icono circular adaptativo de inicio para Android 8.0+.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>
`,
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Instrucciones para abrir, compilar y ejecutar el proyecto en Android Studio.',
    content: `# CuttedVideo - Aplicación Android Nativa

CuttedVideo es una aplicación nativa para Android construida con **Kotlin**, **Jetpack Compose**, **Material 3** y **AndroidX Media3 Transformer**.

## Requisitos
- **Android Studio Ladybug (2024.2+)** o Koala
- **JDK 17**
- Dispositivo o Emulador con Android 8.0+ (API 26+)

## Características Principales
1. **AndroidX Media3 Transformer**:
   - Recorte preciso de fotogramas mediante \`ClippingConfiguration\`.
   - Modificación de velocidad de reproducción (0,5x a 2x) usando \`SonicAudioProcessor\` para conservar el tono de voz natural.
   - Ajuste de resolución (1080p, 720p, 480p) con \`Presentation\` y \`ScaleAndRotateTransformation\`.
2. **Android Photo Picker**:
   - Selección segura y moderna de videos sin solicitar permisos invasivos de almacenamiento en Android 13+.
3. **MediaStore**:
   - Guardado directo en la carpeta pública \`Movies/VideoSplit\`.
   - Control con \`IS_PENDING\` para evitar archivos corruptos en la galería.
   - Nombres secuenciales (\`clip_001.mp4\`, etc.) con verificación para no sobrescribir archivos.
4. **Perfiles Dinámicos**:
   - Perfiles configurables para WhatsApp Status (30s / 60s), Instagram Reels (90s), Historias (60s), TikTok y duración personalizada.

## Cómo compilar y ejecutar
1. Descarga el archivo ZIP del proyecto desde el visor web.
2. Descomprime la carpeta y ábrela en **Android Studio**.
3. Deja que Gradle sincronice las dependencias (\`androidx.media3:media3-transformer:1.3.1\`).
4. Conecta tu teléfono Android o inicia un emulador y haz clic en **Run 'app'** (\`Shift + F10\`).
`,
  },
];
