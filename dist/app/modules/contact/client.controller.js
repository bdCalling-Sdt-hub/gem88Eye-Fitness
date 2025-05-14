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
exports.deleteClient = exports.updateClientStatus = exports.updateClient = exports.getAllClients = exports.addClient = void 0;
const client_model_1 = __importDefault(require("./client.model"));
const addClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, client_email, address, gender, phone } = req.body;
    if (!name || !client_email || !address || !gender || !phone) {
        res.status(400).json({ success: false, message: 'All fields are required!' });
        return;
    }
    try {
        const newClient = new client_model_1.default({
            name,
            client_email,
            address,
            gender,
            phone,
        });
        yield newClient.save();
        res.status(201).json({ success: true, message: 'Client added successfully!' });
    }
    catch (err) {
        next(err);
    }
});
exports.addClient = addClient;
const getAllClients = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const clients = yield client_model_1.default.find();
        if (clients.length === 0) {
            res.status(404).json({
                success: false,
                message: 'No clients found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: clients
        });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllClients = getAllClients;
const updateClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, client_email, address, gender, phone } = req.body;
    try {
        const clientToUpdate = yield client_model_1.default.findById(id);
        if (!clientToUpdate) {
            res.status(404).json({ success: false, message: 'Client not found!' });
            return;
        }
        if (name)
            clientToUpdate.name = name;
        if (client_email)
            clientToUpdate.client_email = client_email;
        if (address)
            clientToUpdate.address = address;
        if (gender)
            clientToUpdate.gender = gender;
        if (phone)
            clientToUpdate.phone = phone;
        yield clientToUpdate.save();
        res.status(200).json({
            success: true,
            message: 'Client updated successfully!',
            data: clientToUpdate,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateClient = updateClient;
const updateClientStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.id;
    const { active } = req.body;
    if (typeof active !== 'boolean') {
        res.status(400).json({
            success: false,
            message: 'Active status must be a boolean (true or false).'
        });
    }
    try {
        const updatedClient = yield client_model_1.default.findByIdAndUpdate(clientId, { active }, { new: true });
        if (!updatedClient) {
            res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Client status updated successfully!',
            data: updatedClient
        });
    }
    catch (err) {
        next(err);
    }
});
exports.updateClientStatus = updateClientStatus;
const deleteClient = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const clientId = req.params.id;
    try {
        const deletedClient = yield client_model_1.default.findByIdAndDelete(clientId);
        if (!deletedClient) {
            res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Client deleted successfully!',
            data: deletedClient
        });
    }
    catch (err) {
        next(err);
    }
});
exports.deleteClient = deleteClient;
