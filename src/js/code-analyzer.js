import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

function parseCode(codeToParse) {
    return esprima.parseScript(codeToParse, {loc: true});
}

function evalCode(codeToEval) {
    return escodegen.generate(codeToEval);
}

function convertStringToParsedCode(codeString) {
    let parsed = parseCode(codeString);
    return parsed.body[0].expression;
}

String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
        return typeof args[i] !== 'undefined' ? args[i++] : '';
    });
};

export {parseCode, evalCode, convertStringToParsedCode};
