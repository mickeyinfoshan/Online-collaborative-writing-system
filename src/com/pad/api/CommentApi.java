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

import com.pad.entity.Comment;

@Component
@Path("/comment")
public class CommentApi extends BaseApi{
	
	@GET
	@Path("/{pad_id}/list")
	@Produces(MediaType.APPLICATION_JSON)
	public Comment[] getCommentList(
			@PathParam("pad_id") String pad_id
	){
		Session session = getSession();
		Transaction t = session.beginTransaction();
		String query = "from Comment C where C.pad_id='" + pad_id + "'";
		List<Comment> list = (List<Comment>)(session.createQuery(query).list());
		t.commit();
		int size = list.size();
		Comment[] comments = new Comment[size];
		return (Comment[])(list.toArray(comments));
	}
	
	@POST
	@Path("/{pad_id}/create")
	public String createComment(
			@PathParam("pad_id") String pad_id,
			@FormParam(value="created_time") String created_time,
			@FormParam(value="content") String content,
			@FormParam(value="user_name") String user_name,
			@FormParam(value="user_id") String user_id
		){
		
		Comment c = new Comment();
		c.setContent(content);
		c.setCreated_time(created_time);
		c.setPad_id(pad_id);
		c.setUser_id(user_id);
		c.setUser_name(user_name);
		Session session = getSession();
		Transaction t = session.beginTransaction();
		session.save(c);
		t.commit();
		return "200";
	}
	
	@POST
	@Path("/{pad_id}/delete/{comment_id}")
	public String deleteComment(
				@PathParam("pad_id") String pad_id,
				@PathParam("comment_id") int comment_id
			){
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Comment c = (Comment)session.get(Comment.class, comment_id);
		session.delete(c);
		t.commit();
		return "200";
	}
	
	@POST
	@Path("/{pad_id}/update/{comment_id}")
	public String updateComment(
				@PathParam("pad_id") String pad_id,
				@PathParam("comment_id") int comment_id
			){
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Comment c = (Comment)session.get(Comment.class, comment_id);
		session.save(c);
		t.commit();
		return "200";
	}
}
