import {evalCode} from './code-analyzer';

let parseFunctions = {
    BlockStatement: parseBlockStatement,
    Program: parseBlockStatement,
    VariableDeclaration: parseVariableDeclaration,
    ExpressionStatement: parseExpressionStatement,
    FunctionDeclaration: parseFunctionDeclaration,
    WhileStatement: parseWhileStatement,
    IfStatement: parseIfStatement,
    ReturnStatement: parseReturnStatement,
};

function addNewsEdges(previousNodes, currentNode, graph) {
    if (previousNodes) {
        // console.log('prev nodes = ' + JSON.stringify(previousNodes));
        for (let i = 0; i < previousNodes.length; i++) {
            let previousNode = previousNodes[i];
            let condition = '';
            if (previousNode.type === 'condition true')
                condition = 'true';
            else if (previousNode.type === 'condition false')
                condition = 'false';
            graph.addEdge(previousNode.name, currentNode, condition);
        }
    }
}

function parseVariableDeclaration(parsedCode, graph, previousNodes) {
    let currentNode = graph.addNode(evalCode(parsedCode));
    addNewsEdges(previousNodes, currentNode, graph);
    return [{name: currentNode, type: 'assignment'}];
}

function parseExpressionStatement(parsedCode, graph, previousNode) {
    return null;
}

function parseFunctionDeclaration(parsedCode, graph, previousNodes) {
    console.log('parseFunctionDeclaration');
    return graphGenerator(parsedCode.body, graph, previousNodes);
}

function parseBlockStatement(parsedEsgraphNode, graph, previousNodes) {
    // graph.resetBlock();
    // return parseStatementList(parsedEsgraphNode.body, graph, previousNodes);
    graphGenerator(parsedEsgraphNode.normal, graph, previousNodes);
    return null;
}

function parseStatementList(statementList, graph, previousNodes) {
    let lastNode = previousNodes;
    for (let i = 0; i < statementList.length; i++) {
        lastNode = graphGenerator(statementList[i], graph, lastNode);
    }
    return lastNode;
}

function parseWhileStatement(parsedCode, graph, inputVector) {
    return null;
}

function parseIfStatement(parsedCode, graph, previousNodes) {
    let nodeName = graph.addNode(evalCode(parsedCode.test), 'condition');

    let endTrueNode = nodeName;
    let endFalseNode = nodeName;
    addNewsEdges(previousNodes, nodeName, graph);

    let consequentNode = graphGenerator(parsedCode.consequent, graph, [{name: nodeName, type: 'condition true'}]);
    if (consequentNode) {
        endTrueNode = consequentNode[0].name;
    }
    if (parsedCode.alternate) {
        let alternateNode = graphGenerator(parsedCode.alternate, graph, [{name: nodeName, type: 'condition false'}]);
        if (alternateNode) {
            endTrueNode = alternateNode[0].name;
        }
    }

    // graph.addEdge(nodeName, graph.getLastNode() + 1);
    // parsedCode.alternate = substituteStatement(parsedCode.alternate);
    if (endTrueNode === endFalseNode)
        return [{name: endTrueNode, type: 'end condition'}];
    else
        return [{name: endTrueNode, type: 'end condition'}, {name: endFalseNode, type: 'end condition'}];
}

function parseReturnStatement(parsedCode, graph, previousNodes) {
    let currentNode = graph.addNode(evalCode(parsedCode), 'return');
    addNewsEdges(previousNodes, currentNode, graph);
    return [{name: currentNode, type: 'return'}];
}

export function graphGenerator(parsedEsgraphNode, graph, previousNodes = null) {
    console.log(parsedEsgraphNode.astNode);
    if (parsedEsgraphNode.astNode !== undefined && parsedEsgraphNode.astNode.type in parseFunctions) {
        return parseFunctions[parsedEsgraphNode.astNode.type](parsedEsgraphNode, graph, previousNodes);
    }
    else
        return null;
}
