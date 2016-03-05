package com.pad.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.xml.bind.annotation.XmlRootElement;

@Entity
@XmlRootElement
public class PadGroupUser {
	private int id;
	private String padGroupId;
	private User user;
	@Id
	@GeneratedValue
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getPadGroupId() {
		return padGroupId;
	}
	public void setPadGroupId(String padGroupId) {
		this.padGroupId = padGroupId;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
}
