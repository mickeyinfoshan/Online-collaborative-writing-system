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

@Component
@Path("/course")
public class CourseApi extends BaseApi {
	
	@GET
	@Path("/{teacher_id}/list")
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
	@Path("/{teacher_id}/create")
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
	@Path("/{teacher_id}/update/{course_id}")
	public String updateCourse(@PathParam("teacher_id") String teacher_id,
			@FormParam(value="teacher_name") String teacher_name,
			@FormParam(value="name") String name,
			@FormParam(value="created_time") String created_time) {
		
		return "200";
	}
}
