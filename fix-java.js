const fs = require('fs');
const path = require('path');

// VERSION değişimi yapılacak tüm dosyalar
const filesToFix = [
    'android/app/capacitor.build.gradle',
    'android/capacitor-cordova-android-plugins/build.gradle',
    'node_modules/@capacitor/android/capacitor/build.gradle',
    'node_modules/@capacitor-community/admob/android/build.gradle'
];

filesToFix.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');

        // VERSION_21 → VERSION_17
        content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');

        // kotlinOptions'da JavaVersion.VERSION_17 → "17" (string olmalı)
        content = content.replace(/jvmTarget\s*=\s*JavaVersion\.VERSION_17/g, 'jvmTarget = "17"');

        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', relPath);
    } else {
        console.log('Not found (skipped):', relPath);
    }
});
console.log('Done! Java 17 fixes applied.');
