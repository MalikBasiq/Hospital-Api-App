"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
// const router = require('./routes/patients')
const patients_1 = require("./routes/patients");
const appointments = require('./routes/appointments');
mongoose_1.default.connect("mongodb://localhost/Hospital")
    .then(() => console.log("connected to mongo db..."))
    .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});
const app = (0, express_1.default)();
app.use(express_1.default.json());
const port = 3000;
app.use('/api/patients', patients_1.patientRoutes);
app.use('/api/appointments', appointments);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
