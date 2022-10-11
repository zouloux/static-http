# Node http-server

0 dependency node based static http server.

### Start a static server from your terminal

##### Start with default port on current directory 
- `npx @zouloux/http-server`

##### Specify root directory
- `npx @zouloux/http-server ./docs/`

##### Specify port
- `npx @zouloux/http-server ./docs/ -p 8080`

### Start from a node script

- `npm i @zouloux/http-server`

```typescript
import { startServer } from "server"

// Start a server with custom options.
startServer({
	// Optionnal : specify port
	port: 8080,
	// Optionnal : specify root directory
	root: './docs/',
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
