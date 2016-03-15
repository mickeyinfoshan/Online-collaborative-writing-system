package com.pad.dao.impl;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@Transactional
public class BaseSessionFactoryDaoImpl {
	/**
	 * 向DAO层注入SessionFactory
	 */
	@Autowired
	protected SessionFactory sessionFactory;

	/**
	 * 获取当前工作的Session
	 */
	public Session getSession() {
		return this.sessionFactory.getCurrentSession();
	}

	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}

	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
}
