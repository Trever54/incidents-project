package com.mock.incidents.model;

import com.google.gson.JsonObject;

/**
 * This class represents incident data. It only stores data the backend needs
 * access to while the entire data is stored in a JsonObject that can be parsed
 * with GSON.
 */
public class Incident {

    private JsonObject jsonObject;
    private float latitude;
    private float longitude;
    private String startDate;
    private String endDate;
    private String timeZone;

    public Incident(JsonObject jsonObject, float latitude, float longitude, 
            String startDate, String endDate, String timeZone) {
        this.jsonObject = jsonObject;
        this.latitude = latitude;
        this.longitude = longitude;
        this.startDate = startDate;
        this.endDate = endDate;
        this.timeZone = timeZone;
    }

    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("Latitude: ");
        builder.append(this.latitude);
        builder.append("\n");
        builder.append("Longitude: ");
        builder.append(this.longitude);
        builder.append("\n");
        builder.append("StartDate: ");
        builder.append(this.startDate);
        builder.append("\n");
        builder.append("EndDate: ");
        builder.append(this.endDate);
        builder.append("\n");
        builder.append("timeZone: ");
        builder.append(this.timeZone);
        return builder.toString();
    }

    
}