const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const morgan = require("morgan");
const app = express();
const port = 2727;

// MongoDB connection
const mongoURI = "REDACTED"; // Change this if using Atlas

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ Connected to MongoDB"))++
.catch(err => console.error("❌ MongoDB connection error:", err));

// Load Student model
const Student = require("./models/Student");

// View engine and middleware setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Middleware to load all students
const loadStudents = async (req, res, next) => {
    req.students = await Student.find();
    next();
};

// Routes
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/select-subject", (req, res) => {
    res.render("select-subject");
});

app.get("/mark-attendance", loadStudents, (req, res) => {
    let students = req.students;
    let subject = req.query.subject;
    res.render("mark-attendance", { students, subject });
});

app.post("/submit-attendance", async (req, res) => {
    const students = await Student.find();
    const subject = req.body.subject;
    const date = new Date().toISOString().split("T")[0];

    for (let student of students) {
        const attendanceStatus = req.body[`attendance_${student._id}`];
        if (attendanceStatus) {
            student.attendance[subject].push({ date, status: attendanceStatus });
            await student.save();
        }
    }

    res.redirect("/");
});

app.get("/add-student", (req, res) => {
    res.render("add-student");
});

app.post("/add-student", async (req, res) => {
    const newStudent = new Student({
        name: req.body.name,
        attendance: {
            DS: [],
            LINUX: [],
            JAVA: [],
            OOSE: [],
            BEE: []
        }
    });

    await newStudent.save();
    res.redirect("/");
});

app.get("/reports", async (req, res) => {
    let students = await Student.find();
    let subjects = ["DS", "LINUX", "JAVA", "OOSE", "BEE"];
    res.render("reports", { students, subjects });
});

app.get("/ErrorThrow", (req, res, next) => {
    const errt = new Error("Error Thrown");
    errt.status = 500;
    next(errt);
});

app.use(/.*/, (req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    res.render("error", { error: err });
});

app.use((err, req, res, next) => {
    console.error(err.status + " " + err.message);
    res.render("error", { error: err });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
