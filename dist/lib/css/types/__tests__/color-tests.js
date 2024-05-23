"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const color_1 = require("../color");
const parser_1 = require("../../syntax/parser");
const parse = (value) => color_1.color.parse({}, parser_1.Parser.parseValue(value));
describe('types', () => {
    describe('<color>', () => {
        describe('parsing', () => {
            it('#000', () => (0, assert_1.strictEqual)(parse('#000'), (0, color_1.pack)(0, 0, 0, 1)));
            it('#0000', () => (0, assert_1.strictEqual)(parse('#0000'), (0, color_1.pack)(0, 0, 0, 0)));
            it('#000f', () => (0, assert_1.strictEqual)(parse('#000f'), (0, color_1.pack)(0, 0, 0, 1)));
            it('#fff', () => (0, assert_1.strictEqual)(parse('#fff'), (0, color_1.pack)(255, 255, 255, 1)));
            it('#000000', () => (0, assert_1.strictEqual)(parse('#000000'), (0, color_1.pack)(0, 0, 0, 1)));
            it('#00000000', () => (0, assert_1.strictEqual)(parse('#00000000'), (0, color_1.pack)(0, 0, 0, 0)));
            it('#ffffff', () => (0, assert_1.strictEqual)(parse('#ffffff'), (0, color_1.pack)(255, 255, 255, 1)));
            it('#ffffffff', () => (0, assert_1.strictEqual)(parse('#ffffffff'), (0, color_1.pack)(255, 255, 255, 1)));
            it('#7FFFD4', () => (0, assert_1.strictEqual)(parse('#7FFFD4'), (0, color_1.pack)(127, 255, 212, 1)));
            it('#f0ffff', () => (0, assert_1.strictEqual)(parse('#f0ffff'), (0, color_1.pack)(240, 255, 255, 1)));
            it('transparent', () => (0, assert_1.strictEqual)(parse('transparent'), (0, color_1.pack)(0, 0, 0, 0)));
            it('bisque', () => (0, assert_1.strictEqual)(parse('bisque'), (0, color_1.pack)(255, 228, 196, 1)));
            it('BLUE', () => (0, assert_1.strictEqual)(parse('BLUE'), (0, color_1.pack)(0, 0, 255, 1)));
            it('rgb(1, 3, 5)', () => (0, assert_1.strictEqual)(parse('rgb(1, 3, 5)'), (0, color_1.pack)(1, 3, 5, 1)));
            it('rgb(0% 0% 0%)', () => (0, assert_1.strictEqual)(parse('rgb(0% 0% 0%)'), (0, color_1.pack)(0, 0, 0, 1)));
            it('rgb(50% 50% 50%)', () => (0, assert_1.strictEqual)(parse('rgb(50% 50% 50%)'), (0, color_1.pack)(128, 128, 128, 1)));
            it('rgba(50% 50% 50% 50%)', () => (0, assert_1.strictEqual)(parse('rgba(50% 50% 50% 50%)'), (0, color_1.pack)(128, 128, 128, 0.5)));
            it('rgb(100% 100% 100%)', () => (0, assert_1.strictEqual)(parse('rgb(100% 100% 100%)'), (0, color_1.pack)(255, 255, 255, 1)));
            it('rgb(222 111 50)', () => (0, assert_1.strictEqual)(parse('rgb(222 111 50)'), (0, color_1.pack)(222, 111, 50, 1)));
            it('rgba(200, 3, 5, 1)', () => (0, assert_1.strictEqual)(parse('rgba(200, 3, 5, 1)'), (0, color_1.pack)(200, 3, 5, 1)));
            it('rgba(222, 111, 50, 0.22)', () => (0, assert_1.strictEqual)(parse('rgba(222, 111, 50, 0.22)'), (0, color_1.pack)(222, 111, 50, 0.22)));
            it('rgba(222 111 50 0.123)', () => (0, assert_1.strictEqual)(parse('rgba(222 111 50 0.123)'), (0, color_1.pack)(222, 111, 50, 0.123)));
            it('hsl(270,60%,70%)', () => (0, assert_1.strictEqual)(parse('hsl(270,60%,70%)'), parse('rgb(178,132,224)')));
            it('hsl(270, 60%, 70%)', () => (0, assert_1.strictEqual)(parse('hsl(270, 60%, 70%)'), parse('rgb(178,132,224)')));
            it('hsl(270 60% 70%)', () => (0, assert_1.strictEqual)(parse('hsl(270 60% 70%)'), parse('rgb(178,132,224)')));
            it('hsl(270deg, 60%, 70%)', () => (0, assert_1.strictEqual)(parse('hsl(270deg, 60%, 70%)'), parse('rgb(178,132,224)')));
            it('hsl(4.71239rad, 60%, 70%)', () => (0, assert_1.strictEqual)(parse('hsl(4.71239rad, 60%, 70%)'), parse('rgb(178,132,224)')));
            it('hsl(.75turn, 60%, 70%)', () => (0, assert_1.strictEqual)(parse('hsl(.75turn, 60%, 70%)'), parse('rgb(178,132,224)')));
            it('hsla(.75turn, 60%, 70%, 50%)', () => (0, assert_1.strictEqual)(parse('hsl(.75turn, 60%, 70%, 50%)'), parse('rgba(178,132,224, 0.5)')));
        });
        describe('util', () => {
            describe('isTransparent', () => {
                it('transparent', () => (0, assert_1.strictEqual)((0, color_1.isTransparent)(parse('transparent')), true));
                it('#000', () => (0, assert_1.strictEqual)((0, color_1.isTransparent)(parse('#000')), false));
                it('#000f', () => (0, assert_1.strictEqual)((0, color_1.isTransparent)(parse('#000f')), false));
                it('#0001', () => (0, assert_1.strictEqual)((0, color_1.isTransparent)(parse('#0001')), false));
                it('#0000', () => (0, assert_1.strictEqual)((0, color_1.isTransparent)(parse('#0000')), true));
            });
            describe('toString', () => {
                it('transparent', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('transparent')), 'rgba(0,0,0,0)'));
                it('#000', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#000')), 'rgb(0,0,0)'));
                it('#000f', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#000f')), 'rgb(0,0,0)'));
                it('#000f', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#000c')), 'rgba(0,0,0,0.8)'));
                it('#fff', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#fff')), 'rgb(255,255,255)'));
                it('#ffff', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#ffff')), 'rgb(255,255,255)'));
                it('#fffc', () => (0, assert_1.strictEqual)((0, color_1.asString)(parse('#fffc')), 'rgba(255,255,255,0.8)'));
            });
        });
    });
});
