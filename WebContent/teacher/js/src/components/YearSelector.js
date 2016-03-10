import SelectField from 'material-ui/lib/select-field';
import MenuItem from 'material-ui/lib/menus/menu-item';
import injectTapEventPlugin from 'react-tap-event-plugin';

var React = require('react');
var {Base} = require("../data-station/index");

var years = require("./../models/years");
var selectedYear = require("./../models/selectedYear");

var YearSelector = React.createClass({

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(years, "Years.change");
		this.ds.addSource(selectedYear, "SelectedYear.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "Years.change");
		this.ds.addHandler(function() {
			_this.forceUpdate();
		}, "SelectedYear.change");
	},
	handleChange : function(event, index, value) {
		console.log(value);
		selectedYear.selectYear(value);
	},
	render: function() {
		console.log("render");
		var selectedValue = selectedYear.year ? selectedYear.year. : -1;
		var yearItems = years._years.map((year)=>{
			var key = "year" + year;
			var text = `${year}`;
			return <MenuItem value={year} primaryText={text} key={key} />;
		});
		return (
			 <SelectField value={selectedValue} onChange={this.handleChange}>
		        <MenuItem value={-1} primaryText="请选择"/>
		        {yearItems}
		     </SelectField>
		);
	}

});

injectTapEventPlugin();

module.exports = YearSelector;