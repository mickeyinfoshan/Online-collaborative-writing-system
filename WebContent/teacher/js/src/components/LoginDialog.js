import injectTapEventPlugin from 'react-tap-event-plugin';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

var React = require('react');
var {Base} = require("../data-station/index");

var user = require("./../models/user");
var dialogController = require("./../models/dialogController");

var LoginDialog = React.createClass({

	getInitialState: function() {
		return {
			email : "",
			password : "" 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(dialogController, "DialogController.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "DialogController.change");
	},

	setEmail : function() {
		this.setState({
			email : this.refs.emailInput.getValue() 
		});
	},

	setPassword : function() {
		this.setState({
			password : this.refs.passwordInput.getValue() 
		});
	},

	canLogin : function() {
		return this.state.email != "" && this.state.password != "";
	},

	login : function() {
		if(!this.canLogin()) {
			return;
		}
		user.login(this.state.email, this.state.password);
	},

	render: function() {
		
		const actions = [
		  <FlatButton
		    label="登录"
		    primary={true}
		    keyboardFocused={true}
		    onTouchTap={this.login} />,
		];

	    var hide = dialogController.login == "hide";

	    return (
	        <Dialog
	          title="请登录"
	          actions={actions}
	          modal={false}
	          open={!hide}
	          >
	          
	          <TextField floatingLabelText="请输入用户名" ref="emailInput" hintText="邮箱" onChange={this.setEmail} />
	          <br />
	          <TextField floatingLabelText="请输入密码" ref="passwordInput" type="password" onChange={this.setPassword} />			          
	        </Dialog>
   		);
		
	}

});

injectTapEventPlugin();

module.exports = LoginDialog;