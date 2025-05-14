"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leads_controller_1 = require("./leads.controller");
const LeadsRoutes = express_1.default.Router();
LeadsRoutes.post('/add', leads_controller_1.addLead);
LeadsRoutes.post('/upload', leads_controller_1.updateLeadsFromCsv);
LeadsRoutes.get('/all', leads_controller_1.getAllLeads);
LeadsRoutes.put('/status/:leadId', leads_controller_1.updateLeadStatus);
LeadsRoutes.put('/update/:leadId', leads_controller_1.updateLead);
LeadsRoutes.get('/:leadId', leads_controller_1.getLeadById);
LeadsRoutes.delete('/delete/:id', leads_controller_1.deleteLead);
exports.default = LeadsRoutes;
