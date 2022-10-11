import { createServer } from 'http';
import path from 'path';
import { readFile, access, readdir, stat } from "fs/promises";
import { getMimeTypeFromExtension } from "./mime-types";
import { responseError } from "./errors";

// ----------------------------------------------------------------------------- TYPES

export interface IServerOptions
{
	port 				?: number
	root 				?: string
	indexFile			?: string
	charset				?: string
	allowDirectoryIndex ?: boolean
	onInfo				?: TLogRequest
	onRequest			?: (request, response) => Promise<boolean|void>
}

type TLogRequest = (code:number, filePath:string) => void

// ----------------------------------------------------------------------------- FILE HELPERS

type TFileStatus = "nope" | "file" | "directory"
async function getFileStatus ( filePath:string ):Promise<TFileStatus> {
	try {
		await access( filePath )
		return (await stat( filePath )).isDirectory() ? "directory" : "file";
	}
	catch {
		return "nope"
	}
}

// ----------------------------------------------------------------------------- DIRECTORY LISTING

const buildLink = (href:string, fileName:string = href) => `<a href="/${href}">${fileName}</a>`

const listingStyle = `<style>
	body { font-family: sans-serif }
	a { display: inline-block; margin-top: 4px; color: black;font-size: 16px;text-decoration: none; }
	a:hover{ text-decoration: underline }
</style>`

async function directoryIndex ( response, currentDirectoryPath:string, options:IServerOptions ) {
	const files = await readdir( currentDirectoryPath )
	const base = path.relative( options.root, currentDirectoryPath )
	const htmlLinks = [ buildLink( path.join(base, ".."), "[ Parent directory ]" ) ]
	for ( const linkPath of files ) {
		const status = await getFileStatus( path.join(currentDirectoryPath, linkPath ))
		const fileName = linkPath + (status === "directory" ? "/" : "")
		const href = path.join( base, linkPath )
		htmlLinks.push( buildLink(href, `/${fileName}`) )
	}
	options.onInfo?.( 200, currentDirectoryPath )
	const lines = [
		`<h3>/${base}/</h3>`,
		listingStyle,
		...htmlLinks.map( link => `${link}<br/>`),
	]
	response.writeHead(200, { 'Content-Type': getMimeTypeFromExtension("html") });
	response.end(lines.join("\n"), options.charset);
}

// ----------------------------------------------------------------------------- STATIC SERVER REQUEST

async function staticServerRequest ( request, response, options:IServerOptions ) {
	// Prepend base directory to file path.
	let filePath = path.join( options.root, request.url )
	// Check if requested path is a directory. Map to index file.
	const status = await getFileStatus( filePath )
	if ( status === "directory" || filePath.lastIndexOf("/") === filePath.length - 1 )
		filePath = path.join( filePath, options.indexFile )
	// Directory listing
	const indexStatus = await getFileStatus( filePath )
	if ( status === "directory" && indexStatus === "nope" && options.allowDirectoryIndex ) {
		const currentDirectoryPath = path.dirname( filePath )
		await directoryIndex( response, currentDirectoryPath, options );
		return;
	}
	// Get mime-type from extension
	let fileExtension = path.extname( filePath )
	fileExtension = (
		fileExtension
		? fileExtension.split('.')[1].toLowerCase()
		: ''
	)
	const mimeType = getMimeTypeFromExtension( fileExtension )
	if ( indexStatus === "nope" ) {
		// File not found
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
export function startServer ( options:IServerOptions ):IServerOptions {
	// Default parameters
	options = {
		port: 8765,
		root: ".",
		indexFile: "index.html",
		allowDirectoryIndex: true,
		charset: "utf-8",
		onInfo: (code:number, filePath:string) => {
			const color = code === 200 ? `\x1b[1;0;102m` : `\x1b[1;97;41m`
			console.log(`${color} ${code} \x1b[0m - /${path.relative(options.root, filePath)}`)
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

