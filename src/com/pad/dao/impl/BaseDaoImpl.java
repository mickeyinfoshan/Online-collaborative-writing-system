package com.pad.dao.impl;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.util.List;

import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
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

		return (String) this.getSession().save(entity);
	}

	public void update(T entity) {
		this.getSession().merge(entity);
	}

	public void delete(Serializable id) {
		this.getSession().delete(this.findById(id));
	}

	public void delete(T entity) {
		this.getSession().delete(entity);
	}

	public T findById(Serializable id) {
		return (T) this.getSession().get(this.clazz, id);
	}

	public List<T> findByHQL(String hql, Object... params) {
		Query query = this.getSession().createQuery(hql);
		for (int i = 0; params != null && i < params.length; i++) {
			query.setParameter(i, params);
		}
		return query.list();
	}

	public void merge(T entity) {
		// TODO Auto-generated method stub
		sessionFactory.getCurrentSession().clear();
		sessionFactory.getCurrentSession().update(entity);
	}
}
