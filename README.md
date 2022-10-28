# Node static http

0 dependency node based static http server.

### ✅ Features

- Super lightweight
- Start a local static server in 1 command
- Correct mime-types
- Default to `index.html`
- Directory listing if index is missing
- Types included for Node module usage

### ❌ Not included and not planned

- No config
- No CORS
- No HTTP credentials
- No cookies
- No cache
- No HLS server for media streaming
- No automatic browser open
- No routing system (but you can handle routes yourself with `onRequest`)

### 🙏 Wishlist

- Streaming of huge files (big files will be loaded entirely into RAM) ?
- Compatibility with byte-start for video seeking ?
- Searching for next available port automatically


# Start a static server from your terminal

##### Start with default port on current directory 
- `npx @zouloux/static-http`

##### Specify root directory
- `npx @zouloux/static-http ./docs/`

##### Specify port
- `npx @zouloux/static-http ./docs/ -p 8080` (or `--port`)

# Install it globally and use it every day

##### With node
- `npm i -g @zouloux/static-http`

##### With bun 🐰
- `bun i -g @zouloux/static-http`

##### Use it with
- `static-http`


### Start from a node script

- `npm i @zouloux/static-http`

```typescript
import { startServer } from "@zouloux/static-http"

// Start a server with custom options.
startServer({
	// Optionnal : specify port
	port: 8080,
	// Optionnal : specify root directory
	root: './docs/',
	// Optionnal : set custom index file. Default is index.html
	indexFile: 'index.html',
	// Optionnal : allow directory indexing if index file is missing. Default is true.
	allowDirectoryIndex: true,
	// Optional - Callback executed before any request
	onRequest: async (request, response) => {
		// Return false to halt and disable default static behavior
		// Return true to continue static behavior
		return true
	},
	// When any file has been statically requested
	onInfo: (code:number, filePath:string) => {
		console.log(`${code} - ${filePath}`)
	}
})
```


## How to test

1. Clone this repository
2. `npm i`
3. `npm run build && node dist/cli.es2020.mjs test`

Open link in console and you should see an index file with a directory listing link.
