import assert from 'assert';
import {buildGraph, extractGraphFromCode} from '../src/js/code-cfg_builder';

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

    it('is build graph from empty function with if with var declaration and else and else if and return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                if(b > 3){
                    let c = a + 6;
                }else if(b == 6){
                    a = 7;
                    let r = 3;
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
                    {'from': 9, 'to': 18, 'condition': ''},
                    {'from': 11, 'to': 13, 'condition': 'true'},
                    {'from': 11, 'to': 15, 'condition': 'false'},
                    {'from': 13, 'to': 17, 'condition': ''},
                    {'from': 15, 'to': 17, 'condition': ''},
                    {'from': 17, 'to': 18, 'condition': ''},
                    {'from': 18, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment'},
                    {'name': 8, 'data': ['b > 3'], 'type': 'Conditional'},
                    {'name': 9, 'data': ['let c = a + 6'], 'type': 'assignment'},
                    {'name': 11, 'data': ['b == 6'], 'type': 'Conditional'},
                    {'name': 13, 'data': ['a = 7', 'let r = 3'], 'type': 'assignment'},
                    {'name': 15, 'data': ['let c = 2'], 'type': 'assignment'},
                    {'name': 17, 'data': [null], 'type': 'Normal'},
                    {'name': 18, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from function with while', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                while(a < 2){
                    a = 5;
                }
                return a;
            }`)),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 10, 'condition': 'false'},
                    {'from': 9, 'to': 8, 'condition': ''},
                    {'from': 10, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment'},
                    {'name': 8, 'data': ['a < 2'], 'type': 'Conditional'},
                    {'name': 9, 'data': ['a = 5'], 'type': 'assignment'},
                    {'name': 10, 'data': ['return a;'], 'type': 'Normal'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit'}
                ]
            })
        );
    });

    it('is build graph from function with while and paint', () => {
        assert.equal(
            JSON.stringify(buildGraph(`
            function foo(a){
                let b = 1;
                while(a < 2){
                    b = 5;
                }
                return a;
            }`, {'a': 1})),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 10, 'condition': 'false'},
                    {'from': 9, 'to': 8, 'condition': ''},
                    {'from': 10, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry', 'color': 'green'},
                    {'name': 7, 'data': ['let b = 1'], 'type': 'assignment', 'color': 'green'},
                    {'name': 8, 'data': ['a < 2'], 'type': 'Conditional', 'color': 'green'},
                    {'name': 9, 'data': ['b = 5'], 'type': 'assignment', 'color': 'green'},
                    {'name': 10, 'data': ['return a;'], 'type': 'Normal', 'color': 'red'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit', 'color': 'red'}
                ]
            })
        );
    });

    it('is build graph from function with while and paint', () => {
        assert.equal(
            JSON.stringify(buildGraph(`
            function foo(a){
                let b = 1;
                while(a < 2){
                    b = 5;
                }
                return a;
            }`, {'a': 5})),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 10, 'condition': 'false'},
                    {'from': 9, 'to': 8, 'condition': ''},
                    {'from': 10, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry', 'color': 'green'},
                    {'name': 7, 'data': ['let b = 1'], 'type': 'assignment', 'color': 'green'},
                    {'name': 8, 'data': ['a < 2'], 'type': 'Conditional', 'color': 'red'},
                    {'name': 9, 'data': ['b = 5'], 'type': 'assignment', 'color': 'red'},
                    {'name': 10, 'data': ['return a;'], 'type': 'Normal', 'color': 'green'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit', 'color': 'green'}
                ]
            })
        );
    });


    it('is build graph from empty function with if with var declaration and else and else if and return paint', () => {
        assert.equal(
            JSON.stringify(buildGraph(`
            function foo(b){
                let a = 1;
                if(b > 3){
                    let c = a + 6;
                }else if(b == 6){
                    a = 7;
                    let r = 3;
                }
                else{
                    let c = 2;
                }
                return a;
            }`, {'b': 2})),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 11, 'condition': 'false'},
                    {'from': 9, 'to': 18, 'condition': ''},
                    {'from': 11, 'to': 13, 'condition': 'true'},
                    {'from': 11, 'to': 15, 'condition': 'false'},
                    {'from': 13, 'to': 17, 'condition': ''},
                    {'from': 15, 'to': 17, 'condition': ''},
                    {'from': 17, 'to': 18, 'condition': ''},
                    {'from': 18, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry', 'color': 'green'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment', 'color': 'green'},
                    {'name': 8, 'data': ['b > 3'], 'type': 'Conditional', 'color': 'red'},
                    {'name': 9, 'data': ['let c = a + 6'], 'type': 'assignment', 'color': 'red'},
                    {'name': 11, 'data': ['b == 6'], 'type': 'Conditional', 'color': 'red'},
                    {'name': 13, 'data': ['a = 7', 'let r = 3'], 'type': 'assignment', 'color': 'red'},
                    {'name': 15, 'data': ['let c = 2'], 'type': 'assignment', 'color': 'green'},
                    {'name': 17, 'data': [null], 'type': 'Normal', 'color': 'green'},
                    {'name': 18, 'data': ['return a;'], 'type': 'Normal', 'color': 'green'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit', 'color': 'green'}
                ]
            })
        );
    });

    it('is paint graph from empty function with if with var declaration and else and else if and return paint v2', () => {
        assert.equal(
            JSON.stringify(buildGraph(`
            function foo(b){
                let a = 1;
                if(b > 3){
                    let c = a + 6;
                }else if(b == 6){
                    a = 7;
                    let r = 3;
                }
                else{
                    let c = 2;
                }
                return a;
            }`, {'b': 6})),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 11, 'condition': 'false'},
                    {'from': 9, 'to': 18, 'condition': ''},
                    {'from': 11, 'to': 13, 'condition': 'true'},
                    {'from': 11, 'to': 15, 'condition': 'false'},
                    {'from': 13, 'to': 17, 'condition': ''},
                    {'from': 15, 'to': 17, 'condition': ''},
                    {'from': 17, 'to': 18, 'condition': ''},
                    {'from': 18, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry', 'color': 'green'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment', 'color': 'green'},
                    {'name': 8, 'data': ['b > 3'], 'type': 'Conditional', 'color': 'green'},
                    {'name': 9, 'data': ['let c = a + 6'], 'type': 'assignment', 'color': 'green'},
                    {'name': 11, 'data': ['b == 6'], 'type': 'Conditional', 'color': 'red'},
                    {'name': 13, 'data': ['a = 7', 'let r = 3'], 'type': 'assignment', 'color': 'red'},
                    {'name': 15, 'data': ['let c = 2'], 'type': 'assignment', 'color': 'red'},
                    {'name': 17, 'data': [null], 'type': 'Normal', 'color': 'red'},
                    {'name': 18, 'data': ['return a;'], 'type': 'Normal', 'color': 'green'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit', 'color': 'green'}
                ]
            })
        );
    });

    it('is paint graph from empty function with if with var declaration and else and else if and return paint v2', () => {
        assert.equal(
            JSON.stringify(buildGraph(`
            function foo(b){
                let a = 1;
                if(b < 3){
                    let c = a + 6;
                }else if(b == 6){
                    a = 7;
                    let r = 3;
                }
                else{
                    let c = 2;
                }
                return a;
            }`, {'b': 6})),
            JSON.stringify({
                'edges': [
                    {'from': 4, 'to': 7, 'condition': ''},
                    {'from': 7, 'to': 8, 'condition': ''},
                    {'from': 8, 'to': 9, 'condition': 'true'},
                    {'from': 8, 'to': 11, 'condition': 'false'},
                    {'from': 9, 'to': 18, 'condition': ''},
                    {'from': 11, 'to': 13, 'condition': 'true'},
                    {'from': 11, 'to': 15, 'condition': 'false'},
                    {'from': 13, 'to': 17, 'condition': ''},
                    {'from': 15, 'to': 17, 'condition': ''},
                    {'from': 17, 'to': 18, 'condition': ''},
                    {'from': 18, 'to': 5, 'condition': ''}
                ],
                'nodes': [
                    {'name': 4, 'data': ['start'], 'type': 'Entry', 'color': 'green'},
                    {'name': 7, 'data': ['let a = 1'], 'type': 'assignment', 'color': 'green'},
                    {'name': 8, 'data': ['b < 3'], 'type': 'Conditional', 'color': 'red'},
                    {'name': 9, 'data': ['let c = a + 6'], 'type': 'assignment', 'color': 'red'},
                    {'name': 11, 'data': ['b == 6'], 'type': 'Conditional', 'color': 'green'},
                    {'name': 13, 'data': ['a = 7', 'let r = 3'], 'type': 'assignment', 'color': 'green'},
                    {'name': 15, 'data': ['let c = 2'], 'type': 'assignment', 'color': 'red'},
                    {'name': 17, 'data': [null], 'type': 'Normal', 'color': 'green'},
                    {'name': 18, 'data': ['return a;'], 'type': 'Normal', 'color': 'green'},
                    {'name': 5, 'data': ['end'], 'type': 'SuccessExit', 'color': 'green'}
                ]
            })
        );
    });

});
