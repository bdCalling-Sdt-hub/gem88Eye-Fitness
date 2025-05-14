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
exports.getRoles = exports.assignRole = void 0;
const role_model_1 = __importDefault(require("./role.model"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const assignRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, role, accessControls } = req.body;
        const existingRole = yield role_model_1.default.findOne({ email });
        if (existingRole) {
            return res.status(400).json({ message: "User already has a role assigned" });
        }
        const defaultAccessControls = [
            "calendar", "services", "invoice", "contact",
            "reports", "payroll-reporting", "settings"
        ];
        let finalAccessControls = accessControls && Array.isArray(accessControls)
            ? accessControls.filter(page => defaultAccessControls.includes(page))
            : [];
        const newRole = yield role_model_1.default.create({
            name,
            email,
            role,
            accessControls: finalAccessControls.length ? finalAccessControls : defaultAccessControls,
        });
        const emailContent = {
            to: email,
            subject: "New Role Assigned to Your Account",
            html: `
        <h3>Hello ${name},</h3>
        <p>You have been assigned the role of <strong>${role}</strong> in our system.</p>
        <p>Please set your password and access your account.</p>
        <p>Click the link to set your password: <a href="http://72.167.224.54:8081/auth/set-password">Set Password</a></p>
        <p>Best Regards,</p>
        <p>A New Fitness Team</p>
      `,
        };
        yield emailHelper_1.emailHelper.sendEmail(emailContent);
        res.status(201).json({ message: "Role assigned successfully, email sent", newRole });
    }
    catch (error) {
        console.error("Error in assignRole:", error);
        res.status(500).json({ message: "Error assigning role", error });
    }
});
exports.assignRole = assignRole;
const getRoles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const roles = yield role_model_1.default.find();
        res.status(200).json({ roles });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching roles", error });
    }
});
exports.getRoles = getRoles;
