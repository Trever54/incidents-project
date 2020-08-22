package com.mock.incidents;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({"com.mock.incidents", "controller"}) // Add this
public class IncidentsApplication {

	public static void main(String[] args) {
		SpringApplication.run(IncidentsApplication.class, args);
	}

}
