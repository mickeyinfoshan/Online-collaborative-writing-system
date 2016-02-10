var React = require('react');
var $ = require("$");
var PadItem = require("./PadItem");
import List from 'material-ui/lib/lists/list';

var PublicList = React.createClass({

	getInitialState: function() {
		return {
			pads : [] 
		};
	},

	getPads : function() {
		var url = this.props.url;
		if(!url) {
			return;
		}
		$.get(url, function(res) {
			this.setState({
				pads : res 
			});
		}.bind(this));
	},

	componentDidUpdate: function(prevProps, prevState) {
		if(prevProps.url != this.props.url) {
			this.getPads();
		}
	},

	render: function() {
		if(this.state.pads.length == 0) {
			return <div />
		}
		var padItems = this.state.pads.map((pad)=><PadItem pad_id={pad.pad_id} key={pad.pad_id} selectPad={this.props.selectPad} />);
		return (
			<List>
				{padItems}
			</List>
		);
	}

});

module.exports = PublicList;