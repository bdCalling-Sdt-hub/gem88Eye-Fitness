import express from 'express';
import { getPredefinedClassNames, createClass, getAllClasses, updateClass, deleteClass, updateClassStatus, getClassStats, getClassById } from './class.controller';
import { authenticateAdmin, authenticateStaff, authenticateUser } from '../../middlewares/auth';

const ClassRoutes = express.Router();

ClassRoutes.get('/names', getPredefinedClassNames);
ClassRoutes.get('/get', getAllClasses);
ClassRoutes.get('/getstates', getClassStats);
ClassRoutes.get('/classById/:classId', getClassById);
ClassRoutes.post('/create', createClass);
ClassRoutes.put('/:classId', updateClass);
ClassRoutes.put('/status/:classId',updateClassStatus);
ClassRoutes.delete('/delete/:classId', deleteClass);

export default ClassRoutes;
