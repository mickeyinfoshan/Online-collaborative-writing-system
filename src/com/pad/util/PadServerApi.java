package com.pad.util;

public class PadServerApi {
	private static String padHost = "localhost";
	private static String padPort = "8081";
	private static String padApiKey = "8f2f95ba0babc4a151d970b8acfbc00869cf3dce5b5ca6893343303d86049cd8";
	public static String getBaseRequestUrl(String method) {
		String protocal = "http";
		return protocal + "://" + padHost + ":" + padPort + "/api/1.2.10/" + method + "?apikey=" + padApiKey;
	}
}
