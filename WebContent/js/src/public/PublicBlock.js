var React = require('react');
var $ = require("jquery")
import LeftNav from 'material-ui/lib/left-nav';

var PublicList = require("./PublicList");
var PadContent = require("./PadContent");
var CommentBlock = require("./CommentBlock");

var PublicBlock = React.createClass({

	getInitialState: function() {
		return {
			selectedPad : null,
			user_name : "",
			user_id : "" 
		};
	},

	selectPad : function(pad_id) {
		this.setState({
			selectedPad : pad_id  
		});
	},

	getUserInfo : function() {
		$.get("/pad/getInfo", function(res) {
			res = JSON.parse(res);
			var user = res.user;
			this.setState({
				user_id : user.authorId,
				user_name : user.name 
			});
		}.bind(this));
	},

	componentDidMount: function() {
		this.getUserInfo();
	},

	render: function() {
		var open = this.state.selectedPad != null ? true : false;
		var padBlock = (
			<LeftNav
	          docked={false}
	          width={600}
	          open={open}
	          openRight={true}
	          onRequestChange={(open)=>{
	          	if(!open) {
	          		console.log(open);
	          		this.selectPad(null);
	          	}
	          }}
	        >
				<PadContent pad_id={this.state.selectedPad} />
				<CommentBlock pad_id={this.state.selectedPad} user_id={this.state.user_id} user_name={this.state.user_name} />	          
	        </LeftNav>
		);

		return (
			<div>
				<PublicList url={this.props.url} selectPad={this.selectPad} />
				{padBlock}
			</div>
		);
	}

});

module.exports = PublicBlock;