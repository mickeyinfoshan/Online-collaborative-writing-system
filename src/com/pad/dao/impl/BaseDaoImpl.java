package com.pad.dao.impl;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.util.List;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.transaction.annotation.Transactional;

import com.pad.dao.BaseDao;

/**
 * BaseDaoImpl 定义DAO的通用操作的实现
 * 
 */
@SuppressWarnings("unchecked")
@Transactional
public class BaseDaoImpl<T> extends BaseSessionFactoryDaoImpl implements BaseDao<T> {

	private Class<T> clazz;
	
	public BaseDaoImpl() {
		ParameterizedType type = (ParameterizedType) this.getClass()
				.getGenericSuperclass();
		clazz = (Class<T>) type.getActualTypeArguments()[0];
		System.out.println("DAO的真实实现类是：" + this.clazz.getName());
	}

	public String save(T entity) {
		Transaction t = this.getSession().beginTransaction();
		String result = (String) this.getSession().save(entity);
		t.commit();
		return result;
	}

	public void update(T entity) {
		Transaction t = this.getSession().beginTransaction();
		this.getSession().merge(entity);
		t.commit();
	}

	public void delete(Serializable id) {
		Transaction t = this.getSession().beginTransaction();
		this.getSession().delete(this.findById(id));
		t.commit();
	}

	public void delete(T entity) {
		Transaction t = this.getSession().beginTransaction();
		this.getSession().delete(entity);
		t.commit();
	}

	public T findById(Serializable id) {
		Transaction t = this.getSession().beginTransaction();
		T result = (T) this.getSession().get(this.clazz, id);
		t.commit();
		return result;
	}

	public List<T> findByHQL(String hql, Object... params) {
		Transaction t = this.getSession().beginTransaction();
		Query query = this.getSession().createQuery(hql);
		for (int i = 0; params != null && i < params.length; i++) {
			query.setParameter(i, params);
		}
		List<T> result = query.list();
		t.commit();
		return result;
	}

	public void merge(T entity) {
		// TODO Auto-generated method stub
		Transaction t = this.getSession().beginTransaction();
		sessionFactory.getCurrentSession().clear();
		sessionFactory.getCurrentSession().update(entity);
		t.commit();
	}
}
