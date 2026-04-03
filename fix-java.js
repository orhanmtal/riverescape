const fs = require('fs');
const path = require('path');

const filesToFix = [
    'android/app/capacitor.build.gradle',
    'android/capacitor-cordova-android-plugins/build.gradle',
    'node_modules/@capacitor/android/capacitor/build.gradle'
];

filesToFix.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        content = content.replace(/JavaVersion\.VERSION_21/g, 'JavaVersion.VERSION_17');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', relPath);
    } else {
        console.log('Not found:', relPath);
    }
});
console.log('Done!');
