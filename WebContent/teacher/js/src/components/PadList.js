var React = require('react');
import List from 'material-ui/lib/lists/list';
var pads = require("../models/pads")
var {Base} = require("../data-station/index");
var PadItem = require("./PadItem");

var PadList = React.createClass({

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(pads, "Pads.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "Pads.change");
	},

	render: function() {
		if(pads._pads.length == 0) {
			return <div />
		}
		var padItems = pads._pads.map((pad)=><PadItem pad_id={pad.pad_id} key={pad.pad_id}/>);
		var title = pads._pads.length + " 份作业";
		return (
			<List subheader={title} style={{overflowY:"auto"}}>
				{padItems}
			</List>
		);
	}

});

module.exports = PadList;