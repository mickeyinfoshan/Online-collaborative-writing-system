var {Model} = require("../data-station/index");
var $ = require("jquery");

var selectedCourse = require("./selectedCourse");
var server = require("../utils/server");

class Missions extends Model {
	constructor() {
		super();
		this._missions = [];
	}

	init() {
		if(!selectedCourse.course) {
			this.set({
				_missions : []
			});
			return;
		}
		var url = server + `/pad/api/mission/${selectedCourse.course.id}/list`;
		var _this = this;
		$.get(url, function(res) {
			_this.set({
				_missions : res
			});
		});
	}

	addMission(mission) {
		var _this = this;
		if(!selectedCourse.course) {
			return;
		}
		var url = server + `/pad/api/mission/${selectedCourse.course.id}/create`;
		$.post(url, mission, function(res) {
			_this.init();
		});
	}
};

var missions = new Missions();

missions.addSource(selectedCourse, "SelectedCourse.change");
missions.addHandler(missions.init.bind(missions), "SelectedCourse.change");

module.exports = missions;