var React = require('react');
var Base = require("./data-station/index").Base;
var CourseSelector = require("./components/CourseSelector");
var MissionSelector = require("./components/MissionSelector");
var MissionDialog = require("./components/MissionDialog");
var CourseDialog = require("./components/CourseDialog");
var LoginDialog = require("./components/LoginDialog");
var PadBlock = require("./components/PadBlock");
var Header = require("./components/Header");
var PadList = require("./components/PadList");
var SelectedCourseBlock = require("./components/SelectedCourseBlock");
var SelectedMissionBlock = require("./components/SelectedMissionBlock");

var dialogController = require("./models/dialogController");
var selectedCourse = require("./models/selectedCourse");
var user = require("./models/user");

import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import IconButton from 'material-ui/lib/icon-button';
import injectTapEventPlugin from 'react-tap-event-plugin';

var App = React.createClass({

	componentDidMount: function() {
		var _this = this;
		this.ds = new Base();
		this.ds.addSource(selectedCourse, "SelectedCourse.change");
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "SelectedCourse.change");
		user.set({
			id : -1,
			name : "管理员",
			email : "email@email.com"
		});

	},

	render: function() {
		var missionSelect = "";
		if(selectedCourse.course) {
			missionSelect = (
				<span style={{marginLeft : 30}}>
					作业：<MissionSelector />
					<IconButton 
						tooltip="添加作业" 
						touch={true} 
						tooltipPosition="bottom-center"
						onClick={()=>{
							dialogController.show("mission", "create");
						}}
					>
      					<ContentAdd />
    				</IconButton>
				</span>
			);
		}
		return (
			<div>
				<Header />
				<div style={{borderBottom : "solid 1px #ccc", padding : 28}}>
					课程：<CourseSelector />
					<IconButton 
						tooltip="添加课程" 
						touch={true} 
						tooltipPosition="bottom-center"
						onClick={()=>{
							dialogController.show("course", "create");
						}}
					>
      					<ContentAdd />
    				</IconButton>
					{missionSelect}
				</div>
				<div>
					<div style={{width : "20%", display: "inline-block", verticalAlign:"top"}}>
						<SelectedCourseBlock />
						<SelectedMissionBlock />
					</div>
					<div style={{width : "80%", display: "inline-block", verticalAlign:"top", overflowY:"auto"}}>
						<PadList />
					</div>
				</div>
				<MissionDialog />
				<CourseDialog />
				<LoginDialog />
				<PadBlock />
			</div>
		);
	}

});

injectTapEventPlugin();
module.exports = App;