package com.pad.api;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public abstract class BaseApi {
	@Autowired
	protected SessionFactory sessionFactory;

	protected Session getSession() {
		Session session = null;
		session = this.sessionFactory.getCurrentSession();
		return session;
	}

	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}

	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
}
