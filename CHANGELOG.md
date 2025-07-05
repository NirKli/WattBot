# Changelog

## unreleased

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


[1.1.1]: https://github.com/NirKli/WattBot/compare/v1.0.0...v1.1.1
[1.1.0]: https://github.com/NirKli/WattBot/compare/v1.0.0...v1.1.0