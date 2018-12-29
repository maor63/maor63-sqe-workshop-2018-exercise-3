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

export function paintGraph(graph, markedRows) {
    let nodeMap = graph.getNodeMap();
    let currentNode = nodeMap[4];
    paintPath(currentNode, graph, nodeMap, markedRows);
    paintNotPaintedNodeWhitRed(graph);
}