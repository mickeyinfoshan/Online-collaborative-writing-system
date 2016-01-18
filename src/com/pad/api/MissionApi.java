package com.pad.api;

import java.util.List;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.Session;
import org.springframework.stereotype.Component;

import com.pad.entity.Mission;

@Component
@Path("/mission")
public class MissionApi extends BaseApi{
	
	@GET
	@Path("/{course_id}/list")
	@Produces(MediaType.APPLICATION_JSON)
	public Mission[] getMissionList(
				@PathParam("course_id") int course_id
			) {
		
		Session session = getSession();
		String query = "from Mission M where M.course=" + course_id;
		List<Mission> list = (List<Mission>)(session.createQuery(query).list());
		session.close();
		Mission[] missions = new Mission[list.size()];	
		return (Mission[])list.toArray(missions);
	}
}
