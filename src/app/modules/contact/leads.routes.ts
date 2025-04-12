// src/app/routes/leadRoutes.ts
import express from 'express';
import { addLead, deleteLead, getAllLeads, getLeadById, updateLead, updateLeadsFromCsv, updateLeadStatus } from './leads.controller';

const LeadsRoutes = express.Router();

LeadsRoutes.post('/add', addLead);
LeadsRoutes.post('/upload', updateLeadsFromCsv);

LeadsRoutes.get('/all', getAllLeads);

LeadsRoutes.put('/status/:leadId', updateLeadStatus); 
LeadsRoutes.put('/update/:leadId', updateLead);
LeadsRoutes.get('/:leadId', getLeadById);
LeadsRoutes.delete('/delete/:id',deleteLead)
export default LeadsRoutes;
