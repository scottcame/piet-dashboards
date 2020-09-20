package com.cascadia_analytics.piet.dashboards;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

@SpringBootApplication
public class PietDashboardsApplication extends SpringBootServletInitializer {
	
	public static void main(String ... args) {
		SpringApplication.run(PietDashboardsApplication.class, args);
	}

}
