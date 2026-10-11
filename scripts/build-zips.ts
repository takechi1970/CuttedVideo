import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../src/data/androidProjectFiles';

const GRADLEW_SH_CONTENT = `#!/bin/sh
# CuttedVideo - Gradle wrapper bootstrap script for macOS & Linux
set -e

DIRNAME=$(cd "$(dirname "$0")" && pwd)

if command -v gradle >/dev/null 2>&1; then
    exec gradle "$@"
fi

if [ -n "$JAVA_HOME" ] && [ -x "$JAVA_HOME/bin/java" ]; then
    JAVACMD="$JAVA_HOME/bin/java"
elif command -v java >/dev/null 2>&1; then
    JAVACMD="java"
else
    echo "ERROR: No se encontró Java. Asegúrate de instalar JDK 17 (ej. brew install openjdk@17)." >&2
    exit 1
fi

WRAPPER_JAR="$DIRNAME/gradle/wrapper/gradle-wrapper.jar"

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
    echo "Aviso: Para compilar directamente en Mac o Linux, instala Gradle o abre la carpeta en Android Studio."
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

async function buildAndroidZip() {
  const zip = new JSZip();
  const root = zip.folder('CuttedVideo-Android') || zip;

  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  root.file(
    '.gitignore',
    `*.iml\n.gradle\n/local.properties\n/.idea/caches\n/.idea/libraries\n/.idea/modules.xml\n/.idea/workspace.xml\n.DS_Store\n/build\n/captures\n.externalNativeBuild\n.cxx\nlocal.properties\n`
  );

  root.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME\ndistributionPath=wrapper/dists\ndistributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip\nnetworkTimeout=10000\nvalidateDistributionUrl=true\nzipStoreBase=GRADLE_USER_HOME\nzipStorePath=wrapper/dists\n`
  );

  root.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -Dfile.encoding=UTF-8\nandroid.useAndroidX=true\nandroid.nonTransitiveRClass=true\n`
  );

  root.file('gradlew', GRADLEW_SH_CONTENT, { unixPermissions: '755' });
  root.file('gradlew.bat', GRADLEW_BAT_CONTENT);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    platform: 'UNIX',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  const outPath = path.resolve(process.cwd(), 'public/CuttedVideo-Android-Studio-Project.zip');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated Android ZIP: ${outPath} (${buffer.length} bytes)`);
}

async function buildFullSourceZip() {
  const zip = new JSZip();
  const root = zip.folder('CuttedVideo-Source') || zip;

  const baseDir = process.cwd();

  function addDirToZip(dirPath: string, zipFolder: JSZip) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === '.next' ||
        entry.name === 'public' ||
        entry.name.endsWith('.zip')
      ) {
        continue;
      }
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subFolder = zipFolder.folder(entry.name) || zipFolder;
        addDirToZip(fullPath, subFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(entry.name, content);
      }
    }
  }

  addDirToZip(baseDir, root);

  const buffer = await zip.generateAsync({ type: 'nodebuffer', platform: 'UNIX' });
  const outPath = path.resolve(process.cwd(), 'public/CuttedVideo-Full-Source-Code.zip');
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated Full Source ZIP: ${outPath} (${buffer.length} bytes)`);
}

async function run() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  await buildAndroidZip();
  await buildFullSourceZip();
  console.log('All ZIP files generated successfully.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
