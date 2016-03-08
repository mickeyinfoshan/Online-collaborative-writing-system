package com.pad.api;

import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.commons.io.IOUtils;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Header;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.glassfish.jersey.media.multipart.FormDataParam;
import org.hibernate.Query;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.github.kevinsawicki.http.HttpRequest;
import com.pad.entity.Course;
import com.pad.entity.CoursePadGroup;
import com.pad.entity.CourseStudent;
import com.pad.entity.Mission;
import com.pad.entity.MissionPad;
import com.pad.entity.PadGroupUser;
import com.pad.entity.User;
import com.pad.util.MailThread;
import com.pad.util.PadServerApi;

@Component
@Path("/course")
public class CourseApi extends BaseApi {
	
	@Autowired
	private SessionFactory mysf;
	
	@GET
	@Path("/teacher/{teacher_id}/list")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getCourses(@PathParam("teacher_id") String teacher_id) {
		String query = "from Course C where teacher_id='" + teacher_id + "'";
		if(teacher_id.equals("-1")) {
			query = "from Course C";
		}
		Session s = getSession();
		Transaction t = s.beginTransaction();
		List<Course> list = (List<Course>)(s.createQuery(query).list());
		t.commit();
		Course[] courses = new Course[list.size()];
		return (Course[])(list.toArray(courses));
	}
	
	@POST
	@Path("/teacher/{teacher_id}/create")
	public String createCourse(
			@PathParam("teacher_id") String teacher_id,
			@FormParam(value="teacher_name") String teacher_name,
			@FormParam(value="name") String name,
			@FormParam(value="created_time") String created_time
			) {
		
		Course course = new Course();
		course.setCreated_time(created_time);
		course.setName(name);
		course.setTeacher_id(teacher_id);
		course.setTeacher_name(teacher_name);
		Session s = getSession();
		Transaction t = s.beginTransaction();
		s.save(course);
		t.commit();
		return "200";
	}
	
	@POST
	@Path("/{course_id}/update")
	public String updateCourse(
			@PathParam("teacher_id") String teacher_id,
			@PathParam("course_id") int course_id,
			@FormParam(value="name") String name
		) {
		
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Course course = (Course)session.get(Course.class, course_id);
		course.setName(name);
		session.save(course);
		t.commit();
		return "200";
	}

	@GET
	@Path("/{course_id}/delete")
	public String deleteCourse(
			@PathParam("teacher_id") String teacher_id,
			@PathParam("course_id") int course_id
		) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Course course = (Course)session.get(Course.class, course_id);
		session.delete(course);
		t.commit();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/mission/list")
	@Produces(MediaType.APPLICATION_JSON)
	public Mission[] getMissionList(
				@PathParam("course_id") int course_id
			) {
		
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from Mission M where M.course=" + course_id;
		List<Mission> list = (List<Mission>)(session.createQuery(query).list());
		t.commit();
		Mission[] missions = new Mission[list.size()];	
		return (Mission[])list.toArray(missions);
	}

