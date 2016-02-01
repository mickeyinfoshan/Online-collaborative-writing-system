var ReactDOM = require("react-dom");
var React = require("react");

var CommentBlock = require("./CommentBlock");
var MissionBlock = require("./MissionBlock");
var PublicButton = require("./PublicButton");

ReactDOM.render(<CommentBlock />, document.getElementById('commentBlock'));
ReactDOM.render(<MissionBlock />, document.getElementById("missionBlock"));
ReactDOM.render(<PublicButton />, document.getElementById("publicButton"));