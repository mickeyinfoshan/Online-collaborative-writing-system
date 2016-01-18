var {Model} = require("../data-station/index");

var missions = require("./missions");

var _ = require("lodash");

class SelectedMission extends Model {

	constructor() {
		super();
		this.mission = null;
	}

	selectMission(missionId) {
		var index = _.findIndex(missions._missions, function(c) {
			return c.id == missionId;
		});
		if(index < 0) {
			return;
		}
		var mission = missions._missions[index];
		this.set({
			mission
		});
	}
}

var selected = new SelectedMission();

selected.addSource(missions, "Missions.change");

selected.addHandler(function() {
	var currentMission = selected.mission;
	var index = _.findIndex(missions._missions, function(c) {
		if(!currentMission) {
			return false;
		}
		return c.id == currentMission.id;
	});
	if(index < 0) {
		selected.set({
			mission : null
		});
	}
}, "Missions.change");

module.exports = selected;