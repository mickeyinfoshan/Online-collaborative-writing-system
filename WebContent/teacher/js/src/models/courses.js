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
		var url = server + `/pad/api/course/${user.id}/list`;
		var _this = this;
		$.get(url, function(res) {
			_this.set({
				_courses : res
			})
		});
	}

	addCourse(course) {
		if(!user.id) {
			return;
		}
		course.teacher_id = user.id;
		course.teacher_name = user.name;
		var url = server + `/pad/api/course/${user.id}/create`;
		var _this = this;
		$.post(url, course, function(res) {
			_this.init();
		});
	}
}

var courses = new Courses();

courses.addSource(user, "User.change");
courses.addHandler(courses.init.bind(courses), "User.change");

module.exports = courses;