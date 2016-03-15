package com.pad.dao.impl;

import org.hibernate.Query;
import org.hibernate.Transaction;

import com.pad.dao.PadDao;
import com.pad.entity.Pad;

public class PadDaoImpl extends BaseDaoImpl<Pad> implements PadDao {

	@Override
	public Pad getPad(Pad pad) {
		// TODO Auto-generated method stub
		Pad p = null;
		Transaction t = this.getSession().beginTransaction();
		Query query = this.getSession().createQuery(
				"from Pad where gid=:gid and pname=:pname");
		query.setString("gid", pad.getGid());
		query.setString("pname", pad.getPname());
		Object obj = query.uniqueResult();
		if (obj != null) {
			p = (Pad) obj;
		}
		t.commit();
		return p;
	}

	@Override
	public void deletePad(long time) {
		// TODO Auto-generated method stub
		Transaction t = this.getSession().beginTransaction();
		String hql = "delete Pad as p where p.lastUpdate<:time";
		Query query = this.getSession().createQuery(hql);
		query.setLong("time", time);
		query.executeUpdate();
		t.commit();
	}

}
