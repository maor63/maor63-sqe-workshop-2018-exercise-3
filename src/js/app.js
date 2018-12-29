import $ from 'jquery';
import {extract_params, parse_arguments} from './symbolic-substituter';
import {buildGraph, convertGraphToDiagram} from './code-cfg_builder';
import * as flowchart from 'flowchart.js';

function getInputVector(inputArgs, codeToParse) {
    let argsValues = parse_arguments(inputArgs);
    let params = extract_params(codeToParse);
    let inputVector = {};
    for (let i = 0; i < argsValues.length; i++)
        inputVector[params[i]] = argsValues[i];
    return inputVector;
}

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let inputArgs = $('#inputVector').val();
        let codeToParse = $('#codePlaceholder').val();
        // let parsedCode = substitute_symbols(codeToParse);
        let inputVector = getInputVector(inputArgs, codeToParse);

        let graph = buildGraph(codeToParse, inputVector);
        let diagram = convertGraphToDiagram(graph);

        let chart = flowchart.parse(diagram);
        $('#codeParseResults').html('');
        chart.drawSVG('codeParseResults', {
            'flowstate' : {
                'red' : { 'fill' : 'red', 'font-size' : 12},
                'green' : { 'fill' : 'green', 'font-size' : 12},
            }
        });
    });
});
