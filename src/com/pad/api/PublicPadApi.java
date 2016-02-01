package com.pad.api;

import java.util.List;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.Session;
import org.hibernate.Transaction;

import org.springframework.stereotype.Component;

import com.pad.entity.PublicPad;

@Component
@Path("/public/pad")
public class PublicPadApi extends BaseApi {
	
	@GET
	@Path("/all")
	@Produces(MediaType.APPLICATION_JSON)
	public PublicPad[] allPublicPads() {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from PublicPad";
		List<PublicPad> list = (List<PublicPad>)session.createQuery(query).list();
		PublicPad[] publicPads = new PublicPad[list.size()];
		t.commit();
		return (PublicPad[])list.toArray(publicPads);
	}
	
	@GET
	@Path("/has/{pad_id}")
	public Boolean hasPad(@PathParam("pad_id") String pad_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Boolean hasThisPad = false;
		String query = "from PublicPad pp where pp.pad_id='" + pad_id +"'";
		int size = session.createQuery(query).list().size();
		if(size > 0) {
			hasThisPad = true;
		}
		t.commit();
		return hasThisPad;
	}
	
	@POST
	@Path("/add/{pad_id}")
	public String addPad(
			@PathParam("pad_id") String pad_id,
			@FormParam(value="user_name") String user_name,
			@FormParam(value="user_id") String user_id,
			@FormParam(value="created_time") String created_time
			
	) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from PublicPad pp where pp.pad_id='" + pad_id +"'";
		Object origin = session.createQuery(query).uniqueResult();
		if(origin == null) {
			PublicPad pp = new PublicPad();
			pp.setCreated_time(created_time);
			pp.setPad_id(pad_id);
			pp.setUser_id(user_id);
			pp.setUser_name(user_name);
			session.save(pp);
		}
		t.commit();
		return "200";
	}
	
	@GET
	@Path("/remove/{pad_id}")
	public String removePad(@PathParam("pad_id") String pad_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from PublicPad pp where pp.pad_id='" + pad_id +"'";
		Object origin = session.createQuery(query).uniqueResult();
		if(origin != null) {
			session.delete(origin);
		}
		t.commit();
		return "200";
	}
}
