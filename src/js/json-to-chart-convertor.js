import {evalCode} from './code-analyzer';


function addNodeToGraph(node, graph) {
    if (!(node.id in graph.getNodeMap())) {
        if (node.type === 'Entry')
            graph.addNode(node.id, 'start', node.type);
        else if (node.type === 'SuccessExit')
            graph.addNode(node.id, 'end', node.type);
        else
            graph.addNode(node.id, node.data, node.type);
    }
}

function createNodeMap(flowGraph) {
    let nodeMap = {};

    for (let i = 0; i < flowGraph.nodes.length; i++) {
        let node = flowGraph.nodes[i];
        nodeMap[node.id] = node;

    }
    return nodeMap;
}

function generateGraph(flowGraph, graph, nodeMap) {
    for (let i = 0; i < flowGraph.edges.length; i++) {
        let edge = flowGraph.edges[i];
        edgeParser(edge, graph, nodeMap);
    }
    let lastEdge = graph.getLastEdge();
    addNodeToGraph(nodeMap[lastEdge.to], graph);
}

export function convertJsonChartToGraph(flowchart) {
    flowchart = JSON.parse(flowchart);
    let functionJson = flowchart.functions[0];
    let graph = new Graph();
    if (functionJson === undefined)
        return graph;
    let flowGraph = functionJson.flowGraph;
    let nodeMap = createNodeMap(flowGraph);
    generateGraph(flowGraph, graph, nodeMap);
    return graph;
}

let edgeDataParseFunctions = {
    'VariableDeclarator': VariableDeclaratorEdge,
    'AssignmentExpression': AssignmentExpressionEdge,
};


function VariableDeclaratorEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = 'let ' + evalCode(edge.data);
    nodeMap[edge.from].type = 'assignment';
    addNodeToGraph(nodeMap[edge.from], graph);
    graph.addEdge(edge.from, edge.to, '');
}

function AssignmentExpressionEdge(edge, graph, nodeMap) {
    if (edge.label.indexOf('param') !== -1) {
        addNodeToGraph(nodeMap[edge.from], graph);
        graph.addEdge(edge.from, edge.to, '');
    }
    else {

        nodeMap[edge.from].data = evalCode(edge.data);
        nodeMap[edge.from].type = 'assignment';
        addNodeToGraph(nodeMap[edge.from], graph);
        graph.addEdge(edge.from, edge.to, '');
    }
}

function parseNormalEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = evalCode(edge.data);
    addNodeToGraph(nodeMap[edge.from], graph);
    graph.addEdge(edge.from, edge.to, '');
}

function parseFalseConditionalEdge(edge, graph, nodeMap) {
    nodeMap[edge.from].data = evalCode(edge.data);
    addNodeToGraph(nodeMap[edge.from], graph);
    graph.addEdge(edge.from, edge.to, 'false');
}

function parseEpsilonEdge(edge, graph, nodeMap) {
    addNodeToGraph(nodeMap[edge.from], graph);
    graph.addEdge(edge.from, edge.to, '');
}

function parseConditionalEdge(edge, graph, nodeMap) {
    if (!('data' in nodeMap[edge.from])) {
        nodeMap[edge.from].data = evalCode(edge.data);
        nodeMap[edge.from].type = 'Conditional';
    }
    let condition = edge.from + 1 === edge.to ? 'true' : 'false';
    addNodeToGraph(nodeMap[edge.from], graph);
    graph.addEdge(edge.from, edge.to, condition);
}

function edgeParser(edge, graph, nodeMap) {
    // console.log(edge.type);
    if (edge.type === 'Conditional') {
        parseConditionalEdge(edge, graph, nodeMap);

    } else if (edge.type === 'Epsilon') {
        parseEpsilonEdge(edge, graph, nodeMap);
    }
    else {
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
        let lastNode = this.nodes[this.nodes.length - 1];
        if (lastNode !== undefined && type === 'assignment' && lastNode.type === type && lastNode.name + 1 === name) {
            lastNode.data.push(data);
            let oldName = lastNode.name;
            lastNode.name = name;

            this._fixEdges(oldName, name);
        }
        else {
            this.nodes.push({name: name, data: [data], type: type});
        }
        return name;
    }

    _fixEdges(oldName, name) {
        let newEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if (edge.to === oldName) {
                edge.to = name;
                newEdges.push(edge);
            } else if (edge.from === oldName) {
                edge.from = name;
            }
            else
                newEdges.push(edge);
        }
        this.edges = newEdges;
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

    getNodeOutEdges(nodeName){
        let outEdges = [];
        for (let i = 0; i < this.edges.length; i++) {
            let edge = this.edges[i];
            if(edge.from === nodeName)
                outEdges.push(edge);
        }
        return outEdges;
    }
}

