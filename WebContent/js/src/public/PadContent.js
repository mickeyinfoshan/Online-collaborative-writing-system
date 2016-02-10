var React = require('react');
var $ = require("jquery");
var padServer = require("./padServer");

var PadContent = React.createClass({
	
	getInitialState: function() {
		return {
			content : "" 
		};
	},

	componentDidMount: function() {
		this.getContent();
	},

	componentDidUpdate: function(prevProps, prevState) {
		if(prevProps.pad_id != this.props.pad_id) {
			this.getContent();
		}
	},

	getContent : function() {
		if(!this.props.pad_id) {
			return;
		}
		var _this = this;
		var pad_id = this.props.pad_id;
		var url = padServer.getRequestUrl("getHTML", {padID : pad_id});
		$.getJSON(url, function(res) {
			if(res.message == "ok") {
				var html = res.data.html;
				_this.setState({
					content : html 
				});
			}
		});
	},

	render: function() {
		var content = this.state.content || "暂无内容";
		var name = "";
		if(this.props.pad_id) {
			name = this.props.pad_id.split("$")[1];
		}
		return (
			<div style={{borderBottom : "solid 1px #ccc"}}>
				<h2 style={{borderBottom : "solid 1px #ccc", padding: 15}}>{name}</h2>
				<div dangerouslySetInnerHTML={{__html: content}} style={{padding : 15}} />
			</div>
		);
	}

});

module.exports = PadContent;