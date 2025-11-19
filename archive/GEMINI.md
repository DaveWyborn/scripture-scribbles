# Gemini Workspace Context

## Project Overview

This project, "Scripture Scribbles," is a local-first, privacy-focused Bible study tool. It's a web application designed to work with the user's local Bible files in markdown format. The application allows for rich annotations, including highlighting, notes, and tags, all of which are stored locally on the user's device.

**Technologies:**

*   HTML
*   CSS
*   JavaScript
*   Python (for data conversion)
*   Supabase (for optional cloud features)

**Architecture:**

The project is a single-page application (SPA) contained within a single HTML file (`scripture-scribbles-reader.html`). It uses the File System Access API to interact with the local file system, allowing it to read and write files directly on the user's device. This makes it a "local-first" application. There is also a Python script for converting the Bible from markdown to JSON, and a Supabase integration for potential cloud-based features.

## Getting Started

**Prerequisites:**

*   A modern web browser that supports the File System Access API (e.g., Chrome, Edge, Brave).
*   Python 3 (for running the conversion script).

**Installation:**

There is no installation required for the main application. It can be run by opening the `index.html` or `scripture-scribbles-reader.html` file in a web browser.

**Running the Project:**

1.  Open the `index.html` file in a web browser.
2.  Click the "Launch Scripture Scribbles" button to open the reader.
3.  Select your local folder containing the Bible in markdown format.

**Running Tests:**

There are no automated tests included in the project.

## Development Conventions

**Coding Style:**

The project uses standard HTML, CSS, and JavaScript. There is no linter or formatter configuration specified.

**Branching Strategy:**

The project is hosted on GitHub, but there is no specific branching strategy mentioned in the documentation.

**Commits:**

There are no commit message conventions specified.

**Pull Requests:**

Contributions are welcome, and the `README.md` file suggests opening an issue on GitHub to discuss potential changes.
