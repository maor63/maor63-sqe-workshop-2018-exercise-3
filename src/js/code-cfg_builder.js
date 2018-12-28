import {parseCode} from './code-analyzer';
import {graphGenerator} from './statement-parser';
import * as esgraph from 'esgraph';

class Graph {
    constructor() {
        this.edges = [];
        this.nodes = [];
        this.reset_block = false;
    }

    addNode(data, type = 'assignment') {
        let name = this.nodes.length + 1;
        if(!this.reset_block) {
            if (this.nodes.length > 0) {
                let lastNode = this.nodes[this.nodes.length - 1];
                if (lastNode.type === type) {
                    lastNode.data.push(data);
                    return lastNode.name;
                }
            }
        }
        else
            this.reset_block = false;
        this.nodes.push({name: name, data: [data], type: type});
        return name;
    }

    resetBlock(){
        this.reset_block = true;
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
    // let graph = new Graph();
    // graphGenerator(esgraph(parsedCode)[0], graph, inputVector);
    // let lastNode = graph.getLastNode();
    // let currentNode = graph.addNode('end node', 'end');
    // graph.addEdge(lastNode, currentNode);

    let graph = esgraph(parsedCode);
    const dot = esgraph.dot(graph,{ counter: 1, source: graph[0] });
    return dot;
}

export const buildGraph = (code, inputVector) => {
    let parsedCode = parseCode(code);
    let edges = [];
    let nodes = [];
    // let graph = extractGraphFromCode(parsedCode, inputVector);

};

