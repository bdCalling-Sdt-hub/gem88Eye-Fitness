"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const class_controller_1 = require("./class.controller");
const ClassRoutes = express_1.default.Router();
ClassRoutes.get('/names', class_controller_1.getPredefinedClassNames);
ClassRoutes.get('/get', class_controller_1.getAllClasses);
ClassRoutes.get('/getstates', class_controller_1.getClassStats);
ClassRoutes.get('/classById/:classId', class_controller_1.getClassById);
ClassRoutes.post('/create', class_controller_1.createClass);
ClassRoutes.put('/:classId', class_controller_1.updateClass);
ClassRoutes.put('/status/:classId', class_controller_1.updateClassStatus);
ClassRoutes.delete('/delete/:classId', class_controller_1.deleteClass);
exports.default = ClassRoutes;
