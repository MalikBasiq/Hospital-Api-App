import express from "express";
import mongoose from "mongoose"
import { patientRoutes } from './routes/patients';
const appointments = require('./routes/appointments')

mongoose.connect("mongodb://localhost/Hospital")
.then(()=> console.log("connected to mongo db..."))
.catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const app = express()
app.use(express.json());
const port = 3000
app.use('/api/patients',patientRoutes)
app.use('/api/appointments',appointments)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})