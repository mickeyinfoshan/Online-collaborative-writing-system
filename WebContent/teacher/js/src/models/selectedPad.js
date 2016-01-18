var {Model} = require("../data-station/index");

var pads = require("./pads");

var _ = require("lodash");

class SelectedPad extends Model {

	constructor() {
		super();
		this.pad = null;
	}

	selectPad(padId) {
		var index = _.findIndex(pads._pads, function(c) {
			return c.pad_id == padId;
		});
		if(index < 0) {
			return;
		}
		var pad = pads._pads[index];
		this.set({
			pad
		});
	}
}

var selected = new SelectedPad();

selected.addSource(pads, "Pads.change");

selected.addHandler(function() {
	var currentPad = selected.pad;
	var index = _.findIndex(pads._pads, function(c) {
		if(!currentPad) {
			return false;
		}
		return c.pad_id == currentPad.pad_id;
	});
	if(index < 0) {
		selected.set({
			pad : null
		});
	}
}, "Pads.change");

module.exports = selected;