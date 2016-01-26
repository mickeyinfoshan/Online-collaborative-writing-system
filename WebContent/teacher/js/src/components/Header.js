var React = require('react');
import AppBar from 'material-ui/lib/app-bar';
var {Base} = require("../data-station/index")
var user = require("../models/user");
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Avatar from 'material-ui/lib/avatar';
import Colors from 'material-ui/lib/styles/colors';

var Header = React.createClass({
	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(user, "User.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "User.change");
	},
	render: function() {
		var title = "作业管理";
		var rightElement = <span></span>;
		if(user.name) {
			var letter = user.name.charAt(0);
			rightElement = (
				<IconMenu
        			iconButtonElement={
          				<Avatar style={{
          					backgroundColor : "#fff",
          					color : "#000"
          				}}>
          					<bold>{letter}</bold>
          				</Avatar>
	        		}
	        		targetOrigin={{horizontal: 'right', vertical: 'top'}}
	        		anchorOrigin={{horizontal: 'right', vertical: 'top'}}
	      		>
	        		<MenuItem primaryText="帮助" />
	        		<MenuItem primaryText="退出" onClick={user.logout.bind(user)} />
	      		</IconMenu>
			);
		}
		return (
			<AppBar
			    title={title}
			    showMenuIconButton={false}
			    iconElementRight={rightElement}
			/>
		);
	}

});

injectTapEventPlugin();

module.exports = Header;