	//Awful one!!!!!
	@POST
	@Path("/{course_id}/mission/create")
	@Produces(MediaType.APPLICATION_JSON)
	public String createMission(@PathParam("course_id") int course_id,
			@FormParam(value="name") String name,
			@FormParam(value="start") String start,
			@FormParam(value="end") String end,
			@FormParam(value="created_time") String created_time,
			@FormParam(value="content") String content
		) throws UnsupportedEncodingException {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Course course = (Course)session.get(Course.class, course_id);
		Mission mission = new Mission();
		mission.setCourse(course);
		mission.setStart(start);
		mission.setEnd(end);
		mission.setName(name);
		mission.setCreated_time(created_time);
		mission.setContent(content);
		session.save(mission);
		String nestedQuery = "(select padGroupId from CoursePadGroup CPG where CPG.course='" +  course_id + "')";
		String query = "select user from PadGroupUser PGU where PGU.padGroupId in " + nestedQuery;
		List<String> receivers = (List<String>)session.createQuery(query).list();
		//create pad
		String coursePadGroupQuery = "select padGroupId from CoursePadGroup cpg where cpg.course=" + course_id;
		List<String> groupIds = (List<String>)session.createQuery(coursePadGroupQuery).list();
		for(int i = 0; i < groupIds.size(); i++) {
			String groupId = groupIds.get(i);
			String padName = mission.getName() + "-小组" + (i + 1);
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
		MailThread mt = new MailThread();
		mt.setMission(mission);
		mt.setSessionFactory(mysf);
		mt.setReceivers(receivers);
		mt.start();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/student/add/{student_id}")
	public String addStudent(@PathParam("course_id") int course_id,
			@PathParam("student_id") String student_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from CourseStudent CS where CS.student_id='" + student_id + "' and CS.course=" + course_id;
		List<CourseStudent> list = (List<CourseStudent>)session.createQuery(query).list(); //直接拷过来的，懒得用uniqueResult
		if(list.size() <= 0) {
			Course course = (Course)session.get(Course.class, course_id);
			CourseStudent cs = new CourseStudent();
			cs.setCourse(course);
			cs.setStudent_id(student_id);
			session.save(cs);
		}
		t.commit();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/student/count")
	public int countStudnet(@PathParam("course_id") int course_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String nestedQuery = "(select padGroupId from CoursePadGroup CPG where CPG.course='" + course_id + "')";
		String query = "select count(*) from PadGroupUser PGU where PGU.padGroupId in " + nestedQuery;
		int count = ((Long)session.createQuery(query).uniqueResult()).intValue();
		t.commit();
		return count;
	}
	
	@GET
	@Path("/student/{student_id}/selected")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getStudentSelectedCourses(@PathParam("student_id") String student_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String nestedQuery = "(select padGroupId from PadGroupUser PGU where PGU.user='" + student_id + "')";
		String query = "select course from CoursePadGroup CPG where CPG.padGroupId in" + nestedQuery;
		List<Course> list = (List<Course>)session.createQuery(query).list();
		Course[] courses = new Course[list.size()];
		t.commit();
		return (Course[])list.toArray(courses);
	}
	

	@GET
	@Path("/student/{student_id}/not/selected")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getStudentNotSelectedCourses(@PathParam("student_id") String student_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String nested_query = "(select course from CourseStudent CS where CS.student_id='" + student_id + "')";
		String query = "from Course C where C.id not in" + nested_query;
		List<Course> list = (List<Course>)session.createQuery(query).list();
		Course[] courses = new Course[list.size()];
		t.commit();
		return (Course[])list.toArray(courses);
	}
	
	@GET
	@Path("/{course_id}/student/remove/{student_id}")
	public String removeStudentFromCourse(@PathParam("student_id") String student_id,@PathParam("course_id") int course_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from CourseStudent CS where CS.student_id='" + student_id + "' and CS.course=" + course_id;
		List<CourseStudent> list = (List<CourseStudent>)session.createQuery(query).list();
		if(list.size() > 0) {
			CourseStudent cs = list.get(0);
			session.delete(cs);
		}
		t.commit();
		return "200";
	}

	@POST
	@Path("/{course_id}/student/import")
	@Consumes({MediaType.MULTIPART_FORM_DATA})
	public String importStudents(@PathParam("course_id") int course_id, @FormDataParam("file") InputStream fileInputStream) throws IOException {
		int START_ROW = 2;
		int STUDENT_NUMBER_COL = 0;
		int NAME_COL = 1;
		int GROUP_COL = 2;
		int EMAIL_COL = 3;
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Session _session = mysf.openSession();
		Course course = (Course)session.get(Course.class, course_id);
		XSSFWorkbook wb = new XSSFWorkbook(fileInputStream);
		XSSFSheet sheet = wb.getSheetAt(0);
		int lastRowIndex = sheet.getLastRowNum();
		int i = START_ROW;
		DataFormatter df = new DataFormatter();
		while(i <= lastRowIndex) {
			String groupNumber = df.formatCellValue(sheet.getRow(i).getCell(GROUP_COL));
			if(groupNumber.isEmpty()) {
				break;
			}
			int groupMemberCount = 1;
			int currentRow = i + 1;
			while(currentRow <= lastRowIndex && 
					df.formatCellValue(sheet.getRow(currentRow).getCell(GROUP_COL)).equals(groupNumber) && 
					!df.formatCellValue(sheet.getRow(currentRow).getCell(STUDENT_NUMBER_COL)).isEmpty() &&
					!df.formatCellValue(sheet.getRow(currentRow).getCell(NAME_COL)).isEmpty() &&
					!df.formatCellValue(sheet.getRow(currentRow).getCell(EMAIL_COL)).isEmpty()
					) {
				currentRow++;
				groupMemberCount++;
			}
			CoursePadGroup coursePadGroup = new CoursePadGroup(course);
			session.save(coursePadGroup);
			System.out.println(groupMemberCount + "");
			System.out.println(i + "");
			for(currentRow = i; currentRow < i + groupMemberCount; currentRow++) {
				Row row = sheet.getRow(currentRow);
				String name = df.formatCellValue(row.getCell(NAME_COL));
				String studentNumber = df.formatCellValue(row.getCell(STUDENT_NUMBER_COL));
				String email = df.formatCellValue(row.getCell(EMAIL_COL));
				if(name.isEmpty() || studentNumber.isEmpty() || email.isEmpty()) {
					continue;
				}
				Query getExistUserQuery = _session.createQuery(
						"from User where username=:name ");
				getExistUserQuery.setString("name", email);
				User user = (User)getExistUserQuery.uniqueResult();
				//用户不存在 创建用户
				if(user == null) {
					user = new User();
					user.setName(name);
					user.setUsername(email);
					user.setPassword(studentNumber);
					user.setStudentNumber(studentNumber);
					Transaction _t = _session.beginTransaction();
					_session.save(user);
					_t.commit();
					user.initPadUser();
				}
				PadGroupUser padGroupUser = new PadGroupUser();
				padGroupUser.setUser(user.getAuthorId());
				padGroupUser.setPadGroupId(coursePadGroup.getPadGroupId());
				session.save(padGroupUser);
			}
			i += groupMemberCount;
		}
		t.commit();
		_session.close();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/student/{user_id}/members")
	@Produces(MediaType.APPLICATION_JSON)
	public String getUserGroupMembers(@PathParam("course_id") int course_id, @PathParam("user_id") String user_id) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Course course = (Course)session.get(Course.class, course_id);
		String getPadGroupNestedQuery = "(select padGroupId from CoursePadGroup CPG where CPG.course='" + course.getId() + "')";
		String getPadGroupQuery = "select padGroupId from PadGroupUser PGU where PGU.user='" + user_id + "' and PGU.padGroupId in " + getPadGroupNestedQuery;
		String padGroupId = (String)session.createQuery(getPadGroupQuery).uniqueResult();
		String getUsersQuery = "select user from PadGroupUser PGU where PGU.padGroupId='" + padGroupId + "'";
		List<String> userIdList = (List<String>)session.createQuery(getUsersQuery).list();
		JSONArray result = new JSONArray();
		Session _session = mysf.openSession();
		for(int i = 0; i < userIdList.size(); i++) {
			String userId = userIdList.get(i);
			User u = (User)_session.get(User.class, userId);
			result.add(u);
		}
		_session.close();
		t.commit();
		return result.toJSONString();
	}
	
	public SessionFactory getMysf() {
		return mysf;
	}

	public void setMysf(SessionFactory mysf) {
		this.mysf = mysf;
	}
}
