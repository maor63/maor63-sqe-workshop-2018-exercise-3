import {parseCode} from './code-analyzer';
import {convertJsonChartToGraph} from './json-to-chart-convertor';
import * as Styx from 'styx';
import {evaluate_code_conditions} from './symbolic-substituter';
import {paintGraph} from './graph-painter';


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

function convertEntryNode(mapNodeToSign, node, output) {
    mapNodeToSign[node.name] = 'st';
    output.push('st=>start: Start');
}

function convertExitNode(mapNodeToSign, node, output) {
    mapNodeToSign[node.name] = 'e';
    output.push('e=>end: End');
}

function convertNodesToDiagram(nodes, mapNodeToSign, output) {
    let op = 1;
    let cond = 1;
    for (let node of nodes) {
        if (node.type === 'Entry') {
            convertEntryNode(mapNodeToSign, node, output);
        } else if (node.type === 'SuccessExit') {
            convertExitNode(mapNodeToSign, node, output);
        } else if (node.type === 'Conditional') {
            mapNodeToSign[node.name] = 'cond{}'.format(cond);
            output.push('cond{}=>condition: {} | {}'.format(cond, node.data, node.color));
            cond++;
        } else {
            mapNodeToSign[node.name] = 'op{}'.format(op);
            output.push('op{}=>operation: {} | {}'.format(op, node.data, node.color));
            op++;
        }

    }
}

function convertEdgesToDiargam(edges, output, mapNodeToSign) {
    for (let edge of edges) {
        if (edge.condition === '')
            output.push('{}->{}'.format(mapNodeToSign[edge.from], mapNodeToSign[edge.to]));
        else {
            output.push('{}({})->{}'.format(mapNodeToSign[edge.from], edge.condition, mapNodeToSign[edge.to]));
        }
    }
}

export function convertGraphToDiagram(graph) {
    let nodes = graph.nodes;
    let edges = graph.edges;
    let mapNodeToSign = {};
    let output = [];
    convertNodesToDiagram(nodes, mapNodeToSign, output);
    convertEdgesToDiargam(edges, output, mapNodeToSign);
    return output.join('\n');
}

