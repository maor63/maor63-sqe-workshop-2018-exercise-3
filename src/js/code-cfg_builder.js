import {parseCode} from './code-analyzer';
import {convertFlowchartToGraph} from './statement-parser';
import * as esgraph from 'esgraph';
import * as js2flowchart from 'js2flowchart';
import * as Styx from 'styx';


export function extractGraphFromCode(code, inputVector) {
    let parsedCode = parseCode(code);
    // let graph = new Graph();
    // graphGenerator(esgraph(parsedCode)[0], graph, inputVector);
    // let lastNode = graph.getLastNode();
    // let currentNode = graph.addNode('end node', 'end');
    // graph.addEdge(lastNode, currentNode);

    var flowProgram = Styx.parse(parsedCode);
    var json = Styx.exportAsJson(flowProgram);

    // graphGenerator(json, graph, inputVector);



    return convertFlowchartToGraph(json);
}

export const buildGraph = (code, inputVector) => {
    let parsedCode = parseCode(code);
    let edges = [];
    let nodes = [];
    // let graph = extractGraphFromCode(parsedCode, inputVector);

};

