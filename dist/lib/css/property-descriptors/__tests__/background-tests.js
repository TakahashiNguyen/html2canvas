"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const parser_1 = require("../../syntax/parser");
const background_image_1 = require("../background-image");
const color_1 = require("../../types/color");
const angle_1 = require("../../types/angle");
jest.mock('../../../core/context');
const context_1 = require("../../../core/context");
jest.mock('../../../core/features');
const backgroundImageParse = (context, value) => background_image_1.backgroundImage.parse(context, parser_1.Parser.parseValues(value));
describe('property-descriptors', () => {
    let context;
    beforeEach(() => {
        context = new context_1.Context({}, {});
    });
    describe('background-image', () => {
        it('none', () => {
            (0, assert_1.deepStrictEqual)(backgroundImageParse(context, 'none'), []);
            expect(context.cache.addImage).not.toHaveBeenCalled();
        });
        it('url(test.jpg), url(test2.jpg)', () => {
            (0, assert_1.deepStrictEqual)(backgroundImageParse(context, 'url(http://example.com/test.jpg), url(http://example.com/test2.jpg)'), [
                { url: 'http://example.com/test.jpg', type: 0 /* CSSImageType.URL */ },
                { url: 'http://example.com/test2.jpg', type: 0 /* CSSImageType.URL */ }
            ]);
            expect(context.cache.addImage).toHaveBeenCalledWith('http://example.com/test.jpg');
            expect(context.cache.addImage).toHaveBeenCalledWith('http://example.com/test2.jpg');
        });
        it(`linear-gradient(to bottom, rgba(255,255,0,0.5), rgba(0,0,255,0.5)), url('https://html2canvas.hertzen.com')`, () => (0, assert_1.deepStrictEqual)(backgroundImageParse(context, `linear-gradient(to bottom, rgba(255,255,0,0.5), rgba(0,0,255,0.5)), url('https://html2canvas.hertzen.com')`), [
            {
                angle: (0, angle_1.deg)(180),
                type: 1 /* CSSImageType.LINEAR_GRADIENT */,
                stops: [
                    { color: (0, color_1.pack)(255, 255, 0, 0.5), stop: null },
                    { color: (0, color_1.pack)(0, 0, 255, 0.5), stop: null }
                ]
            },
            { url: 'https://html2canvas.hertzen.com', type: 0 /* CSSImageType.URL */ }
        ]));
    });
});
