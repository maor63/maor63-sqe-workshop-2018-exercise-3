import {convertStringToParsedCode, evalCode, parseCode} from './code-analyzer';
import {substituteStatement} from './statement-substituter';
import {evalExpression} from './expression-evaluator';

function substitute_symbols(inputCode, inputVector = {}) {
    let parsed = parseCode(inputCode);
    substituteStatement(parsed, {}, inputVector);
    return evalCode(parsed);
}

export function evaluate_code_conditions(inputCode, inputVector = {}) {
    let parsed = parseCode(inputCode);
    let conditions = [];
    let varMap = {};
    substituteStatement(parsed, varMap, inputVector, conditions);
    let res = [];
    let inputAndGlobalMap = Object.assign(inputVector, varMap);
    for (let i = 0; i < conditions.length; i++) {
        // console.log(evalExpression(convertStringToParsedCode(conditions[i][0]), inputAndGlobalMap));
        let evaluation = eval(evalExpression(convertStringToParsedCode(conditions[i][0]), inputAndGlobalMap));
        res.push([evaluation, conditions[i][1]]);
    }
    return res;
}

export function parse_arguments(argumentsString) {
    return eval('[' + argumentsString + ']');
}

export function extract_params(code) {
    let functionStart = code.indexOf('function');
    let startOfParams = code.indexOf('(', functionStart);
    let endOfParams = code.indexOf(')', startOfParams);
    let rawParams = code.slice(startOfParams + 1, endOfParams);
    rawParams = rawParams.split(' ').join('').split(',').join('","');
    return eval('["{}"]'.format(rawParams));
}

function isPredicate(parsedCodeLine) {
    return parsedCodeLine.includes('if') || parsedCodeLine.includes('while') || parsedCodeLine.includes('else');
}

export function markPredicates(parsedCodeLines, markRows) {
    for (let i = 0, markRowIndex = 0; i < parsedCodeLines.length; i++) {
        if (isPredicate(parsedCodeLines[i])) {
            let color = markRows[markRowIndex][0] ? 'green' : 'red';
            parsedCodeLines[i] = '<mark class="{}">{}</mark>'.format(color, parsedCodeLines[i]);
            markRowIndex++;
        }
    }
}

export {substitute_symbols};