var React = require("react");
var ReactDOM = require("react-dom");

var CourseSelector = require("./components/CourseSelector");
var MissionSelector = require("./components/MissionSelector");
var user = require("./models/user")

var container = document.getElementById("app");

ReactDOM.render(<div>
		<CourseSelector />
		<MissionSelector />
	</div>, container);

user.set({
	id : -1,
	name : "hehe",
	email : "hehe@pad.com"
});
