# Portfolio Playground

Welcome to my portfolio and playground for experimentation! This project is built using **React** and **JavaScript**, running inside a **Docker container**. It serves as a space for me to showcase my skills and explore various technologies, including **WebAssembly**, **C++**, and **Raylib**. Feel free to dive into the details below to understand how everything comes together.

## Features

- **React Frontend**: The website is powered by a React-based UI that serves as my personal portfolio and an experimental platform for testing various web technologies.
- **Docker**: The project is containerized with Docker, ensuring easy deployment and portability across environments.
- **GitHub Actions CI/CD**: Continuous integration and deployment are handled automatically through GitHub Actions. Every time code is pushed to the repository, the image is rebuilt, uploaded to Docker Hub, and pulled to the server.
- **WebAssembly & C++ with Raylib**: I leverage WebAssembly to convert C++ code into a web-compatible format. The Raylib library is used for various graphical experiments and game-like features.
- **Makefile**: The project is compiled and built using a Makefile, which streamlines the process of building C++ code into WebAssembly.

## Technologies Used

- **Frontend**: React, JavaScript
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Backend**: WebAssembly, C++ (Raylib)
- **Build Tool**: Makefile

## How It Works

### 1. **React Application**

The frontend is built with React and serves as the main interface for the portfolio. It dynamically loads content and interacts with the user, allowing them to explore various projects and experiments I've worked on.

### 2. **Docker Setup**

The entire application, including the React frontend and WebAssembly-generated code, is containerized using Docker. This ensures consistency and simplifies deployment on any environment.

To build and run the Docker container locally, use the following commands:

```bash
docker build -t my-portfolio .
docker run -p 8080:80 my-portfolio
