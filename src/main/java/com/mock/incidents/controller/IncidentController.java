package com.mock.incidents.controller;

import com.mock.incidents.configuration.IncidentDataReader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IncidentController {
    
    @Autowired
    IncidentDataReader incidentDataReader;

    @GetMapping("/incident")
    public String getIncident() {
        return incidentDataReader.incident.getJsonObject().toString();
    }


}