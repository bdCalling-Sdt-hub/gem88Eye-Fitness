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
exports.resetPassword = exports.verifyOTP = exports.forgetPassword = exports.setPassword = exports.updateProfile = exports.getUserProfile = exports.staffLogin = exports.deleteStaff = exports.editStaff = exports.getAllStaff = exports.getAllStaffAvailabilityByDay = exports.addStaffAvailability = exports.createStaff = void 0;
const staff_model_1 = __importDefault(require("./staff.model"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const role_model_1 = __importDefault(require("../role/role.model"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const staff_aviliability_model_1 = __importDefault(require("../staff/staff.aviliability.model"));
const moment_1 = __importDefault(require("moment"));
const upload = (0, fileUploadHandler_1.default)();
const createStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, fileUploadHandler_1.default)()(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({ message: "File upload error", error: err });
        }
        try {
            const { name, expiryDate } = req.body;
            let document = null;
            if (req.files && "documents" in req.files) {
                const file = req.files["documents"][0];
                document = `/uploads/documents/${file.filename}`;
            }
            const staff = new staff_model_1.default({ name, documents: document !== null && document !== void 0 ? document : "", expiryDate, status: "valid" });
            yield staff.save();
            res.status(201).json({
                message: "Staff created successfully",
                staff,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error creating staff", error });
        }
    }));
});
exports.createStaff = createStaff;
const addStaffAvailability = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { staffId, availability, date } = req.body;
    if (!staffId || !availability || !Array.isArray(availability) || !date) {
        res.status(400).json({ success: false, message: 'Staff ID, availability, and date are required!' });
        return;
    }
    const parsedDate = moment_1.default.utc(date, 'YYYY-MM-DD', true);
    if (!parsedDate.isValid()) {
        res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date (YYYY-MM-DD).' });
        return;
    }
    try {
        const availabilityRecords = [];
        for (const dayAvailability of availability) {
            const { day, timeSlots } = dayAvailability;
            if (!timeSlots || !Array.isArray(timeSlots)) {
                res.status(400).json({ success: false, message: `Time slots are required for ${day}.` });
                return;
            }
            for (const timeSlot of timeSlots) {
                const { startTime, endTime } = timeSlot;
                if (!startTime || !endTime) {
                    res.status(400).json({ success: false, message: `Both startTime and endTime are required for ${day}.` });
                    return;
                }
                const existingRecord = yield staff_aviliability_model_1.default.findOne({
                    staff: staffId,
                    day,
                    date: parsedDate.toDate(),
                    startTime,
                    endTime,
                });
                if (existingRecord) {
                    res.status(400).json({
                        success: false,
                        message: `Duplicate time slot for ${day} with start time ${startTime} and end time ${endTime}.`,
                    });
                    return;
                }
                const newAvailability = new staff_aviliability_model_1.default({
                    staff: staffId,
                    day,
                    date: parsedDate.toDate(),
                    startTime,
                    endTime,
                });
                const savedAvailability = yield newAvailability.save();
                availabilityRecords.push(savedAvailability);
            }
        }
        const groupedByDay = {};
        availabilityRecords.forEach(record => {
            const day = record.day;
            if (!groupedByDay[day]) {
                groupedByDay[day] = {
                    day,
                    date: moment_1.default.utc(record.date).format('YYYY-MM-DD'),
                    staffId: record.staff,
                    timeSlots: []
                };
            }
            groupedByDay[day].timeSlots.push({
                startTime: record.startTime,
                endTime: record.endTime,
                _id: record._id
            });
        });
        const formattedResponse = Object.values(groupedByDay);
        res.status(201).json({
            success: true,
            message: 'Staff availability added successfully!',
            data: formattedResponse,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.addStaffAvailability = addStaffAvailability;
const getTodayDayOfWeek = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    return daysOfWeek[today.getDay()];
};
const getAllStaffAvailabilityByDay = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { day = getTodayDayOfWeek() } = req.query;
    try {
        const availability = yield staff_aviliability_model_1.default.find({ day })
            .select('startTime endTime staff')
            .populate('staff', 'name')
            .exec();
        if (!availability || availability.length === 0) {
            res.status(404).json({ success: false, message: 'No availability found for the specified day' });
        }
        res.status(200).json({
            success: true,
            message: `Availability for ${day} fetched successfully.`,
            data: availability,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllStaffAvailabilityByDay = getAllStaffAvailabilityByDay;
const getAllStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        let filter = {};
        if (status === "valid") {
            filter = { status: "valid" };
        }
        else if (status === "invalid") {
            filter = { status: "invalid" };
        }
        const staff = yield staff_model_1.default.find(filter).select("name status documents expiryDate role createdAt");
        const staffWithAvailability = yield Promise.all(staff.map((staffMember) => __awaiter(void 0, void 0, void 0, function* () {
            const availabilityRecords = yield staff_aviliability_model_1.default.find({ staff: staffMember._id })
                .select("day startTime endTime")
                .sort({ day: 1, startTime: 1 });
            const groupedAvailability = {};
            availabilityRecords.forEach(record => {
                const { day, startTime, endTime, _id } = record;
                if (!groupedAvailability[day]) {
                    groupedAvailability[day] = {
                        day,
                        timeSlots: []
                    };
                }
                groupedAvailability[day].timeSlots.push({
                    startTime,
                    endTime,
                    _id
                });
            });
            const formattedAvailability = Object.values(groupedAvailability);
            return Object.assign(Object.assign({}, staffMember.toObject()), { documents: staffMember.documents ? `${staffMember.documents}` : null, availability: formattedAvailability });
        })));
        res.status(200).json({
            message: "Staff retrieved successfully",
            staff: staffWithAvailability,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching staff",
            error: error,
        });
    }
});
exports.getAllStaff = getAllStaff;
const editStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const { staffId } = req.params;
            const { name, expiryDate, businessName, address } = req.body;
            const staff = yield staff_model_1.default.findById(staffId);
            if (!staff) {
                return res.status(404).json({ message: "Staff not found" });
            }
            if (name)
                staff.name = name;
            if (expiryDate)
                staff.expiryDate = expiryDate;
            if (businessName)
                staff.businessName = businessName;
            if (address)
                staff.address = address;
            if (req.files && req.files['image']) {
                const files = req.files;
                const imagePath = '/uploads/image/' + files['image'][0].filename;
                staff.image = imagePath;
            }
            yield staff.save();
            res.status(200).json({
                message: "Staff updated successfully",
                staff,
            });
        }
        catch (error) {
            res.status(500).json({ message: "Error updating staff", error });
        }
    }));
});
exports.editStaff = editStaff;
const deleteStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffId } = req.params;
        const staff = yield staff_model_1.default.findByIdAndDelete(staffId);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({
            message: "Staff deleted successfully",
            staff,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting staff", error });
    }
});
exports.deleteStaff = deleteStaff;
const staffLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield role_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.password) {
            return res.status(400).json({ message: "User does not have a password set" });
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "Login successful", token, user });
    }
    catch (error) {
        console.error("Error in staffLogin:", error);
        res.status(500).json({ message: "Error logging in", error });
    }
});
exports.staffLogin = staffLogin;
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield role_model_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userProfile = {
            id: user._id,
            name: user.name,
            businessName: user.businessName,
            address: user.address,
            email: user.email,
            role: user.role,
            image: user.image || 'https://i.ibb.co/z5YHLV9/profile.png',
            accessControls: user.accessControls,
        };
        res.status(200).json({ message: 'User profile fetched successfully', user: userProfile });
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Error fetching user profile', error });
    }
});
exports.getUserProfile = getUserProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const { name, email, businessName, address, password } = req.body;
            const user = req.user;
            const updatedUserData = {};
            if (name) {
                updatedUserData.name = name;
            }
            if (email) {
                updatedUserData.email = email;
            }
            if (businessName) {
                updatedUserData.businessName = businessName;
            }
            if (address) {
                updatedUserData.address = address;
            }
            if (password) {
                const hashedPassword = yield bcryptjs_1.default.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 10));
                updatedUserData.password = hashedPassword;
            }
            if (req.files && req.files['image']) {
                const files = req.files;
                const imagePath = '/uploads/image/' + files['image'][0].filename;
                updatedUserData.image = imagePath;
            }
            const updatedUser = yield role_model_1.default.findByIdAndUpdate(user.id, updatedUserData, {
                new: true,
                runValidators: true,
            });
            if (!updatedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            const userProfile = {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                businessName: updatedUser.businessName,
                address: updatedUser.address,
                role: updatedUser.role,
                accessControls: updatedUser.accessControls,
                image: updatedUser.image || 'https://i.ibb.co/z5YHLV9/profile.png',
                createdAt: updatedUser.createdAt,
            };
            res.status(200).json({ message: 'Profile updated successfully', user: userProfile });
        }
        catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ message: 'Error updating profile', error });
        }
    }));
});
exports.updateProfile = updateProfile;
const setPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = yield role_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Password set successfully" });
    }
    catch (error) {
        console.error("Error in setPassword:", error);
        res.status(500).json({ message: "Error setting password", error });
    }
});
exports.setPassword = setPassword;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield role_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = otpExpires;
        yield user.save();
        yield emailHelper_1.emailHelper.sendEmail({
            to: email,
            subject: "Password Reset OTP",
            html: `<p>Your OTP for password reset is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
        });
        res.status(200).json({ message: "OTP sent successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error sending OTP", error });
    }
});
exports.forgetPassword = forgetPassword;
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield role_model_1.default.findOne({ email });
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ message: "Invalid OTP request" });
        }
        if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.resetPasswordOTP;
        user.resetPasswordExpires;
        yield user.save();
        res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error });
    }
});
exports.verifyOTP = verifyOTP;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        const user = yield role_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error resetting password", error });
    }
});
exports.resetPassword = resetPassword;
