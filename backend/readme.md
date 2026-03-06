# Wifi Monitor Project: Example Server

Created by Bradley Tian (bradley_tian@berkeley.edu)

For PlexTech Curriculum Use Only. Do not redistribute.

## Overview

This is a mock backend system that supports basic data management functionalities for your WiFi heatmap display. It is connected to a local database and has several endpoints that allows you to insert, query, and delete user data.

## Setup Instructions

To setup the backend system, follow these steps:

1. Clone this repository to your local environment.
2. <code>cd</code> into the cloned directory. All subsequent steps will take place inside this directory.
3. Run <code>node -v</code> to check your <code>node</code> version. If you don't have it installed, [install the right version here](https://nodejs.org/en/download).
4. Run <code>npm install</code> to install all dependencies. This may take a while.
5. Run <code>npm start</code> to boot up the API server. Pay attention to the terminal message and the port the server is listening on. 
6. <code>Ctrl/Command + T</code> to open a new terminal and run <code>node test.js</code>.
7. If all tests are passing, congratulations! Your backend system is now operational and ready for connection. 

## Database Schema 

When surveying the campus population, we have observed that most participants prefer to remain anonymous. As such, the 
***users*** database table is defined with the following fields:

| Name  | Type      | Description |
| :---  | :---      | :---        |
| ID    | INTEGER   | The unique ID of a user. This is auto-generated and serves as the primary key for the record. |
| Location | TEXT   | The location at which the survey report is submitted from.                |
| Rating | INTEGER  | The rating given for the wifi quality at the location mentioned above.    |

## API Endpoints

    POST http://localhost:PORT/add-user

Add a new user submission to the database.

<details>
<summary>Payload Structure</summary>
<code>
    {
        location: "Dwinelle",
        rating: 3
    }
</code>
</details>
<br/>
<details>
<summary>Response</summary>
A success status if no error occurs.
</details>
<br/>

    GET http://localhost:PORT/get-users

Get all user submissions from the database.

<details>
<summary>Response</summary>
<code>
{
    results: [ ...{User Objects} ]
}
</code>
</details>
<br/>

    DELETE http://localhost:PORT/delete-user/?id=#

Delete a user submission with a specific ID.

<details>
<Summary>Query Parameters</Summary>
Replace <code>#</code> with the desired user ID.
</details>

## General Advice

When calling the endpoints, make sure to pay extra attention the following aspects:

### Asynchronous Functions

If your program is returning pending promises or non-determinant data, are you properly using <code>awaits</code> and <code>.then()</code> to enforce the order of data handling?

### Response Parsing

Be careful with how you process the responses from API calls. Keep in mind that <code>response</code> is a **Promise** and need to be deserialized first. On this note, make sure you use <code>.then()</code> enough times to return data in your desired forms. If your data appears to be <code>Object</code> or <code>undefined</code>, are you parsing the layers properly?

## Concluding Remarks

This documentation is written in a way that resembles those commonly found in industry projects. It may seem difficult to understand at first, but part of the curriculum is training yourself to investigate and digest technical, unfamiliar information. As always, please reach out to your curriculum instructors or me if you have any questions or uncertainties about the backend system. We hope you have a great time exploring this project!
