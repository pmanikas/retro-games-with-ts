// tsc first then run the build script
const tsc = require('typescript');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const tsConfig = path.resolve(__dirname, '../tsconfig.json');
const tsConfigJson = require(tsConfig);
const outDir = path.resolve(__dirname, '../dist');
const srcDir = path.resolve(__dirname, '../games');
const files = fs.readdirSync(srcDir);
const tsFiles = files.filter(file => file.endsWith('.ts'));
const jsFiles = files.filter(file => file.endsWith('.js'));

rimraf.sync(outDir);
fs.mkdirSync(outDir);

tsFiles.forEach(file => {
    const filePath = path.resolve(srcDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const {
        outputText,
        diagnostics,
    } = tsc.transpileModule(content, {
        compilerOptions: tsConfigJson.compilerOptions,
        fileName: filePath,
    });

    if (diagnostics && diagnostics.length) {
        console.error(diagnostics);
        process.exit(1);
    }

    const jsFile = file.replace('.ts', '.js');

    fs.writeFileSync(path.resolve(outDir, jsFile), outputText);

    console.log(`Transpiled ${file} to ${jsFile}`);
});

jsFiles.forEach(file => {
    const filePath = path.resolve(srcDir, file);
    fs.copyFileSync(filePath, path.resolve(outDir, file));
    console.log(`Copied ${file}`);
}
);

console.log('Build complete');

