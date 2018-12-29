import {parseCode} from './code-analyzer';
import {convertJsonChartToGraph} from './json-to-chart-convertor';
import * as Styx from 'styx';
import {evaluate_code_conditions} from './symbolic-substituter';


export function extractGraphFromCode(code) {
    let parsedCode = parseCode(code);

    let flowProgram = Styx.parse(parsedCode);
    let json = Styx.exportAsJson(flowProgram);
    return convertJsonChartToGraph(json);
}

export const buildGraph = (code, inputVector) => {

    let graph = extractGraphFromCode(code);
    let markedRows = evaluate_code_conditions(code, inputVector);
    paintGraph(graph, markedRows);
    return graph;

};

function paintNotPaintedNodeWhitRed(graph) {
    for (let node of graph.nodes) {
        if (!('color' in node))
            node.color = 'red';
    }
}

function paintConditionalNode(markedRows, markedRowsIndex, currentNode, nodeMap, outEdges) {
    let res = markedRows[markedRowsIndex][0];
    if (res)
        currentNode = nodeMap[outEdges[0].to];
    else {
        currentNode.color = 'red';
        currentNode = nodeMap[outEdges[1].to];
    }
    return currentNode;
}

function paintPath(currentNode, graph, nodeMap, markedRows) {
    let markedRowsIndex = 0;
    while (currentNode.id !== 5) {
        if ('color' in currentNode)
            break;
        currentNode.color = 'green';
        let outEdges = graph.getNodeOutEdges(currentNode.name);
        if (outEdges.length === 0)
            break;
        if (currentNode.type !== 'Conditional') {
            currentNode = nodeMap[outEdges[0].to];
        } else {
            currentNode = paintConditionalNode(markedRows, markedRowsIndex++, currentNode, nodeMap, outEdges);
        }
    }
}

function paintGraph(graph, markedRows) {
    let nodeMap = graph.getNodeMap();
    let currentNode = nodeMap[4];
    paintPath(currentNode, graph, nodeMap, markedRows);
    paintNotPaintedNodeWhitRed(graph);
}

