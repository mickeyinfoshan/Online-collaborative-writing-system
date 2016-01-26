var {Model} = require("../data-station/index");
var $ = require("jquery");

var user = require("./user");

var server = require("../utils/server");

class Courses extends Model {
	
	constructor() {
		super();
		this._courses = [];
	}

	init() {
		if(!user.id) {
			this.set({
				_courses : []
			});
			return;
		}
		var url = server + `/pad/api/course/teacher/${user.id}/list`;
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
			_this.init();
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
			_this.init();
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

courses.addSource(user, "User.change");
courses.addHandler(courses.init.bind(courses), "User.change");

module.exports = courses;