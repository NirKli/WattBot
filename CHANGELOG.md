# Changelog

## unreleased

### Improvements and bug fixes

#### Build, Dependencies, GitHub Actions

- build(deps): bump actions/checkout from 5 to 6
- build(deps): Bump @mui/icons-material from 7.3.4 to 7.3.6 in /frontend
- build(deps): Bump @mui/material from 7.3.4 to 7.3.6 in /frontend
- build(deps): Bump react from 19.2.0 to 19.2.1 in /frontend
- build(deps): Bump react-dom from 19.2.0 to 19.2.1 in /frontend
- build(deps): Bump react-easy-crop from 5.5.3 to 5.5.6 in /frontend
- build(deps): Bump @types/react from 19.2.2 to 19.2.7 in /frontend
- build(deps): Bump @types/react-dom from 19.2.2 to 19.2.3 in /frontend
- build(deps): Bump @vitejs/plugin-react from 5.1.0 to 5.1.2 in /frontend
- build(deps): Bump axios from 1.13.1 to 1.13.2 in /frontend
- build(deps): Bump eslint from 9.39.0 to 9.39.1 in /frontend
- build(deps): Bump typescript-eslint from 8.46.2 to 8.49.0 in /frontend
- build(deps): Bump vite from 7.1.12 to 7.2.7 in /frontend
- build(deps): Bump @eslint/js from 9.37.0 to 9.39.0 in /frontend
- build(deps): Bump eslint-plugin-react-refresh from 0.4.23 to 0.4.24 in /frontend
- build(deps): Bump eslint-plugin-react-hooks from 6.1.1 to 7.0.1 in /frontend
- build(deps): Bump globals from 16.4.0 to 16.5.0 in /frontend
- build(deps): Bump torch from 2.9.0+cpu to 2.9.1+cpu
- build(deps): Bump torchvision from 0.24.0 to 0.24.1
- build(deps): Bump torchaudio from 2.9.0 to 2.9.1
- build(deps): Bump albumentations from 2.0.7 to 2.0.8
- build(deps): Bump fastapi from 0.120.4 to 0.124.0
- build(deps): Bump pydantic from 2.12.3 to 2.12.5
- build(deps): Bump pydantic_core from 2.41.4 to 2.41.5
- build(deps): Bump pymongo from 4.15.3 to 4.15.5
- build(deps): Bump starlette from 0.49.1 to 0.50.0
- build(deps): Bump ultralytics from 8.3.223 to 8.3.235
- build(deps): Bump uvicorn from 0.38.0 to 0.38.0
- build(deps): Bump python-multipart from 0.0.19 to 0.0.20
- build(deps): Bump opencv-python from 4.12.0.88 to 4.12.0.88
- build(deps): Bump pytest from 8.4.2 to 9.0.2
- build(deps): Bump pytest-asyncio from 1.2.0 to 1.3.0
- build(deps): Bump httpx from 0.28.0 to 0.28.1
- build(deps): Bump pytest-cov from 7.0.0 to 7.0.0

## [1.2.2] - 01-11-2025

### Improvements and bug fixes

 - frontend: Add yearly totals view to consumption history with toggle between monthly and yearly views
 - frontend: Update favicon to new wattbot icon
 - frontend: Add route-level lazy-loading with Suspense for heavy pages to reduce initial bundle size
 - frontend: Split vendor chunks (react/react-dom, MUI) via Vite manualChunks for better caching
 - frontend: Fix React list key warning in `ConsumptionHistory`
 - frontend: Replace `any` types and remove unused vars to satisfy ESLint rules

#### Build, Dependencies, GitHub Actions

- build(deps): Bump torch-stack group from 2.8.0+cpu to 2.9.0+cpu
- build(deps): Bump pydantic from 2.11.10 to 2.12.3
- build(deps): Bump pydantic_core from 2.33.2 to 2.41.4
- build(deps): Bump pytest-asyncio from 1.1.0 to 1.2.0
- build(deps): Bump pytest-cov from 6.2.1 to 7.0.0
- build(deps): Bump uvicorn from 0.35.0 to 0.38.0
- build(deps): Bump starlette from 0.47.3 to 0.49.1
- build(deps): Bump fastapi from 0.116.1 to 0.120.4
- build(deps): Bump pymongo from 4.14.1 to 4.15.3
- build(deps): Bump ultralytics from 8.3.194 to 8.3.223
- build(deps): Bump @mui/material from 7.3.1 to 7.3.3 in /frontend
- build(deps): Bump @mui/icons-material from 7.3.2 to 7.3.4 in /frontend
- build(deps): Bump typescript-eslint from 8.42.0 to 8.45.0 in /frontend
- build(deps): Bump @vitejs/plugin-react from 4.7.0 to 5.0.4 in /frontend
- build(deps): Bump @types/react from 19.1.6 to 19.2.0 in /frontend
- build(deps): Bump @types/react-dom from 19.1.7 to 19.2.0 in /frontend
- build(deps): Bump react from 19.1.0 to 19.2.0 in /frontend
- build(deps): Bump react-dom from 19.1.0 to 19.2.0 in /frontend
- build(deps): Bump react-easy-crop from 5.5.0 to 5.5.3 in /frontend
- build(deps): Bump eslint from 9.32.0 to 9.37.0 in /frontend
- build(deps): Bump @eslint/js from 9.32.0 to 9.37.0 in /frontend
- build(deps): Bump axios from 1.9.0 to 1.12.2 in /frontend
- build(deps): Bump globals from 16.3.0 to 16.4.0 in /frontend
- build(deps): Bump typescript from 5.8.3 to 5.9.3 in /frontend
- build(deps): Bump eslint-plugin-react-refresh from 0.4.20 to 0.4.23 in /frontend
- build(deps): Bump eslint-plugin-react-hooks from 5.2.0 to 6.1.1 in /frontend
- build(deps): Bump actions/setup-node from 4 to 5
- build(deps): Bump actions/setup-python from 5 to 6
- build(deps): Bump vite from 7.1.4 to 7.1.12 in /frontend

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

[1.2.2]: https://github.com/NirKli/WattBot/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/NirKli/WattBot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/NirKli/WattBot/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/NirKli/WattBot/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/NirKli/WattBot/compare/v1.0.0...v1.1.0