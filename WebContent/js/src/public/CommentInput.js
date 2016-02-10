const React = require("react");

import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import injectTapEventPlugin from 'react-tap-event-plugin';

var $ = require("jquery");

var CommentInput = React.createClass({
	
	getInitialState: function() {
		return {
			content : ""
		};
	},

	setContent : function(e) {
		var content = this.refs.textInput.getValue();
		this.setState({
			content : content 
		});
	},

	canSave : function() {
		return this.state.content.length !== 0 &&
				this.props.pad_id && this.props.user_id && this.props.user_name;
	},

	save : function() {
		//need pad_id, user_id, user_name, content
		if(!this.canSave()) {
			return;
		}

		var now = new Date();

		var month = now.getMonth() + 1;
		var date = now.getDate();
		var hour = now.getHours();
		var minute = now.getMinutes();

		var created_time = `${month}/${date} ${hour}:${minute}`; 

		var data = {
			user_name : this.props.user_name,
			user_id : this.props.user_id,
			content : this.state.content,
			created_time : created_time
		};

		var pad_id = this.props.pad_id;

		var url = `/pad/api/comment/${pad_id}/create`;
		var _this = this;
		$.post(url, data, function(res) {
			if(res == '200') {
				_this.setState({
					content : ""
				});
				_this.props.afterAddComment();
			}
		}).error(function() {
			window.alert("服务器去开小差了，请稍后重试");
		});
	},

	render : function() {
		return (<div>
			<TextField ref="textInput" 
				multiLine={true} 
				floatingLabelText={"新的评语"}  
				hintText={"写下你的评语吧~"}
				value={this.state.content}
				onChange={this.setContent}
			/>
			<FlatButton
        label="发表"
        primary={true}
        keyboardFocused={true}
        onTouchTap={this.save} 
        style={{float : "right"}}/>
		</div>);
	}
});

injectTapEventPlugin();

module.exports = CommentInput;