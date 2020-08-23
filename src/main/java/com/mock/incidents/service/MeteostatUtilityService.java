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
    public String requestWeatherData(float latitude, float longitude, 
            String startDate, String endDate, String timeZone) {

        String result = "";

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
            HttpResponse<String> response = client.send(request, 
                    HttpResponse.BodyHandlers.ofString());
            
            // make sure our response was ok
            if (response.statusCode() == 200) {
                // get the body for our result
                result = response.body();
            } else {
                LOGGER.error("Bad response from meteostat. Error code: {}", response.statusCode());
            }

        } catch(IOException | InterruptedException e) {
            LOGGER.error("Failed to query for weather data {}", e);
        }

        return result;

    }


}