package com.mock.incidents.data;

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
    private String pathToDataFile;

    /**
     * Content of the data file
     */
    public String dataFileContent;

    /**
     * Bean which reads and stores the JSON data on startup of the application
     * such that it can be accessed by other parts of the application
     */
    @Bean
    public void readData() {

        LOGGER.info("Reading in data from path: '{}'", pathToDataFile);

        // try to read the file into a string
        try {
            Path path = FileSystems.getDefault().getPath(pathToDataFile);
            dataFileContent = Files.readString(path, StandardCharsets.US_ASCII);
        } catch (IOException e) {
            LOGGER.error("Failed to read JSON file at path '{}'", pathToDataFile, e);
        } 

    }

}
