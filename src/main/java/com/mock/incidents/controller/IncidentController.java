package com.mock.incidents.controller;

import com.mock.incidents.configuration.DataInitializer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IncidentController {
    
    @Autowired
    DataInitializer dataInitializer;

    @GetMapping("/incident")
    public String getIncident() {
        return dataInitializer.enrichedData.toString();
    }


}