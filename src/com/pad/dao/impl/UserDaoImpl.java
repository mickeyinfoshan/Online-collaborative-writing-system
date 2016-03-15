package com.pad.dao.impl;

import org.hibernate.Query;
import org.hibernate.Transaction;

import com.pad.dao.UserDao;
import com.pad.entity.User;

public class UserDaoImpl extends BaseDaoImpl<User> implements UserDao {

	public User checkUser(User user) {
		// TODO Auto-generated method stub
		User u = null;
		Transaction t = this.getSession().beginTransaction();
		Query query = this.getSession().createQuery(
				"from User where username=:name and password=:pass");
		query.setString("name", user.getUsername());
		query.setString("pass", user.getPassword());
		Object obj = query.uniqueResult();
		if (obj != null) {
			u = (User) obj;
		}
		t.commit();
		return u;
	}

	public Boolean checkExistUser(User user) {
		// TODO Auto-generated method stub
		Transaction t = this.getSession().beginTransaction();
		Query query = this.getSession().createQuery(
				"from User where username=:name ");
		System.out.println(query.toString());
		query.setString("name", user.getUsername());
		Object obj = query.uniqueResult();
		t.commit();
		if (obj != null) {
			return true;
		}		
		return false;
	}

	@Override
	public User getUser(String userName) {
		// TODO Auto-generated method stub
		Transaction t = this.getSession().beginTransaction();
		Query query = this.getSession().createQuery(
				"from User where username=:name ");
		System.out.println(query.toString());
		query.setString("name", userName);
		User result = (User) query.uniqueResult();
		t.commit();
		return result;
	}
}
