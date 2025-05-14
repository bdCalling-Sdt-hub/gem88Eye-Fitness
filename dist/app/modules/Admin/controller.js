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
exports.getAllLocations = exports.deleteLocation = exports.updateLocationStatus = exports.updateLocation = exports.createLocation = exports.changePassword = exports.resetPassword = exports.verifyOTP = exports.forgetPassword = exports.getAdminProfile = exports.updateAdminProfile = exports.loginAdmin = exports.registerAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const admin_model_1 = __importDefault(require("./admin.model"));
const location_model_1 = require("./location.model");
const emailHelper_1 = require("../../../helpers/emailHelper");
const crypto_1 = __importDefault(require("crypto"));
const role_model_1 = __importDefault(require("../role/role.model"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const registerAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const admin = yield admin_model_1.default.create({ name, email, password: hashedPassword });
        res.status(201).json({ message: "Admin created successfully", admin });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating admin", error });
    }
});
exports.registerAdmin = registerAdmin;
const loginAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const admin = yield admin_model_1.default.findOne({ email });
        if (!admin)
            return res.status(404).json({ message: "Admin not found" });
        const isMatch = yield bcryptjs_1.default.compare(password, admin.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });
        const token = jsonwebtoken_1.default.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ message: "Login successful", token, admin });
    }
    catch (error) {
        res.status(500).json({ message: "Error logging in", error });
    }
});
exports.loginAdmin = loginAdmin;
// export const updateAdminProfile = async (req: Request, res: Response) => {
//   try {
//     // Get the admin data attached to the request by the authenticateAdmin middleware
//     const admin = req.admin;
//     // Extract the updated fields from the request body
//     const { name, email, image } = req.body;
//     // Prepare an object to store the updated fields
//     const updatedAdminData: any = {};
//     // If the name is provided, update it
//     if (name) {
//       updatedAdminData.name = name;
//     }
//     // If the email is provided, update it
//     if (email) {
//       updatedAdminData.email = email;
//     }
//     // If the image is provided, update it
//     if (image) {
//       updatedAdminData.image = image;
//     }
//     if (!admin) {
//       return res.status(400).json({ message: "Admin is not authenticated" });
//     }
//     const updatedAdmin = await Admin.findByIdAndUpdate(admin.id, updatedAdminData, {
//       new: true,  // Return the updated document
//       runValidators: true,  // Ensure validators are applied (e.g., email uniqueness)
//     });
//     // If admin is not found, return an error
//     if (!updatedAdmin) {
//       return res.status(404).json({ message: 'Admin not found' });
//     }
//     // Send the updated admin data as a response (excluding sensitive data like password)
//     const adminProfile = {
//       id: updatedAdmin._id,
//       name: updatedAdmin.name,
//       email: updatedAdmin.email,
//       role: updatedAdmin.role,
//       image: updatedAdmin.image || '',  // Default image if not provided
//       createdAt: updatedAdmin.createdAt,
//       updatedAt: updatedAdmin.updatedAt,
//     };
//     res.status(200).json({ message: 'Admin profile updated successfully', admin: adminProfile });
//   } catch (error) {
//     console.error('Error updating admin profile:', error);
//     res.status(500).json({ message: 'Error updating admin profile', error });
//   }
// };
const upload = (0, fileUploadHandler_1.default)();
// export const updateAdminProfile = async (req: Request, res: Response) => {
//   // Handle image upload first using multer
//   upload(req, res, async (err: any) => {
//     if (err) {
//       // Handle file upload errors
//       return res.status(400).json({ message: err.message });
//     }
//     try {
//       const admin = req.admin;
//       if (!admin) {
//         return res.status(400).json({ message: 'Admin is not authenticated' });
//       }
//       const { name, email } = req.body;
//       const updatedAdminData: any = {};
//       if (name) {
//         updatedAdminData.name = name;
//       }
//       if (email) {
//         updatedAdminData.email = email;
//       }
//       if (req.files && (req.files as { [fieldname: string]: Express.Multer.File[] })['image']) {
//         const files = req.files as { [fieldname: string]: Express.Multer.File[] }; 
//         const imagePath = '/uploads/image/' + files['image'][0].filename;  
//         updatedAdminData.image = imagePath;
//       }
//       const updatedAdmin = await Admin.findByIdAndUpdate(admin.id, updatedAdminData, {
//         new: true, 
//         runValidators: true, 
//       });
//       if (!updatedAdmin) {
//         return res.status(404).json({ message: 'Admin not found' });
//       }
//       const adminProfile = {
//         id: updatedAdmin._id,
//         name: updatedAdmin.name,
//         email: updatedAdmin.email,
//         role: updatedAdmin.role,
//         image: updatedAdmin.image || '', 
//         createdAt: updatedAdmin.createdAt,
//         updatedAt: updatedAdmin.updatedAt,
//       };
//       res.status(200).json({ message: 'Admin profile updated successfully', admin: adminProfile });
//     } catch (error) {
//       console.error('Error updating admin profile:', error);
//       res.status(500).json({ message: 'Error updating admin profile', error });
//     }
//   });
// };
const updateAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    upload(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        try {
            const admin = req.admin;
            if (!admin) {
                return res.status(400).json({ message: 'Admin is not authenticated' });
            }
            const { name, email, businessName, address } = req.body;
            const updatedAdminData = {};
            if (name) {
                updatedAdminData.name = name;
            }
            if (email) {
                updatedAdminData.email = email;
            }
            if (businessName) {
                updatedAdminData.businessName = businessName;
            }
            if (address) {
                updatedAdminData.address = address;
            }
            if (req.files && req.files['image']) {
                const files = req.files;
                const imagePath = '/uploads/image/' + files['image'][0].filename;
                updatedAdminData.image = imagePath;
            }
            const updatedAdmin = yield admin_model_1.default.findByIdAndUpdate(admin.id, updatedAdminData, {
                new: true,
                runValidators: true,
            });
            if (!updatedAdmin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            const adminProfile = {
                id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                businessName: updatedAdmin.businessName || '',
                address: updatedAdmin.address || '',
                image: updatedAdmin.image || '',
                createdAt: updatedAdmin.createdAt,
                updatedAt: updatedAdmin.updatedAt,
            };
            res.status(200).json({ message: 'Admin profile updated successfully', admin: adminProfile });
        }
        catch (error) {
            console.error('Error updating admin profile:', error);
            res.status(500).json({ message: 'Error updating admin profile', error });
        }
    }));
});
exports.updateAdminProfile = updateAdminProfile;
const getAdminProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.admin;
        if (!admin) {
            return res.status(400).json({ message: "Admin is not authenticated" });
        }
        const fetchedAdmin = yield admin_model_1.default.findById(admin.id).select('-password');
        if (!fetchedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        const adminProfile = {
            id: fetchedAdmin._id,
            name: fetchedAdmin.name,
            businessName: fetchedAdmin.businessName || '',
            address: fetchedAdmin.address || '',
            email: fetchedAdmin.email,
            role: fetchedAdmin.role,
            image: fetchedAdmin.image || 'https://i.ibb.co/z5YHLV9/profile.png',
            createdAt: fetchedAdmin.createdAt,
            updatedAt: fetchedAdmin.updatedAt,
        };
        res.status(200).json({ message: 'Admin profile fetched successfully', admin: adminProfile });
    }
    catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ message: 'Error fetching admin profile', error });
    }
});
exports.getAdminProfile = getAdminProfile;
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        let user = yield admin_model_1.default.findOne({ email });
        if (!user) {
            user = yield role_model_1.default.findOne({ email });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 20 * 60 * 1000); // 10 minutes expiry
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = otpExpires;
        yield user.save();
        const htmlContent = `
      <p>Your OTP for password reset is <strong>${otp}</strong>.</p>
      <p>This OTP will expire in 10 minutes.</p>
    `;
        yield emailHelper_1.emailHelper.sendEmail({
            to: email,
            subject: 'Password Reset OTP',
            html: htmlContent,
        });
        res.status(200).json({ message: "OTP sent successfully to your email." });
    }
    catch (error) {
        console.error("Error in forgetPassword:", error);
        res.status(500).json({ message: "Error sending OTP", error });
    }
});
exports.forgetPassword = forgetPassword;
// export const verifyOTP = async (req: Request, res: Response) => {
//   try {
//     const { email, otp, role } = req.body;
//     // Find the user by email
//     let user;
//     if (role === 'admin') {
//       user = await Admin.findOne({ email });
//     } else if (role === 'staff') {
//       user = await Role.findOne({ email });
//     }
//     if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
//       return res.status(400).json({ message: "Invalid OTP request" });
//     }
//     // Check if OTP matches and is not expired
//     if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
//       return res.status(400).json({ message: "Invalid or expired OTP" });
//     }
//     // Clear OTP fields after verification
//     user.resetPasswordOTP = '';
//     user.resetPasswordExpires = new Date(0); // Set to epoch time as a placeholder for "null"
//     await user.save();
//     res.status(200).json({ message: "OTP verified successfully" });
//   } catch (error) {
//     console.error("Error verifying OTP:", error);
//     res.status(500).json({ message: "Error verifying OTP", error });
//   }
// };
const verifyOTP = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        let user = yield admin_model_1.default.findOne({ email });
        if (!user) {
            user = yield role_model_1.default.findOne({ email });
        }
        if (!user || !user.resetPasswordOTP || !user.resetPasswordExpires) {
            return res.status(400).json({ message: "Invalid OTP request" });
        }
        if (user.resetPasswordOTP !== otp || new Date() > user.resetPasswordExpires) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        user.resetPasswordOTP = '';
        user.resetPasswordExpires = new Date(0);
        yield user.save();
        res.status(200).json({ message: "OTP verified successfully" });
    }
    catch (error) {
        console.error("Error verifying OTP:", error);
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
        let user = yield admin_model_1.default.findOne({ email });
        if (!user) {
            user = yield role_model_1.default.findOne({ email });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        yield user.save();
        res.status(200).json({ message: "Password reset successfully" });
    }
    catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ message: "Error resetting password", error });
    }
});
exports.resetPassword = resetPassword;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const adminId = (_a = req.admin) === null || _a === void 0 ? void 0 : _a.id;
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "New password and confirm password must match" });
        }
        const admin = yield admin_model_1.default.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, admin.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        admin.password = hashedPassword;
        yield admin.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating password", error });
    }
});
exports.changePassword = changePassword;
// export const createLocation = async (req: Request, res: Response) => {
//   try {
//     const { locationName, address, region, locationType, hourRate, firstName, lastName, email, mobileNumber, workType } = req.body;
//     // Validate required fields
//     if (!locationName || !address || !region || !hourRate || !firstName || !lastName || !email || !mobileNumber || !workType) {
//       return res.status(400).json({ message: "All required fields must be provided." });
//     }
//     const location = new Location({
//       locationName,
//       address,
//       region,
//       locationType: locationType || null, // Ensure optional field is handled correctly
//       hourRate,
//       firstName,
//       lastName,
//       email,
//       mobileNumber,
//       workType,
//     });
//     await location.save();
//     return res.status(201).json({ message: "Location created successfully", location });
//   } catch (error) {
//     return res.status(500).json({ message: "Error creating location", error: (error as Error).message });
//   }
// };
// Get All Locations
const createLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationName, address, region, locationType, hourRate, hours, mileRate, miles, description, firstName, lastName, email, mobileNumber, workType } = req.body;
        if (!region || !Array.isArray(region)) {
            return res.status(400).json({ message: "Region must be an array of states/cities." });
        }
        const newLocation = new location_model_1.Location({
            locationName,
            address,
            region,
            locationType,
            hourRate,
            hours,
            mileRate,
            miles,
            description,
            firstName,
            lastName,
            email,
            mobileNumber,
            workType,
            date: new Date(), // Current date
            status: 'active',
        });
        // Save the location to the database
        const savedLocation = yield newLocation.save();
        return res.status(201).json({
            message: "Location created successfully",
            location: savedLocation,
        });
    }
    catch (error) {
        console.error("Error creating location:", error);
        return res.status(500).json({
            message: "Error creating location",
            error: error.message,
        });
    }
});
exports.createLocation = createLocation;
const updateLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId } = req.params;
        const { locationName, address, region, locationType, hourRate, hours, mileRate, miles, description, firstName, lastName, email, mobileNumber, workType, removeFields = [] } = req.body;
        if (region && !Array.isArray(region)) {
            return res.status(400).json({ message: "Region must be an array of states/cities." });
        }
        const updateData = {};
        if (locationName)
            updateData.locationName = locationName;
        if (address)
            updateData.address = address;
        if (region)
            updateData.region = region;
        if (locationType)
            updateData.locationType = locationType;
        if (hourRate)
            updateData.hourRate = hourRate;
        if (hours)
            updateData.hours = hours;
        if (mileRate)
            updateData.mileRate = mileRate;
        if (miles)
            updateData.miles = miles;
        if (description)
            updateData.description = description;
        if (firstName)
            updateData.firstName = firstName;
        if (lastName)
            updateData.lastName = lastName;
        if (email)
            updateData.email = email;
        if (mobileNumber)
            updateData.mobileNumber = mobileNumber;
        if (workType)
            updateData.workType = workType;
        const unsetData = {};
        removeFields.forEach((field) => {
            unsetData[field] = "";
        });
        const updatedLocation = yield location_model_1.Location.findByIdAndUpdate(locationId, { $set: updateData, $unset: unsetData }, { new: true });
        if (!updatedLocation) {
            return res.status(404).json({ message: "Location not found." });
        }
        return res.status(200).json({
            message: "Location updated successfully",
            location: updatedLocation,
        });
    }
    catch (error) {
        console.error("Error updating location:", error);
        return res.status(500).json({
            message: "Error updating location",
            error: error.message,
        });
    }
});
exports.updateLocation = updateLocation;
const updateLocationStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId, status } = req.body;
        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: "Invalid status. Must be 'active' or 'inactive'." });
        }
        const result = yield location_model_1.Location.updateOne({ _id: locationId }, { $set: { status } });
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: "Location not found or status already set to the same value." });
        }
        return res.status(200).json({
            message: `Location status updated to ${status}`,
        });
    }
    catch (error) {
        return res.status(500).json({ message: "Error updating location status", error: error.message });
    }
});
exports.updateLocationStatus = updateLocationStatus;
const deleteLocation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId } = req.params;
        const location = yield location_model_1.Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ message: "Location not found." });
        }
        yield location_model_1.Location.findByIdAndDelete(locationId);
        return res.status(200).json({
            message: "Location removed successfully"
        });
    }
    catch (error) {
        return res.status(500).json({
            message: "Error removing location",
            error: error.message
        });
    }
});
exports.deleteLocation = deleteLocation;
// export const getAllLocations = async (req: Request, res: Response) => {
//   try {
//     // Get the status filter from the query parameters (if provided)
//     const status = req.query.status;
//     // Build the query based on the status filter
//     const query: any = {};
//     if (status) {
//       // Validate status value (either 'active' or 'inactive')
//       if (status !== 'active' && status !== 'inactive') {
//         return res.status(400).json({ message: "Invalid status. Please use 'active' or 'inactive'." });
//       }
//       query.status = status;  // Add status filter to the query
//     }
//     // Fetch locations from the database based on the query
//     const locations = await Location.find(query);
//     return res.status(200).json(locations);  // Return the filtered locations
//   } catch (error) {
//     return res.status(500).json({ message: "Error fetching locations", error: (error as Error).message });
//   }
// };
const getAllLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, workType } = req.query;
        const query = {};
        if (status) {
            if (status !== 'active' && status !== 'inactive') {
                return res.status(400).json({ message: "Invalid status. Please use 'active' or 'inactive'." });
            }
            query.status = status;
        }
        if (workType) {
            if (workType !== 'online' && workType !== 'offline') {
                return res.status(400).json({ message: "Invalid workType. Please use 'online' or 'offline'." });
            }
            query.workType = workType;
        }
        const locations = yield location_model_1.Location.find(query);
        return res.status(200).json(locations);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching locations", error: error.message });
    }
});
exports.getAllLocations = getAllLocations;
//home 
