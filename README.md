# Portfolio Playground

Welcome to my **webportfolio**! This project is a dynamic space where I can showcase my skills and explore cutting-edge technologies.

[Visit the Website](http://www.htdguide.com)

---

## **Key Features**

- **Interactive React Frontend**  
  A sleek and responsive UI built with React, serving as the main interface for showcasing projects and experiments.

- **Dockerized Environment**  
  The entire project is containerized using **Docker**, ensuring portability, consistent environments, and smooth deployment across systems.

- **Automated CI/CD Pipeline**  
  With **GitHub Actions**, every push triggers:
  - Automatic builds of the Docker image.
  - Uploading the image to **Docker Hub**.
  - Pulling and deploying the image to the server.

- **WebAssembly & C++ with Raylib**  
  - **C++ experiments**: Utilizing **Raylib** for graphical applications and game-like features.  
  - **WebAssembly integration**: Compiling C++ code into web-compatible binaries using **Emscripten** for smooth browser execution.

- **Custom Build Automation**  
  A **Makefile** simplifies the build process for C++ and WebAssembly code, streamlining development and deployment workflows.

---

## **Technologies Used**

| **Category**          | **Technologies**                                                                                   |
|-----------------------|---------------------------------------------------------------------------------------------------|
| **Frontend**          | React, JavaScript                                                                                |
| **Containerization**  | Docker                                                                                           |
| **CI/CD**             | GitHub Actions                                                                                   |
| **Backend**           | WebAssembly, C++ (Raylib)                                                                        |
| **Build Tools**       | Makefile, Emscripten                                                                             |

---

## **What's Inside**

### **React Frontend**
The user interface is built using React, offering a fast and modern experience. It features:
- A **desktop-inspired design** with draggable, resizable app windows.
- Interactive elements like desktop icons and background video wallpapers.
- Smooth scaling and adaptability across devices.

### **WebAssembly Integration**
- **C++ and Raylib**:  
  WebAssembly brings the power of C++ into the browser. Using Raylib, I’ve created graphical and interactive features, including:
  - A **Sorting Algorithms visualizer**.
  - Experimentation with game-like functionality.
- **High performance**:  
  WebAssembly ensures near-native performance for computational tasks in the browser.

### **Dockerized Setup**
- **Effortless Deployment**:  
  All services and dependencies are containerized with Docker, allowing the project to run consistently on any environment.
- **Portable Build**:  
  The Docker image includes everything needed for the React frontend, WebAssembly experiments, and deployment.

### **Automated CI/CD**
Every code push is fully automated through **GitHub Actions**, handling:
1. Docker image creation and upload to **Docker Hub**.
2. Remote server updates by pulling the latest image.

### **Makefile for WebAssembly Builds**
A **Makefile** streamlines building C++ code into WebAssembly, making it easy to:
- Compile WebAssembly binaries.
- Optimize builds for browser performance.
- Automate repetitive development tasks.

## **Screenshots**
<img width="950" alt="Screenshot 2025-01-24 at 8 29 42 PM" src="https://github.com/user-attachments/assets/4ea658f1-1b8a-4194-9a5e-0da7e2658376" />
<img width="951" alt="Screenshot 2025-01-24 at 8 29 58 PM" src="https://github.com/user-attachments/assets/f9ac9e0a-3c75-4043-b805-bd78fa2b8077" />

