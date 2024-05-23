import {RenderConfigurations} from './canvas-renderer';
import {createForeignObjectSVG} from '../../core/features';
import {asString} from '../../css/types/color';
import {Renderer} from '../renderer';
import {Context} from '../../core/context';

export class ForeignObjectRenderer extends Renderer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	options: RenderConfigurations;

	constructor(context: Context, options: RenderConfigurations) {
		super(context, options);
		this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.options = options;
		this.canvas.width = Math.floor(options.size.width * options.scale);
		this.canvas.height = Math.floor(options.size.height * options.scale);
		this.canvas.style.width = `${options.size.width}px`;
		this.canvas.style.height = `${options.size.height}px`;

		this.ctx.scale(this.options.scale, this.options.scale);
		this.ctx.translate(-options.x, -options.y);
		this.context.logger.debug(
			`EXPERIMENTAL ForeignObject renderer initialized (${options.size.width}x${options.size.height} at ${options.x},${options.y}) with scale ${options.scale}`
		);
	}

	async render(element: HTMLElement): Promise<HTMLCanvasElement> {
		const svg = createForeignObjectSVG(
			this.options.size.width * this.options.scale,
			this.options.size.height * this.options.scale,
			this.options.scale,
			this.options.scale,
			element
		);

		const img = await loadSerializedSVG(svg);

		if (this.options.backgroundColor) {
			this.ctx.fillStyle = asString(this.options.backgroundColor);
			this.ctx.fillRect(
				0,
				0,
				this.options.size.width * this.options.scale,
				this.options.size.height * this.options.scale
			);
		}

		this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);

		return this.canvas;
	}
}

export const loadSerializedSVG = (svg: Node): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.onload = () => {
			resolve(img);
		};
		img.onerror = reject;

		img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
	});
