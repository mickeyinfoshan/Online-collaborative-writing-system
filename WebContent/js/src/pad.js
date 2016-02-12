var PublicBlock = require("./public/PublicBlock");
var React = require("react");
var ReactDOM = require("react-dom");

var container = document.getElementById("publicBlock");

ReactDOM.render(<PublicBlock url={"/pad/api/public/pad/all"} />, container); 