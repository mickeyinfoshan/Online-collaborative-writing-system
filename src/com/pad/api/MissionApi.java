package com.pad.api;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.util.List;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.StreamingOutput;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.Transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import com.github.kevinsawicki.http.HttpRequest;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.pdf.PdfWriter;
import com.itextpdf.tool.xml.XMLWorkerHelper;
import com.pad.entity.Course;
import com.pad.entity.Mission;
import com.pad.entity.MissionPad;
import com.pad.entity.User;
import com.pad.util.PadServerApi;

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
			@FormParam(value="content") String content,
			@FormParam(value="desc") String desc
		) {
		
		Session session = getSession();
		Transaction t = session.beginTransaction();
		Mission mission = (Mission)session.get(Mission.class, mission_id);
		mission.setName(name);
		mission.setContent(content);
		mission.setStart(start);
		mission.setEnd(end);
		mission.setDescription(desc);
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
		String padGroupId = (String)session.createQuery(getPadGroupQuery).list().get(0);
		String url = PadServerApi.getBaseRequestUrl("listPads");
		url += "&groupID=" + padGroupId;
		String resString = HttpRequest.get(url).body();
		System.out.println(resString);
		JSONArray json_padIds = JSON.parseObject(resString).getJSONObject("data").getJSONArray("padIDs");
		System.out.println(json_padIds.toJSONString());
		String getPadQuery = "select pad_id from MissionPad MP where MP.mission=" + mission.getId() + " and MP.pad_id in (:padIds)";
		String padId = (String)session.createQuery(getPadQuery).setParameterList("padIds", json_padIds.toArray()).uniqueResult();
		JSONObject result = new JSONObject();
		result.put("pad_id", padId);
		result.put("group_id", padGroupId);
		User user = (User)session.get(User.class, user_id);
		String padUserUrl = PadServerApi.getBaseRequestUrl("createAuthorIfNotExistsFor");
		padUserUrl += "&authorMapper=" + user_id;
		padUserUrl += "&name=" + URLEncoder.encode(user.getName(), "UTF-8");
		String _resString = HttpRequest.get(padUserUrl).body();
		JSONObject _res = JSON.parseObject(_resString);
		String authorId = _res.getJSONObject("data").getString("authorID");
		result.put("author_id", authorId);
		String response = result.toJSONString();
		t.commit();
		return response;
	}

	@GET
	@Path("/pad/{pad_id}/authors")
	@Produces(MediaType.APPLICATION_JSON)
	public String getPadAuthors(@PathParam("mission_id") int mission_id, @PathParam("pad_id") String pad_id) {
		return "";
	}
	
	@GET
	@Path("/pad/{missionpad_id}/score/{score}")
	@Produces(MediaType.APPLICATION_JSON)
	public String setMissionPadScore(@PathParam("missionpad_id") int missionpad_id, @PathParam("score") int score) {
		Session session = getSession();
		Transaction t = session.beginTransaction();
		MissionPad mp = (MissionPad)session.get(MissionPad.class, missionpad_id);
		mp.setScore(score);
		session.save(mp);
		t.commit();
		return "200";
	}
	
	@GET
	@Produces({"application/pdf"})
	@Path("/{mission_id}/pad/{pad_id}/export/pdf")
	public Response getPDF(@PathParam("pad_id") final String pad_id) throws Exception {
		String url = PadServerApi.getBaseRequestUrl("getHTML");
		url += "&padID=" + URLEncoder.encode(pad_id, "UTF-8");
		System.out.println(url);
		String resString = HttpRequest.get(url).body();
		JSONObject res = JSON.parseObject(resString);
		System.out.println(resString);
		String padHtml = res.getJSONObject("data").getString("html");
		padHtml = padHtml.replaceAll("<br>", "<br />");
		padHtml = padHtml.replaceAll("<body>", "<body style=\"font-family:SimSun;\">");
		String TEMP_FILE = "temp.pdf";
		Document document = new Document();
		PdfWriter writer = PdfWriter.getInstance(document, new FileOutputStream(TEMP_FILE));
		document.open();
		InputStream stream = new ByteArrayInputStream(padHtml.getBytes(StandardCharsets.UTF_8));
		XMLWorkerHelper.getInstance().parseXHtml(writer, document, stream, Charset.forName("UTF-8"));
		document.close();
		File pdfFile = new File(TEMP_FILE);
		ResponseBuilder response = Response.ok((Object) pdfFile, "application/pdf");
		String pdfFileName = pad_id;
		int dollarIndex = pdfFileName.indexOf("$");
		pdfFileName = pdfFileName.substring(dollarIndex + 1);
		pdfFileName = URLEncoder.encode(pdfFileName, "UTF-8");
		pdfFileName += ".pdf";
		System.out.println(pdfFileName);
		response.header("Content-Disposition",
				"attachment; filename=" + pdfFileName);
		return response.build();
	}
	
	
}
