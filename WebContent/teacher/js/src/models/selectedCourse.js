var {Model} = require("../data-station/index");

var courses = require("./courses");

var _ = require("lodash");

class SelectedCourse extends Model {

	constructor() {
		super();
		this.course = null;
	}

	selectCourse(courseId) {
		console.log(courseId);
		var index = _.findIndex(courses._courses, function(c) {
			return c.id == courseId;
		});
		console.log(courses._courses);
		console.log(index);
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
	var index = _.findIndex(courses._courses, function(c) {
		if(!currentCourse) {
			return false;
		}
		return c.id == currentCourse.id;
	});
	if(index < 0) {
		selected.set({
			course : null
		});
	}
}, "Courses.change");

module.exports = selected;