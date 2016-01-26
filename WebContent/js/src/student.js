var React = require("react");
var ReactDOM = require("react-dom");
var StudentApp = require("./StudentApp");

var container = document.getElementById("body");

container.innerHTML = "";
ReactDOM.render(<StudentApp />, container);