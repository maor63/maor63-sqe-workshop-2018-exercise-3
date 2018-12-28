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

export function convertFlowchartToGraph(flowchart) {
    flowchart = JSON.parse(flowchart);
    let functionJson = flowchart.functions[0];
    // console.log(functionJson);
    let graph = new Graph();
    if (functionJson === undefined)
        return graph;
    let flowGraph = functionJson.flowGraph;
    // console.log(flowGraph);
    let nodeMap = {};

    for (let i = 0; i < flowGraph.nodes.length; i++) {
        let node = flowGraph.nodes[i];
        nodeMap[node.id] = node;
    }
    // let edges = [];
    for (let i = 0; i < flowGraph.edges.length; i++) {
        let edge = flowGraph.edges[i];
        edgeParser(edge, graph, nodeMap);

    }
    let nodesIds = Object.keys(nodeMap);
    for (let i = 0; i < nodesIds.length; i++) {
        let node = nodeMap[nodesIds[i]];
        if (node.type === 'Entry')
            graph.addNode(node.id, 'start', node.type);
        else if (node.type === 'SuccessExit')
            graph.addNode(node.id, 'end', node.type);
        else
            graph.addNode(node.id, node.data, node.type);
    }
    graph.validateEdges();
    return graph;
}

let edgeDataParseFunctions = {
    'VariableDeclarator': VariableDeclaratorEdge,
};


function VariableDeclaratorEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = 'let ' + evalCode(edge.data);
    nodeMap[edge.from].type = 'assignment';
    graph.addEdge(edge.from, edge.to, '');
}

function parseNormalEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = evalCode(edge.data);
    graph.addEdge(edge.from, edge.to, '');
}

function parseFalseConditionalEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = evalCode(edge.data);
    graph.addEdge(edge.from, edge.to, 'false');
}

function parseEpsilonEdge(edge, graph, nodeMap) {
    graph.addEdge(edge.from, edge.to, '');
}

function parseConditionalEdge(edge, graph, nodeMap) {
    if(!('data' in nodeMap[edge.from]))
        nodeMap[edge.from].data = evalCode(edge.data);
    let condition = edge.label.startsWith('!') ? 'false' : 'true';
    graph.addEdge(edge.from, edge.to, condition);
}

function edgeParser(edge, graph, nodeMap) {
    // console.log(edge.type);
    if (edge.type === 'Conditional') {
        parseConditionalEdge(edge, graph, nodeMap);

    } else if(edge.type === 'Epsilon'){
        parseEpsilonEdge(edge, graph, nodeMap);
    }
    else
    {
        if (edge !== undefined && edge.data.type in edgeDataParseFunctions) {
            edgeDataParseFunctions[edge.data.type](edge, graph, nodeMap);
        }
        else
            parseNormalEdge(edge, graph, nodeMap);
    }
}


class Graph {
    constructor() {
        this.edges = [];
        this.nodes = [];
    }

    addNode(name, data, type = '') {
        // let name = this.nodes.length + 1;
        let lastNode = this.nodes[this.nodes.length - 1];
        if (lastNode !== undefined && type === 'assignment' && lastNode.type === type) {
            lastNode.data.push(data);

        }
        else {
            this.nodes.push({name: name, data: [data], type: type});
        }
        return name;
    }

    validateEdges() {
        let nodeMap = this.getNodeMap();
        let newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (!(edge.to in nodeMap)) {
                i = this.findNextExistsNode(i, nodeMap, newEdges);
            }
            else
                newEdges.push(edge);
        }
        this.edges = newEdges;
    }

    findNextExistsNode(startIndex, nodeMap, newEdges) {
        let edge = this.edges[startIndex];
        for (let j = startIndex + 1; j < this.edges.length; j++) {
            let nextEdge = this.edges[j];
            if (nextEdge.to in nodeMap) {
                console.log(nextEdge.to);
                edge.to = nextEdge.to;
                newEdges.push(edge);
                startIndex = j;
                break;
            }
        }
        return startIndex;
    }

    getNodeMap() {
        let nodeMap = {};
        for (let i = 0; i < this.nodes.length; i++) {
            nodeMap[this.nodes[i].name] = this.nodes[i];
        }
        return nodeMap;
    }

    getLastEdge() {
        return this.edges[this.edges.length - 1];
    }

    addEdge(from, to, condition = '') {
        this.edges.push({from: from, to: to, condition: condition});
    }
}

