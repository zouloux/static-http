#!/usr/bin/env node

import { IServerOptions, startServer } from "./server";
import { accessSync } from "fs"
import path from "path";
import { networkInterfaces } from "os";

// Get parameters from cli
let options:IServerOptions = {}
process.argv.forEach( (arg, index) => {
	// First argvs are useless
	if ( index < 2 ) return
	// Try to get port
	const lowerArg = arg.toLowerCase()
	if ( lowerArg === "-p" || lowerArg === "--port") {
		const nextArg = process.argv[ index + 1 ]
		options.port = parseFloat( nextArg )
		// Check if this port is valid
		if ( isNaN(options.port) ) {
			console.error(`Invalid port ${nextArg}`)
			process.exit(1);
		}
	}
	// Try to get root directory
	else {
		if ( options.root ) return
		const rootPath = path.join( process.cwd(), arg )
		// Check if this directory exists
		try {
			accessSync( rootPath )
			options.root = rootPath
		}
		catch {
			console.error(`Root directory ${rootPath} not found`)
			process.exit(1)
		}
	}
})

// ----------------------------------------------------------------------------- GET LOCAL IPS

const networkInterfaceList = networkInterfaces();
const ips = [ 'localhost', '127.0.0.1' ]
for ( const name of Object.keys(networkInterfaceList) )
	for ( const net of networkInterfaceList[name] ) {
		const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
		if ( net.family === familyV4Value && !net.internal )
			ips.push( net.address )
	}

// ----------------------------------------------------------------------------- START SERVER

// Start server with options from cli
options = startServer( options )

// Show log
const lines = [
	`Server started on port ${options.port}`,
	...ips.map( ip => `- http://${ip}:${options.port}/`),
]
console.log( lines.join("\n") )
console.log("")