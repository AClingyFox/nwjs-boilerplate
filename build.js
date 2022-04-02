const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const copyDirSync = require('copy-dir-sync');

throw new Error("Not ready yet! Please build manually.");
const buildsFolderPath = path.join(__dirname, '_builds');
const buildsFolderExists = fs.existsSync(buildsFolderPath);
if (buildsFolderExists === false) {
    fs.mkdirSync(buildsFolderPath);
}
const buildsFolderContents = fs.readdirSync(buildsFolderPath);
const buildsFolderIsEmpty = buildsFolderContents.length < 1;
if (buildsFolderIsEmpty === false) {
    buildsFolderContents.forEach(contentName => {
        const contentPath = path.join(buildsFolderPath, contentName);
        fs.rmSync(contentPath, { recursive: true, });
    });
}
const windowsBuildPath = path.join(buildsFolderPath, 'windows');
const macosBuildPath = path.join(buildsFolderPath, 'macos');
const linuxBuildPath = path.join(buildsFolderPath, 'linux');
fs.mkdirSync(windowsBuildPath);
fs.mkdirSync(macosBuildPath);
fs.mkdirSync(linuxBuildPath);
// TODO: Add support for building the .bin on linux/macos
const indexJsPath = path.join(__dirname, 'src', 'index.js');
const binName = '_binary.bin';
const binPath = path.join(buildsFolderPath, binName);
const nwjcPath = path.join(__dirname, 'node_modules', 'nw', 'nwjs', 'nwjc.exe');
const nwjcExists = fs.existsSync(nwjcPath);
if (!nwjcExists) {
    throw new Error("Tried to build a .bin but nwjc doesn't exist! Are you sure you're using the nwjs sdk?")
}
execSync(`${nwjcPath} ${indexJsPath} ${binPath}`, (err, stdout, stderr) => {
    if (err) {
        throw err;
    }
});
const nwjsNormalFolderName = '_nwjs';
const nwjsNormalTempFolderName = '_nwjs_temp';
const nwjsNormalFolderPath = path.join(buildsFolderPath, nwjsNormalFolderName);
const nwjsNormalTempFolderPath = path.join(buildsFolderPath, nwjsNormalTempFolderName);
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJsonSourceCode = fs.readFileSync(packageJsonPath, 'utf8');
const packageJsonObject = JSON.parse(packageJsonSourceCode);
const nwjsVersion = packageJsonObject.devDependencies.nw.slice(0, -4);
execSync(`npm install --prefix ${nwjsNormalTempFolderPath} nw@${nwjsVersion}`, (err, stdout, stderr) => {
    if (err) {
        throw err;
    }
    console.log('RAN')
});
const tempNwjsNormalPath = path.join(nwjsNormalTempFolderPath, 'node_modules', 'nw', 'nwjs');
// copyDirSync(tempNwjsNormalPath, nwjsNormalFolderPath)
// fs.rmSync(nwjsNormalTempFolderPath, { recursive: true, });
// Windows:
copyDirSync(tempNwjsNormalPath, windowsBuildPath);
const windowsBuildResourcesPath = path.join(windowsBuildPath, 'resources');
copyDirSync(tempNwjsNormalPath, windowsBuildResourcesPath);
const windowsBinPath = path.join(windowsBuildPath, binName)
fs.copyFileSync(binPath, windowsBinPath);


