package com.cascadia_analytics.piet.dashboards;

import java.io.InputStreamReader;

import javax.annotation.PostConstruct;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PietDashboardsRestController {
	
	private static final Log LOG = LogFactory.getLog(PietDashboardsRestController.class);
	
	@Value(value = "${config.filename}")
	private Resource configFile; // set in application.properties
	
	private String configJson;
	
	@PostConstruct
	public void init() throws Exception {
		LOG.info("Loading Piet Dashboards config from " + configFile.getURI());
		try (InputStreamReader configReader = new InputStreamReader(configFile.getInputStream())) {
			configJson = FileCopyUtils.copyToString(configReader);
		}
	}
	
	@GetMapping(path="/config", produces="application/json")
	public String getConfiguration() throws Exception {
		return configJson;
	}
	
}
