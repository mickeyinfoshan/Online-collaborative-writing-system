import React from "react"
import $ from "jquery"
import _ from 'lodash'
import {
	splitHistory,
	getPadStatic,
	getChatStatic
} from "./util"
var padServer = require("../utils/padServer")
import AppBar from 'material-ui/lib/app-bar';

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function getDisplayTime(timestamp) {
	var d = new Date(timestamp);
	var year = d.getFullYear();
	var month = d.getMonth() + 1;
	var day = d.getDate();
	var hour = d.getHours();
	var minute = d.getMinutes();
	return `${year}/${month}/${day} ${hour}:${minute}`;
}

const Analyze = React.createClass({
	getInitialState: function() {
		var now = new Date();
		return {
			padHistory : [],
			chatHistory : [],
			confirmed : false,
			start : now,
			scope : 120000 //2 minutes
		};
	},
	fetchPadHistory : function(padID) {
		var url = padServer.getRequestUrl("getAllVersions", {padID});
		$.getJSON(url, function(res) {
			if(res.code != 0) {
				alert(res.message);
				return;
			}
			this.setState({
				padHistory : res.data.version 
			});
		}.bind(this));
	},
	fetchChatHistory : function(padID) {
		var url = padServer.getRequestUrl("getChatHistory", {padID});
		$.getJSON(url, function(res) {
			if(res.code != 0) {
				alert(res.message);
				return;
			}
			this.setState({
				chatHistory : res.data.messages
			});
		}.bind(this));
	},
	fetchData : function(padID) {
		if(!this.state.confirmed) {
			return;
		}
		this.fetchChatHistory(padID);
		this.fetchPadHistory(padID);
		setTimeout(this.fetchData.bind(this, padID), this.state.scope);
	},
	componentDidMount: function() {
		var padID = getParameterByName("padID");
		if(padID) {
			this.fetchData(padID);
		}	
	},
	changeScope : function(e) {
		var scope = e.target.value;
		if(!$.isNumeric(scope)) {
			return;
		}
		if(scope <= 0) {
			return;
		}
		scope *= 1000;
		this.setState({
			scope : scope 
		});
	},
	changeStartYear : function(e) {
		var start = new Date(this.state.start);
		start.setFullYear(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartMonth : function(e) {
		var month = e.target.value;
		var start = new Date(this.state.start);
		start.setMinutes(month + 1);
		this.setState({
			start 
		});
	},
	changeStartDay : function(e) {
		var start = new Date(this.state.start);
		start.setDate(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartHour : function(e) {
		var start = new Date(this.state.start);
		start.setHours(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartMinute : function(e) {
		var start = new Date(this.state.start);
		start.setMinutes(e.target.value);
		this.setState({
			start 
		});
	},
	getDataRows : function() {
		var dataRows = [];
		var padHistory = this.state.padHistory.slice(0);
		var chatHistory = this.state.chatHistory.slice(0);
		var start = this.state.start.getTime();
		var scope = this.state.scope;
		var padHistorySlices = splitHistory(start, scope, padHistory, "timestamp" );
		var chatHistorySlices = splitHistory(start, scope, chatHistory, "time");
		// var padHistorySlices = {};
		// var chatHistorySlices = {};
		console.log(padHistorySlices);
		var _start = start;
		var now = new Date();
		while(_start < now.getTime()) {
			var padHistorySlice = padHistorySlices[_start] || [];
			var chatHistorySlice = chatHistorySlices[_start] || [];
			var timeDisplay = getDisplayTime(_start);
			var padStatic = getPadStatic(padHistorySlice, scope);
			var chatStatic = getChatStatic(chatHistorySlice);
			var row = (
				<tr key={_start}>
					<td>
						{timeDisplay}
					</td>
					<td>
						{padStatic.timePercentage}
					</td>
					<td>
						{padStatic.textCount}
					</td>
					<td>
						{padStatic.authorsLength}
					</td>
					<td>
						{chatStatic.chatCount}
					</td>
				</tr>
			);
			dataRows.push(row);
			_start += scope;
		}
		console.log(dataRows.length)
		return dataRows;
	},
	confirmeChangeButtonHandler : function(confirmed) {
		var padID = getParameterByName("padID");
		this.setState({
			confirmed : confirmed 
		}, this.fetchData.bind(this, padID));
	},
	render : function() {
		var scopeToDisplay = this.state.scope / 1000;
		var dataRows = [];
		if(this.state.confirmed) {
			dataRows = this.getDataRows();
		}
		var year = this.state.start.getFullYear();
		var month = this.state.start.getMonth() + 1;
		var day = this.state.start.getDate();
		var hour = this.state.start.getHours()
		var minute = this.state.start.getMinutes();
		return (
			<div style={{textAlign:"center"}}>
				<AppBar
			    	title={"数据分析"}
			    	showMenuIconButton={false}
				/>
				<div>
					<span>
						开始时间: 
						<input  onChange={this.changeStartYear} 
								value={year}
						/>
						-<input 
							onChange={this.changeStartMonth}
							value={month}
						/>
						-<input
							onChange={this.changeStartDay}
							value={day}
						/>
						&nbsp;<input
							onChange={this.changeStartHour}
							value={hour}
						/>
						:<input
							onChange={this.changeStartMinute}
							value={minute}
						/> 
					</span>
					<span>
						检测间隔：<input value={scopeToDisplay} onChange={this.changeScope} />秒
					</span>
					<button onClick={this.confirmeChangeButtonHandler.bind(this, true)}>确定</button>
					<button onClick={this.confirmeChangeButtonHandler.bind(this, false)}>暂停</button>
				</div>
				<div>
					<table>
						<thead>
							<tr>
								<th>时间</th>
								<th>时间比例</th>
								<th>编辑文章字数</th>
								<th>参与编辑人数</th>
								<th>聊天字数</th>
							</tr>
						</thead>
					<tbody>
						{dataRows}
					</tbody>
					</table>
				</div>
			</div>
		);
	}
});

export default Analyze