export function getHistorySlice(start, scope, history, timekey) {
	if(history.length == 0) {
		return {
			_slice : [],
			history : history
		}
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
		_slice : result,
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
		result[_start] = _result._slice;
		// break;
	}
	//console.log(_history);
	return result;
}

export function getPadStatic(historySlice, scope) {
	console.log(historySlice);
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
	var maxTimestampGap = 0;
	for(var i = 0; i < historySlice.length; i++) {
		var currItem = historySlice[i];
		var nextItem = historySlice[i+1];
		if(!nextItem) {
			break;
		}
		var timestampGap = nextItem.timestamp - currItem.timestamp;
		if(timestampGap > maxTimestampGap) {
			maxTimestampGap = timestampGap;
		}
	}
	return {
		authorsLength : authors.length,
		textCount : textCount,
		timePercentage : timePercentage.toFixed(2),
		maxTimestampGap : maxTimestampGap
	}
}

export function getChatStatic(historySlice) {
	var chatCount = 0;
	var chatters = [];
	historySlice.forEach(function(item) {
		chatCount += item.text.length;
		if(chatters.indexOf(item.userId) < 0) {
			chatters.push(item.userId);
		}
	})
	var chatterCount = chatters.length;
	var messageCount = historySlice.length;
	return {chatCount, chatterCount, messageCount};
}