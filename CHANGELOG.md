# Changelog

## unreleased

## [1.2.1] - 06-09-2025

### Improvements and bug fixes

- Implemented 409 conflict error handling for duplicate meter readings with user-friendly alerts.
- Enhanced Reading Details UI with larger photos (500px on desktop) and improved side-by-side layout
- Added Usage Trend metric to consumption dashboard with tooltip explanation
- Improved dashboard layout with all stats cards
- Enhanced mobile responsiveness and visual spacing throughout the interface 
- Fix average calculation in history consumption 

#### Build, Dependencies, GitHub Actions

- Update Nginx base image to version 1.29 in Dockerfile
- Removed unused deps in `package.json`
- build(deps): Bump pytest-asyncio from 1.0.0 to 1.1.0
- build(deps): Bump pymongo from 4.13.0 to 4.14.1
- build(deps): Bump uvicorn from 0.34.3 to 0.35.0
- build(deps): Bump ultralytics from 8.3.146 to 8.3.194
- build(deps): Bump fastapi from 0.115.12 to 0.116.1
- build(deps): Bump starlette from 0.46.2 to 0.47.3
- build(deps): Bump opencv-python from 4.11.0.86 to 4.12.0.88
- build(deps): Bump torch-stack group from 2.7.0+cpu to 2.8.0+cpu
- build(deps): Bump @eslint/js from 9.28.0 to 9.32.0 in /frontend
- build(deps): Bump @vitejs/plugin-react from 4.5.2 to 4.7.0 in /frontend
- build(deps): Bump @mui/icons-material from 7.1.1 to 7.3.2 in /frontend
- build(deps): Bump @mui/material from 7.2.0 to 7.3.1 in /frontend
- build(deps): Bump @emotion/styled from 11.14.0 to 11.14.1 in /frontend
- build(deps): Bump vite from 6.3.5 to 7.1.4 in /frontend
- build(deps): Bump globals from 16.2.0 to 16.3.0 in /frontend
- build(deps): Bump react-dom and @types/react-dom in /frontend
- build(deps): Bump form-data from 4.0.2 to 4.0.4 in /frontend
- build(deps): Bump react-easy-crop from 5.4.2 to 5.5.0 in /frontend
- build(deps): Bump typescript-eslint from 8.33.0 to 8.42.0 in /frontend
- build(deps): Bump pytest from 8.4.1 to 8.4.2


## [1.2.0] - 07-07-2025

### Improvements
- Added a new cropper component to allow users to crop images, improving the accuracy of meter reading detection.
- Added a popup when the retry has failed, asking the user to open an issue on GitHub for assistance.
- Added file removal functionality to image upload component
- Refactor ConsumptionHistory component to improve readability and functionality, update imports, enhance mobile view.
- Added ability to recalculate price when changing the date of the consumption

#### Build, Dependencies, GitHub Actions
- Added code coverage reporting to the project with coveralls for better code quality tracking.
- Added tests for the backend `api` and `crud` code
- Added badges in `README.md`

## [1.1.1] - 16-06-2025

### Improvements
- Split components into separate files for better organization and maintainability.

## [1.1.0] - 11-06-2025

### Improvements

- Dark mode support for automatic OS theme detection, the `darkMode` option can now be set to `auto`.
- Refactor the entire frontend codebase to use `MUI` components, enhancing the UI readability and maintainability.

#### Build, Dependencies, GitHub Actions

- Bump `uvicorn` to version `0.34.3`

## [1.0.0] - 02-06-2025

[1.2.1]: https://github.com/NirKli/WattBot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/NirKli/WattBot/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/NirKli/WattBot/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/NirKli/WattBot/compare/v1.0.0...v1.1.0