import $ from 'jquery';
import {parseCode} from './code-analyzer';
import * as js2flowchart from 'js2flowchart';
import * as esgraph from 'esgraph/lib';
import * as Styx from "styx";

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let graph = esgraph(codeToParse);
        var flowProgram = Styx.parse(parsedCode);
        var json = Styx.exportAsJson(flowProgram);

        console.log(json);
        const dot = esgraph.dot(graph);
        // $('#image').html(json);
        $('#parsedCode').val(JSON.stringify(parsedCode, null, 2));
    });
});
