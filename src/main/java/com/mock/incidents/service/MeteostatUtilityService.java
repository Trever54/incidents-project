package com.mock.incidents.service;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Class which interacts with meteostat to get weather data
 */
@Service
public class MeteostatUtilityService {
    
    /**
     * Logger
     */
    private final static Logger LOGGER = LogManager.getLogger(MeteostatUtilityService.class);

    /**
     * url for the meteostat weather service to get hourly weather data
     */
    @Value("${meteostat.hourly.url}")
    private String weatherServiceUrl;

    /**
     * api key for authentication with the meteostat weather service
     */
    @Value("${meteostat.api.key}")
    private String apiKey;

    /**
     * Given an incident, request weather data for that incident
     * @param incident - the incident to get weather data for
     * @return - the weather data for that incident
     */
    public JsonObject requestWeatherData(float latitude, float longitude,
            String startDate, String endDate, String timeZone) {

        JsonObject result = null;

        try {
            // build uri
            StringBuilder builder = new StringBuilder();
            builder.append(weatherServiceUrl);
            builder.append("?lat=");
            builder.append(latitude);
            builder.append("&lon=");
            builder.append(longitude);
            builder.append("&start=");
            builder.append(startDate);
            builder.append("&end=");
            builder.append(endDate);
            builder.append("&tz=");
            builder.append(timeZone);

            // create the request
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(builder.toString()))
                    .header("x-api-key", apiKey)
                    .GET()
                    .build();
    
            // get response
            LOGGER.info("Sending http request to meteostat: {}", request.toString());
            HttpResponse<String> response = client.send(request, 
                    HttpResponse.BodyHandlers.ofString());
            
            // make sure our response was ok
            if (response.statusCode() == 200) {
                // check and see if the data is valid JSON
                JsonElement jsonElement = JsonParser.parseString(response.body());
                if (jsonElement.isJsonObject()) {
                    result = jsonElement.getAsJsonObject();
                } else {
                    LOGGER.error("Weather Data failed to be parsed into a JSON Object: {}", result);
                    throw new IOException();
                }
            } else {
                LOGGER.error("Bad response from meteostat. Error code: {}", response.statusCode());
            }

            

        } catch(IOException | InterruptedException e) {
            LOGGER.error("Failed to query for weather data {}", e);
        }

        return result;

    }

    /**
     * Trims down weather data such that it only includes the data
     * block and only includes times between the defined ZonedDateTimes
     * @param weatherData - the weather data to trim down
     * @param start - the start date and time (exclusive)
     * @param end - the end date and time (exclusive)
     * @return - the trimed down weather data in the form of a JsonObject
     */
    public JsonArray trimWeatherData(JsonObject weatherData, Instant start, Instant end, String timezone) {

        JsonArray newData = new JsonArray();

        JsonArray allData = weatherData.get("data").getAsJsonArray();

        // Zone id and formatter for dates
        ZoneId zoneId = ZoneId.of(timezone);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        // loop through all data (would be good to just optimize this query later on)
        for (int i = 0; i < allData.size(); i++) {

            JsonObject data = allData.get(i).getAsJsonObject();

            String time = data.get("time").getAsString();
            Instant timeInstant = LocalDateTime.parse(time, formatter).atZone(zoneId).toInstant();

            // check if range is between the start/end we're looking for
            if (timeInstant.isAfter(start) && timeInstant.isBefore(end)) {
                newData.add(data);
            }

        }

        return newData;

    }


}