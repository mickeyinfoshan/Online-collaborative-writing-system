 var React = require('react');

var $ = require("jquery");

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import injectTapEventPlugin from 'react-tap-event-plugin';
 
 var PublicButton = React.createClass({
 
 	getInitialState: function() {
 		return {
 			dialog : false,
 			isPrivate : true 
 		};
 	},

 	componentDidMount: function() {
 		this.getIsPrivate();
 	},

 	getIsPrivate : function() {
 		var _this = this;
 		if(!window.GLOBAL) {
 			setTimeout(function() {
 				_this.getIsPrivate();
 			}, 500);
 			return;
 		}
 		if(!window.GLOBAL.pad_id) {
 			setTimeout(function() {
 				_this.getIsPrivate();
 			}, 500);
 			return;
 		}
 		var pad_id = window.GLOBAL.pad_id;
 		var url = `/pad/api/public/pad/has/${pad_id}`;
 		$.get(url, function(res) {
 			if(res == "true") {
 				_this.setState({
 					isPrivate : false 
 				});
 			}
 			else {
 				_this.setState({
 					isPrivate : true 
 				});
 			}
 		});
 	},

 	save : function() {
 		if(this.state.isPrivate) {
 			this.setToPublic();
 		}
 		else {
 			this.setToPrivate();
 		}
 	},

 	setToPublic : function() {
 		if(!window.GLOBAL) {
 			return;
 		}
 		if(!window.GLOBAL.pad_id) {
 			return;
 		}
 		if(!window.GLOBAL.user_id) {
 			return;
 		}
 		if(!window.GLOBAL.user_name) {
 			return;
 		}

 		var _this = this;

 		var now = new Date();
 		var pad_id = window.GLOBAL.pad_id;
 		var data = {
 			created_time : now.getTime(),
 			user_id : window.GLOBAL.user_id,
 			user_name : window.GLOBAL.user_name
 		};

 		var url = `/pad/api/public/pad/add/${pad_id}`;
 		$.post(url, data, function(res) {
 			_this.getIsPrivate();
 			_this.hideDialog();
 		});
 	},

 	setToPrivate : function() {
 		if(!window.GLOBAL) {
 			return;
 		}
 		if(!window.GLOBAL.pad_id) {
 			return;
 		}
 		var _this = this;
 		var pad_id = window.GLOBAL.pad_id;
 		var url = `/pad/api/public/pad/remove/${pad_id}`;
 		$.get(url, function(res) {
 			_this.getIsPrivate();
 			_this.hideDialog();
 		});
 	},	

 	hideDialog : function() {
 		this.setState({
 			dialog : false 
 		});
 	},

 	showDialog : function() {
 		this.setState({
 			dialog : true 
 		});
 	},

 	render: function() {
 		const actions = [
	      <FlatButton
	        label="取消"
	        secondary={true}
	        onTouchTap={this.hideDialog} />,
	      <FlatButton
	        label="确定"
	        primary={true}
	        keyboardFocused={true}
	        onTouchTap={this.save} />,
	    ];

	    var buttonLabel = "公开文章";
	    var dialogTitle = "确定公开这篇文章吗？";
	    var dialogText = "公开文章会使文章出现在公开文章列表并被所有用户阅读和评论，确定公开？";

	    if(!this.state.isPrivate) {
	    	buttonLabel = "取消公开";
	    	dialogTitle = "确定取消公开这篇文章吗？";
	    	dialogText = "取消公开文章会使文章不能被其他用户阅读和评论，确定取消？"
	    }

 		return (
 			<div>
 				<RaisedButton label={buttonLabel} onTouchTap={this.showDialog} secondary={true} />
 				<Dialog
		          title={dialogTitle}
		          actions={actions}
		          modal={false}
		          open={this.state.dialog}
		          onRequestClose={this.hideDialog}>
		          <div>
		          	<p>
		          		{dialogText}
		          	</p>
		          </div>
		        </Dialog>
 			</div>
 		);
 	}
 
 });
 
injectTapEventPlugin();

module.exports = PublicButton;