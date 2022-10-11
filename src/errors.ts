
const errors = {
	"default" : "Unknown error",
	404 : 'Not found',
	500 : 'Server error',
}

export function responseError ( response, errorCode, mimeType, charset ) {
	response.writeHead(errorCode, { 'Content-Type': mimeType });
	const errorStatus = (
		errorCode in errors
			? errors[ errorCode ]
			: errors["default"]
	)
	const errorMessage = `${errorCode} - ${errorStatus}`
	if ( mimeType === "text/html" )
		response.end(`<h3>${errorMessage}</h3>`, charset);
	else if ( mimeType === "application/json" )
		response.end(`{"error": {"code": ${errorCode}, "status": "${errorStatus}"}}`, charset);
	else
		response.end(errorMessage, charset);
}