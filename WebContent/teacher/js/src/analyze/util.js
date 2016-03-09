function getHistorySlice(start, scope, history, timekey) {
	if(history.length == 0) {
		return []
	}
	var end = start + scope;
	var result = [];
	for(var i = 0; i < history.length; i++) {
		var time = history[i][timekey];
		if(time >= end) {
			break;
		}
		if(time < start) {
			continue;
		}
		result.push(history[i]);
	}
	//console.log(i);
	history = history.slice(i);
	return {
		slice : result,
		history : history
	}
}

export function splitHistory(start, scope, history, timekey) {
	if(history.length == 0) {
		return []
	}
	var result = {};
	var _start = start;
	var _history = history.slice(0);
	while(_history.length > 0) {
		_start += scope;
		var _result = getHistorySlice(_start, scope, _history, timekey);
		_history = _result.history;
		result[_start] = _result.slice;
		// break;
	}
	//console.log(_history);
	return result;
}

export function getPadStatic(historySlice, scope) {
	var authors = [];
	var textCount = 0;
	var timePercentage = 0;
	var length = historySlice.length;
	if(length > 0) {
		var lastItem = historySlice[length - 1];
		var firstItem = historySlice[0];
		timePercentage = (lastItem.timestamp - firstItem.timestamp) / scope;
	}
	historySlice.forEach(function(item) {
		textCount += item.textCount;
		var author = item.author;
		if(authors.indexOf(author) < 0) {
			authors.push(author);
		}
	});
	return {
		authorsLength : authors.length,
		textCount : textCount,
		timePercentage : timePercentage.toFixed(2)
	}
}

export function getChatStatic(historySlice) {
	var chatCount = 0;
	historySlice.forEach(function(item) {

	})
	return {chatCount};
}