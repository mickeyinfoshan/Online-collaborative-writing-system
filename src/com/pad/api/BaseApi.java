package com.pad.api;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.pad.dao.impl.BaseDaoImpl;
import com.pad.dao.impl.BaseSessionFactoryDaoImpl;
import com.pad.dao.impl.UserDaoImpl;
import com.pad.entity.Pad;

@Component
@Transactional
public class BaseApi extends BaseSessionFactoryDaoImpl{
	
}
