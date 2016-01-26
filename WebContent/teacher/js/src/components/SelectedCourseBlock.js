var React = require('react');

var selectedCourse = require("../models/selectedCourse");
var dialogController = require("../models/dialogController");
var courses = require("../models/courses");
var server = require("../utils/server");
var Base = require("../data-station").Base;
var $ = require("jquery");

import FlatButton from 'material-ui/lib/flat-button';
import injectTapEventPlugin from 'react-tap-event-plugin';

var SelectedCourseBlock = React.createClass({

	getInitialState: function() {
		return {
			studentCount : 0 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(selectedCourse, "SelectedCourse.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
			_this.getStudentCount();
		}, "SelectedCourse.change");
		this.getStudentCount();
	},

	getStudentCount : function() {
		if(!selectedCourse.course) {
			return;
		}
		var url = server + `/pad/api/course/${selectedCourse.course.id}/student/count`;
		$.get(url, function(res) {
			this.setState({
				studentCount : res 
			});
		}.bind(this));
	},

	deleteCourse : function() {
		if(!selectedCourse.course) {
			return;
		}
		if(!confirm("确定删除该课程吗？")) {
			return;
		}

		courses.delete({
			id : selectedCourse.course.id
		});

	},

	render: function() {
		if(!selectedCourse.course) {
			return <div />;	
		}
		var created_time = new Date(selectedCourse.course.created_time);
		var year = created_time.getFullYear();
		var month = created_time.getMonth() + 1;
		var day = created_time.getDate();
		created_time = `${year}-${month}-${day}`;
		return (
			<div style={{paddingLeft : 28}}>
				<h4>课程名称：{selectedCourse.course.name}</h4>
				<p>创建时间：{created_time}</p>
				<p>学生选课：{this.state.studentCount}人</p>
				<p>
					<FlatButton label="编辑" secondary={true} onClick={()=>{dialogController.show("course", "update")}} />
				</p>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = SelectedCourseBlock;