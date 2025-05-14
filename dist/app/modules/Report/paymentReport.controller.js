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
exports.createPaymentReport = void 0;
const paymentReport_model_1 = __importDefault(require("./paymentReport.model"));
const getReportPeriod = () => {
    const today = new Date();
    const periodBeginning = new Date(today);
    const periodEnding = new Date(today);
    periodEnding.setDate(periodEnding.getDate() + 14); // Two weeks later
    return { periodBeginning, periodEnding };
};
const createPaymentReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { staffName, periodBeginning, periodEnding, workDetails } = req.body;
        if (!workDetails || workDetails.length === 0) {
            return res.status(400).json({ message: "Work details are required" });
        }
        const paymentReport = new paymentReport_model_1.default({
            staffName,
            periodBeginning,
            periodEnding,
            workDetails,
        });
        yield paymentReport.save();
        return res.status(201).json({ message: "Payment report created", paymentReport });
    }
    catch (error) {
        console.error("Error creating payment report:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createPaymentReport = createPaymentReport;
