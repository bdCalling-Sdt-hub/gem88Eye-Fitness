import express from 'express';
import { getPredefinedClassNames, createClass, getAllClasses, updateClass, deleteClass, updateClassStatus, getClassStats, getClassById } from './class.controller';
import { authenticateAdmin, authenticateStaff, authenticateUser } from '../../middlewares/auth';

const ClassRoutes = express.Router();

// Route to fetch predefined class names
ClassRoutes.get('/names', getPredefinedClassNames);
ClassRoutes.get('/get', getAllClasses);
ClassRoutes.get('/getstates', getClassStats);
ClassRoutes.get('/classById/:classId', getClassById);
ClassRoutes.post('/create', createClass);
ClassRoutes.put('/:classId', authenticateStaff,authenticateAdmin,authenticateUser,updateClass);
ClassRoutes.put('/status/:classId',updateClassStatus);
ClassRoutes.delete('/delete/:classId', deleteClass);

export default ClassRoutes;
