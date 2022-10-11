import { createServer } from 'http';
import path from 'path';
import { readFile, access } from "fs/promises";
import { getMimeTypeFromExtension } from "./mime-types";
import { responseError } from "./errors";

// ----------------------------------------------------------------------------- TYPES

export interface IStartServerOptions {
	port 	?: number
	root 	?: string
	index	?: string
	charset	?: string
	onInfo	?: TLogRequest
	onRequest	?: (request, response) => Promise<boolean|void>
}

type TLogRequest = (code:number, filePath:string) => void

// ----------------------------------------------------------------------------- SERVER REQUEST

async function staticServerRequest ( request, response, options:IStartServerOptions ) {
	// Get requested file path. Default it to index.html.
	let filePath = request.url
	if ( filePath === "/" )
		filePath += options.index
	// Get mime-type from extension
	const fileExtension = path.extname( filePath ).split('.')[1].toLowerCase();
	const mimeType = getMimeTypeFromExtension( fileExtension )
	// Prepend base directory to file path and check if this file exists
	filePath = path.join( options.root, filePath )
	try {
		await access(filePath)
	}
	catch {
		options.onInfo?.( 404, filePath )
		responseError( response, 404, mimeType, options.charset )
		return;
	}
	// Try to read file locally
	try {
		// TODO: Support streaming huge files (like mp4 videos)
		const content = await readFile( filePath )
		options.onInfo?.( 200, filePath )
		response.writeHead(200, { 'Content-Type': mimeType });
		response.end(content, options.charset);
	}
	// Unable to load file or any other error happened
	catch ( error ) {
		// Return 500 error
		options.onInfo?.( 500, filePath )
		responseError( response, 500, mimeType, options.charset )
	}
}

// ----------------------------------------------------------------------------- START SERVER

/**
 * Start a static server
 * @param options
 */
export function startServer ( options:IStartServerOptions ):IStartServerOptions {
	// Default parameters
	options = {
		port: 8765,
		root: ".",
		index: "index.html",
		charset: "utf-8",
		onInfo: (code:number, filePath:string) => {
			console.log(`${code} - ${path.relative(options.root, filePath)}`)
		},
		...options
	}
	// Server request handler
	async function serverRequestHandler ( request, response ) {
		// Execute optional middleware
		if ( options.onRequest ) {
			const result = await options.onRequest( request, response )
			if ( result === false ) return
		}
		// Execute static server request with options
		await staticServerRequest( request, response, options )
	}
	// Create server
	createServer( serverRequestHandler ).listen( options.port )
	// Return mutated default options
	return options
}

