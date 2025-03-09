# FOCUS - Front End

Front-end code for the ES410 Master’s Group 18 project, FOCUS (Functional Optometry for Cognitive User Support): a website designed to enhance reading productivity, improve attention, as well as detect and mitigate eye strain.

The website, built with the ReactJS framework, utilises built-in or connected webcams to capture frames of the user's face, in compliance with our Privacy Policy, to identify and measure eye features and metrics. It also employs [WebGazer](https://webgazer.cs.brown.edu/), an eye-tracking library licensed under the GNU General Public License (GPL) v3, to perform eye-tracking. For more details, refer to `LICENSE-WebGazer`.


## How to run the front-end?

### Pre-requisites:

- [**Node.js**](https://nodejs.org/en/) - Most up-to-date version recommended

### Steps:

1) Install Node.js using the above link

Check if it is installed correctly by running `node -v` in a terminal window. This should display the correct version number which you have installed.

This should now give you access to the command `npm`, which would be used to run the React project.

2) The React project is already created and set up inside this repository (inside the folder `focus-app`). All you need to do is clone the repo to your desired location:

```bash
git clone https://github.com/anaya-s/FOCUS-frontend.git
```
Then enter inside the project directory `focus-app`:

```bash
cd focus-app
```

3) If you are cloning the project for the first time, or fetching a commit, make sure you run the following command to install the necessary packages specified inside `package.json` for the website to run correctly:

```bash
npm install
```

This will install the necessary packages inside the `node-modules` folder (which could be hidden inside text editors like vscode since it is written inside `.gitignore`).

4) To launch the website for viewing, run the following:

```bash
npm run dev
```

You should see the following being printed out, with a link (`http://localhost:5173/`) that will direct you to the website.

```bash
> focus-app@0.0.0 dev
> vite


  VITE v5.4.9  ready in 2774 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

Make sure you are also running the backend server to correctly access the functionalities of the website during development. The repository for the backend is: https://github.com/LewisArnold1/FOCUS-Backend

## Webgazer License

WebGazer.js - Scalable browser-based webcam eye tracking

Copyright (C) 2016 Brown WebGazer Team

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see [GNU Licenses](http://www.gnu.org/licenses/).
