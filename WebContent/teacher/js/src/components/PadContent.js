var React = require('react');
var $ = require("jquery");
var {Base} = require("../data-station/index");
var selectedPad = require("../models/selectedPad");
var padServer = require("../utils/padServer");
import Paper from 'material-ui/lib/paper';

var PadContent = React.createClass({
	
	getInitialState: function() {
		return {
			content : "" 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(selectedPad, "SelectedPad.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.getContent();
		}, "SelectedPad.change");
	},

	getContent : function() {
		if(!selectedPad.pad) {
			return;
		}
		var _this = this;
		var pad_id = selectedPad.pad.pad_id;
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
		if(selectedPad.pad) {
			name = selectedPad.pad.pad_id.split("$")[1];
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