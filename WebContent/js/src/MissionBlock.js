var React = require('react');

import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';
import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';

var $ = require("jquery");
var _ = require("lodash");

var MissionBlock = React.createClass({

	getInitialState: function() {
		return {
			isDialogShow : false,
			courses : [],
			selectedCourseId : -1,
			missions : [],
			selectedMissionId : -1,
		};
	},

	setDialog : function(show) {
		this.setState({
			isDialogShow : show
		});
	},

	showDialog : function() {
		this.getCourses();
		this.setDialog(true);
	},

	hideDialog : function() {
		this.setDialog(false);
		this.setState({
			courses : [],
			selectedCourseId : -1,
			missions : [],
			selectedMissionId : -1 
		});
	},
	save : function() {
		if(this.state.selectedCourseId < 0 || this.state.selectedMissionId < 0) {
			return;
		}
		if(!window.GLOBAL.pad_id) {
			return;
		}
		var pad_id = window.GLOBAL.pad_id;
		var url = `/pad/api/mission/${this.state.selectedMissionId}/pad/add/${pad_id}`; 
		$.get(url, function(res) {
			this.hideDialog();
		}.bind(this));
	},
	getCourses : function() {
		if(!window.GLOBAL.user_id) {
			return;
		}
		var userId = window.GLOBAL.user_id;
		var url = `/pad/api/course/student/${userId}/selected`;
		var _this = this;
		$.get(url, function(res) {
			var currentSelectedCourseId = _this.state.selectedCourseId;
			var selectedCourseId = _.indexOf(res, (course)=>course.id === currentSelectedCourseId) >= 0 ? currentSelectedCourseId : -1;
			_this.setState({
				courses : res,
				selectedCourseId : selectedCourseId 
			});
		});
	},
	getMissions : function() {
		if(this.state.selectedCourseId < 0) {
			this.setState({
				missions : [],
				selectedMissionId : -1 
			});
			return;
		}

		var url = `/pad/api/course/${this.state.selectedCourseId}/mission/list`;
		var _this = this;
		$.get(url, function(res) {
			var currentSelectedMissionId = _this.state.selectedMissionId;
			var selectedMissionId = _.indexOf(res, (mission)=>mission.id===currentSelectedMissionId)?currentSelectedMissionId:-1;
			_this.setState({
				missions : res,
				selectedMissionId : selectedMissionId
			});
		});
	},
	selectCourse : function(event, index, value) {
		var _this = this;
		this.setState({
			selectedCourseId : value 
		}, function() {
			_this.getMissions();
		});
	},
	selectMission : function(event, index, value) {
		this.setState({
			selectedMissionId : value 
		});
	},
	toCourses : function() {
		this.hideDialog();
		window.open("/pad/courses.html");
	},
	render: function() {
		const actions = [
	      <FlatButton
	        label="取消"
	        secondary={true}
	        onTouchTap={this.hideDialog} />,
	      <FlatButton
	        label="确定"
	        primary={true}
	        keyboardFocused={true}
	        onTouchTap={this.save} />,
	    ];
	    var courses = this.state.courses.map((course)=>{
	    	var key = "course" + course.id;
	    	var text = course.name + " - " + course.teacher_name;
	    	return <MenuItem value={course.id} primaryText={text} key={key} />
	    });

	    var missions = this.state.missions.map((mission)=>{
	    	var key = "mission" + mission.id;
	    	var text = mission.name;
	    	return <MenuItem value={mission.id} primaryText={text} key={key} />
	    });

		return (
			<div>
				<RaisedButton label="提交文章" onTouchTap={this.showDialog} primary={true} />
				<Dialog
		          title="提交文章"
		          actions={actions}
		          modal={false}
		          open={this.state.isDialogShow}
		          onRequestClose={this.hideDialog}>
		          <div>
		          	<span>
		          		<b>课程：</b>
		          		<SelectField value={this.state.selectedCourseId} onChange={this.selectCourse}>
					        <MenuItem value={-1} primaryText="请选择"/>
					        {courses}
					    </SelectField>
					    &nbsp;&nbsp;&nbsp;
					    <b>任务：</b>
					    <SelectField value={this.state.selectedMissionId} onChange={this.selectMission}>
					    	<MenuItem value={-1} primaryText="请选择"/>
					    	{missions}
					    </SelectField>
		          	</span>
		          	<p>若课程不在列表中，可点<span style={{color : "#ff2263", cursor:"pointer"}} onClick={this.toCourses}>这里</span>添加</p>
		          </div>
		        </Dialog>
			</div>
		);
	}

});

injectTapEventPlugin();
module.exports = MissionBlock;