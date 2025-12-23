# Retro Gaming Library - Product Brief

## Project Overview / Description
A responsive web application (React-based) designed for retro gaming enthusiasts to build and manage their personal collection of game cover art. The application features an intuitive search interface with live predictive autocomplete (powered by Firebase), allowing users to search through a comprehensive catalog of retro games across 30+ classic gaming platforms. Users can curate their personal library ("My List") without limits, populated with cover art through automated feed management.

## Target Audience
- Retro gaming enthusiasts and collectors
- Gamers who want to organize and showcase their classic game collections
- Users who appreciate clean, minimal interfaces for content discovery
- Cross-platform users (desktop and mobile)

## Primary Benefits / Features
- **Multi-Platform Support**: Covers 30+ retro gaming platforms from 3DO to Sony PlayStation (via Webrcade emulators).
- **Live Search Interface**: Active predictive autocomplete querying Firebase for instant game discovery.
- **Unlimited Personal Library**: Build and maintain a permanent catalog of game cover art with no size limits.
- **Automated Feed Management**: Scripts to validate and upload game feeds to Firebase Realtime Database.
- **Responsive Design**: Works seamlessly on both laptop and mobile devices.
- **Interactive Game Display**: Hover effects showing larger cover art previews.
- **Game Management**: Play and remove buttons for each game in the library.

## High-Level Tech/Architecture
- **Frontend**: React application (`src/react`) using Webrcade common components.
- **Backend**: Firebase Realtime Database for feed storage and search indexing.
- **Automation**: Node.js scripts for feed validation, chunked uploading, and index generation.
- **Deployment**: Local Docker container serving Apache/Node or Firebase Hosting.
- **Search**: Client-side query to Firebase Realtime Database using flattened search index.
- **Data Source**: JSON feeds managed via `upload-to-firebase.js`.
