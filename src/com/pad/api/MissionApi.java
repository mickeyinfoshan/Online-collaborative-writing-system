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

import com.pad.entity.Mission;
import com.pad.entity.MissionPad;

@Component
@Path("/mission")
public class MissionApi extends BaseApi{	
	
	@GET
	@Path("/{mission_id}/pad/add/{pad_id}")
	public String attachPadToMission(
					@PathParam("mission_id") int mission_id,
					@PathParam("pad_id") String pad_id
			) {
		Session session = getSession();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		String query = "from MissionPad MS where MS.pad_id='" + pad_id + "'";
		List<MissionPad> queryResult = (List<MissionPad>)session.createQuery(query).list();
		Transaction t = session.beginTransaction();
		if(queryResult.size() > 0) {
			MissionPad originMissionPad = queryResult.get(0);
			session.delete(originMissionPad);
		}
		MissionPad newMissionPad = new MissionPad();
		newMissionPad.setMission(mission);
		newMissionPad.setPad_id(pad_id);
		session.save(newMissionPad);
		t.commit();
		session.close();
		return "200";
	}
	
	@POST
	@Path("/{mission_id}/update")
	public String updateMission(
			@PathParam("mission_id") int mission_id,
			@FormParam(value="name") String name,
			@FormParam(value="start") String start,
			@FormParam(value="end") String end,
			@FormParam(value="content") String content
		) {
		
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		mission.setName(name);
		mission.setContent(content);
		mission.setStart(start);
		mission.setEnd(end);
		session.save(mission);
		t.commit();
		session.close();
		return "200";
	}
	
	@GET
	@Path("/{mission_id}/pad/list")
	@Produces(MediaType.APPLICATION_JSON)
	public MissionPad[] listPads(@PathParam("mission_id") int mission_id) {
		Session session = getSession();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		String query = "from MissionPad MS where MS.mission=" + mission_id;
		List<MissionPad> list = (List<MissionPad>)session.createQuery(query).list();
		session.close();
		MissionPad[] missionPads = new MissionPad[list.size()];
		return (MissionPad[])list.toArray(missionPads);
	}
}
