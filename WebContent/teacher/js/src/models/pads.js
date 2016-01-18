var {Model} = require("../data-station/index");
var $ = require("jquery");

var selectedMission = require("./selectedMission");

class Pads extends Model {
	constructor() {
		super();
		this._pads = [];
	}

	init() {
		if(!selectedMission.mission) {
			this.set({
				_pads : []
			});
			return;
		}
		var url = `/pad/api/pad/${selectedMission.mission.id}/list`;
		var _this = this;
		var _this = this;
		$.get(url, function(res) {
			_this.set({
				_pads : res
			});
			setTimeout(_this.init.bind(_this), 30000);
		});
	}
};

var pads = new Pads();

pads.addSource(selectedMission, "SelectedMission.change");
pads.addHandler(pads.init.bind(pads), "SelectedMission.change");

module.exports = pads;