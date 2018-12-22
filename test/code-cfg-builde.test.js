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
            JSON.stringify({edges: [], nodes: []})
        );
    });

    it('is build graph from empty function with parameters and return code', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                return a
            }`)),
            JSON.stringify({
                edges: [],
                nodes: [{name: 1, data: ['return a;'], type: 'return'},

                ]
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
                edges: [],
                nodes: [
                    {name: 1, data: ['let a = 1;'], type: 'assignment'},
                ]
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
                edges: [],
                nodes: [
                    {name: 1, data: ['let a = 1;', 'let b = \'hi\';', 'let c;'], type: 'assignment'},]
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
                edges: [
                    {from: 1, to: 2, condition: ''},
                ],
                nodes: [{name: 1, data: ['let a = 1;', 'let b = \'hi\';', 'let c;'], type: 'assignment'},
                    {name: 2, data: ['return a;'], type: 'return'}
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
                edges: [
                    {from: 1, to: 2, condition: ''},
                    {from: 2, to: 3, condition: ''},
                ],
                nodes: [{
                    name: 1, data: ['let a = 1;', 'let b = \'hi\';', 'let c;']
                    , type: 'assignment'
                }
                    , {name: 2, data: ['b > 3'], type: 'condition'}
                    , {name: 3, data: ['return a;'], type: 'return'}
                ]
            })
        );
    });

    it('is build graph from empty function with if with var declaration and return', () => {
        assert.equal(
            JSON.stringify(extractGraphFromCode(`
            function foo(a){
                let a = 1;
                if(b > 3){
                    let c = a + 6;
                }
                return a;
            }`)),
            JSON.stringify({
                edges: [
                    {from: 1, to: 2, condition: ''},
                    {from: 2, to: 3, condition: 'true'},
                    {from: 3, to: 4, condition: ''},
                    {from: 2, to: 4, condition: ''},
                ],
                nodes: [
                    {name: 1, data: ['let a = 1;'], type: 'assignment'}
                    , {name: 2, data: ['b > 3'], type: 'condition'}
                    , {name: 3, data: ['let c = a + 6;'], type: 'assignment'}
                    , {name: 4, data: ['return a;'], type: 'return'}
                ]
            })
        );
    });

});
