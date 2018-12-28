import {parseCode} from './code-analyzer';
import {convertJsonChartToGraph} from './statement-parser';
import * as esgraph from 'esgraph';
import * as js2flowchart from 'js2flowchart';
import * as Styx from 'styx';


export function extractGraphFromCode(code, inputVector) {
    let parsedCode = parseCode(code);

    let flowProgram = Styx.parse(parsedCode);
    let json = Styx.exportAsJson(flowProgram);
    return convertJsonChartToGraph(json);
}

export const buildGraph = (code, inputVector) => {
    let parsedCode = parseCode(code);
    let edges = [];
    let nodes = [];
    // let graph = extractGraphFromCode(parsedCode, inputVector);

};

