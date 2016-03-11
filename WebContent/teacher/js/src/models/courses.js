var {Model} = require("../data-station/index");
var $ = require("jquery");

var user = require("./user");

var server = require("../utils/server");

var selectedYear = require("./selectedYear");
var years = require("./years")

class Courses extends Model {
	
	constructor() {
		super();
		this._courses = [];
	}

	init() {
		if(!user.id || !selectedYear.year) {
			this.set({
				_courses : []
			});
			return;
		}
		var url = server + `/pad/api/course/teacher/${user.id}/list/by/year/${selectedYear.year}`;
		var _this = this;
		$.get(url, function(res) {
			_this.set({
				_courses : res
			})
		});
	}

	create(course) {
		if(!user.id) {
			return;
		}
		course.teacher_id = user.id;
		course.teacher_name = user.name;
		var now = new Date();
		course.created_time = now.getTime();
		var url = server + `/pad/api/course/teacher/${user.id}/create`;
		var _this = this;
		$.post(url, course, function(res) {
			years.init();
		});
	}

	update(course) {
		if(!course.id) {
			return;
		}
		if(!course.name) {
			return;
		}
		var url = server + `/pad/api/course/${course.id}/update/`;
		var _this = this;
		$.post(url, course, function(res) {
			years.init();
		});
	}

	delete(course) {
		if(!course.id) {
			return;
		}

		var url = server + `/pad/api/course/${course.id}/delete/`;
		var _this = this;
		$.get(url, function(res) {
			_this.init();
		});
	}
}

var courses = new Courses();

courses.addSource(selectedYear, "SelectedYear.change");
courses.addHandler(courses.init.bind(courses), "SelectedYear.change");

module.exports = courses;