package com.mock.incidents.configuration;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.mock.incidents.component.IncidentDataReader;
import com.mock.incidents.model.Incident;
import com.mock.incidents.service.MeteostatUtilityService;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * This class handles the initialization of the data. This includes both reading
 * the data and enriching the data with weather information.
 */
@Configuration
public class DataInitializer {

    /**
     * Logger
     */
    private final static Logger LOGGER = LogManager.getLogger(DataInitializer.class);

    /**
     * Absolute path to the data file to read
     */
    @Value("${data.file}")
    private String stringPath;

    /**
     * Data reader that can read the incident data file
     * into an Incident object
     */
    @Autowired
    private IncidentDataReader dataReader;

    /**
     * Interaction service to get weather data
     */
    @Autowired
    private MeteostatUtilityService meteostat;

    /**
     * Enriched data created from initialization
     */
    public JsonObject enrichedData;

    /**
     * Bean that initializes the data by reading the specified data file
     * and then enriching it with weather data
     */
    @Bean
    public void initializeData() {

        // read in incident
        Incident incident = dataReader.readData(stringPath);
        // initialize enriched data
        enrichedData = incident.getJsonObject();

        // request weather data
        float latitude = incident.getLatitude();
        float longitude = incident.getLongitude();
        String startDate = incident.getStartDateString();
        String endDate = incident.getEndDateString();
        String timeZone = incident.getTimeZone();
        JsonObject weatherData = meteostat.requestWeatherData(latitude, longitude, startDate, endDate, timeZone);

        // Parse the time(s) we want from the weather data
        JsonArray trimmedWeatherData = meteostat.trimWeatherData(weatherData, incident.getStartInstant(), incident.getEndInstant(), timeZone);

        // add weather to the enriched data
        enrichedData.add("weather", trimmedWeatherData);
        
    }


}