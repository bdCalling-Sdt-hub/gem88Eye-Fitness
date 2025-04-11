// app/routes/clientRoutes.ts
import express from 'express';
import { addClient, deleteClient, getAllClients, updateClient, updateClientStatus } from './client.controller';
import { sendEmailToClients } from './mailer.contact.controller';

const ClientRoutes = express.Router();

// ClientRoutes.get('/clients/add', renderAddClientForm); 
ClientRoutes.post('/clients/add', addClient); 
ClientRoutes.post('/sendmail', sendEmailToClients); 
ClientRoutes.put('/clients/active/:id', updateClientStatus); 
ClientRoutes.put('/clients/:id', updateClient); 
ClientRoutes.delete('/clients/:id', deleteClient); 
ClientRoutes.get('/clients/get', getAllClients); 

export default ClientRoutes;
