"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const patients_1 = require("./patients");
const router = express_1.default.Router();
const Joi = require('joi-oid');
const appointmentSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true,
        minLength: 20,
        maxLength: 200
    },
    currency: {
        type: String,
        enum: ["USD", "EUR", "BTC"],
        required: true
    },
    totalFee: {
        type: Number,
        required: true,
        default: 0,
    },
    paidFee: {
        type: Number,
        default: 0
    },
    unpaidFee: {
        type: Number,
        default: 0
    }
});
const Appointment = mongoose_1.default.model("Appointment", appointmentSchema);
//get all appointments
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield Appointment.find()
        .populate('patientId');
    res.send(appointments);
}));
//  Get a list of unpaid appointments.
router.get("/unpaid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const appointments = yield Appointment
        .find({ unpaidFee: { $eq: 0 } });
    res.send(appointments);
}));
// Get a remaining bill for a specific patient
router.get('/remaining-bill/:patientId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId } = req.params;
    try {
        // Check if the patient exists
        const patient = yield patients_1.Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient not found" });
        }
        // Calculate remaining bill
        const appointments = yield Appointment.find({ patientId });
        const remainingBill = appointments.reduce((totalUnpaid, appointment) => {
            return totalUnpaid + appointment.unpaidFee;
        }, 0);
        res.json({ "remainingBill": remainingBill });
    }
    catch (error) {
        console.error("Error retrieving appointments ", error.name);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Could not calculate remaining bill" });
        }
    }
}));
// Get all appointments of a patient
router.get("/:patientId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId } = req.params;
    try {
        // Check if the patient exists
        const patient = yield patients_1.Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: "Patient with given Id not found" });
        }
        // Retrieve all appointments of the patient
        const appointments = yield Appointment.find({ patientId });
        res.json(appointments);
    }
    catch (error) {
        console.error("Error retrieving appointments ", error.name);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Could not retrieve appointments" });
        }
    }
}));
//creating a new appointment
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = validateAppointment(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);
    try {
        const { patientId, startTime, endTime, appointmentDate, description, currency, totalFee, paidFee, unpaidFee } = req.body;
        // Check if the patient exists
        const patient = yield patients_1.Patient.findById(patientId);
        if (!patient) {
            return res.status(400).json({ error: "Patient with the given id not found" });
        }
        const newAppointment = new Appointment({
            patientId,
            startTime,
            endTime,
            appointmentDate,
            description,
            currency,
            totalFee,
            paidFee,
            unpaidFee
        });
        const savedAppointment = yield newAppointment.save();
        res.status(201).json(savedAppointment);
    }
    catch (error) {
        console.error("Error adding appointment: ", error.name);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Could not add appointment" });
        }
    }
}));
// Update an existing appointment
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside update");
    const { error } = validateAppointment(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);
    const { id } = req.params;
    try {
        const { patientId, startTime, endTime, appointmentDate, description, currency, totalFee, paidFee, unpaidFee } = req.body;
        // Check if the appointment exists
        let appointment = yield Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ error: "Appointment with given id not found" });
        }
        if (paidFee > totalFee) // paidFee cannot be greater than totalFee
         {
            return res.status(404).json({ error: "Paid fee cannot pe greater than Total fee" });
        }
        // Update appointment properties
        appointment.patientId = patientId;
        appointment.startTime = startTime;
        appointment.endTime = endTime;
        appointment.appointmentDate = appointmentDate;
        appointment.description = description;
        appointment.currency = currency;
        appointment.totalFee = totalFee;
        appointment.paidFee = paidFee;
        appointment.unpaidFee = unpaidFee;
        // Save the updated appointment
        const updatedAppointment = yield appointment.save();
        res.json(updatedAppointment);
    }
    catch (error) {
        console.error("Error updating Appointment", error.name);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Could not update patient" });
        }
    }
}));
//delete
router.delete("/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // Find the patient by ID and delete it
        const deletedPatient = yield Appointment.findByIdAndDelete(id);
        if (!deletedPatient) {
            return res.status(404).json({ error: "Appointment with the given id not found" });
        }
        res.json({ message: "Appointment deleted successfully", deletedPatient });
    }
    catch (error) {
        console.error("Error deleting patient", error.name);
        if (error.name === "ValidationError") {
            return res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "Could not delete patient" });
        }
    }
}));
// Get appointments for a specific day
router.get('/specific-day/:date', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { date } = req.params;
    // Validate date
    const { error } = validateDate({ date });
    if (error)
        return res.status(400).send(error.details[0].message);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    try {
        const appointments = yield Appointment.find({
            appointmentDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        });
        res.json(appointments);
    }
    catch (error) {
        console.error("Error fetching appointments:", error);
        res.status(500).json({ error: "Could not fetch appointments" });
    }
}));
const exchangeRates = {
    "EUR": 1.10, // 1 EUR = 1.10 USD
    "BTC": 50000, // 1 BTC = 50000 USD
    "USD": 1 // 1 USD = 1 USD
};
function convertToUSD(amount, currency) {
    // Directly access the exchange rate
    const rate = exchangeRates[currency];
    return amount * rate;
}
function computeStartEndDates(period) {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    if (period === 'week') {
        const dayOfWeek = now.getUTCDay(); // getUTCDay returns 0 for Sunday
        start = new Date(now);
        start.setUTCDate(now.getUTCDate() - dayOfWeek);
        start.setUTCHours(0, 0, 0, 0); //setting to 12am of the day
        end = new Date(start);
        end.setUTCDate(start.getUTCDate() + 6);
        end.setUTCHours(23, 59, 59, 999); //setting to 11:59pm of the end-day
    }
    else if (period === 'month') {
        start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
    }
    return { start, end };
}
function computeFinancialStats(start, end) {
    return __awaiter(this, void 0, void 0, function* () {
        const appointments = yield Appointment.find({
            appointmentDate: { $gte: start, $lt: end }
        });
        let totalPaid = 0;
        let totalUnpaid = 0;
        //getting in dollars
        for (const appointment of appointments) {
            totalPaid = totalPaid + convertToUSD(appointment.paidFee, appointment.currency);
            totalUnpaid = totalUnpaid + convertToUSD(appointment.unpaidFee, appointment.currency);
        }
        const balance = totalPaid;
        return { totalPaid, totalUnpaid, balance };
    });
}
function getFinancialStats() {
    return __awaiter(this, void 0, void 0, function* () {
        const { start: weekStart, end: weekEnd } = computeStartEndDates('week');
        const { start: monthStart, end: monthEnd } = computeStartEndDates('month');
        const weeklyStats = yield computeFinancialStats(weekStart, weekEnd); //calculating for current week
        const monthlyStats = yield computeFinancialStats(monthStart, monthEnd); //calculating for current month
        return { weeklyStats, monthlyStats };
    });
}
router.get('/financial/stats', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stats = yield getFinancialStats();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
router.get("/popular/pet", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield Appointment
            .find()
            .populate('patientId'); // populating the patient objects
        const petEarnings = {};
        for (const appointment of appointments) {
            //@ts-ignore
            const petType = appointment.patientId.petType;
            if (petType) {
                if (!petEarnings[petType]) {
                    petEarnings[petType] = { count: 0, totalEarned: 0 };
                }
                petEarnings[petType].count += 1;
                petEarnings[petType].totalEarned += appointment.totalFee;
            }
        }
        let popularPet = '';
        let maxCount = 0;
        for (const petType in petEarnings) {
            if (petEarnings[petType].count > maxCount) {
                maxCount = petEarnings[petType].count;
                popularPet = petType;
            }
        }
        const moneyFromEachPet = [];
        for (const petType in petEarnings) {
            const totalEarned = petEarnings[petType].totalEarned;
            moneyFromEachPet.push({ petType: petType, totalEarned: totalEarned });
        }
        res.json({ popularPet, moneyFromEachPet });
    }
    catch (error) {
        console.error("Error getting popular pet and earnings:", error);
        res.status(500).json({ error: "Could not get popular pet and earnings" });
    }
}));
function validateDate(date) {
    const schema = Joi.object({
        date: Joi.date().iso().required()
    });
    return schema.validate(date);
}
function validateAppointment(appointment) {
    const schema = Joi.object({
        patientId: Joi.objectId().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        appointmentDate: Joi.date().required(),
        description: Joi.string().min(20).max(200).required(),
        currency: Joi.string().valid("USD", "EUR", "BTC").required(),
        totalFee: Joi.number().required(),
        paidFee: Joi.number(),
        unpaidFee: Joi.number()
    });
    return schema.validate(appointment);
}
module.exports = router;
