"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_controller_1 = require("./client.controller");
const mailer_contact_controller_1 = require("./mailer.contact.controller");
const ClientRoutes = express_1.default.Router();
ClientRoutes.post('/clients/add', client_controller_1.addClient);
ClientRoutes.post('/sendmail', mailer_contact_controller_1.sendEmailToLeadOrClients);
ClientRoutes.put('/clients/active/:id', client_controller_1.updateClientStatus);
ClientRoutes.put('/clients/:id', client_controller_1.updateClient);
ClientRoutes.delete('/clients/:id', client_controller_1.deleteClient);
ClientRoutes.get('/clients/get', client_controller_1.getAllClients);
exports.default = ClientRoutes;
