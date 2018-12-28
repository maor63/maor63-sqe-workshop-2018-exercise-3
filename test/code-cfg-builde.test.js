import assert from 'assert';
import {extractGraphFromCode} from '../src/js/code-cfg_builder';

describe('The javascript parser', () => {
    it('is build graph from empty code', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode('')),
            JSON.stringify({edges: [], nodes: []})
        );
    });

    it('is build graph from empty function code', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(){}`)),
            JSON.stringify({
                edges: [{'from': 4, 'to': 5, 'condition': ''}],
                nodes: [{'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}]
            })
        );
    });

    it('is build graph from empty function with parameters and return code', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                return a
            }`)),
            JSON.stringify({
                edges: [{'from': 4, 'to': 7, 'condition': ''}, {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 5, 'condition': ''}],
                nodes: [{'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment'},
                    {'name': 8, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'},
                ],
            })
        );
    });

    it('is build graph from empty function with var declaration', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
            }`)),
            JSON.stringify({
                edges: [{'from': 4, 'to': 7, 'condition': ''}, {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 5, 'condition': ''}],
                nodes: [{'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment'},
                    {'name': 8, 'data': ['return undefined;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'},
                ],
            })
        );
    });

    it('is build graph from empty function with multi var declaration', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                let b = "hi";
                let c;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 9, 'condition': ''},
                    {'from': 9, 'to': 10, 'condition': ''},
                    {'from': 10, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 9, 'data': ['let a = 1', 'let b = \'hi\'', 'let c'], 'type': 'assignment'},
                    {'name': 10, 'data': ['return undefined;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from empty function with multi var declaration and return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                let b = "hi";
                let c;
                return a;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 9, 'condition': ''},
                    {'from': 9, 'to': 10, 'condition': ''},
                    {'from': 10, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 9, 'data': ['let a = 1', 'let b = \'hi\'', 'let c'], 'type': 'assignment'},
                    {'name': 10, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from empty function with simple if return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                let b = "hi";
                let c;
                if(b > 3){}
                return a;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 9, 'condition': ''},
                    {'from': 9, 'to': 10, 'condition': ''},
                    {'from': 10, 'to': 11, 'condition': 'true'},
                    {'from': 10, 'to': 12, 'condition': 'false'},
                    {'from': 11, 'to': 12, 'condition': ''},
                    {'from': 12, 'to': 5, 'condition': ''}
                ],
                'nodes': [{'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 9, 'data': ['let a = 1', 'let b = \'hi\'', 'let c'], 'type': 'assignment'},
                    {'name': 10, 'data': ['b > 3'], 'type': 'Conditional'},
                    {'name': 11, 'data': [null], 'type': 'Normal'},
                    {'name': 12, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from empty function with if with var declaration and return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                a = 3;
                if(b > 3){
                    let c = a + 6;
                }
                return a;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': ''},
                    {'from': 9, 'to': 10, 'condition': 'true'},
                    {'from': 9, 'to': 12, 'condition': 'false'},
                    {'from': 10, 'to': 12, 'condition': ''},
                    {'from': 12, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 8, 'data': ['let a = 1', 'a = 3'], 'type': 'assignment'},
                    {'name': 9, 'data': ['b > 3'], 'type': 'Conditional'},
                    {'name': 10, 'data': ['let c = a + 6'], 'type': 'assignment'},
                    {'name': 12, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from empty function with if with var declaration and else and return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                if(b > 3){
                    let c = a + 6;
                }
                else{
                    let c = 2;
                }
                return a;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 11, 'condition': 'false'},
                    {'from': 9, 'to': 13, 'condition': ''},
                    {'from': 11, 'to': 13, 'condition': ''},
                    {'from': 13, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment'},
                    {'name': 8, 'data': ['b > 3'], 'type': 'Conditional'},
                    {'name': 9, 'data': ['let c = a + 6'], 'type': 'assignment'},
                    {'name': 11, 'data': ['let c = 2'], 'type': 'assignment'},
                    {'name': 13, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

});
