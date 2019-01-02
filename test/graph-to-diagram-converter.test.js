import assert from 'assert';
import {buildGraph, convertGraphToDiagram} from '../src/js/code-cfg_builder';

describe('The Graph to diagram parser', () => {
    it('is build graph from empty code', () => {
        assert.equal(
            convertGraphToDiagram(buildGraph(`
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
            }`, {'b': 6})).toString(),
            `st=>start: Start
op1=>operation: (1) 
let a = 1 | green
cond1=>condition: (2) 
b < 3 | red
op2=>operation: (3) 
let c = a + 6 | red
cond2=>condition: (4) 
b == 6 | green
op3=>operation: (5) 
a = 7
let r = 3 | green
op4=>operation: (6) 
let c = 2 | red
op5=>operation: (7) 
return a; | green
e=>end: End
st->op1
op1->cond1
cond1(true)->op2
cond1(false)->cond2
op2->op5
cond2(true)->op3
cond2(false)->op4
op3->op5
op4->op5
op5->e`
        );
    });
});