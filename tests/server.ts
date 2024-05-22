import express from 'express';
import cors from 'cors';
import path from 'path';
import yargs from 'yargs';
import {ScreenshotRequest} from './types';
import fs from 'fs';
import bodyParser from 'body-parser';
import filenamifyUrl from 'filenamify-url';
import * as mkdirp from 'mkdirp';

const serveIndex = require('serve-index');
const proxy = require('html2canvas-proxy');

export const app = express();
app.use('/', serveIndex(path.resolve(__dirname, '../'), {icons: true}));
app.use([/^\/src($|\/)/, '/'], express.static(path.resolve(__dirname, '../')));

export const corsApp = express();
corsApp.use('/proxy', proxy());
corsApp.use('/cors', cors(), express.static(path.resolve(__dirname, '../')));
corsApp.use('/', express.static(path.resolve(__dirname, '.')));

export const screenshotApp = express();
screenshotApp.use(cors());
screenshotApp.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
	// IE9 doesn't set headers for cross-domain ajax requests
	if (typeof req.headers['content-type'] === 'undefined') {
		req.headers['content-type'] = 'application/json';
	}
	next();
});
screenshotApp.use(
	bodyParser.json({
		limit: '15mb',
		type: '*/*'
	})
);

const prefix = 'data:image/png;base64,';
const screenshotFolder = '../tmp/reftests';
const metadataFolder = '../tmp/reftests/metadata';

mkdirp.sync(path.resolve(__dirname, screenshotFolder));
mkdirp.sync(path.resolve(__dirname, metadataFolder));

const writeScreenshot = (buffer: Buffer, body: ScreenshotRequest) => {
	const filename = `${filenamifyUrl(body.test.replace(/^\/tests\/reftests\//, '').replace(/\.html$/, ''), {
		replacement: '-'
	})}!${[process.env.TARGET_BROWSER, body.platform.name, body.platform.version].join('-')}`;

	fs.writeFileSync(path.resolve(__dirname, screenshotFolder, `${filename}.png`), buffer);
	return filename;
};

screenshotApp.post('/screenshot', (req: express.Request<{}, void, ScreenshotRequest>, res: express.Response) => {
	if (!req.body || !req.body.screenshot) {
		return res.sendStatus(400);
	}

	const buffer = Buffer.from(req.body.screenshot.substring(prefix.length), 'base64');
	const filename = writeScreenshot(buffer, req.body);
	fs.writeFileSync(
		path.resolve(__dirname, metadataFolder, `${filename}.json`),
		JSON.stringify({
			windowWidth: req.body.windowWidth,
			windowHeight: req.body.windowHeight,
			platform: req.body.platform,
			devicePixelRatio: req.body.devicePixelRatio,
			test: req.body.test,
			id: process.env.TARGET_BROWSER,
			screenshot: filename
		})
	);
	return res.sendStatus(200);
});

screenshotApp.use((error: Error, _req: express.Request, _res: express.Response, next: express.NextFunction) => {
	console.error(error);
	next();
});

const args = yargs(process.argv.slice(2)).number(['port', 'cors']).argv;

// @ts-ignore
if (args.port) {
	// @ts-ignore
	app.listen(args.port, () => {
		// @ts-ignore
		console.log(`Server running on port ${args.port}`);
	});
}

// @ts-ignore
if (args.cors) {
	// @ts-ignore
	corsApp.listen(args.cors, () => {
		// @ts-ignore
		console.log(`CORS server running on port ${args.cors}`);
	});
}
