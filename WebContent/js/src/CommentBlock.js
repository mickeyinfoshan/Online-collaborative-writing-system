const React = require("react");

var CommentInput = require("./CommentInput");
var CommentList = require("./CommentList");

var CommentBlock = React.createClass({
	render : function() {
		return (<div>
			<CommentList />
			<CommentInput />
		</div>);
	}
});

module.exports = CommentBlock;