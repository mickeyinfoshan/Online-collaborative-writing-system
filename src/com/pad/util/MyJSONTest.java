package com.pad.util;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.kevinsawicki.http.HttpRequest;

public class MyJSONTest {
	public static void main(String[] args) {
		JSONArray pads = ChatStatic.listAllPads();
		if(pads == null) {
			return;
		}
		for(int i = 0; i < pads.size(); i++) {
			String padId = pads.getString(i);
			JSONObject padStatic = ChatStatic.getPadChatStatic(padId);
			System.out.println(JSON.toJSONString(padStatic));
		}
	}
}
