import {parseCode, evalCode} from './code-analyzer';
import {graphGenerator} from './statement-parser';

class Graph {
    constructor() {
        this.edges = [];
        this.nodes = [];
    }

    addNode(data, type = 'assignment') {
        let name = this.nodes.length + 1;
        if (this.nodes.length > 0) {
            let lastNode = this.nodes[this.nodes.length - 1];
            if (lastNode.type === type) {
                lastNode.data.push(data);
                return lastNode.name;
            }
            // else if ('if statement' === type) {
            //     console.log('if statment');
            //     this.addEdge(name, name + 1, 'true');
            // }
            // else
            //     this.addEdge(name - 1, name);
        }
        this.nodes.push({name: name, data: [data], type: type});
        return name;
    }

    getLastNode() {
        return this.nodes.length;
    }

    addEdge(from, to, condition = '') {
        if(from === 0 || from === to)
            return;
        // if (this.edges.length > 0) {
        //     let lastEdge = this.edges[this.edges.length - 1];
        //     if (lastEdge.from === from && lastEdge.to === to && lastEdge.condition === condition)
        //         return;
        // }
        this.edges.push({from: from, to: to, condition: condition});
    }
}

export function extractGraphFromCode(code, inputVector) {
    let parsedCode = parseCode(code);
    let graph = new Graph();
    graphGenerator(parsedCode, graph, inputVector);
    // let lastNode = graph.getLastNode();
    // let currentNode = graph.addNode('end node', 'end');
    // graph.addEdge(lastNode, currentNode);
    return graph;
}

export const buildGraph = (code, inputVector) => {
    let parsedCode = parseCode(code);
    let edges = [];
    let nodes = [];
    let graph = extractGraphFromCode(parsedCode, inputVector);
};

