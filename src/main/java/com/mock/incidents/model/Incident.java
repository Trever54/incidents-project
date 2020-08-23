package com.mock.incidents.model;

import java.time.ZonedDateTime;

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
    private String startDateString;
    private String endDateString;
    private String timeZone;
    private ZonedDateTime startDateWithTime;
    private ZonedDateTime endDateWithTime;

    public Incident(JsonObject jsonObject, float latitude, float longitude, 
            String startDateString, String endDateString, String timeZone, 
            ZonedDateTime startDateWithTime, ZonedDateTime endDateWithTime) {

        this.jsonObject = jsonObject;
        this.latitude = latitude;
        this.longitude = longitude;
        this.startDateString = startDateString;
        this.endDateString = endDateString;
        this.timeZone = timeZone;
        this.startDateWithTime = startDateWithTime;
        this.endDateWithTime = endDateWithTime;

    }

    public String toString() {
        StringBuilder builder = new StringBuilder();
        builder.append("\n");
        builder.append("Latitude: ");
        builder.append(this.latitude);
        builder.append("\n");
        builder.append("Longitude: ");
        builder.append(this.longitude);
        builder.append("\n");
        builder.append("StartDate: ");
        builder.append(this.startDateString);
        builder.append("\n");
        builder.append("EndDate: ");
        builder.append(this.endDateString);
        builder.append("\n");
        builder.append("timeZone: ");
        builder.append(this.timeZone);
        builder.append("\n");
        builder.append("Start Date With Time: ");
        builder.append(this.startDateWithTime);
        builder.append("\n");
        builder.append("End Date With Time: ");
        builder.append(this.endDateWithTime);
        return builder.toString();
    }

    public JsonObject getJsonObject() {
        return this.jsonObject;
    }

    public float getLatitude() {
        return this.latitude;
    }

    public float getLongitude() {
        return this.longitude;
    }
    
    public String getStartDateString() {
        return this.startDateString;
    }

    public String getEndDateString() {
        return this.endDateString;
    }

    public String getTimeZone() {
        return this.timeZone;
    }

    public ZonedDateTime getStartDateWithTime() {
        return this.startDateWithTime;
    }

    public ZonedDateTime getEndDateWithTime() {
        return this.endDateWithTime;
    }

    
}