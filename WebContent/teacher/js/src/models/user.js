var {Model} = require("../data-station/index");
var $ = require("jquery");

class User extends Model {
	constructor() {
		super();
		this.id = "";
		this.name = "";
		this.email = "";
	}

	login(email, password) {
		var _this = this;
		var data = {};
		data["user.username"] = email;
		data["user.password"] = password;
		$.post("/pad/login", data, function(res) {
			if(res.message == 'ok') {
				var _user = res.user;
				_this.set({
					id : _user.authorId,
					name : _user.name,
					email : _user.username
				});
			}
			else {
				window.alert("用户名或密码错误");
			}
		});
	}

	register(email, name, password) {
		var data = {};
		data["user.username"] = email;
		data["user.password"] = password;
		data["user.name"] = name;
	}
}

var user = new User();

module.exports = user;