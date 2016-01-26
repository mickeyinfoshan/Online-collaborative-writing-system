import LeftNav from 'material-ui/lib/left-nav';

var {Base} = require("../data-station/index");
var React = require('react');
var dialogController = require("../models/dialogController");
var PadContent = require("./PadContent");
var CommentBlock = require("./CommentBlock");

var PadBlock = React.createClass({
	componentDidMount: function() {
		var _this = this;
		this.ds = new Base();
		this.ds.addSource(dialogController, "DialogController.change");
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "DialogController.change");
	},
	render: function() {
		var hide = dialogController.pad == "hide";
		return (
			<LeftNav
	          docked={false}
	          width={600}
	          open={!hide}
	          openRight={true}
	          onRequestChange={(open)=>{
	          	if(!open) {
	          		dialogController.hideAll();
	          	}
	          }}
	        >
				<PadContent />
				<CommentBlock />	          
	        </LeftNav>
		);
	}

});

module.exports = PadBlock;