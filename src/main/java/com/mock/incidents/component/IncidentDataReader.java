package com.mock.incidents.component;

import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.TimeZone;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.mock.incidents.model.Incident;

/**
 * The purpose of this class is to read incident data into a jsonObject
 * 
 * The JSON config file to be read is specified in application.properties.
 */
@Component
public class IncidentDataReader {

    /**
     * Logger
     */
    private final static Logger LOGGER = LogManager.getLogger(IncidentDataReader.class);

    /**
     * Reads JSON incident data and returns an incident object
     * that represents that data
     */
    public Incident readData(String stringPath) {

        LOGGER.info("Reading in data from path: '{}'", stringPath);

        // load file into a JsonObject
        JsonObject jsonContent = readFileIntoJsonObject(stringPath);

        // parse info into an Incident object
        Incident incident = parseIncident(jsonContent);

        return incident;

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
            String startDateString = eventOpened.split("T")[0];
            String endDateString = eventClosed.split("T")[0];

            // fire department
            JsonObject fireDepartment = jsonContent.get("fire_department").getAsJsonObject();
            String timeZone = fireDepartment.get("timezone").getAsString();

            // Actual dates, including time (needed to weed through the meteostat weather service response)
            ZoneId zoneId = ZoneId.of(timeZone);
            Instant startInstant = Instant.parse(eventOpened);
            ZonedDateTime startDateWithTime = startInstant.atZone(zoneId);
            Instant endInstant = Instant.parse(eventClosed);
            ZonedDateTime endDateWithTime = endInstant.atZone(zoneId);

            incident = new Incident(jsonContent, latitude, longitude, 
                    startDateString, endDateString, timeZone, startDateWithTime, endDateWithTime);

        } catch (NullPointerException | IllegalArgumentException e) {
            LOGGER.error("Failed to create incident object for JSON: {}", jsonContent, e);
        }

        return incident;

    }

}
