
const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');

const code = fs.readFileSync('stealer.js', 'utf8');

const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,

    controlFlowFlattening: false,
    deadCodeInjection: false,

    stringArray: false,
    splitStrings: false,

    renameGlobals: false,
    renameProperties: false,

    identifierNamesGenerator: 'hexadecimal',

    selfDefending: false,
    debugProtection: false,

    disableConsoleOutput: true,

    transformObjectKeys: false,
    unicodeEscapeSequence: false,

    ignoreRequireImports: true
});

fs.writeFileSync('stealer-obf.js', result.getObfuscatedCode());

console.log('done');
