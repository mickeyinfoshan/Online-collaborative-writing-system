var {Model} = require("../data-station/index");

var courses = require("./courses");

var _ = require("lodash");

class SelectedCourse extends Model {

	constructor() {
		super();
		this.course = null;
	}

	selectCourse(courseId) {
		var index = _.findIndex(courses._courses, function(c) {
			return c.id == courseId;
		});
		if(index < 0) {
			return;
		}
		var course = courses._courses[index];
		this.set({
			course
		});
	}
}

var selected = new SelectedCourse();

selected.addSource(courses, "Courses.change");

selected.addHandler(function() {
	var currentCourse = selected.course;
	if(!currentCourse) {
			return false;
	}
	var index = _.findIndex(courses._courses, function(c) {
		return c.id == currentCourse.id;
	});
	if(index < 0) {
		selected.set({
			course : null
		});
	}
	else if(courses._courses[index].name != currentCourse.name) {
		selected.set({
			course : courses._courses[index]
		});
	}
}, "Courses.change");

module.exports = selected;