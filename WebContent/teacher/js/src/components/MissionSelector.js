import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';

var React = require('react');
var {Base} = require("../data-station/index");

var missions = require("./../models/missions");
var selectedMission = require("./../models/selectedMission");

var MissionSelector = React.createClass({

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(missions, "Missions.change");
		this.ds.addSource(selectedMission, "SelectedMission.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "Missions.change");
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "SelectedMission.change");
	},
	handleChange : function(event, index, value) {
		selectedMission.selectMission(value);
	},
	render: function() {
		var selectedValue = selectedMission.mission ? selectedMission.mission.id : -1;
		var missionItems = missions._missions.map((mission)=>{
			var key = "mission" + mission.id;
			return <MenuItem value={mission.id} primaryText={mission.name} key={key} />;
		});
		return (
			 <SelectField value={selectedValue} onChange={this.handleChange}>
		        <MenuItem value={-1} primaryText="请选择"/>
		        {missionItems}
		     </SelectField>
		);
	}

});

injectTapEventPlugin();

module.exports = MissionSelector;