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
exports.exportReportsAsCSV = exports.getAllReportsOV = exports.getOverviewReport = void 0;
const paymentReport_model_1 = __importDefault(require("./paymentReport.model"));
const workdetails_model_1 = __importDefault(require("./work.model/workdetails.model"));
const json2csv_1 = require("json2csv");
const class_model_1 = __importDefault(require("../class/class.model"));
const staff_model_1 = __importDefault(require("../staff/staff.model"));
const moment_1 = __importDefault(require("moment"));
const workdetails_model_2 = __importDefault(require("./work.model/workdetails.model"));
const instructor_model_1 = __importDefault(require("./work.model/instructor.model"));
const miles_model_1 = __importDefault(require("./work.model/miles.model"));
const getOverviewReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { filterType, instructorName } = req.query;
        const getDateFilter = (filter) => {
            const currentDate = new Date();
            let startDate;
            let endDate;
            if (filter === "biweekly") {
                const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
                const currentWeek = Math.floor((currentDate.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24 * 7));
                const startWeek = new Date(startOfYear.getTime() + (currentWeek * 1000 * 3600 * 24 * 7));
                startDate = new Date(startWeek);
                endDate = new Date(startWeek.getTime() + (14 * 24 * 60 * 60 * 1000));
            }
            else if (filter === "monthly") {
                startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            }
            else if (filter === "yearly") {
                startDate = new Date(currentDate.getFullYear(), 0, 1);
                endDate = new Date(currentDate.getFullYear() + 1, 0, 0);
            }
            else {
                startDate = new Date();
                endDate = new Date();
            }
            return { $gte: startDate, $lte: endDate };
        };
        const dateFilter = filterType ? getDateFilter(filterType) : {};
        const instructorQuery = instructorName
            ? { instructorName: { $regex: instructorName, $options: "i" } }
            : {};
        const instructors = yield instructor_model_1.default.find(Object.assign(Object.assign({}, (filterType && { periodBeginning: dateFilter })), instructorQuery)).populate('instructorName');
        console.log("Instructors found:", instructors.length);
        console.log("First instructor:", instructors[0] ? JSON.stringify(instructors[0]) : "None");
        const workDetailsPromises = instructors.map(instructor => workdetails_model_2.default.find({ instructor: instructor._id }));
        const allWorkDetails = yield Promise.all(workDetailsPromises);
        const milesDetailsPromises = instructors.map(instructor => miles_model_1.default.find({ instructor: instructor._id }));
        const allMilesDetails = yield Promise.all(milesDetailsPromises);
        let overviewData = instructors.map((instructor, index) => {
            const workDetails = allWorkDetails[index];
            const milesDetails = allMilesDetails[index];
            console.log(`Instructor ${index} data:`, {
                id: instructor._id,
                instructorNameRef: instructor.instructorName,
                periodBeginning: instructor.periodBeginning
            });
            const totalHours = workDetails.reduce((sum, work) => sum + work.workDetails.hours, 0);
            const totalWorkAmount = workDetails.reduce((sum, work) => sum + (work.workDetails.hours * work.workDetails.hourRate), 0);
            const totalMiles = milesDetails.reduce((sum, miles) => sum + (miles.milesDetails.miles || 0), 0);
            const mileageRates = milesDetails
                .filter(m => m.milesDetails.mileRate)
                .map(m => m.milesDetails.mileRate);
            const mileageRate = mileageRates.length > 0
                ? mileageRates.reduce((sum, rate) => sum + rate, 0) / mileageRates.length
                : 0;
            let staffName = 'Unknown';
            if (instructor.instructorName) {
                if (typeof instructor.instructorName === 'string') {
                    staffName = instructor.instructorName;
                }
                else if (typeof instructor.instructorName === 'object') {
                    if ('name' in instructor.instructorName) {
                        staffName = instructor.instructorName.name;
                    }
                    else if ('firstName' in instructor.instructorName && 'lastName' in instructor.instructorName) {
                        staffName = `${instructor.instructorName.firstName} ${instructor.instructorName.lastName}`;
                    }
                    else {
                        const possibleNameFields = ['fullName', 'displayName', 'username', '_id'];
                        for (const field of possibleNameFields) {
                            if (typeof instructor.instructorName === 'object' && field in instructor.instructorName && instructor.instructorName[field]) {
                                staffName = typeof instructor.instructorName === 'object' && field in instructor.instructorName
                                    ? instructor.instructorName[field]
                                    : staffName;
                                break;
                            }
                        }
                    }
                }
            }
            return {
                instructorName: staffName,
                instructorId: instructor._id,
                periodBeginning: instructor.periodBeginning,
                periodEnding: instructor.periodEnding,
                totalWorkingHours: totalHours,
                totalWorkAmount,
                totalMiles,
                mileageRate,
                totalAmount: totalWorkAmount + (totalMiles * mileageRate),
            };
        });
        return res.status(200).json({
            message: "Overview report fetched successfully",
            overviewData,
        });
    }
    catch (error) {
        console.error("Error fetching overview report:", error);
        return res.status(500).json({ message: "Error fetching overview report", error });
    }
});
exports.getOverviewReport = getOverviewReport;
const getAllReportsOV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { year = '2025' } = req.query;
        const totalClasses = yield class_model_1.default.countDocuments();
        const totalInstructors = yield staff_model_1.default.countDocuments();
        const paymentReports = yield paymentReport_model_1.default.find();
        const monthlyPayroll = [];
        const monthlyClasses = [];
        const monthlyInstructors = [];
        const monthlyMiles = [];
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        monthNames.forEach((month) => {
            monthlyPayroll.push({ month, value: 0 });
            monthlyClasses.push({ month, value: 0 });
            monthlyInstructors.push({ month, value: 0 });
            monthlyMiles.push({ month, value: 0 });
        });
        let totalPayrollAmount = 0;
        paymentReports.forEach((report) => {
            if (report.workDetails) {
                report.workDetails.forEach((work) => {
                    const workDate = new Date(work.date);
                    const monthIndex = workDate.getMonth();
                    if (workDate.getFullYear() === parseInt(year)) {
                        const payrollAmount = work.hours * work.hourRate;
                        totalPayrollAmount += payrollAmount;
                        monthlyPayroll[monthIndex].value += payrollAmount;
                        monthlyClasses[monthIndex].value += 1;
                        monthlyInstructors[monthIndex].value += 1;
                    }
                });
            }
        });
        const milesReports = yield workdetails_model_1.default.find();
        let totalMilesAmount = 0;
        milesReports.forEach((report) => {
            if (report.milesDetails) {
                report.milesDetails.forEach((miles) => {
                    const milesAmount = miles.miles * miles.mileRate;
                    totalMilesAmount += milesAmount;
                    const milesDate = new Date(report.date);
                    const monthIndex = milesDate.getMonth();
                    if (milesDate.getFullYear() === parseInt(year)) {
                        monthlyMiles[monthIndex].value += milesAmount;
                    }
                });
            }
        });
        return res.status(200).json({
            success: true,
            message: 'All reports fetched successfully',
            totalClasses,
            totalInstructors,
            totalMilesAmount,
            totalPayrollAmount,
            paymentReports,
            milesReports,
            monthlyPayroll,
            monthlyClasses,
            monthlyInstructors,
            monthlyMiles
        });
    }
    catch (error) {
        console.error("Error fetching reports:", error);
        return res.status(500).json({ message: "Error fetching reports", error });
    }
});
exports.getAllReportsOV = getAllReportsOV;
const exportReportsAsCSV = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { timePeriod } = req.query;
    try {
        let startDate;
        let endDate;
        if (timePeriod === 'bi-weekly') {
            startDate = (0, moment_1.default)().subtract(2, 'weeks').startOf('week').toDate();
            endDate = (0, moment_1.default)().toDate();
        }
        else if (timePeriod === 'monthly') {
            startDate = (0, moment_1.default)().startOf('month').toDate();
            endDate = (0, moment_1.default)().endOf('month').toDate();
        }
        else if (timePeriod === 'yearly') {
            startDate = (0, moment_1.default)().startOf('year').toDate();
            endDate = (0, moment_1.default)().endOf('year').toDate();
        }
        else {
            return res.status(400).json({
                success: false,
                message: "Invalid time period. Please use 'bi-weekly', 'monthly', or 'yearly'."
            });
        }
        const totalClasses = yield class_model_1.default.countDocuments();
        const totalInstructors = yield staff_model_1.default.countDocuments();
        const paymentReports = yield paymentReport_model_1.default.find({
            date: { $gte: startDate, $lte: endDate },
        });
        let totalPayrollAmount = 0;
        paymentReports.forEach((report) => {
            report.workDetails.forEach((work) => {
                totalPayrollAmount += work.hours * work.hourRate;
            });
        });
        const milesReports = yield workdetails_model_1.default.find({
            date: { $gte: startDate, $lte: endDate },
        });
        let totalMilesAmount = 0;
        milesReports.forEach((report) => {
            report.milesDetails.forEach((miles) => {
                totalMilesAmount += miles.miles * miles.mileRate;
            });
        });
        const reportData = [
            { "Total Classes": totalClasses, "Total Instructors": totalInstructors, "Total Payroll Amount": totalPayrollAmount, "Total Miles Amount": totalMilesAmount },
        ];
        const json2csvParser = new json2csv_1.Parser();
        const csvData = json2csvParser.parse(reportData);
        res.header('Content-Type', 'text/csv');
        res.attachment(`report-${timePeriod}.csv`);
        return res.send(csvData);
    }
    catch (error) {
        console.error("Error generating report:", error);
        return res.status(500).json({ message: "Error generating report", error });
    }
});
exports.exportReportsAsCSV = exportReportsAsCSV;
