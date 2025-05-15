# Monthly Consumption Management System

This project is a **Monthly Consumption Management System** built using Python, FastAPI, MongoDB, and React. It provides
APIs for managing monthly electricity consumption data, electricity prices, and user settings. The system also supports
file uploads and retrievals for consumption-related data.

## Features

- **Monthly Consumption Management**:
    - Add, update, retrieve, and delete monthly consumption records.
    - Calculate electricity prices based on consumption data.

- **File Management**:
    - Upload and retrieve files (e.g., images) associated with consumption records.

- **Settings Management**:
    - Manage user settings such as currency and dark mode preferences.

- **Electricity Price Management**:
    - Add, update, retrieve, and delete electricity price records.

## Technologies Used

- **Backend**:
    - Python
    - FastAPI
    - MongoDB (with GridFS for file storage)
    - Pydantic for data validation

- **Frontend**:
    - React
    - TypeScript
    - JavaScript

- **Package Managers**:
    - pip (for Python dependencies)
    - npm (for JavaScript/TypeScript dependencies)

## Installation

### Prerequisites

- Python 3.9+
- Node.js and npm
- MongoDB

### Backend Setup

**Docker will be added in the future, for backend and frontend.**

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```
2. Install Python dependencies:
   pip install -r requirements.txt
3. Start MongoDB: Ensure MongoDB is running locally on mongodb://localhost:27017/.
4. Run the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at http://127.0.0.1:8000.

### Frontend Setup

1. Install dependencies:
    ```bash
    cd frontend
    npm install
    ```
2. Start the React development server:
    ```bash
    npm start
    ```
   The frontend will be available at http://localhost:5173.

### API Endpoints

#### Monthly Consumption

- **POST** `/monthly-consumption`: Upload and process a file to create a new monthly consumption record.
- **GET** `/monthly-consumption/{id}`: Retrieve a specific monthly consumption record by ID.
- **PUT** `/monthly-consumption/{id}`: Update a specific monthly consumption record by ID.
- **DELETE** `/monthly-consumption/{id}`: Delete a specific monthly consumption record by ID.
- **GET** `/monthly-consumption`: Retrieve all monthly consumption records.
- **GET** `/monthly-consumption/file/{file_id}`: Retrieve a file associated with a consumption record.

#### Settings

- **GET** `/settings`: Retrieve user settings.
- **PUT** `/settings`: Update user settings.

#### Electricity Prices

- **GET** `/prices`: Retrieve all electricity prices.
- **POST** `/prices`: Add a new electricity price.
- **PUT** `/prices/{id}`: Update an electricity price by ID.
- **DELETE** `/prices/{id}`: Delete an electricity price by ID.

---

### Project Structure

```plaintext
.
├── api/
│   ├── monthly_consumption_routes.py
│   ├── settings_routes.py
│   ├── electricity_price_routes.py
├── services/
│   ├── db_save.py
│   ├── model/
│   │   ├── MonthlyConsumption.py
│   │   ├── Settings.py
│   │   ├── ElectricityPrice.py
│   ├── exception/
│   │   ├── NoObjectHasFoundException.py
├── frontend/
│   ├── (React application files)
├── requirements.txt
├── main.py
```