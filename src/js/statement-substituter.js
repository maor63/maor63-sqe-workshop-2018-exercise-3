import {evalExpression} from './expression-evaluator';
import {convertStringToParsedCode} from './code-analyzer';

let parseFunctions = {
    BlockStatement: parseBlockStatement,
    Program: parseBlockStatement,
    VariableDeclaration: parseVariableDeclaration,
    VariableDeclarator: parseVariableDeclarator,
    ExpressionStatement: parseExpressionStatement,
    FunctionDeclaration: parseFunctionDeclaration,
    WhileStatement: parseWhileStatement,
    IfStatement: parseIfStatement,
    ReturnStatement: parseReturnStatement,
};

function parseVariableDeclaration(parsedCode, varMap, evaluatedConditions) {
    parsedCode.declarations = parseStatementList(parsedCode.declarations, varMap, evaluatedConditions);
    return null;
}

function parseVariableDeclarator(parsedCode, varMap) {
    let name = evalExpression(parsedCode.id, varMap);
    let value = evalExpression(parsedCode.init, varMap);
    if (value !== '')
        varMap[name] = value;

    return parsedCode;
}

function isInputVectorAssignment(tokens, inputVector) {
    return (tokens[0] in inputVector || tokens[0].split('[')[0] in inputVector);
}

function parseExpressionStatement(parsedCode, varMap, inputVector) {
    let codeString = evalExpression(parsedCode.expression, varMap);
    let tokens = codeString.split(' ');
    if (tokens.length > 1 && isInputVectorAssignment(tokens, inputVector))
        parsedCode.expression = convertStringToParsedCode(codeString);
    else
        parsedCode.expression = undefined;
    return parsedCode;
}

function parseFunctionDeclaration(parsedCode, varMap, inputVector, evaluatedConditions) {
    parsedCode.body = substituteStatement(parsedCode.body, varMap, inputVector, evaluatedConditions);
    return parsedCode;
}

function parseBlockStatement(parsedCode, varMap, inputVector, evaluatedConditions) {
    let varMapCopy = JSON.parse(JSON.stringify(varMap));
    parsedCode.body = parseStatementList(parsedCode.body, varMapCopy, inputVector, evaluatedConditions);
    return parsedCode;
}

function notLocal(statement) {
    return !(statement.type === 'ExpressionStatement' && statement.expression === undefined);

}

function parseStatementList(statementList, varMap, inputVector, evaluatedConditions) {
    let filteredStatements = [];
    for (let i = 0; i < statementList.length; i++) {
        statementList[i] = substituteStatement(statementList[i], varMap, inputVector, evaluatedConditions);
        if (statementList[i] !== null && notLocal(statementList[i]))
            filteredStatements.push(statementList[i]);
    }
    return filteredStatements;
}

function parseWhileStatement(parsedCode, varMap, inputVector, evaluatedConditions, preIfConditions) {
    let condition = evalExpression(parsedCode.test, varMap);
    parsedCode.test = convertStringToParsedCode(condition);
    evaluatedConditions.push([condition, parsedCode.loc.start.line]);
    parsedCode.body = substituteStatement(parsedCode.body, varMap, inputVector, evaluatedConditions, preIfConditions);
    return parsedCode;
}

function parseIfStatement(parsedCode, varMap, inputVector, evaluatedConditions, preIfConditions) {
    let condition = evalExpression(parsedCode.test, varMap, false);
    parsedCode.test = convertStringToParsedCode(condition);
    let preConditions = '';
    let fullCondition = condition;
    if(preIfConditions.length > 0) {
        preConditions = '!({})'.format(preIfConditions.join(' || '));
        fullCondition = preConditions + ' && ' + condition;
    }

    console.log(fullCondition);
    preIfConditions.push(condition);
    evaluatedConditions.push([fullCondition, parsedCode.loc.start.line]);
    parsedCode.consequent = substituteStatement(parsedCode.consequent, varMap, inputVector, evaluatedConditions,preIfConditions);
    parsedCode.alternate = substituteStatement(parsedCode.alternate, varMap, inputVector, evaluatedConditions, preIfConditions);
    if(parsedCode.alternate && parsedCode.alternate.type !== 'IfStatement')
        evaluatedConditions.push(['!({})'.format(preIfConditions.join(' || ')), parsedCode.alternate.loc.start.line]);
    return parsedCode;
}

function parseReturnStatement(parsedCode, varMap, inputVector) {

    parsedCode.argument = convertStringToParsedCode(evalExpression(parsedCode.argument, varMap, inputVector));
    return parsedCode;
}

export function substituteStatement(parsedCode, varMap, inputVector, evaluatedConditions = [], preIfConditions = []) {
    if (parsedCode !== null && parsedCode.type in parseFunctions) {
        parsedCode = parseFunctions[parsedCode.type](parsedCode, varMap, inputVector, evaluatedConditions, preIfConditions);
        return parsedCode;
    }
    else
        return parsedCode;
}
