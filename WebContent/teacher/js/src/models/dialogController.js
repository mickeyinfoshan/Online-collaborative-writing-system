var {Model} = require("../data-station/index");

var courses = require("./courses");
var missions = require("./missions");
var user = require("./user");
var selectedPad = require("./selectedPad");

var _ = require("lodash");

class DialogController extends Model {
	constructor() {
		super();
		this.register = "hide";
		this.login = "hide";
		this.course = "hide";
		this.mission = "hide";
		this.pad = "hide";
	}

	hideAll() {
		this.set({
			register : "hide",
			login : "hide",
			course : "hide",
			mission : "hide",
			pad : "hide",
		})
	}

	show(dialog, mode) {
		mode = mode || "show";
		var dialogs = ["register", "login", "course", "mission", "pad"];
		var newState = {};
		for(var i = 0; i < dialogs.length; i++) {
			var dialogState = "hide";
			if(dialogs[i] === dialog) {
				dialogState = mode;
			}
			newState[dialogs[i]] = dialogState;
		}
		this.set(newState);	
	}
}

var dialogController = new DialogController();

dialogController.addSource(missions, "Missions.change");
dialogController.addSource(user, "User.change");
dialogController.addSource(courses, "Courses.change");
dialogController.addSource(selectedPad, "SelectedPad.change");

dialogController.addHandler(dialogController.hideAll.bind(dialogController), "Missions.change");
dialogController.addHandler(function(){
	if(!user.id) {
		this.show("login");
	}
	else {
		this.hideAll();
	}
}.bind(dialogController), "User.change");
dialogController.addHandler(dialogController.hideAll.bind(dialogController), "Courses.change");
dialogController.addHandler(function() {
	if(selectedPad.pad) {
		this.show("pad");
	}
	else {
		this.hideAll();
	}
}.bind(dialogController), "SelectedPad.change");

module.exports = dialogController;