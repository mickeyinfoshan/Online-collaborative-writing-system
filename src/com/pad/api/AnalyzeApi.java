package com.pad.api;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

import javax.ws.rs.FormParam;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import org.springframework.stereotype.Component;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.pad.dao.impl.UserDaoImpl;

@Component
@Path("/analyze")
public class AnalyzeApi extends BaseApi{

	@POST
	@Path("/export/csv")
	public Response exportCSVFile(@FormParam(value="data") String data) throws IOException {
		String TEMP_FILE = "temp.csv";
		FileWriter writer = new FileWriter(TEMP_FILE);
		 
//	    writer.append("DisplayName");
//	    writer.append(',');
//	    writer.append("Age");
//	    writer.append("\r\n");
//
//	    writer.append("MKYONG");
//	    writer.append(',');
//	    writer.append("26");
//            writer.append("\r\n");
//			
//	    writer.append("YOUR NAME");
//	    writer.append(',');
//	    writer.append("29");
//	    writer.append("\r\n");
			
		JSONArray rows = JSON.parseArray(data);
		for(int i = 0; i < rows.size(); i++) {
			 JSONArray row = rows.getJSONArray(i);
			 for(int j = 0; j < row.size(); j++) {
				 writer.append(row.getString(j));
				 if(j < row.size() - 1) {
					 writer.append(",");
				 }
			 }
			 writer.append("\r\n");//换行符
		}
			
	    writer.flush();
	    writer.close();
	    
	    File csvFile = new File(TEMP_FILE);
	    ResponseBuilder response = Response.ok((Object) csvFile, "application/CSV");
	    response.header("Content-Disposition",
				"attachment; filename=data.csv");
	    return response.build();
	}
	
}
