package com.pad.api;

import javax.ws.rs.GET;
import javax.ws.rs.Path;

import org.springframework.stereotype.Component;

@Component
@Path("/my")
public class MyApi {
	
	
	@GET
	@Path("/hehe")
	public String hehe() {
		return "hehe";
	}
}
