import {Bounds, parseBounds, parseDocumentSize} from './css/layout/bounds';
import {COLORS, isTransparent, parseColor} from './css/types/color';
import {CloneConfigurations, CloneOptions, DocumentCloner, WindowOptions} from './dom/document-cloner';
import {isBodyElement, isHTMLElement, parseTree} from './dom/node-parser';
import {CacheStorage} from './core/cache-storage';
import {CanvasRenderer, RenderConfigurations, RenderOptions} from './render/canvas/canvas-renderer';
import {ForeignObjectRenderer} from './render/canvas/foreignobject-renderer';
import {Context, ContextOptions} from './core/context';
import {ElementContainer} from './dom/element-container';
import {Vector2} from 'three';

export type Options = CloneOptions &
	WindowOptions &
	RenderOptions &
	ContextOptions & {
		backgroundColor: string | null;
		foreignObjectRendering: boolean;
		removeContainer?: boolean;
	};

const html2canvas = (element: HTMLElement, options: Partial<Options> = {}): Promise<HTMLCanvasElement> => {
	return new Promise(async (resolve) => {
		resolve((await HTML2CanvasClass.init(element, options)).render());
	});
};

export default html2canvas;

if (typeof window !== 'undefined') {
	CacheStorage.setContext(window);
}

export class HTML2CanvasClass {
	private renderer!: ForeignObjectRenderer | CanvasRenderer;
	private target!: HTMLElement | ElementContainer;
	constructor(renderer: ForeignObjectRenderer | CanvasRenderer, target: HTMLElement | ElementContainer) {
		this.renderer = renderer;
		this.target = target;
	}
	static async init(element: HTMLElement, opts: Partial<Options>) {
		// @ts-ignore
		if (!element || typeof element !== 'object') {
			throw Error('Invalid element provided as first argument');
		}
		const ownerDocument = element.ownerDocument;

		if (!ownerDocument) {
			throw new Error(`Element is not attached to a Document`);
		}

		const defaultView = ownerDocument.defaultView;

		if (!defaultView) {
			throw new Error(`Document is not attached to a Window`);
		}

		const resourceOptions = {
			allowTaint: opts.allowTaint ?? false,
			imageTimeout: opts.imageTimeout ?? 15000,
			proxy: opts.proxy,
			useCORS: opts.useCORS ?? false
		};

		const contextOptions = {
			logging: opts.logging ?? true,
			cache: opts.cache,
			...resourceOptions
		};

		const windowOptions = {
			windowWidth: opts.windowWidth ?? defaultView.innerWidth,
			windowHeight: opts.windowHeight ?? defaultView.innerHeight,
			scrollX: opts.scrollX ?? defaultView.pageXOffset,
			scrollY: opts.scrollY ?? defaultView.pageYOffset
		};

		const windowBounds = new Bounds(
			windowOptions.scrollX,
			windowOptions.scrollY,
			windowOptions.windowWidth,
			windowOptions.windowHeight
		);

		const context = new Context(contextOptions, windowBounds);

		const foreignObjectRendering = opts.foreignObjectRendering ?? false;

		const cloneOptions: CloneConfigurations = {
			allowTaint: opts.allowTaint ?? false,
			onclone: opts.onclone,
			ignoreElements: opts.ignoreElements,
			inlineImages: foreignObjectRendering,
			copyStyles: foreignObjectRendering
		};

		context.logger.debug(
			`Starting document clone with size ${windowBounds.width}x${
				windowBounds.height
			} scrolled to ${-windowBounds.left},${-windowBounds.top}`
		);

		const documentCloner = new DocumentCloner(context, element, cloneOptions);
		const clonedElement = documentCloner.clonedReferenceElement;
		if (!clonedElement) {
			throw Error(`Unable to find element in cloned iframe`);
		}

		const container = await documentCloner.toIFrame(ownerDocument, windowBounds);

		const {width, height, left, top} =
			isBodyElement(clonedElement) || isHTMLElement(clonedElement)
				? parseDocumentSize(clonedElement.ownerDocument)
				: parseBounds(context, clonedElement);

		const backgroundColor = parseBackgroundColor(context, clonedElement, opts.backgroundColor);

		const renderOptions: RenderConfigurations = {
			canvas: opts.canvas,
			backgroundColor,
			scale: opts.scale ?? defaultView.devicePixelRatio ?? 1,
			x: (opts.x ?? 0) + left,
			y: (opts.y ?? 0) + top,
			size: opts.size ?? new Vector2(width, height)
		};

		let renderer, target;
		if (foreignObjectRendering) {
			context.logger.debug(`Document cloned, using foreign object rendering`);
			renderer = new ForeignObjectRenderer(context, renderOptions);
			target = clonedElement;
		} else {
			context.logger.debug(
				`Document cloned, element located at ${left},${top} with size ${width}x${height} using computed rendering`
			);

			context.logger.debug(`Starting DOM parsing`);
			const root = parseTree(context, clonedElement);

			if (backgroundColor === root.styles.backgroundColor) {
				root.styles.backgroundColor = COLORS.TRANSPARENT;
			}

			context.logger.debug(
				`Starting renderer for element at ${renderOptions.x},${renderOptions.y} with size ${renderOptions.size.width}x${renderOptions.size.height}`
			);

			renderer = new CanvasRenderer(context, renderOptions);
			target = root;
		}

		if (opts.removeContainer ?? true) {
			if (!DocumentCloner.destroy(container)) {
				context.logger.error(`Cannot detach cloned iframe as it is not in the DOM anymore`);
			}
		}

		context.logger.debug(`Finished rendering`);
		return new HTML2CanvasClass(renderer, target);
	}

	async render() {
		// @ts-ignore
		return await this.renderer.render(this.target);
	}
}

const parseBackgroundColor = (context: Context, element: HTMLElement, backgroundColorOverride?: string | null) => {
	const ownerDocument = element.ownerDocument;
	// http://www.w3.org/TR/css3-background/#special-backgrounds
	const documentBackgroundColor = ownerDocument.documentElement
		? parseColor(context, getComputedStyle(ownerDocument.documentElement).backgroundColor as string)
		: COLORS.TRANSPARENT;
	const bodyBackgroundColor = ownerDocument.body
		? parseColor(context, getComputedStyle(ownerDocument.body).backgroundColor as string)
		: COLORS.TRANSPARENT;

	const defaultBackgroundColor =
		typeof backgroundColorOverride === 'string'
			? parseColor(context, backgroundColorOverride)
			: backgroundColorOverride === null
				? COLORS.TRANSPARENT
				: 0xffffffff;

	return element === ownerDocument.documentElement
		? isTransparent(documentBackgroundColor)
			? isTransparent(bodyBackgroundColor)
				? defaultBackgroundColor
				: bodyBackgroundColor
			: documentBackgroundColor
		: defaultBackgroundColor;
};
