import ListItem from 'material-ui/lib/lists/list-item';
import injectTapEventPlugin from 'react-tap-event-plugin';
import ActionAssignment from 'material-ui/lib/svg-icons/action/assignment';
import Colors from 'material-ui/lib/styles/colors';
import Avatar from 'material-ui/lib/avatar';

var React = require('react');
var $ = require("jquery");

var padServer = require("./padServer");

var PadItem = React.createClass({

	getInitialState: function() {
		return {
			lastEditTime : "",
			authors : []
		};
	},

	getSelect : function() {
		this.props.selectPad(this.props.pad_id);
	},

	componentDidMount: function() {
		this.getAuthors();
		this.getLastEditTime();
	},

	getLastEditTime : function() {
		var _this = this;
		var url = padServer.getRequestUrl("getLastEdited", {padID : this.props.pad_id});
		$.getJSON(url, function(res) {
			if(res.message == "ok") {
				var lastEditTime = res.data.lastEdited;
				lastEditTime = new Date(lastEditTime);
				lastEditTime = (lastEditTime.getMonth() + 1) + "-" + lastEditTime.getDate() + " " + lastEditTime.getHours() + ":" + lastEditTime.getMinutes();
				_this.setState({
					lastEditTime : lastEditTime
				})
			}
		});
	},

	getAuthors : function() {
		var _this = this;
		var url = padServer.getRequestUrl("listAuthorsOfPad", {padID : this.props.pad_id});
		$.getJSON(url, function(res) {
			if(res.message == "ok") {
				var authorIDs = res.data.authorIDs;
				authorIDs.forEach(_this.getAuthorName);
			}
		});
	},

	getAuthorName : function(authorID) {
		var _this = this;
		var url = padServer.getRequestUrl("getAuthorName", {authorID});
		$.getJSON(url, function(res) {
			if(res.message == "ok") {
				var authors = _this.state.authors;
				var authorName = res.data;
				if(authors.indexOf(authorName) < 0) {
					authors.push(authorName);
					_this.setState({
						authors 
					});
				}
			}
		});
	},

	getName : function() {
		return this.props.pad_id.split("$")[1];
	},

	render: function() {
		var name = this.getName();
		var authors = this.state.authors.join("，");
		return (
			<ListItem
				leftAvatar={<Avatar icon={<ActionAssignment />} backgroundColor={Colors.blue500} />}
				primaryText={name}
				secondaryText={authors}
				onClick={this.getSelect}
			>
				<span style={{float:"right", color: Colors.grey400}}>{this.state.lastEditTime}</span>
			</ListItem>
		);
	}

});

injectTapEventPlugin();

module.exports = PadItem;