

// From : https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const extensionsToMimeTypes = {
	"default" : "text/plain",
	// --- TEXT BASED FORMAT
	"text" : "text/plain",
	"html" : "text/html",
	"htm" : "text/html",
	"xml" : "text/xml",
	"json" : "application/json",
	"csv" : "text/csv",
	// --- ARCHIVE / BIN
	"zip" : "application/zip",
	"bz" : "application/x-bzip",
	"bzZ" : "application/x-bzip2",
	"bin" : "application/octet-stream",
	// --- WEB ASSET
	"js" : "text/javascript",
	"mjs" : "text/javascript",
	"cjs" : "text/javascript",
	"css" : "text/css",
	// --- FONT
	"woff" : "font/woff",
	"woff2" : "font/woff2",
	"otf" : "font/otf",
	"eot" : "application/vnd.ms-fontobject",
	// --- IMAGE
	"png" : "image/png",
	"jpg" : "image/jpg",
	"jpeg" : "image/jpeg",
	"gif" : "image/gif",
	"webp" : "image/webp",
	"avif" : "image/avif",
	"svg" : "image/svg+xml",
	"ico" : "image/vnd.microsoft.icon",
	// --- VIDEO
	"mp4" : "video/mp4",
	"webm" : "video/webm",
	"weba" : "audio/webm",
	"oga" : "audio/ogg",
	// --- AUDIO
	"mp3" : "video/mp3",
	"wav" : "video/wav",
	"aac" : "video/aac",
	"ogv" : "video/ogg",
	"mpeg" : "video/mpeg",
}


export function getMimeTypeFromExtension ( extension ) {
	return (
		extension in extensionsToMimeTypes
		? extensionsToMimeTypes[ extension ]
		: extensionsToMimeTypes["default"]
	)
}