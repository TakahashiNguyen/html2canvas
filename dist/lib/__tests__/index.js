"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const canvas_renderer_1 = require("../render/canvas/canvas-renderer");
const document_cloner_1 = require("../dom/document-cloner");
const color_1 = require("../css/types/color");
jest.mock('../core/logger');
jest.mock('../css/layout/bounds');
jest.mock('../dom/document-cloner');
jest.mock('../dom/node-parser', () => {
    return {
        isBodyElement: () => false,
        isHTMLElement: () => false,
        parseTree: jest.fn().mockImplementation(() => {
            return { styles: {} };
        })
    };
});
jest.mock('../render/stacking-context');
jest.mock('../render/canvas/canvas-renderer');
describe('html2canvas', () => {
    const element = {
        ownerDocument: {
            defaultView: {
                pageXOffset: 12,
                pageYOffset: 34
            }
        }
    };
    it('should render with an element', async () => {
        document_cloner_1.DocumentCloner.destroy = jest.fn().mockReturnValue(true);
        await (0, index_1.default)(element);
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.objectContaining({
            cache: expect.any(Object),
            logger: expect.any(Object),
            windowBounds: expect.objectContaining({ left: 12, top: 34 })
        }), expect.objectContaining({
            backgroundColor: 0xffffffff,
            scale: 1,
            size: { x: 200, y: 50 },
            x: 0,
            y: 0,
            canvas: undefined
        }));
        expect(document_cloner_1.DocumentCloner.destroy).toBeCalled();
    });
    it('should have transparent background with backgroundColor: null', async () => {
        await (0, index_1.default)(element, { backgroundColor: null });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
            backgroundColor: color_1.COLORS.TRANSPARENT
        }));
    });
    it('should use existing canvas when given as option', async () => {
        const canvas = {};
        await (0, index_1.default)(element, { canvas });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
            canvas
        }));
    });
    it('should not remove cloned window when removeContainer: false', async () => {
        document_cloner_1.DocumentCloner.destroy = jest.fn();
        await (0, index_1.default)(element, { removeContainer: false });
        expect(canvas_renderer_1.CanvasRenderer).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({
            backgroundColor: 0xffffffff,
            scale: 1,
            size: { x: 200, y: 50 },
            x: 0,
            y: 0,
            canvas: undefined
        }));
        expect(document_cloner_1.DocumentCloner.destroy).not.toBeCalled();
    });
});
