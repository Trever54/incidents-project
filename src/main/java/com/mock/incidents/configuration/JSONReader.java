package com.mock.incidents.configuration;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mock.incidents.model.Incident;

/**
 * The purpose of this class is to read and store a
 * JSON config file whose location is specified in application.properties.
 */
@Configuration
public class JSONReader {

    /**
     * Logger
     */
    private final static Logger LOGGER = LogManager.getLogger(JSONReader.class);

    /**
     * Absolute path to the data file to read
     */
    @Value("${data.file}")
    private String stringPath;

    /**
     * Bean which reads and stores the JSON data on startup of the application
     * such that it can be accessed by other parts of the application
     */
    @Bean
    public void readData() {

        LOGGER.info("Reading in data from path: '{}'", stringPath);

        // load file into a JsonObject
        JsonObject jsonContent = readFileIntoJsonObject(stringPath);

        // parse info into an Incident object
        Incident incident = parseIncident(jsonContent);

        LOGGER.info(incident);

    }

    /**
     * This method reads the file in to a JsonObject
     * @param stringPath - the path to the file to be read in
     * @return the JsonObject representing the file contents; otherwise null if the
     * file could not be read or was of invalid Json format.
     */
    private JsonObject readFileIntoJsonObject(String stringPathToFile) {

        JsonObject jsonContent = null;

        try {

            // read from the file
            Path path = FileSystems.getDefault().getPath(stringPathToFile);
            String stringJsonContent = Files.readString(path, StandardCharsets.US_ASCII);

            // check and see if the data is valid JSON
            JsonElement jsonElement = JsonParser.parseString(stringJsonContent);
            if (jsonElement.isJsonObject()) {
                jsonContent = jsonElement.getAsJsonObject();
                LOGGER.info("Successfully read JSON data from file at path: '{}'", stringPathToFile);
            } else {
                LOGGER.error("Data failed to be parsed into a JSON Object from "
                    + "file at path: '{}'", stringPathToFile);
                throw new IOException();
            }

        } catch (IOException e) {
            LOGGER.error("Failed to read JSON file at path '{}'", stringPathToFile, e);
        } 

        return jsonContent;

    }

     /**
      * Based on the Json Data, this method creates an Incident object
      * representing the data.
      * @param jsonContent - the json data in the form of a JsonObject
      * @return - the Incident object which has specific parts of the data
      * parsed to more easily use on the backend side.
      */
    private Incident parseIncident(JsonObject jsonContent) {

        Incident incident = null;

        try {

            // address
            JsonObject address = jsonContent.get("address").getAsJsonObject();
            float latitude = address.get("latitude").getAsFloat();
            float longitude = address.get("longitude").getAsFloat();
    
            // description
            JsonObject description = jsonContent.get("description").getAsJsonObject();
            String eventOpened = description.get("event_opened").getAsString();
            String eventClosed = description.get("event_closed").getAsString();
            String startDate = eventOpened.split("T")[0];
            String endDate = eventClosed.split("T")[0];

            // fire department
            JsonObject fireDepartment = jsonContent.get("fire_department").getAsJsonObject();
            String timeZone = fireDepartment.get("timezone").getAsString();

            incident = new Incident(jsonContent, latitude, longitude, startDate, endDate, timeZone);

        } catch (NullPointerException e) {
            LOGGER.error("Failed to create incident object for JSON: {}", jsonContent);
        }

        return incident;

    }

}
