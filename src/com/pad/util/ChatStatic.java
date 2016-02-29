package com.pad.util;

import com.alibaba.fastjson.*;
import com.github.kevinsawicki.http.HttpRequest;

class UserChatStatic {
	private String userId;
	private String userName;
	private int chatLength;
	public void setUserId(String userId) {
		this.userId = userId;
	}
	
	public void setUserName(String userName) {
		this.userName = userName;
	}
	
	public void setChatLength(int length) {
		this.chatLength = length;
	}
	
	public String getUserId() {
		return this.userId;
	}
	
	public String getUserName() {
		return this.userName;
	}
	
	public int getChatLength() {
		return chatLength;
	}
}


public class ChatStatic {
	private static String padHost = "121.40.97.89";
	private static String padPort = "8081";
	private static String padApiKey = "8f2f95ba0babc4a151d970b8acfbc00869cf3dce5b5ca6893343303d86049cd8";
	
	private static String getBaseRequestUrl(String method) {
		String protocal = "http";
		return protocal + "://" + padHost + ":" + padPort + "/api/1.2.10/" + method + "?apikey=" + padApiKey;
	}
	
	public static JSONArray listAllPads() {
		JSONObject res = JSON.parseObject(HttpRequest.get(getBaseRequestUrl("listAllPads")).body());
		if(res.getInteger("code") == 0) {
			JSONObject data = res.getJSONObject("data");
			JSONArray padIDs = data.getJSONArray("padIDs");
			return padIDs;
		}
		return null;
	}
	
	private static String getChatHistoryUrl(String padId) {
		return getBaseRequestUrl("getChatHistory") + "&padID=" + padId;
	}
	
	public static JSONArray getChatHistory(String padId) {
		String url = getChatHistoryUrl(padId);
		String resString = HttpRequest.get(url).body();
		JSONObject res = JSON.parseObject(resString);
		if(res.getInteger("code") != 0) {
			return null;
		}
		return res.getJSONObject("data").getJSONArray("messages");
	}

	
	public static JSONObject getPadChatStatic(String padId) {
		JSONObject result = new JSONObject();
		result.put("padId", padId);
		JSONObject statics = new JSONObject();
		JSONArray messages = getChatHistory(padId);
		for(int i = 0; i < messages.size(); i++) {
			JSONObject chat = messages.getJSONObject(i);
			String userId = chat.getString("userId");
			String userName = chat.getString("userName");
			String text = chat.getString("text");
			UserChatStatic u = (UserChatStatic)statics.getObject(userId, UserChatStatic.class);
			if(u != null) {
				int len = u.getChatLength();
				len += text.length();
				u.setChatLength(len);
			}
			else {
				u = new UserChatStatic();
				u.setUserId(userId);
				u.setUserName(userName);
				u.setChatLength(text.length());
				statics.put(userId, u);
			}
		}
		result.put("statics", statics);
		return result;
	}
}
