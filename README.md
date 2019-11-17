single-market-robot-simulator-db-googledrive
=========
Persistent storage for Econ1.Net simulation configurations in Google Drive.

This is a browser-side JavaScript module we use with recent versions of npm:single-market-robot-simulator-app-framework

Each user has a primary folder in Google Drive, and a "hint" file in the app data folder
that may indicate a file selected through the Google Drive interface.

The primary folder contains StudyFolder(s).

Each StudyFolder contains a config.json file for the market simulator and one or more
zip files of market simulator data.
