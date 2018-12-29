import {parseCode} from './code-analyzer';
import {convertJsonChartToGraph} from './json-to-chart-convertor';
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

