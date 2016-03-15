const React = require("react");

var CommentInput = require("./CommentInput");
var CommentList = require("./CommentList");

var CommentBlock = React.createClass({
	requestComments : function() {
		this.refs.commentList.getComments();
	},
	render : function() {
		return (<div>
			<CommentList ref="commentList" />
			<CommentInput requestComments={this.requestComments} />
		</div>);
	}
});

module.exports = CommentBlock;