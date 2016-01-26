const React = require("react");

var CommentInput = require("./CommentInput");
var CommentList = require("./CommentList");

var CommentBlock = React.createClass({
	
	requestFresh : function() {
		this.refs.commentList.getComments();
	},

	render : function() {
		return (<div>
			<CommentList ref="commentList" />
			<CommentInput requestFresh={this.requestFresh} />
		</div>);
	}
});

module.exports = CommentBlock;