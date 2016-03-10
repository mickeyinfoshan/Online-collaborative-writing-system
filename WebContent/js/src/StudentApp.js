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
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import TextField from 'material-ui/lib/text-field';

var PublicBlock = require("./public/PublicBlock");

var StudentApp = React.createClass({

	getInitialState: function() {
		return {
			user : null,
			selectedCourses : [],
			currentCourse : null,
			members : [],
			missionPad : null,
			addCourseDialog : false,
			missions : [],
			currentMission : null,
		};
	},

	componentDidMount: function() {
	  //this.getUser();
	},
	login : function() {
		var email = this.refs.loginEmailInput.getValue();
		var password = this.refs.loginPasswordInput.getValue();
		if(!email || !password) {
			return;
		}
		var dataToPost = {};
		dataToPost["user.username"] = email;
		dataToPost["user.password"] = password;
		var url = "/pad/login";
		$.post(url, dataToPost, function(res) {
			res = JSON.parse(res);
			if(res.message == "ok") {
				this.getUser();
			}
			else {
				alert("邮箱或学号错误");
			}
		}.bind(this));
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
		//this.getNotSelectedCourses();
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

	getMembers : function() {
		var userId = this.getUserId();
		if(!this.state.currentCourse) {
			return;
		}
		var courseId = this.state.currentCourse.id;
		var url = `/pad/api/course/${courseId}/student/${userId}/members`;
		$.get(url, function(res) {
			this.setState({
				members : res 
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

	getMissionPad : function() {
		var userId = this.getUserId();
		if(!this.state.currentMission) {
			return;
		}
		var missionId = this.state.currentMission.id;
		var url = `/pad/api/mission/${missionId}/pad/for/${userId}`;
		$.get(url, function(res) {
			this.setState({
				missionPad : res 
			});
		}.bind(this));
	},

	selectCourse : function(course) {
		if(this.state.currentCourse) {
			if(this.state.currentCourse.id == course.id) {
				return;
			}
		}
		this.setState({
			currentCourse : course 
		}, function(){
			this.getMissions();
			this.getMembers();
		}.bind(this));
	},

	selectMission : function(mission) {
		if(this.state.currentMission) {
			if(this.state.currentMission.id == mission.id) {
				return;
			}
		}
		this.setState({
			currentMission : mission 
		}, function() {
			this.getMissionPad();
		}.bind(this));
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

	toEdit : function() {
		window.users = this.state.members;
		var group = {
			status : 0,
			id : this.state.missionPad.group_id,
			name : this.state.members[0].name
		};
		var padName = this.state.missionPad.pad_id.split("$")[1];
		window.edit = {
			user : this.state.user,
			group : group,
			name : padName,
			groupID : this.state.missionPad.group_id
		};
		window.open("/pad/edit.html", "edit_window");
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
	        		<MenuItem primaryText="退出" onClick={()=>{
	        			this.setState({
	        				user : null 
	        			});
	        		}} />
	      		</IconMenu>
			);
		}
		
		var selectedCourseItems = this.state.selectedCourses.map((course)=>{
			var key = "selectedCourse" + course.id;
			return <ListItem key={key} onClick={_this.selectCourse.bind(_this, course)}
					>
						{course.name}
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
		        label="登录"
		        primary={true}
		        keyboardFocused={true}
		        onTouchTap={this.login} />,
		];

		var courseToAddValue = -1;
		if(this.state.courseToAdd) {
			courseToAddValue = this.state.courseToAdd.id;
		}

		var notSelectedCourseItems = "";

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
			var toEditButton = <FlatButton
		        label="编写作业"
		        secondary={true}
		        onTouchTap={this.toEdit} />;
			if(now > currentMission.end) {
				dateNotifyStr = "（已截止）";
				toEditButton = <span>该作业已截止</span>;
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
						{currentMission.desc}
						<div style={{textAlign : "right", fontSize : 15, color : "#aaa", marginTop : 50}}>{currentMissionCreateTime}</div>
					</div>
					{toEditButton}
					<div style={{borderTop : "solid 1px #ccc"}}>
						<p>公开的文章</p>
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
									padding : 15,
									borderBottom : "solid 1px #ccc"
						}}>
							<span style={{fontSize : 18}}>我的课程</span>
						</div>
						<List>
							{selectedCourseItems}
						</List>
					</div>
					{missionListBlock}
					{missionDetailBlock}
				</div>
				<Dialog
		          title="登录"
		          actions={actions}
		          modal={true}
		          open={!this.state.user}
		          onRequestClose={()=>{}}>
		        	<TextField
      					ref="loginEmailInput"
      					floatingLabelText="请填写您的邮箱"
    				/>
    				&nbsp;&nbsp;
    				&nbsp;
    				<TextField 
    					ref="loginPasswordInput"
    					floatingLabelText="请填写您的学号"
    					type="password"
    				/>
		        </Dialog>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = StudentApp;