package com.cascadia_analytics.piet.dashboards;

import static org.junit.Assert.assertEquals;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD) // forces recreation of repository with fresh database after each test
public class PietDashboardsRestControllerTest {

	private static final Log log = LogFactory.getLog(PietDashboardsRestControllerTest.class);

	@LocalServerPort
	private int port;

	@Autowired
    private TestRestTemplate restTemplate;

	@BeforeAll
	public static void beforeAll() {
		log.trace("Before " + PietDashboardsRestControllerTest.class.getName());
	}

	@Test
	public void testGetConfiguration() throws Exception {
		
		String configurationString = restTemplate.getForObject("http://localhost:" + port + "/config", String.class);
		
	    ObjectMapper mapper = new ObjectMapper();
	    JsonNode root = mapper.readTree(configurationString);
	    
	    // obvs not a real config file...that's over in the ui/test directory
	    // this is just to demonstrate that the Spring machinery is working and returns a proper json file
	 
	    JsonNode jsonNode1 = root.get("foo");
	    assertEquals(jsonNode1.textValue(), "bar");

	}
	
}
