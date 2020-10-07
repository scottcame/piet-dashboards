// Copyright 2020 Scott Came Consulting LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
