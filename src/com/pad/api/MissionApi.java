package com.pad.api;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.kevinsawicki.http.HttpRequest;
import com.pad.entity.Course;
import com.pad.entity.Mission;
import com.pad.entity.MissionPad;
import com.pad.entity.User;
import com.pad.util.PadServerApi;

@Component
@Path("/mission")
public class MissionApi extends BaseApi{
	
	@Autowired
	private SessionFactory mysf;
	
	@GET
	@Path("/{mission_id}/pad/add/{pad_id}")
	public String attachPadToMission(
					@PathParam("mission_id") int mission_id,
					@PathParam("pad_id") String pad_id
			) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		String query = "from MissionPad MS where MS.pad_id='" + pad_id + "'";
		List<MissionPad> queryResult = (List<MissionPad>)session.createQuery(query).list();
		if(queryResult.size() > 0) {
			MissionPad originMissionPad = queryResult.get(0);
			session.delete(originMissionPad);
		}
		MissionPad newMissionPad = new MissionPad();
		newMissionPad.setMission(mission);
		newMissionPad.setPad_id(pad_id);
		session.save(newMissionPad);
		t.commit();
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
		return "200";
	}
	
	@GET
	@Path("/{mission_id}/pad/list")
	@Produces(MediaType.APPLICATION_JSON)
	public MissionPad[] listPads(@PathParam("mission_id") int mission_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		String query = "from MissionPad MS where MS.mission=" + mission_id;
		List<MissionPad> list = (List<MissionPad>)session.createQuery(query).list();
		t.commit();
		MissionPad[] missionPads = new MissionPad[list.size()];
		return (MissionPad[])list.toArray(missionPads);
	}
	
	@GET
	@Path("/{mission_id}/pad/for/{user_id}")
	@Produces(MediaType.APPLICATION_JSON)
	public String getMissionPadForUser(@PathParam("mission_id") int mission_id, @PathParam("user_id") String user_id) throws UnsupportedEncodingException {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		Course course = mission.getCourse();
		String getPadGroupNestedQuery = "(select padGroupId from CoursePadGroup CPG where CPG.course='" + course.getId() + "')";
		String getPadGroupQuery = "select padGroupId from PadGroupUser PGU where PGU.user='" + user_id + "' and PGU.padGroupId in " + getPadGroupNestedQuery;
		String padGroupId = (String)session.createQuery(getPadGroupQuery).uniqueResult();
		String url = PadServerApi.getBaseRequestUrl("listPads");
		url += "&groupID=" + padGroupId;
		String resString = HttpRequest.get(url).body();
		System.out.println(resString);
		JSONArray json_padIds = JSON.parseObject(resString).getJSONObject("data").getJSONArray("padIDs");
		System.out.println(json_padIds.toJSONString());
		String getPadQuery = "select pad_id from MissionPad MP where MP.mission=" + mission.getId() + "and MP.pad_id in (:padIds)";
		String padId = (String)session.createQuery(getPadQuery).setParameterList("padIds", json_padIds.toArray()).uniqueResult();
		t.commit();
		JSONObject result = new JSONObject();
		result.put("pad_id", padId);
		result.put("group_id", padGroupId);
		Session _session = mysf.openSession();
		User user = (User)_session.get(User.class, user_id);
		_session.close();
		String padUserUrl = PadServerApi.getBaseRequestUrl("createAuthorIfNotExistsFor");
		padUserUrl += "&authorMapper=" + user_id;
		padUserUrl += "&name=" + URLEncoder.encode(user.getName(), "UTF-8");
		String _resString = HttpRequest.get(padUserUrl).body();
		JSONObject _res = JSON.parseObject(_resString);
		String authorId = _res.getJSONObject("data").getString("authorID");
		result.put("author_id", authorId);
		String response = result.toJSONString();
		return response;
	}

	@GET
	@Path("/pad/{pad_id}/authors")
	@Produces(MediaType.APPLICATION_JSON)
	public String getPadAuthors(@PathParam("mission_id") int mission_id, @PathParam("pad_id") String pad_id) {
		return "";
	}
	
	public SessionFactory getMysf() {
		return mysf;
	}

	public void setMysf(SessionFactory mysf) {
		this.mysf = mysf;
	}
	
	
}
