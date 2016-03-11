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
			studentCount : 0,
			groupCount : 0,
			importing : false
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
				studentCount : Number(res.studentCount),
				groupCount : Number(res.groupCount)
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
	importStudents : function() {
		var formData = new FormData();
		this.setState({
			importing : true 
		});
		var _this = this;
		formData.append('file', $('input[type=file]')[0].files[0]);
		var url = `/pad/api/course/${selectedCourse.course.id}/student/import/`;
		$.ajax({
			url : url,
			data: formData,
			contentType: false,
    		processData: false,
    		method : "POST"
		}).done(function(res) {
			if(res == "200") {
				_this.setState({
					importing : false 
				});
				_this.getStudentCount();
				alert("导入成功");
			}
		}).fail(function(){
			_this.setState({
				importing : false 
			});
			alert("导入失败");
		});
	},
	render: function() {
		if(!selectedCourse.course) {
			return <div />;	
		}
		var created_time = new Date(Number(selectedCourse.course.created_time));
		var year = created_time.getFullYear();
		var month = created_time.getMonth() + 1;
		var day = created_time.getDate();
		created_time = `${year}-${month}-${day}`;
		var importStudentButton = (
			<p>
				<input type="file" name="file" id="studentFileInput"/>
				<button onClick={this.importStudents}>导入学生</button><br />
				<a href="/pad/template.xlsx" target="_blank">导入模板下载</a>
			</p>);
		var studentCountText = <p>学生选课：{this.state.studentCount}人({this.state.groupCount}组)</p>;
		var studentBlock = this.state.studentCount > 0 ? studentCountText : importStudentButton;
		if(this.state.importing) {
			studentBlock = "导入学生中，请稍后"
		}
		return (
			<div style={{paddingLeft : 28}}>
				<h4>课程名称：{selectedCourse.course.name}</h4>
				<p>创建时间：{created_time}</p>
				{studentBlock}
				<p>
					<FlatButton label="编辑" secondary={true} onClick={()=>{dialogController.show("course", "update")}} />
				</p>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = SelectedCourseBlock;