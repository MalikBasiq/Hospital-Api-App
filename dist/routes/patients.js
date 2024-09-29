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
exports.Patient = exports.patientRoutes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
exports.patientRoutes = router;
const joi_1 = __importDefault(require("joi"));
const patientSchema = new mongoose_1.default.Schema({
    petName: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 20
    },
    petType: {
        type: String,
        enum: ["cat", "dog", "bird"],
        lowercase: true,
        required: true
    },
    ownerName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 20
    },
    ownerAddress: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 40
    },
    ownerPhoneNumber: {
        type: String,
        required: true,
        minlength: 11,
        maxlength: 11,
        validate: {
            validator: function (v) {
                return v && v.length >= 11 && v.length < 12; // Ensuring it contains exactly 12 digits
            },
            message: 'ownerPhoneNumber is not a valid 11-digit phone number!'
        },
    }
});
const Patient = mongoose_1.default.model("Patient", patientSchema);
exports.Patient = Patient;
//getting all patients 
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("inside get all patients");
    const patient = yield Patient.find();
    res.send(patient);
}));
//add a new patient
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //validating data before inserting in db
    const { error } = ValidatePatient(req.body); // object destructuring
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    try {
        console.log(req.body);
        const { petName, petType, ownerName, ownerAddress, ownerPhoneNumber } = req.body;
        // Create a new patient instance
        const newPatient = new Patient({
            petName,
            petType,
            ownerName,
            ownerAddress,
            ownerPhoneNumber,
        });
        // Save the new patient to the database
        const savedPatient = yield newPatient.save();
        res.status(201).json(savedPatient);
    }
    catch (error) {
        console.error("Error adding patient:", error);
        // res.status(500).json({error.message: "Could not add patient"});
        res.status(500).json({ error });
    }
}));
//updating 
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { error } = ValidatePatient(req.body);
    if (error)
        return res.status(400).send(error.details[0].message);
    const { id } = req.params;
    try {
        const { petName, petType, ownerName, ownerAddress, ownerPhoneNumber } = req.body;
        // Find the patient by ID
        let patient = yield Patient.findById(id);
        if (!patient) {
            return res.status(404).json({ error: "Patient with the given id not found" });
        }
        // Update patient properties
        patient.petName = petName;
        patient.petType = petType;
        patient.ownerName = ownerName;
        patient.ownerAddress = ownerAddress;
        patient.ownerPhoneNumber = ownerPhoneNumber;
        // Save the updated patient
        const updatedPatient = yield patient.save();
        res.json(updatedPatient);
    }
    catch (error) {
        console.error("Error updating patient", error.name);
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
        const deletedPatient = yield Patient.findByIdAndDelete(id);
        if (!deletedPatient) {
            return res.status(404).json({ error: "Patient with the given id not found" });
        }
        res.json({ message: "Patient deleted successfully", deletedPatient });
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
function ValidatePatient(patient) {
    const schema = joi_1.default.object({
        petName: joi_1.default.string().min(5).required(),
        petType: joi_1.default.string().required(),
        ownerName: joi_1.default.string().min(4).required(),
        ownerAddress: joi_1.default.string().min(5).required(),
        ownerPhoneNumber: joi_1.default.string().length(11).required()
    });
    return schema.validate(patient);
}
