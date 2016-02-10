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
	componentDidUpdate: function(prevProps, prevState) {
		if(prevProps.pad_id != this.props.pad_id) {
			this.getComments();
		}
	},
	getComments : function() {
		var _this = this;
		
		if(!this.props.pad_id) {
			return;
		}

		var url = `/pad/api/comment/${this.props.pad_id}/list`;
	
		$.get(url, function(res) {
			_this.setState({
				comments : res 
			});			
		});
	},

	render : function() {
		var comments = this.state.comments.map((comment)=>{
			var letter = comment.user_name.charAt(0);
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