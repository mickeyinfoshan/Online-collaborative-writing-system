package com.pad.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.pad.dao.PadDao;
import com.pad.entity.Pad;
import com.pad.service.PadService;
import com.pad.util.StaticData;

public class PadServiceImpl extends BaseServiceImpl<Pad> implements PadService {
	private PadDao padDao;

	@Autowired
	protected SessionFactory sessionFactory;
	
	public SessionFactory getSessionFactory() {
		return sessionFactory;
	}

	public void setSessionFactory(SessionFactory sessionFactory) {
		this.sessionFactory = sessionFactory;
	}
	
	public PadDao getPadDao() {
		return padDao;
	}

	public void setPadDao(PadDao padDao) {
		setBaseDaoImpl(padDao);
		this.padDao = padDao;
	}

	@Override
	public List<Pad> updatePadAndGroup(Pad pad) {
		// TODO Auto-generated method stub
		Session session = getSessionFactory().openSession();
		String getCourseQuery = "(select course from CoursePadGroup CPG where CPG.padGroupId='" + pad.getGid() + "')";
		String getGroupsQuery = "select padGroupId from CoursePadGroup _CPG where _CPG.course in " + getCourseQuery;
		System.out.println(getGroupsQuery);
		List<String> groupIds = (List<String>)session.createQuery(getGroupsQuery).list();
//		System.out.println(groupIds.toArray().toString());
		String groupIdsString = com.alibaba.fastjson.JSON.toJSONString(groupIds.toArray());
		groupIdsString = groupIdsString.replace('[', '(');
		groupIdsString = groupIdsString.replace(']', ')');
		groupIdsString = groupIdsString.replace('\"', '\'');
		System.out.println(groupIdsString);
		session.close();
		List<Pad> pads = padDao.findByHQL("from Pad P where P.gid in " + groupIdsString);
		if (StaticData.needUpdate()) {// 需要更新
			Date cd = new Date();
			pad.setLastUpdate(cd.getTime());
			Pad p = padDao.getPad(pad);
			// 数据库是否存在该条数据
			if (p != null) {
				p.setGname(pad.getGname());
				p.setLastUpdate(cd.getTime());
				p.setTimeValue(pad.getTimeValue());
				p.setWordValue(pad.getWordValue());
				padDao.update(p);
			} else {
				padDao.save(pad);
			}
			// 更新数据库中的过期数据
			if (StaticData.needUpdateDB()) {
				cd.setTime(cd.getTime() - StaticData.db_time);
				padDao.deletePad(cd.getTime());
			}
			// 获取数据库中所有数据
			
			// 没有数据直接返回
			if (pads == null) {
				return null;
			}
			Pad maxPad = pads.get(0);
			int w = 0;// 平均的字数
			int t = 0; // 平均的时间
			int c = 0;// 计数器
			for (Pad tp : pads) {
				if (tp.getWordValue() + tp.getTimeValue() > maxPad
						.getWordValue() + maxPad.getTimeValue()) {
					maxPad = tp;
				}
				w += tp.getWordValue();
				t += tp.getTimeValue();
				c++;
			}
			w = w / c;
			t = t / c;
			Pad aPad = new Pad();
			aPad.setWordValue(w);
			aPad.setTimeValue(t);
			aPad.setPname("平均值");
			aPad.setStatus(c);// 同时在编辑的pad数据
			List<Pad> results = new ArrayList<Pad>();

			maxPad.setStatus(-1);
			results.add(maxPad);
			results.add(aPad);
			pad.setStatus(-2);
			results.add(pad);

			StaticData.pads = results;
			
			pads = padDao.findByHQL("from Pad P where P.gid in " + groupIdsString);
			return pads;
		} else {// 不需要更新
			return pads;
		}
	}

}
