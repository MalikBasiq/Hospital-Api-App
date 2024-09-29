# Housetable Network Veterinarian Hospital Data API

Welcome to the **Housetable Network Veterinarian Hospital Data API**! This project is a small system API built using **Node.js**, **Express**, and **TypeScript** to manage hospital patient data and their appointments. It supports various operations, from adding patients to handling appointments, calculating bills, and generating reports.

## 🛠️ Features

- **Patient Management**: Add, update, list, and delete patients with details like pet name, type (cat, dog, bird), owner name, address, and phone number.
- **Appointment Management**: Add, update, list, and delete appointments with details like start/end time, description, and payment status (USD, EUR, Bitcoin).
- **Billing System**: Track paid and unpaid appointments, get patient bills, and calculate hospital balances weekly and monthly.
- **Statistical Insights**: Get the most popular pet type and analyze how much money each pet type generates.
- **Day-Specific Appointments**: Retrieve a list of all appointments for a specific day.
- **Testing with Jest**: Includes unit tests, integration tests, and database mocking using Jest.

## 📚 Example API Endpoints

### Patients
- **POST** `/patients` - Add a new patient.
- **GET** `/patients` - Get a list of all patients.
- **PUT** `/patients/:id` - Update patient details.
- **DELETE** `/patients/:id` - Delete a patient.

### Appointments
- **POST** `/patients/:id/appointments` - Add a new appointment for a patient.
- **GET** `/patients/:id/appointments` - Get a list of appointments for a specific patient.
- **PUT** `/appointments/:id` - Update appointment details.
- **DELETE** `/appointments/:id` - Delete an appointment.
- **GET** `/appointments/day/:date` - Get a list of appointments for a specific day.
- **GET** `/appointments/unpaid` - Get a list of unpaid appointments.
- **GET** `/patients/:id/bill` - Get the remaining bill for a specific patient.

### Financial Reports
- **GET** `/reports/weekly-balance` - Get the weekly paid, unpaid, and balance amounts for the hospital.
- **GET** `/reports/monthly-balance` - Get the monthly paid, unpaid, and balance amounts for the hospital.
- **GET** `/reports/popular-pet` - Get the most popular pet type and how much money each pet type generates.

## 🚀 Technologies Used

- **Node.js**: Backend runtime environment.
- **Express**: For handling routing and HTTP requests.
- **TypeScript**: For type safety and better code structure.
- **MongoDB** or **MySQL**: For data storage (choose one based on your setup).
- **Jest**: For unit testing and integration testing.

## 🧪 Testing with Jest

- **Unit Tests**: Ensure individual functions work as expected.
- **Integration Tests**: Test API endpoints and their interaction with the database.
- **Mock Database**: Simulate database behavior during testing without hitting the actual database.

## 🏗️ Project Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/vet-hospital-data-api.git

2. Install dependencies:
   npm install
3. Set up the environment variables (MongoDB/MySQL connection, etc.).

4. Start the server:
   npm run start

   📧 Contact
Created by Malik. Feel free to reach out for any questions or suggestions!
This README covers all the aspects of your project, from features to setup instructions. Let me know if you’d like any changes!





