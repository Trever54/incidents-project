# Incidents Project

# Dependencies to Run
    - Java 14

# Running the App

## Configuration

Only 1 data file can be handled at a time for this application. You can change the data file used in the application.properties file located at src\main\resources\application.properties.

This must be changed before the app is started.

## Run the App

Use the below command to run the application. 

Use the -Dspring.config.location argument to override the application.properties with your own.

    java -Dspring.config.location=src\main\resources\application.properties -jar target\incidents-0.0.1-SNAPSHOT.jar

# Improvements if given more time

The below are several improvements I would make given more time on this project.

## Unit Testing

Unit tests can improve the reliability of the project and help catch bugs when making future changes.

I did not write any tests for this project. Given more time, I would write unit tests, prioritizing the data initializer and related methods since those contain the most logic.

## Containerization

Especially since I don't own a OSX machine (like the intended user would run this on), containerizing the application using Docker would be a good step towards making the project platform independent. 

## Handling multiple incidents

Currently, the app can only handle one incident at a time. I set things up where switching to multiple incidents shouldn't be terribly difficult; however, due to lack of time this is a feature I didn't get to.

## Using a Database

With more time, adding a database would be a great addition to this project, especially if we wanted to handle a growing number of incidents.

I had plans to use MongoDB to store both incident and weather information; however, due to time and lack of necessity for this simple example, I ended up not including a database at all.

## UI Improvements - displaying data

Currently, the way I'm displaying data in the UI is very limiting for how much data there is. Because of this, I cherry picked pieces of the data to display.

I can think of a couple different ways to approach this, but I'm leaning towards option 1:

    1. Add an information panel somewhere in the browser such that information is displayed there when an item is clicked. That way, the pop-up doesn't clutter the map.

    2. Format the pop-up to be more condensed and organized so that it can fit more data.

## UI Improvements - MapboxGL

This is my first time using MapboxGL, so there's still a lot to learn! A few nice additions that I didn't get to would be:

    1. Move the map location to the incidents on the map on startup.
    2. Dynamic sizing of the map with the browser.
    3. Map icons different for incidents vs unit statuses.
    4. Unit statuses potentially could have a route linking them together to show the path that was taken.
    5. In MapboxGL, it appears that if two points have the same coordinates, one will get overridden. I'd need to look more into how to handle this.

# Time Spent

I spent roughly 12 hours on this project (with breaks throughout the day).
