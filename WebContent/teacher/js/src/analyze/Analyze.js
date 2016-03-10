import React from "react"
import $ from "jquery"
import _ from 'lodash'
import {
	splitHistory,
	getPadStatic,
	getChatStatic,
	getHistorySlice
} from "./util"
var padServer = require("../utils/padServer")
var server = require("../utils/server")
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

const Modes = {
	MOMENT : "MOMENT",
	DURATION : "DURATION"
};

const Analyze = React.createClass({
	getInitialState: function() {
		var now = new Date();
		return {
			padHistory : [],
			chatHistory : [],
			confirmed : false,
			mode : Modes.MOMENT,
			_window : 10000, //取样窗口
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
		if(this.state.confirmed) {
			return;
		}
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
		if(this.state.confirmed) {
			return;
		}
		var start = new Date(this.state.start);
		start.setFullYear(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartMonth : function(e) {
		if(this.state.confirmed) {
			return;
		}
		var month = e.target.value;
		var start = new Date(this.state.start);
		start.setMinutes(month + 1);
		this.setState({
			start 
		});
	},
	changeStartDay : function(e) {
		if(this.state.confirmed) {
			return;
		}
		var start = new Date(this.state.start);
		start.setDate(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartHour : function(e) {
		if(this.state.confirmed) {
			return;
		}
		var start = new Date(this.state.start);
		start.setHours(e.target.value);
		this.setState({
			start 
		});
	},
	changeStartMinute : function(e) {
		if(this.state.confirmed) {
			return;
		}
		var start = new Date(this.state.start);
		start.setMinutes(e.target.value);
		this.setState({
			start 
		});
	},

	changeMode : function(e) {
		// this.fetchData(getParameterByName("padID"));
		if(this.state.confirmed) {
			return;
		}
		this.setState({
			mode : e.target.value,
			confirmed : false 
		});
	},

	getData : function() {
		if(this.state.mode == Modes.MOMENT) {
			return this.getDataByMoment();
		}
		if(this.state.mode == Modes.DURATION) {
			return this.getDataByDuration();
		}
		return [];
	},

	//时间段
	getDataByDuration : function() {
		var data = [];
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
			var dataItem = {
				_time : _start,
				time : timeDisplay,
				padTimePercentage : padStatic.timePercentage,
				padTextCount : padStatic.textCount,
				authorsLength : padStatic.authorsLength,
				chatCount : chatStatic.chatCount
			};
			data.push(dataItem);
			_start += scope;
		}
		// console.log(dataRows.length)
		if(data.length < 2) {
			return data;
		}
		for(var i = 1; i < data.length; i++) {
			var prevItem = data[i - i];
			var currItem = data[i];
			currItem.padTextCount += prevItem.padTextCount;
			currItem.chatCount += prevItem.chatCount;
		}
		return data;
	},

	//时间点取样
	getDataByMoment : function() {
		var data = [];
		var padHistory = this.state.padHistory.slice(0);
		var chatHistory = this.state.chatHistory.slice(0);
		var start = this.state.start.getTime();
		var scope = this.state.scope;
		var _window = this.state._window;
		var now = new Date();
		var _start = new Date(start);
		_start = _start.getTime();
		while(_start < now.getTime()) {
			var startMoment = _start - (_window / 2); //取样的开始时间为该时刻前半个窗口
			var padSliceResult = getHistorySlice(startMoment, _window, padHistory, "timestamp");
			var padHistorySlice = padSliceResult._slice;
			console.log(padSliceResult)
			console.log(padHistorySlice)
			var chatSliceResult = getHistorySlice(startMoment, _window, chatHistory, "time");
			var chatHistorySlice = chatSliceResult._slice;
			var padStatic = getPadStatic(padHistorySlice, _window);
			var chatStatic = getChatStatic(chatHistorySlice);
			var timeDisplay = getDisplayTime(_start);
			var dataItem = {
				_time : _start,
				time : timeDisplay,
				padTimePercentage : padStatic.timePercentage,
				padTextCount : padStatic.textCount,
				authorsLength : padStatic.authorsLength,
				chatCount : chatStatic.chatCount
			};
			data.push(dataItem);
			_start += scope;
		}
		return data;
	},

	getDataRows : function(data) {
		return data.map(function(item) {
			return (
				<tr key={item._time}>
					<td>
						{item.time}
					</td>
					<td>
						{item.authorsLength}
					</td>
					<td>
						{item.padTextCount}
					</td>
					<td>
						{item.chatCount}
					</td>
				</tr>
			);
		});
	},
	confirmeChangeButtonHandler : function(confirmed) {
		var padID = getParameterByName("padID");
		this.setState({
			confirmed : confirmed 
		}, this.fetchData.bind(this, padID));
	},
	changeWindow : function(e) {
		this.setState({
			_window : e.target.value * 1000
		});
	},
	exportCSV : function() {
		var data = this.getData();
		var fields = ["time", "authorsLength", "padTextCount", "chatCount"];
		var rows = [];
		data.forEach(function(dataItem) {
			var row = [];
			fields.forEach(function(field) {
				row.push(dataItem[field]);
			});
			rows.push(row);
		});

		var postData = {
		    data : JSON.stringify(rows)
		};
		var url = server + "/pad/api/analyze/export/csv";
		var fakeFormHtmlFragment = "<form style='display: none;' method='POST' action='"+ url +"'>";
		_.each(postData, function(postValue, postKey){
		    var escapedKey = postKey.replace("\\", "\\\\").replace("'", "\'");
		    var escapedValue = postValue.replace("\\", "\\\\").replace("'", "\'");
		    fakeFormHtmlFragment += "<input type='hidden' name='"+escapedKey+"' value='"+escapedValue+"'>";
		});
		fakeFormHtmlFragment += "</form>";
		var fakeFormDom = $(fakeFormHtmlFragment);
		$("body").append(fakeFormDom);
		fakeFormDom.submit();
	},
	render : function() {
		var scopeToDisplay = this.state.scope / 1000;
		var dataRows = "";
		if(this.state.confirmed) {
			var data = this.getData();
			dataRows = this.getDataRows(data);
		}
		var year = this.state.start.getFullYear();
		var month = this.state.start.getMonth() + 1;
		var day = this.state.start.getDate();
		var hour = this.state.start.getHours()
		var minute = this.state.start.getMinutes();
		var _windowInputValue = Math.round(this.state._window / 1000);
		var windowInput = (
			<span>
				取样窗口：
				<input value={_windowInputValue} onChange={this.changeWindow} />
			</span>
		);
		if(this.state.mode == Modes.DURATION) {
			windowInput = "";
		}
		var confirmedButton = <button onClick={this.confirmeChangeButtonHandler.bind(this, true)}>确定</button>;
		var CSVButton = "";
		if(this.state.confirmed) {
			confirmedButton = <button onClick={this.confirmeChangeButtonHandler.bind(this, false)}>取消</button>
			CSVButton = <button onClick={this.exportCSV}>导出CSV</button>;
		}
		console.log(dataRows);
		return (
			<div style={{textAlign:"center"}}>
				<AppBar
			    	title={"数据分析"}
			    	showMenuIconButton={false}
			    	style={{textAlign:"left"}}
				/>
				<div>
					<span>
						模式选择：
						<select onChange={this.changeMode}>
							<option value={Modes.MOMENT}>
								时间点取样
							</option>
							<option value={Modes.DURATION}>
								时间段累计
							</option>
						</select>
					</span>
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
					{windowInput}
					{confirmedButton}
					{CSVButton}
				</div>
				<div>
					<table>
						<thead>
							<tr>
								<th>时间</th>
								<th>关注度</th>
								<th>编辑文章字数</th>
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