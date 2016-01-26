var React = require('react');

var selectedMission = require("../models/selectedMission");
var dialogController = require("../models/dialogController");
var missions = require("../models/missions");
var Base = require("../data-station").Base;

import FlatButton from 'material-ui/lib/flat-button';
import injectTapEventPlugin from 'react-tap-event-plugin';

var SelectedMissionBlock = React.createClass({

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(selectedMission, "SelectedMission.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "SelectedMission.change");
	},

	deleteMission : function() {
		if(!selectedMission.mission) {
			return;
		}
		if(!confirm("确定删除该课程吗？")) {
			return;
		}

		missions.delete({
			id : selectedMission.mission.id
		});

	},

	render: function() {
		if(!selectedMission.mission) {
			return <div />;
		}

		function getDateStr(timestamp) {
			timestamp = Number(timestamp);
			var d = new Date(timestamp);
			var year = d.getFullYear();
			var month = d.getMonth() + 1;
			var day = d.getDate();
			return `${year}-${month}-${day}`;
		}

		var created_time = getDateStr(selectedMission.mission.created_time);
		var start = getDateStr(selectedMission.mission.start);
		var end = getDateStr(selectedMission.mission.end);
		return (
			<div style={{paddingLeft : 28}}>
				<h4>作业名称：{selectedMission.mission.name}</h4>
				<p>创建时间：{created_time}</p>
				<p>开始时间：{start}</p>
				<p>结束时间：{end}</p>
				<p>
					<FlatButton label="编辑" secondary={true} onClick={()=>{dialogController.show("mission", "update")}} />
				</p>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = SelectedMissionBlock;