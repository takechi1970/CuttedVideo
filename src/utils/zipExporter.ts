import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';
import { SegmentInfo } from '../types';

/**
 * Script POSIX portable para gradlew en macOS / Linux
 */
const GRADLEW_SH_CONTENT = `#!/bin/sh
# CuttedVideo - Gradle wrapper bootstrap script for macOS & Linux
set -e

DIRNAME=$(cd "$(dirname "$0")" && pwd)

# 1. Si gradle está instalado en el sistema (ej. brew install gradle), usarlo directamente
if command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
fi

# 2. Localizar comando Java
if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
elif command -v java >/dev/null 2>&1; then
    JAVACMD="java"
else
    echo "ERROR: No se encontró Java. Asegúrate de instalar JDK 17 (ej. brew install openjdk@17)." >&2
    exit 1
fi

WRAPPER_JAR="$DIRNAME/gradle/wrapper/gradle-wrapper.jar"

# Verificar si el archivo JAR existe y tiene un tamaño válido (> 20KB)
if [ -f "$WRAPPER_JAR" ]; then
    JAR_SIZE=$(wc -c < "$WRAPPER_JAR" 2>/dev/null || echo 0)
    if [ "$JAR_SIZE" -lt 20000 ]; then
        rm -f "$WRAPPER_JAR"
    fi
fi

if [ ! -f "$WRAPPER_JAR" ]; then
    echo "==> Descargando Gradle Wrapper oficial..."
    mkdir -p "$DIRNAME/gradle/wrapper"
    curl -sLo "$WRAPPER_JAR" "https://repo.gradle.org/artifactory/libs-releases/org/gradle/gradle-wrapper/8.7/gradle-wrapper-8.7.jar" 2>/dev/null || true
fi

if [ -f "$WRAPPER_JAR" ] && [ $(wc -c < "$WRAPPER_JAR" 2>/dev/null || echo 0) -gt 20000 ]; then
    exec "$JAVACMD" -jar "$WRAPPER_JAR" "$@"
else
    echo "Aviso: Para compilar directamente en Mac, instala Gradle con: brew install gradle"
    echo "Luego ejecuta: gradle assembleDebug"
    echo "O abre la carpeta en Android Studio para compilar con un solo clic."
    exit 1
fi
`;

const GRADLEW_BAT_CONTENT = `@rem CuttedVideo - Gradle wrapper script for Windows
@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
if "%DIRNAME%" == "" set DIRNAME=.\\

where gradle >nul 2>nul
if %ERRORLEVEL% equ 0 (
    gradle %*
    exit /b %ERRORLEVEL%
)

where java >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: No se encontro Java en el sistema. Instala JDK 17.
    exit /b 1
)

set WRAPPER_JAR=%DIRNAME%gradle\\wrapper\\gradle-wrapper.jar
if not exist "%WRAPPER_JAR%" (
    echo Configurando Gradle Wrapper...
    if not exist "%DIRNAME%gradle\\wrapper" mkdir "%DIRNAME%gradle\\wrapper"
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('https://raw.githubusercontent.com/gradle/gradle/v8.7.0/gradle/wrapper/gradle-wrapper.jar', '%WRAPPER_JAR%')"
)

java -jar "%WRAPPER_JAR%" %*
`;

/**
 * Downloads a complete, ready-to-open Android Studio project as a ZIP archive.
 */
export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();
  const rootFolder = zip.folder('CuttedVideo-Android') || zip;

  // Add source and build files
  for (const file of ANDROID_PROJECT_FILES) {
    rootFolder.file(file.path, file.content);
  }

  // Generate .gitignore
  rootFolder.file(
    '.gitignore',
    `*.iml
.gradle
/local.properties
/.idea/caches
/.idea/libraries
/.idea/modules.xml
/.idea/workspace.xml
.DS_Store
/build
/captures
.externalNativeBuild
.cxx
local.properties
`
  );

  // Generate gradle wrapper properties
  rootFolder.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // Generate gradle.properties (Fixes 512MB heap memory error and enables AndroidX)
  rootFolder.file(
    'gradle.properties',
    `# Gradle memory settings - prevents JVM GC thrashing
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
`
  );

  // Add executable gradlew for macOS / Linux with 755 unix permissions
  rootFolder.file('gradlew', GRADLEW_SH_CONTENT, {
    unixPermissions: '755',
  });

  // Add gradlew.bat for Windows
  rootFolder.file('gradlew.bat', GRADLEW_BAT_CONTENT);

  const rawBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    platform: 'UNIX',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const blob = new Blob([rawBlob], { type: 'application/zip' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'CuttedVideo-Android-Studio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Keep ObjectURL alive for 60 seconds to prevent premature cancellation by browser download manager
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 60000);
}

/**
 * Downloads all processed video clips packaged into a single ZIP archive.
 */
export async function downloadClipsZip(segments: SegmentInfo[], baseName: string = 'VideoSplit'): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Movies/VideoSplit') || zip;

  for (const seg of segments) {
    if (seg.blob) {
      folder.file(seg.fileName, seg.blob);
    }
  }

  const rawBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip',
    compression: 'STORE',
  });
  const blob = new Blob([rawBlob], { type: 'application/zip' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `${baseName}_clips.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 60000);
}
