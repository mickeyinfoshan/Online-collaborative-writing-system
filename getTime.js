
var http = require("http");

http.createServer(function(req, res) {
	var validUntil = new Date().getTime() / 1000 + 2 * 60 * 60;
	res.end("" + validUntil);
}).listen(8082);