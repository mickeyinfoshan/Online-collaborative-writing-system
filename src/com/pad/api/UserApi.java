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
import org.hibernate.Transaction;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.kevinsawicki.http.HttpRequest;
import com.pad.entity.Course;
import com.pad.entity.CoursePadGroup;
import com.pad.entity.Mission;
import com.pad.entity.MissionPad;
import com.pad.entity.PadGroupUser;
import com.pad.entity.User;
import com.pad.util.PadServerApi;

@Component
@Path("/user")
public class UserApi extends BaseApi  {
	
	@GET
	@Transactional
	@Path("/list/for/course/{courseId}")
	@Produces(MediaType.APPLICATION_JSON)
	public String getStudentsForCourse(@PathParam("courseId") int courseId) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
//		Course course = (Course)session.get(Course.class, courseId);
		String getGroupsQuery = "from CoursePadGroup CPG where CPG.course=" + courseId;
		List<CoursePadGroup> groups = (List<CoursePadGroup>)session.createQuery(getGroupsQuery).list();
		JSONArray result = new JSONArray();
		for(int i = 0; i < groups.size(); i++) {
			CoursePadGroup group = groups.get(i);
			String groupId = group.getPadGroupId();
			String getUsersQuery = "select user from PadGroupUser PGU where PGU.padGroupId='" + groupId + "'";
			List<User> users = (List<User>)session.createQuery(getUsersQuery).list();
			JSONObject jsonGroup = new JSONObject();
			jsonGroup.put("id", groupId);
			jsonGroup.put("students", users.toArray());
			result.add(jsonGroup);
		}
		t.commit();
		return result.toJSONString();
	}
	
	@POST
	@Transactional
	@Path("/add/to/group/{groupId}")
	public String addStudentToGroup(
			@PathParam("groupId") String groupId,
			@FormParam(value="username") String username,
			@FormParam(value="studentNumber") String studentNumber,
			@FormParam(value="name") String name
			) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String getUserQuery = "from User U where U.username='" + username + "'";
		User user = (User)session.createQuery(getUserQuery).uniqueResult();
		if(user == null) {
			user = new User();
			user.setAuthority(10);
			user.setName(name);
			user.setStudentNumber(studentNumber);
			user.setPassword(studentNumber);
			user.setUsername(username);
			session.save(user);
		}
		if(!user.getName().equals(name)) {
			t.commit();
			return user.getName() + "(" + name + ")" + "添加失败，请核对信息";
		}
		if(!user.getStudentNumber().equals(studentNumber)) {
			t.commit();
			return user.getStudentNumber() + "(" + studentNumber + ")" + "添加失败，请核对信息";
		}
		String getCourseQuery = "(select course from CoursePadGroup CPG where CPG.padGroupId='" + groupId + "')";
		String getGroupsQuery = "(select padGroupId from CoursePadGroup CPG where CPG.course in " + getCourseQuery + ")";
		String checkExistQuery = "select count(*) from PadGroupUser PGU where PGU.user='" + user.getAuthorId() + "' and PGU.padGroupId in " + getGroupsQuery;
		int count = ((Long)session.createQuery(checkExistQuery).uniqueResult()).intValue();
		if(count > 0) {
			t.commit();
			return "添加失败，该课程已存在该用户";
		}
		PadGroupUser padGroupUser = new PadGroupUser();
		padGroupUser.setPadGroupId(groupId);
		padGroupUser.setUser(user);
		session.save(padGroupUser);
		t.commit();
		return "200";
	}
	
	@GET
	@Transactional
	@Path("/{userId}/remove/from/group/{groupId}")
	public String removeStudentFromGroup(@PathParam("userId") String userId, @PathParam("groupId") String groupId) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String getGroupUserQuery = "from PadGroupUser PGU where PGU.user='" + userId + "' and PGU.padGroupId='" + groupId + "'";
		PadGroupUser padGroupUser = (PadGroupUser)session.createQuery(getGroupUserQuery).uniqueResult();
		if(padGroupUser != null) {
			session.delete(padGroupUser);
		}
		else {
			t.commit();
			return "该组没有该用户";
		}
		t.commit();
		return "200";
	}
	
	@GET
	@Path("/add/group/for/course/{courseId}")
	public String addGroup(@PathParam("courseId") int courseId) throws UnsupportedEncodingException {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Course course = (Course)session.get(Course.class, courseId);
		CoursePadGroup coursePadGroup = new CoursePadGroup(course);
		session.save(coursePadGroup);
		String getMissionsQuery = "from Mission M where M.course=" + courseId;
		List<Mission> missions = (List<Mission>)session.createQuery(getMissionsQuery).list();
		String groupId = coursePadGroup.getPadGroupId();
		String getGroupCountQuery = "select count(*) from CoursePadGroup CPG where CPG.course=" + courseId;
		int groupCount = ((Long)session.createQuery(getGroupCountQuery).uniqueResult()).intValue();
		for(int i = 0; i < missions.size(); i++) {
			Mission mission = missions.get(i);
			String padName = mission.getName() + "-小组" + groupCount;
			String url = PadServerApi.getBaseRequestUrl("createGroupPad");
			url += "&groupID=" + groupId;
			url += "&padName=" + URLEncoder.encode(padName, "UTF-8");
			url += "&text=" + URLEncoder.encode(mission.getContent(), "UTF-8");
			String padId = JSON.parseObject(HttpRequest.get(url).body()).getJSONObject("data").getString("padID");
			MissionPad mp = new MissionPad();
			mp.setMission(mission);
			mp.setPad_id(padId);
			session.save(mp);
		}
		t.commit();
		return coursePadGroup.getPadGroupId();
	}
	
	@POST
	@Path("/{userId}/update")
	public String updateUser(
				@PathParam("userId") String userId,
				@FormParam(value="username") String username,
				@FormParam(value="studentNumber") String studentNumber,
				@FormParam(value="name") String name
			) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		User user = (User)session.get(User.class, userId);
		String query = "from User U where U.username='" + username + "'";
		User prevUser = (User)session.createQuery(query).uniqueResult();
		if(prevUser!=null && !user.getAuthorId().equals(prevUser.getAuthorId())) {
			t.commit();
			return "该邮箱已被使用，请重试";
		}
		user.setUsername(username);
		user.setName(name);
		user.setPassword(studentNumber);
		user.setStudentNumber(studentNumber);
		session.save(user);
		t.commit();
		return "200";
	}
}
