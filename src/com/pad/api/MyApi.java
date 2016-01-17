package com.pad.api;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.pad.entity.Comment;

@Component
@Path("/my")
public class MyApi {
	
	@Autowired
	protected SessionFactory sessionFactory;

	protected Session getSession() {
		return this.sessionFactory.openSession();
	}

	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}

	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
	
	@GET
	@Path("/hehe")
	public String hehe() {
		Session s = getSession();
		Transaction t = s.beginTransaction();
		Comment c = new Comment();
		c.setName("hehe");
		s.save(c);
		t.commit();
		s.close();
		return "200";
	}
}
