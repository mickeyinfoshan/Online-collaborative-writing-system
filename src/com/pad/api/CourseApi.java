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

import com.pad.entity.Course;
import com.pad.entity.CourseStudent;
import com.pad.entity.Mission;
import com.pad.util.MailSender;

@Component
@Path("/course")
public class CourseApi extends BaseApi {
	
	@GET
	@Path("/teacher/{teacher_id}/list")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getCourses(@PathParam("teacher_id") String teacher_id) {
		String query = "from Course C where teacher_id='" + teacher_id + "'";
		if(teacher_id.equals("-1")) {
			query = "from Course C";
		}
		Session s = getSession();
		List<Course> list = (List<Course>)(s.createQuery(query).list());
		s.close();
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
		s.close();
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
		session.close();
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
		session.close();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/mission/list")
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

	@POST
	@Path("/{course_id}/mission/create")
	@Produces(MediaType.APPLICATION_JSON)
	public String createMission(@PathParam("course_id") int course_id,
			@FormParam(value="name") String name,
			@FormParam(value="start") String start,
			@FormParam(value="end") String end,
			@FormParam(value="created_time") String created_time,
			@FormParam(value="content") String content
		) {
		Session session = getSession();
		Course course = (Course)session.get(Course.class, course_id);
		Mission mission = new Mission();
		mission.setCourse(course);
		mission.setStart(start);
		mission.setEnd(end);
		mission.setName(name);
		mission.setCreated_time(created_time);
		mission.setContent(content);
		Transaction t = session.beginTransaction();
		session.save(mission);
		t.commit();
		session.close();
		String host = "smtp.163.com";
		String port = "25";
		String from = "mjhlybmwq@163.com";
		String password = "208063";
		String to = "819469353@qq.com";
		String subjectText = "subject";
		String messageText = "Message\n\nText";
		MailSender.simpleSend(host, port, from, password, to, subjectText, messageText);
		return "200";
	}
	
	@GET
	@Path("/{course_id}/student/add/{student_id}")
	public String addStudent(@PathParam("course_id") int course_id,
			@PathParam("student_id") String student_id) {
		Session session = getSession();
		String query = "from CourseStudent CS where CS.student_id='" + student_id + "' and CS.course=" + course_id;
		List<CourseStudent> list = (List<CourseStudent>)session.createQuery(query).list(); //直接拷过来的，懒得用uniqueResult
		if(list.size() <= 0) {
			Transaction t = session.beginTransaction();
			Course course = (Course)session.get(Course.class, course_id);
			CourseStudent cs = new CourseStudent();
			cs.setCourse(course);
			cs.setStudent_id(student_id);
			session.save(cs);
			t.commit();
		}
		session.close();
		return "200";
	}
	
	@GET
	@Path("/{course_id}/student/count")
	public int countStudnet(@PathParam("course_id") int course_id) {
		Session session = getSession();
		String query = "select count(*) from CourseStudent CS where CS.course=" + course_id;
		int count = ((Long)session.createQuery(query).uniqueResult()).intValue();
		session.close();
		return count;
	}
	
	@GET
	@Path("/student/{student_id}/selected")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getStudentSelectedCourses(@PathParam("student_id") String student_id) {
		Session session = getSession();
		String query = "select course from CourseStudent CS where CS.student_id='" + student_id + "'";
		List<Course> list = (List<Course>)session.createQuery(query).list();
		Course[] courses = new Course[list.size()];
		session.close();
		return (Course[])list.toArray(courses);
	}
	

	@GET
	@Path("/student/{student_id}/not/selected")
	@Produces(MediaType.APPLICATION_JSON)
	public Course[] getStudentNotSelectedCourses(@PathParam("student_id") String student_id) {
		Session session = getSession();
		String nested_query = "(select course from CourseStudent CS where CS.student_id='" + student_id + "')";
		String query = "from Course C where C.id not in" + nested_query;
		List<Course> list = (List<Course>)session.createQuery(query).list();
		Course[] courses = new Course[list.size()];
		session.close();
		return (Course[])list.toArray(courses);
	}
	
	@GET
	@Path("/{course_id}/student/remove/{student_id}")
	public String removeStudentFromCourse(@PathParam("student_id") String student_id,@PathParam("course_id") int course_id) {
		Session session = getSession();
		String query = "from CourseStudent CS where CS.student_id='" + student_id + "' and CS.course=" + course_id;
		List<CourseStudent> list = (List<CourseStudent>)session.createQuery(query).list();
		if(list.size() > 0) {
			Transaction t = session.beginTransaction();
			CourseStudent cs = list.get(0);
			session.delete(cs);
			t.commit();
		}
		session.close();
		return "200";
	}
}
