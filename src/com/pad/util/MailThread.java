package com.pad.util;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;

import com.pad.entity.Course;
import com.pad.entity.Mission;
import com.pad.entity.User;

public class MailThread extends Thread {
	private String host = "smtp.163.com";
	private String port = "25";
	private String from = "mjhlybmwq@163.com";
	private String password = "208063mjhlyb";
	private String subjectText = "新任务提醒";
	private Mission mission;
	private List<String> receivers;
	private SessionFactory sessionFactory;
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public String getPort() {
		return port;
	}
	public void setPort(String port) {
		this.port = port;
	}
	public String getFrom() {
		return from;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Mission getMission() {
		return mission;
	}
	public void setMission(Mission mission) {
		this.mission = mission;
	}
	private String getMessageText() {
		String text = "";
		Mission mission = getMission();
		Course course = mission.getCourse();
		text = text + "课程：" + course.getName() + "\n";
		text = text +"作业：" + mission.getName() + "\n";
		long startTimeStamp = Long.parseLong(mission.getStart());
		long endTimeStamp = Long.parseLong(mission.getEnd());
		Date start = new Date(startTimeStamp);
		Date end = new Date(endTimeStamp);
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
		String startString = df.format(start);
		String endString = df.format(end);
		text = text + "时间：" + startString + "  -  " + endString + "\n";
		text = text + "作业简介：" + mission.getDescription() + "\n";
		text = text + "直达链接：http://121.40.97.89:8080/pad\n";
		text += "（该邮件由系统自动发出，请勿回复）";
		return text;
	}
	public String getSubjectText() {
		return subjectText;
	}
	public void setSubjectText(String subjectText) {
		this.subjectText = subjectText;
	}
	
	public void sendEmailTo(String to) {
		MailSender.simpleSend(host, port, from, password, to, subjectText, getMessageText());
	}
	public List<String> getReceivers() {
		return receivers;
	}
	public void setReceivers(List<String> receivers) {
		this.receivers = receivers;
	}
	
	public MailThread(Mission mission) {
		this.mission = mission;
	}
	
	public MailThread() {
		
	}	
	
	//用 in 查询可以优化 谁有空谁做吧
	public void run(){
		Session session = sessionFactory.openSession();
		for(int i = 0; i < receivers.size(); i++) {
    	   String user_id = receivers.get(i);
    	   User user = (User)session.get(User.class, user_id);
    	   String email = user.getUsername();
    	   this.sendEmailTo(email);
		}
		session.close();
    }
	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}
	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
}
