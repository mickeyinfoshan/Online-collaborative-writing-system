const React = require("react");

var CommentInput = require("./CommentInput");
var CommentList = require("./CommentList");

var CommentBlock = React.createClass({

	afterAddComment : function() {
		this.refs.commentList.getComments(); 
	},

	render : function() {
		return (<div>
			<CommentList {...this.props} ref="commentList" />
			<CommentInput {...this.props} afterAddComment={this.afterAddComment}  />
		</div>);
	}
}); 

module.exports = CommentBlock;