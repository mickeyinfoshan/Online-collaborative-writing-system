var {Model} = require("../data-station/index");

var years = require("./years");

var _ = require("lodash");

class SelectedYear extends Model {

	constructor() {
		super();
		this.year = null;
	}

	selectYear(_year) {
		var index = _.findIndex(years._years, function(y) {
			return y == _year;
		});
		if(index < 0) {
			return;
		}
		var year = years._years[index];
		this.set({
			year
		});
	}
}

var selected = new SelectedYear();

selected.addSource(years, "Years.change");

selected.addHandler(function() {
	var currentYear = selected.year;
	if(!currentYear) {
			return false;
	}
	var index = _.findIndex(years._years, function(y) {
		return y == currentYear;
	});
	if(index < 0) {
		selected.set({
			year : null
		});
	}
	else if(years._years[index] != currentYear) {
		selected.set({
			year : years._years[index]
		});
	}
}, "Years.change");

module.exports = selected;