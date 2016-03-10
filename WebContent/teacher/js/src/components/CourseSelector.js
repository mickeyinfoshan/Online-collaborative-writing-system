import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';

var React = require('react');
var {Base} = require("../data-station/index");

var courses = require("./../models/courses");
var selectedCourse = require("./../models/selectedCourse");

var CourseSelector = React.createClass({

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(courses, "Courses.change");
		this.ds.addSource(selectedCourse, "SelectedCourse.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "Courses.change");
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "SelectedCourse.change");
	},
	handleChange : function(event, index, value) {
		console.log(value);
		selectedCourse.selectCourse(value);
	},
	render: function() {
		console.log("render");
		var selectedValue = selectedCourse.course ? selectedCourse.course.id : -1;
		var courseItems = courses._courses.map((course)=>{
			var key = "course" + course.id;
			var text = `${course.name}`;
			return <MenuItem value={course.id} primaryText={text} key={key} />;
		});
		return (
			 <SelectField value={selectedValue} onChange={this.handleChange}>
		        <MenuItem value={-1} primaryText="请选择"/>
		        {courseItems}
		     </SelectField>
		);
	}

});

injectTapEventPlugin();

module.exports = CourseSelector;