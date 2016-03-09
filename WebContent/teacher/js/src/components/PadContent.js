var React = require('react');
var $ = require("jquery");
var {Base} = require("../data-station/index");
var selectedPad = require("../models/selectedPad");
var selectedMission = require("../models/selectedMission")
var padServer = require("../utils/padServer");
var server = require("../utils/server")

import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

import injectTapEventPlugin from 'react-tap-event-plugin';

var PadContent = React.createClass({
	
	getInitialState: function() {
		return {
			content : "",
			score : -1, 
		};
	},

	componentDidMount: function() {
		this.ds = new Base();
		this.ds.addSource(selectedPad, "SelectedPad.change");
		var _this = this;
		this.ds.addHandler(function() {
			_this.getContent();
			if(selectedPad.pad) {
				_this.setState({
					score : selectedPad.pad.score
				});
			}
		}, "SelectedPad.change");
	},

	getContent : function() {
		if(!selectedPad.pad) {
			return;
		}
		var _this = this;
		var pad_id = selectedPad.pad.pad_id;
		var url = padServer.getRequestUrl("getHTML", {padID : pad_id});
		$.getJSON(url, function(res) {
			if(res.message == "ok") {
				var html = res.data.html;
				_this.setState({
					content : html 
				});
			}
		});
	},
	setPadScore : function() {
		if(!selectedMission.mission) {
			return;
		}
		if(!selectedPad.pad) {
			return;
		}
		var padId = selectedPad.pad.pad_id;
		var missionId = selectedMission.mission.id;
		var score = this.state.score;
		var missionPadId = selectedPad.pad.id;
		if(!$.isNumeric(score)) {
			alert("请输入数字分数");
			return;
		}
		var url = server + `/pad/api/mission/pad/${missionPadId}/score/${score}`;
		$.get(url, function(res) {
			if(res == "200") {
				alert("打分成功");
			}
			else {
				alert("打分失败")
			}
		});
	},

	scoreInputChangeHandler : function() {
		this.setState({
			score : this.refs.scoreInput.getValue()
		});
	},
	toAnalyze : function() {
		var padID = selectedPad.pad.pad_id;
		window.open("./analyze.html?padID=" + padID);
	},
	exportPDF : function() {
		var padId = selectedPad.pad.pad_id;
		var missionId = selectedMission.mission.id;
		window.open(`/pad/api/mission/pad/${padId}/export/pdf`);
	},
	render: function() {
		var content = this.state.content || "暂无内容";
		var name = "";
		if(selectedPad.pad) {
			name = selectedPad.pad.pad_id.split("$")[1];
		}
		var scoreInputValue = "";
		if(Number(this.state.score) > 0) {
			scoreInputValue = this.state.score;
		}
		return (
			<div style={{borderBottom : "solid 1px #ccc"}}>
				<h2 style={{borderBottom : "solid 1px #ccc", padding: 15}}>{name}</h2>
				<div dangerouslySetInnerHTML={{__html: content}} style={{padding : 15}} />
				<div style={{textAlign : "right"}}>
				<RaisedButton label="导出pdf" onClick={this.exportPDF} />
				<RaisedButton label="数据分析" primary={true} onClick={this.toAnalyze} />
				<TextField ref="scoreInput" 
						   type="number" 
						   hintText="请输入分数"
						   onChange={this.scoreInputChangeHandler} 
						   value={scoreInputValue}
						   style={{width : 120, marginLeft: 80}}
				/>
				<RaisedButton label="打分" secondary={true} onClick={this.setPadScore} />
				</div>
			</div>
		);
	}

});

injectTapEventPlugin();

module.exports = PadContent;