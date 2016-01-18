import Avatar from 'material-ui/lib/avatar';
import React from 'react';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import styles from 'material-ui/lib/styles';

var $ = require("jquery");

const colors = styles.Colors;

const CommentList = React.createClass({
	getInitialState: function() {
		return {
			comments : [] 
		};
	},
	componentDidMount: function() {
		this.getComments();
	},

	getComments : function() {
		var _this = this;
		
		function _getComments() {
			setTimeout(function() {
				_this.getComments();
			}, 3000);
		}

		if(!window.GLOBAL) {
			_getComments();	
			return;
		}

		var pad_id = window.GLOBAL.pad_id;
		
		if(!pad_id) {
			_getComments();
			return;
		}

		var url = `/pad/api/comment/${pad_id}/list`;
		$.get(url, function(res) {
			_getComments();
			_this.setState({
				comments : res 
			});			
		});
	},

	render : function() {
		var comments = this.state.comments.map((comment)=>{
			var letter = comment.user_name[0];
			return <ListItem
			  key={"comment" + comment.id}
		      disabled={true}
		      leftAvatar={
		        <Avatar
		          color={"#fff"}
		          backgroundColor={colors.grey900}
		        >
		          {letter}
		        </Avatar>
		      }
		    >
		     <small style={{color:"#ccc",float:"right"}}>{comment.created_time}</small>
		     <big><b>{comment.user_name}</b></big>
		     <p>
		     	{comment.content}
		     </p>
		    </ListItem>
		});
		console.log(comments);
		return (
			<List subheader="评语：">
				{comments}
			</List>
		);
	}
});

module.exports = CommentList;