import injectTapEventPlugin from 'react-tap-event-plugin';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

var React = require('react');
var {Base} = require("../data-station/index");

var selectedCourse = require("./../models/selectedCourse");
var courses = require("./../models/courses");
var dialogController = require("./../models/dialogController");

var CourseDialog = React.createClass({

	getInitialState: function() {
		var now = new Date();
		var year = now.getFullYear();
		year = "" + year;
		return {
			name : "",
			year : year, 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(dialogController, "DialogController.change");
		var _this = this;
		this.ds.addHandler(function() {
			if(dialogController.course == "create" || !selectedCourse.course) {
				_this.state.name = "";
			}
			else if(dialogController.course == "update") {
				_this.state.name = selectedCourse.course.name;
			}
			_this.forceUpdate();
		}, "DialogController.change");
	},

	setName : function(e) {
		this.setState({
			name : this.refs.nameInput.getValue() 
		});
	},

	setYear : function(e) {
		this.setState({
			year : this.refs.yearInput.getValue() 
		});
	},

	save : function() {
		if(!this.state.name) {
			return;
		}

		if(dialogController.course == "create") {
			courses.create({
				name : this.state.name,
				year : this.state.year
			});
		}

		if(dialogController.course == "update") {
			if(!selectedCourse.course) {
				return;
			}
			courses.update({
				id : selectedCourse.course.id,
				name : this.state.name,
				year : this.state.year
			});
		}
	},

	render: function() {
		
		const actions = [
			<FlatButton
	        	label="取消"
	        	secondary={true}
	        	onTouchTap={dialogController.hideAll.bind(dialogController)} />,
		  <FlatButton
		    label="确定"
		    primary={true}
		    keyboardFocused={true}
		    onTouchTap={this.save} />,
		];

	    var hide = dialogController.course == "hide";

	    var title = "";

	    if(dialogController.course == "create") {
	    	title = "添加";
	    }

	    if(dialogController.course == "update") {
	    	title = "编辑";
	    }

	    title += "课程";

	    return (
	        <Dialog
	          title={title}
	          actions={actions}
	          modal={false}
	          open={!hide}
	          onRequestClose={dialogController.hideAll.bind(dialogController)}>
	          
	          <TextField floatingLabelText="请输入课程名称" ref="nameInput" hintText="" onChange={this.setName} value={this.state.name} />
	          &nbsp;&nbsp;
	          <TextField floatingLabelText="请输入课程年份" ref="yearInput" hintText="" onChange={this.setYear} value={this.state.year} />		          
	        </Dialog>
   		);
		
	}
});

injectTapEventPlugin();

module.exports = CourseDialog;