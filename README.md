[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/gLaQVD8n)
# Wifi Monitor Curriculum Project

Created by Bradley Tian (bradley_tian@berkeley.edu)

For PlexTech Curriculum Use Only. Do not redistribute.

## Prologue

Welcome to the WiFi Monitor Project! This exercise is designed to help you attain a baseline familiarity with the fundamental aspects of JavaScript, React, and frontend development in general while limiting the project scope to a reasonable degree of complexity. Please continue reading to better understand your tasks.

## Project Overview

As we all know by this point, the WiFi connection at UC Berkeley is rather unpredictable, and it can be downright frustrating when the network in certain parts of the campus suddenly goes down. 

Introducing our very own solution - the **UC Berkeley WiFi Monitor**!

We are building a dashboard where users can input their observations of WiFi signal strengths at different locations on campus and see the real-time network statuses on campus through a map view. 

More specifically, below are the key features of this dashboard:

1. Support user submissions, which include but aren't limited to the following fields:
- User location
- Signal strength
- Time of reporting

2. Support storage and retrieval of user-submitted data via connecting to the given backend application.

3. Compute an aggregate wifi strength score for different locations on campus based on user submissions.

4. Display aggregated scores for each location.

- Option 1: display the scores in the form of a list.
- Option 2 (Extra): display scores in the form of markings on an interactive map of UC Berkeley.

## Project Deliverables

The expected deliverable of this project is a **functional single-page React application** that supports at least the first three functionality criteria mentioned above. Please note that deploying the application is not required - it simply needs to run in your local environment. The map display is an extra challenege, but implementing it would provide you with useful training on importing and using third-party libraries in React.

Here is an example of a possible implementation of the WiFi Monitor (for reference only):

![alt text](<Frontend Demo.png>)

## Existing Utilities

First of all, let us walk through the technologies already provided for this project. 

This project directory named <code>wifi-curriclum-project</code> is your starting point. All of your frontend development work should be within this directory, whether it'd be the sub-directories you create or the files you make. 

We have also provided a functional backend application for you; it will handle the storage and retrieval of user-submitted data. Instructions on how to set up and interact with the backend can be found below.

Backend Server Instructions are in the backend folder of this project.

As for styling your components, we recommend the [MATERIAL UI](https://mui.com/material-ui/getting-started/) library. You are free to explore standard CSS frameworks, such as tailwind, but these alternatives may take longer to configure. 

Finally, for the map-view display, we recommend looking into the [LEAFLET.JS](https://react-leaflet.js.org/docs/start-introduction/) library. 

## Getting Started

There are quite a few moving parts, but this project is certainly achievable with the right approaches. Below is a rough development plan that could point you in the right direction, but please feel free to tackle these parts in whichever order and format you find convenient. 

1. Familiarize yourself with the functionality requirements and the provided technologies. Read through the backend server documentation and go over the **Component** and **Component API** sections of Material UI's API documentation. 

2. Create a rough design (either via tools like Figma or by hand) of the frontend interface. Where should the list or map display be? How are the user input boxes positioned? Feel free to refer to the demo, but it's best to conceive your own UI design - don't overlook this part; it's good practice.

3. Think about how you want to handle user inputs. Sure, on a production level we would be capturing the users' live coordinates and their WiFi speed in mb/s. But for the scope of this project, we need to conceive a way to restrain or limit the user inputs so they're easy to record in the database and be used for computation. Perhaps a dropdown list of a number of locations could work? In addition, how will you handle the time of reporting? You could neglect it for this project, or you could, say, flush all outdated user submissions at the end of each day, etc. The choice is yours; this part isn't required for the baseline deliverable. 

4. Review or research the recommended file structure for a small React project. Look up the functionalities of <code>index.js</code> and <code>app.js</code>, and create any other files you may need. 

    - This project shouldn't involve a lot of components; for larger projects that contain thousands of components, you may need layers of directories to better organize your components for reusability. Don't worry about this for now; you'll naturally learn how to organize as you go.

5. Start building the components for your display. For each component, start by looking up the corresponding frameworks in Material UI and importing them as needed. You should keep the number of vanilla HTML components to a minimum. In addition, we recommend looking into [THEMES](https://mui.com/material-ui/customization/theme-components/#theme-default-props) if you find it helpful to standardize the styling of components. 

6. Research <code>async</code> functions and <code>fetch</code> calls; these will be the essentials for communicating with the backend server. Once covered in lecture, research <code>useState</code> and <code>useEffect</code> hooks to determine where you can make API calls to store and retrieve user data.

    - Note that this part may involve running into many unexpected errors; such is the nature of frontend-backend communication, as there are many semantics and details you have to iron out. As a general guide, beware of the following areas:

     - **CORS Policy Handling**: if you are experiencing [CORS](https://youtu.be/4KHiSt0oLJ0?si=cWPw-8gMtWrbD8fh) errors, check your request headers to make sure you have the right origins and credentials. Depending on your setup, you may have to edit the CORS configurations in the backend server as well. This [express.js CORS guide](https://www.geeksforgeeks.org/how-to-allow-cors-in-express/) could help.

     - **Bad Payload and Queries**: some endpoints require JSON payloads or query parameters; make sure you are sending the requests with the payloads in the correct format. Use <code>console.log()</code> to debug your payloads if you are unsure. If you are having trouble parsing the response data, look up examples of <code>.then()</code> usage after <code>fetch</code> calls to make sure you're properly unwrapping the API responses.
    
    - Overall, use <code>console.log()</code> a lot to help confirm data types and narrow down errors. You can check the output in either in the terminal or via the console, accessible via <code>fn+12</code>, in your browser.

7. Build some simple tester components to display and test the data you retrieve from the backend. When you have the API interactions functional, you can then integrate them into your display components, whether that is the list or the interactive map. By this point, begin building functions that can compute aggregated scores from all user-submitted datapoints on a specific location. What algorithms would you like to use? That is up to you.

8. If you decide to go with the map approach, import the Leaflet.js library and begin tinkering with the frameworks there. Following the [quickstart guide](https://leafletjs.com/examples/quick-start/) is helpful here.

    **Leaflet Map Helpful Hints:**
    
    The relevant imports that you want to use for this are:
    ```javascript
    import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
    import markerIconPng from "leaflet/dist/images/marker-icon.png";
    
    import { createTheme, ThemeProvider } from "@mui/material/styles";
    import { Button, FormControl } from "@mui/material";
    ```

    Here is some code you can use as reference for the map:
    ```jsx
    <div style={{
      height: '70vh',
      marginBottom: '1rem',
      borderRadius: '1.5rem',
      borderStyle: 'solid',
      borderWidth: 'thin',
      borderColor: '#25B4E7'
    }}>
      <MapContainer center={[latitude, longitude]} zoom={17} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
      </MapContainer>
    </div>
    ```

## Conclusion
This is quite a comprehensive documentation, but hopefully it provides you with a decent overview of the project and how to get started with frontend development as a whole. If you have any questions, please ask and seek help from your curriculum instructors. Have a great time building the WiFi Monitor!