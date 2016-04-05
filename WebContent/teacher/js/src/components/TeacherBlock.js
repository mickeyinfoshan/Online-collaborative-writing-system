var React = require('react');
var $ = require("jquery");

var TeacherBlock = React.createClass({
	getInitialState: function() {
		return {
			teachers : [],
			editing : false, 
		};
	},
	componentDidMount: function() {
	  this.getTeachers();
	},
	getTeachers : function() {
		var url = `/pad/api/course/{this.props.course.id}/teacher/list`;
		$.get(url, function(res) {
			this.setState({
				teachers : [] 
			});
		}.bind(this));
	},
	addTeachers : function(teachers) {
		var url = `/pad/api/course/{this.props.course.id}/add/teacher`;
		$.post(url, function(res) {
			this.getTeachers();
		}.bind(this));
	},
	render: function() {
		return (
			<div>
				课程老师：
			</div>
		);
	}

});

module.exports = TeacherBlock;