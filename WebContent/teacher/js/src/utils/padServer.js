var padHost = "localhost";
var	padPort = "8081";
var	apikey = "8f2f95ba0babc4a151d970b8acfbc00869cf3dce5b5ca6893343303d86049cd8";
var baseUrl = "http://" + `${padHost}:${padPort}/api/1.2.10/`;
module.exports = {
	
	getRequestUrl : function(requestMethod, params) {
		params.apikey = apikey;
		params.jsonp = "?";
		var pairs = [];
		for(var key in params) {
			var pair = key + "=" + params[key];
			pairs.push(pair);
		}
		console.log(pairs);
		var getParams = pairs.join("&");
		console.log(getParams);
		return baseUrl + requestMethod + "?" + getParams;
	}
};