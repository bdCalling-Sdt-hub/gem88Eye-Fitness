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
exports.authenticateStaff = exports.authenticateUser = exports.generateToken = exports.authenticateAdmin = void 0;
const http_status_codes_1 = require("http-status-codes");
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const jwtHelper_1 = require("../../helpers/jwtHelper");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const staff_model_1 = __importDefault(require("../modules/staff/staff.model"));
const auth = (...roles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenWithBearer = req.headers.authorization;
        if (!tokenWithBearer) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
            const token = tokenWithBearer.split(' ')[1];
            // Verify token using jwtHelper
            const verifyUser = jwtHelper_1.jwtHelper.verifyToken(token, config_1.default.jwt.jwt_secret);
            // Set user to header
            req.user = verifyUser;
            // Guard user by role
            if (roles.length && !roles.includes(verifyUser.role)) {
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, "You don't have permission to access this API");
            }
            next();
        }
    }
    catch (error) {
        next(error);
    }
});
const authenticateAdmin = (req, res, next) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Get token from headers
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.admin = decoded;
        next();
    }
    catch (error) {
        console.error('Error decoding token:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
    }
};
exports.authenticateAdmin = authenticateAdmin;
const generateToken = (req) => {
    const user = req.user;
    const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return token;
};
exports.generateToken = generateToken;
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenWithBearer = req.headers.authorization;
        if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        const token = tokenWithBearer.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid token');
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('Error verifying token:', error);
        next(error);
    }
});
exports.authenticateUser = authenticateUser;
const authenticateStaff = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenWithBearer = req.headers.authorization;
        if (!tokenWithBearer || !tokenWithBearer.startsWith('Bearer')) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'You are not authorized');
        }
        const token = tokenWithBearer.split(' ')[1]; // Extract token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET); // Verify token
        if (!decoded || !decoded.id) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, 'Invalid token');
        }
        const staff = yield staff_model_1.default.findById(decoded.id);
        // Check if staff is found
        if (!staff) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Staff not found');
        }
        req.user = staff; // Attach staff to request
        next();
    }
    catch (error) {
        console.error('Error during staff authentication:', error);
        next(error);
    }
});
exports.authenticateStaff = authenticateStaff;
exports.default = auth;
