var {Model} = require("../data-station/index");
var $ = require("jquery");
var _ = require("lodash");

var user = require("./user");

var server = require("../utils/server");

class Years extends Model {
	
	constructor() {
		super();
		this._years = [];
	}

	init() {
		if(!user.id) {
			this.set({
				_years : []
			});
			return;
		}
		var url = server + `/pad/api/course/teacher/${user.id}/list/years`;
		var _this = this;
		$.get(url, function(res) {
			res = _.uniq(res);
			_this.set({
				_years : res
			})
		});
	}
}

var years = new Years();

years.addSource(user, "User.change");
years.addHandler(years.init.bind(years), "User.change");

module.exports = years;