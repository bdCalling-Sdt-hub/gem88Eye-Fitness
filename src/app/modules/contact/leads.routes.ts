// src/app/routes/leadRoutes.ts
import express from 'express';
import { addLead, getAllLeads, updateLeadStatus } from './leads.controller';

const LeadsRoutes = express.Router();

LeadsRoutes.post('/add', addLead);

LeadsRoutes.get('/all', getAllLeads);

LeadsRoutes.put('/status', updateLeadStatus); 

export default LeadsRoutes;
