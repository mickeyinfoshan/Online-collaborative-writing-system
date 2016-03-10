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
		var url = server + `/pad/api/course/${selectedCourse.course.id}/mission/list`;
		var _this = this;
		$.get(url, function(res) {
			res.forEach((m)=>{
				m.desc = m.description
			})
			_this.set({
				_missions : res
			});
		});
	}

	create(mission) {
		var _this = this;
		if(!selectedCourse.course) {
			return;
		}
		var now = new Date();
		mission.created_time = now.getTime();
		var url = server + `/pad/api/course/${selectedCourse.course.id}/mission/create`;
		$.post(url, mission, function(res) {
			_this.init();
		});
	}

	update(mission) {
		var _this = this;
		if(!mission.id) {
			return;
		}
		var url = server + `/pad/api/mission/${mission.id}/update`;
		$.post(url, mission, function(res) {
			_this.init();
		});
	}
};

var missions = new Missions();

missions.addSource(selectedCourse, "SelectedCourse.change");
missions.addHandler(missions.init.bind(missions), "SelectedCourse.change");

module.exports = missions;