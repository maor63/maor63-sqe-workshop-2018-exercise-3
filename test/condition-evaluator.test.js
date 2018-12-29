import assert from 'assert';
import {evaluate_code_conditions} from '../src/js/symbolic-substituter';

describe('The condition evaluator tests', () => {
    it('is eval 1 true if condition', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(3 > 2){}
                }`
            )),
            JSON.stringify([[true, 2]])
        );
    });
    it('is eval 1 false if condition', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(3 < 2){}
                }`
            )),
            JSON.stringify([[false, 2]])
        );
    });

    it('is eval 1 false if condition with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(a < 2){}
                }`
                , {a: 3})),
            JSON.stringify([[false, 2]])
        );
    });

    it('is eval 1 false if condition with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(a > 2){}
                }`
                , {a: 3})),
            JSON.stringify([[true, 2]])
        );
    });

    it('is eval 2 true and 1 false if condition with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(a > 2){}
                    if(a < 2) {}
                    if(a == 3){}
                }`
                , {a: 3})),
            JSON.stringify([[true, 2], [false, 3], [true, 4]])
        );
    });

    it('is eval if with else condition with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(a > 2){}
                    else{}
                }`
                , {a: 3})),
            JSON.stringify([[true, 2], [false, 3]])
        );
    });

    it('is eval if with else and else if condition with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    if(a > 2){}
                    else if(a== 2){}
                    else {}
                }`
                , {a: 1})),
            JSON.stringify([[false, 2], [false, 3], [true, 4]])
        );
    });

    it('is eval while with with input vector', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `function foo(a){
                    while(a > 2){}
                }`
                , {a: 1})),
            JSON.stringify([[false, 2]])
        );
    });

    it('is eval while with with input vector of global var', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `let a = 1;
                function foo(){
                    while(a > 2){}
                }`
                , {})),
            JSON.stringify([[false, 3]])
        );
    });

    it('is eval while with with input vector of global array var', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(
                `let a = [1];
                function foo(){
                    while(a[0] > 2){}
                }`
                , {})),
            JSON.stringify([[false, 3]])
        );
    });

    it('is parse very complicated', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
            function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) { 
                    c = c + 5;
                    return x + y + z + c;
                } else if (b < z * 2) { 
                    c = c + x + 5;
                    return x + y + z + c;
                } else { 
                    c = c + z + 5;
                    return x + y + z + c;
                }
            }
            `, {x: 1, y: 2, z: 3})),
            JSON.stringify([[false, 7], [true, 10], [false, 13]])
        );
    });

    it('is parse very complicated 2', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
            function foo(x, y, z){
                let a = x + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) { 
                    c = c + 5;
                    return x + y + z + c;
                } else if (b < z * 2) { 
                    c = c + x + 5;
                    return x + y + z + c;
                } else { 
                    c = c + z + 5;
                    return x + y + z + c;
                }
            }
            `, {x: 1, y: 2, z: 6})),
            JSON.stringify([[true, 7], [false, 10], [false, 13]])
        );
    });

    it('is parse very complicated 3', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
            function foo(x, y, z){
                let a = x[2] + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) { 
                    c = c + 5;
                    return x[2] + y + z + c;
                } else if (b < z * 2) { 
                    c = c + x[2] + 5;
                    return x[2] + y + z + c;
                } else { 
                    c = c + z + 5;
                    return x[2] + y + z + c;
                }
            }
            `, {x: [5, 8, 1, 2], y: 2, z: 6})),
            JSON.stringify([[true, 7], [false, 10], [false, 13]])
        );
    });

    it('is parse very complicated 4', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
            function foo(x, y, z){
                let a = x[2] + 1;
                let b = a + y;
                let c = 0;
                
                if (b < z) { 
                    c = c + 5;
                    return x[2] + y + z + c;
                } else if (b < z * 2) { 
                    c = c + x[2] + 5;
                    return x[2] + y + z + c;
                } else { 
                    c = c + z + 5;
                    return x[2] + y + z + c;
                }
                
                while (a < z) {
                    c = a + b;
                    z = c * 2;
                }
            }
            `, {x: [5, 8, 1, 2], y: 2, z: 6})),
            JSON.stringify([[true, 7], [false, 10], [false, 13], [true, 18]])
        );
    });
    it('is parse very complicated with while', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
                    function foo(x, y, z){
                            let a = x + 1;
                            let b = a + y;
                            let c = 0;
                            
                            while (a < z) {
                                c = a + b;
                                z = c * 2;
                            }
                            
                            return z;
                        }
                    
            `, {x: 1, y: 2, z: 6})),
            JSON.stringify([[true, 7]])
        );
    });

    it('is parse very complicated with array as param', () => {
        assert.equal(
            JSON.stringify(evaluate_code_conditions(`
            function foo(x, y, z){
                let a = x + 1;
                let b = a + y[0];
                let c = 0;
                
                if (b < z) { 
                    c = c + 5;
                    return x + y[0] + z + c;
                } else if (b < z * 2) { 
                    c = c + x + 5;
                    return x + y[0] + z + c;
                } else { 
                    c = c + z + 5;
                    return x + y[0] + z + c;
                }
            }
            `, {x: 1, y: [2,1], z: 3})),
            JSON.stringify([[false,7],[true,10],[false,13]])
        );
    });
});

