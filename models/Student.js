// models/Student.js

const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    date: String,
    status: String
}, { _id: false });

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    attendance: {
        DS: [attendanceSchema],
        LINUX: [attendanceSchema],
        JAVA: [attendanceSchema],
        OOSE: [attendanceSchema],
        BEE: [attendanceSchema]
    }
});

module.exports = mongoose.model("Student", studentSchema);
