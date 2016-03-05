package com.pad.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.xml.bind.annotation.XmlRootElement;

import org.hibernate.Session;
import org.hibernate.Transaction;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.github.kevinsawicki.http.HttpRequest;
import com.pad.util.PadServerApi;

@Entity
@XmlRootElement
public class CoursePadGroup {
	private int id;
	private Course course;
	private String padGroupId;
	
	@Id
	@GeneratedValue
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public Course getCourse() {
		return course;
	}
	public void setCourse(Course course) {
		this.course = course;
	}
	public String getPadGroupId() {
		return padGroupId;
	}
	public void setPadGroupId(String padGroupId) {
		this.padGroupId = padGroupId;
	}
	
	public CoursePadGroup(Course course) {
		this.course = course;
		String url = PadServerApi.getBaseRequestUrl("createGroup");
		String resString = HttpRequest.get(url).body();
		JSONObject res = JSON.parseObject(resString);
		String groupId = res.getJSONObject("data").getString("groupID");
		this.padGroupId = groupId;
	}
}
