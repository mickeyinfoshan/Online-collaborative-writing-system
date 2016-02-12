//写得比较casual

var React = require('react');
var $ = require("jquery");
var _ = require("lodash");

import AppBar from 'material-ui/lib/app-bar';
import IconMenu from 'material-ui/lib/menus/icon-menu';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Avatar from 'material-ui/lib/avatar';
import Colors from 'material-ui/lib/styles/colors';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import IconButton from 'material-ui/lib/icon-button';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import ContentClear from 'material-ui/lib/svg-icons/content/clear';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import SelectField from 'material-ui/lib/select-field';

var PublicBlock = require("./public/PublicBlock");

var StudentApp = React.createClass({

	getInitialState: function() {
		return {
			user : null,
			selectedCourses : [],
			currentCourse : null,
			notSelectedCourses : [],
			addCourseDialog : false,
			courseToAdd : null,
			missions : [],
			currentMission : null
		};
	},

	componentDidMount: function() {
	  this.getUser();
	},

	getUser : function() {
		$.get("/pad/getInfo", function(res) {
			res = JSON.parse(res);
			console.log(res.user);
			this.setState({
				user : res.user 
			}, this.getCourses.bind(this));
		}.bind(this));
	},

	getCourses : function() {
		if(!this.state.user) {
			return;
		}
		this.getSelectedCourses();
		this.getNotSelectedCourses();
	},

	getSelectedCourses : function() {
		var userId = this.getUserId();
		var url = `/pad/api/course/student/${userId}/selected`;
		$.get(url, function(res) {
			var currentCourse = this.state.currentCourse;
			var currentIndex = _.findIndex(res, function(c) {
				if(!currentCourse) {
					return false;
				}
				return c.id == currentCourse.id;
			});
			var _currentCourse = currentIndex >=0 ? res[currentIndex] : null;
			this.setState({
				selectedCourses : res,
				currentCourse : _currentCourse
			});
		}.bind(this));
	},

	getNotSelectedCourses : function() {
		var userId = this.getUserId();
		var url = `/pad/api/course/student/${userId}/not/selected`;
		$.get(url, function(res) {
			this.setState({
				notSelectedCourses : res,
				courseToAdd : null
			});
		}.bind(this));
	},

	getUserId : function() {
		if(!this.state.user) {
			return "";
		}
		return this.state.user.authorId;
	},

	getMissions : function() {
		if(!this.state.currentCourse) {
			return;
		}
		var url = `/pad/api/course/${this.state.currentCourse.id}/mission/list`;
		$.get(url, function(res) {
			res.forEach((m)=> {
				m.start = new Date(Number(m.start));
				m.end = new Date(Number(m.end));
				m.created_time = new Date(Number(m.created_time));
			});
			var currentMission = this.state.currentMission;
			var currentIndex = _.findIndex(res, function(m) {
				if(!currentMission) {
					return false;
				}
				return currentMission.id == m.id;
			});
			var _currentMission = currentIndex < 0 ? null : res[currentIndex];
			this.setState({
				missions : res,
				currentMission : _currentMission 
			});
		}.bind(this))
	},

	selectCourse : function(course) {
		if(this.state.currentCourse) {
			if(this.state.currentCourse.id == course.id) {
				return;
			}
		}
		this.setState({
			currentCourse : course 
		}, this.getMissions.bind(this));
	},

	selectMission : function(mission) {
		if(this.state.currentMission) {
			if(this.state.currentMission.id == mission.id) {
				return;
			}
		}
		this.setState({
			currentMission : mission 
		});
	},

	hideAddCourseDialog : function() {
		this.setState({
			addCourseDialog : false 
		});
	},

	showAddCourseDialog : function() {
		this.setState({
			addCourseDialog : true,
			courseToAdd : null 
		});
	},

	addCourse : function() {
		if(!this.state.courseToAdd) {
			return;
		}
		var userId = this.getUserId();
		var url = `/pad/api/course/${this.state.courseToAdd.id}/student/add/${userId}`;
		var _this = this;
		$.get(url, function(res) {
			_this.getCourses();
			_this.hideAddCourseDialog();
		});
	},

	removeCourse : function(course, e) {
		e.stopPropagation();
		if(!course) {
			return;
		}
		if(!confirm("你确定删除该课程吗？")) {
			return;
		}
		var userId = this.getUserId();
		var url = `/pad/api/course/${course.id}/student/remove/${userId}`;
		var _this = this;
		$.get(url, function(res) {
			_this.getCourses();
		});
	},

	selectCourseToAdd : function(event, index, value) {
		var courseIndex = _.findIndex(this.state.notSelectedCourses, function(c) {
			return c.id == value;
		});
		if(courseIndex < 0) {
			return;
		}
		var course = this.state.notSelectedCourses[courseIndex];
		this.setState({
			courseToAdd : course 
		});
	},

	render: function() {
		var title = "课程作业";
		var rightElement = <span></span>;
		var _this = this;
		var user = this.state.user;
		if(user) {
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
	        		<MenuItem primaryText="退出" onClick={window.close.bind(window)} />
	      		</IconMenu>
			);
		}
		
		var selectedCourseItems = this.state.selectedCourses.map((course)=>{
			var key = "selectedCourse" + course.id;
			return <ListItem key={key} onClick={_this.selectCourse.bind(_this, course)}
					rightIcon={<ContentClear onClick={_this.removeCourse.bind(_this, course)} />}
			>
						{course.name} - {course.teacher_name}
					</ListItem>
		});
		var missionItems = this.state.missions.map((mission)=>{
			var key = "mission" + mission.id;
			return <ListItem key={key} 
							 onClick={_this.selectMission.bind(_this, mission)} >
						{mission.name}
				   </ListItem>
		});

		if(this.state.missions.length == 0) {
			missionItems = <ListItem>暂无作业</ListItem>;
		}

		var missionListBlock = (
			<div style={{
						width : "28%",
						height : "100%",
						borderRight: "solid 1px #ccc"
					}}>
						<div style={{display : "flex", 
									justifyContent: "space-between", 
									alignItems : "center",
									padding : 15,
									borderBottom : "solid 1px #ccc"
						}}>
							<span style={{fontSize : 18}}>作业列表</span>
							
						</div>
						
							<List>
								{missionItems}
							</List>
					</div>
		);

		if(!this.state.currentCourse) {
			missionListBlock = "";
		}

		const actions = [
		      <FlatButton
		        label="取消"
		        secondary={true}
		        onTouchTap={this.hideAddCourseDialog} />,
		      <FlatButton
		        label="确定"
		        primary={true}
		        keyboardFocused={true}
		        onTouchTap={this.addCourse} />,
		];

		var courseToAddValue = -1;
		if(this.state.courseToAdd) {
			courseToAddValue = this.state.courseToAdd.id;
		}

		var notSelectedCourseItems = this.state.notSelectedCourses.map((course)=>{
			var key = "notSelectedCourse" + course.id;
			var text = course.name + " - " + course.teacher_name;
			return <MenuItem key={key} value={course.id} primaryText={text} />
		});

		var missionDetailBlock = "";

		function getDateStr(d) {
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var date = d.getDate();
			return `${year}-${month}-${date}`;
		}

		if(this.state.currentMission && this.state.currentCourse) {
			var currentMission = this.state.currentMission;
			var start = getDateStr(currentMission.start);
			var end = getDateStr(currentMission.end);
			var dateNotifyStr = "";
			var now = new Date();
			if(now > currentMission.end) {
				dateNotifyStr = "（已截止）";
			}

			if(now < currentMission.start) {
				dateNotifyStr = "（未开始）";
			}
			var currentMissionCreateTime = getDateStr(currentMission.created_time);
			var publicPadUrl = `/pad/api/public/pad/mission/${currentMission.id}`;
			missionDetailBlock = (
				<div style={{height : "100%" , padding : 18, boxSizing : "border-box", width : "44%"}}>
					<div style={{borderBottom : "solid 1px #ccc", paddingBottom : 15}}>
						<div style={{fontSize : 21, textAlign : "center", marginBottom : 15}}>{this.state.currentMission.name}</div>
						<div style={{textAlign : "right", fontSize : 15, color : "#aaa"}}>{start}  -  {end}  {dateNotifyStr}</div>
					</div>
					<div style={{paddingTop : 20, lineHeight : 1.5}}>
						{currentMission.content}
						<div style={{textAlign : "right", fontSize : 15, color : "#aaa", marginTop : 50}}>{currentMissionCreateTime}</div>
					</div>
					<div style={{borderTop : "solid 1px #ccc"}}>
						<p>该作业公开的文章</p>
						<div>
							<PublicBlock url={publicPadUrl} />
						</div>
					</div>
				</div>
			);
		}

		return (
			<div style={{height : "100%"}}>
				<AppBar
				    title={title}
				    showMenuIconButton={false}
				    iconElementRight={rightElement}
				/>
				<div style={{height : "calc(100% - 64px)", display : "flex"}}>
					<div style={{
								width : "28%", 
								height : "100%", 
								borderRight: "solid 1px #ccc"}}>
						<div style={{display : "flex", 
									justifyContent: "space-between", 
									alignItems : "center",
									paddingLeft : 15,
									paddingRight : 15,
									borderBottom : "solid 1px #ccc"
						}}>
							<span style={{fontSize : 18}}>我的课程</span>
							<IconButton 
								tooltip="添加课程" 
								touch={true} 
								tooltipPosition="bottom-center"
								onClick={_this.showAddCourseDialog}
							>
		      					<ContentAdd />
	    					</IconButton>
						</div>
						<List>
							{selectedCourseItems}
						</List>
					</div>
					{missionListBlock}
					{missionDetailBlock}
				</div>
				<Dialog
		          title="添加课程"
		          actions={actions}
		          modal={false}
		          open={this.state.addCourseDialog}
		          onRequestClose={this.hideAddCourseDialog}>
		           <span>课程：</span>
		           <SelectField value={courseToAddValue} onChange={this.selectCourseToAdd}>
		           	<MenuItem value={-1} primaryText="请选择"/>
		           	{notSelectedCourseItems}
		           </SelectField>
		        
		        </Dialog>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = StudentApp;