import injectTapEventPlugin from 'react-tap-event-plugin';
import TextField from 'material-ui/lib/text-field';
import Dialog from 'material-ui/lib/dialog';
import DatePicker from 'material-ui/lib/date-picker/date-picker';
import FlatButton from 'material-ui/lib/flat-button';

var React = require('react');
var {Base} = require("../data-station/index");

var selectedMission = require("./../models/selectedMission");
var selectedCourse = require("./../models/selectedCourse");
var missions = require("./../models/missions");
var dialogController = require("./../models/dialogController");

var MissionDialog = React.createClass({

	getInitialState: function() {
		return {
			name : "",
			start : null,
			end : null,
			content : "" 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(dialogController, "DialogController.change");
		var _this = this;
		this.ds.addHandler(function() {
			if(dialogController.mission == "create" || !selectedMission.mission) {
				_this.state.name = "";
				_this.state.start = null;
				_this.state.end = null;
			}
			else if(dialogController.mission == "update") {
				_this.state.name = selectedMission.mission.name;
				_this.state.start = new Date(Number(selectedMission.mission.start));
				_this.state.end = new Date(Number(selectedMission.mission.end));
			}
			_this.forceUpdate();
		}, "DialogController.change");
	},

	setName : function(e) {
		this.setState({
			name : this.refs.nameInput.getValue() 
		});
	},

	setStart : function(e, date) {
		this.setState({
			start : date 
		});
	},

	setEnd : function(e, date) {
		this.setState({
			end : date 
		});
	},
	setContent : function(e) {
		this.setState({
			content : e.target.getValue() 
		});
	},
	save : function() {
		if(!selectedCourse.course) {
			return;
		}
		if(!this.state.name) {
			return;
		}
		if(!this.state.start || !this.state.end) {
			return;
		}
		if(this.state.end <= this.state.start) {
			return;
		}
		var mission = {
			name : this.state.name,
			start : this.state.start.getTime(),
			end : this.state.end.getTime(),
		};
		if(dialogController.mission == "create") {
			missions.create(mission);
		}
		if(dialogController.mission == "update") {
			if(!selectedMission.mission) {
				return;
			}
			mission.id = selectedMission.mission.id;
			missions.update(mission);
		}
	},

	render: function() {
		
		const actions = [
			<FlatButton
	        	label="取消"
	        	secondary={true}
	        	onTouchTap={dialogController.hideAll.bind(dialogController)} />,
		  <FlatButton
		    label="确定"
		    primary={true}
		    keyboardFocused={true}
		    onTouchTap={this.save} />,
		];

	    var hide = dialogController.mission == "hide";

	    var title = "";

	    if(dialogController.mission == "create") {
	    	title = "添加";
	    }

	    if(dialogController.mission == "update") {
	    	title = "编辑";
	    }

	    title += "作业";

	    return (
	        <Dialog
	          title={title}
	          actions={actions}
	          modal={false}
	          open={!hide}
	          onRequestClose={dialogController.hideAll.bind(dialogController)}>
	          <div>
	          <div style={{display : "inline-block"}}>
	          <TextField floatingLabelText="请输入作业名称" 
	          			ref="nameInput" 
	          			hintText="" onChange={this.setName} value={this.state.name} /><br />
	          开始：<DatePicker
        		hintText="开始日期"
        		value={this.state.start}
        		onChange={this.setStart}
      		  />
	          结束：<DatePicker
        		hintText="结束日期"
        		value={this.state.end}
        		onChange={this.setEnd}
      		  />
      		  </div>
      		  <div style={{display:"inline-block"}} >
      		  	<TextField floatingLabelText="请输入作业内容" 
	          			hintText="" onChange={this.setContent} value={this.state.content} 
	          			multiLine={true} rows={4}/>
      		  </div>
      		  </div>          
	        </Dialog>
   		);
		
	}
});

injectTapEventPlugin();

module.exports = MissionDialog;