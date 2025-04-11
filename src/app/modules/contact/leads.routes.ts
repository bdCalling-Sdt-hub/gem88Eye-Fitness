// src/app/routes/leadRoutes.ts
import express from 'express';
import { addLead, deleteLead, getAllLeads, updateLead, updateLeadStatus } from './leads.controller';

const LeadsRoutes = express.Router();

LeadsRoutes.post('/add', addLead);

LeadsRoutes.get('/all', getAllLeads);

LeadsRoutes.put('/status', updateLeadStatus); 
LeadsRoutes.put('/update/:leadId', updateLead);
LeadsRoutes.delete('/delete/:id',deleteLead)
export default LeadsRoutes;
