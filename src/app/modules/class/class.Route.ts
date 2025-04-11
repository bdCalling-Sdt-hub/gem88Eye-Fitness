import express from 'express';
import { getPredefinedClassNames, createClass, getAllClasses, updateClass, deleteClass, updateClassStatus } from './class.controller';
import { authenticateAdmin, authenticateStaff, authenticateUser } from '../../middlewares/auth';

const ClassRoutes = express.Router();

// Route to fetch predefined class names
ClassRoutes.get('/names', getPredefinedClassNames);
ClassRoutes.get('/get', getAllClasses);
ClassRoutes.post('/create', createClass);
ClassRoutes.put('/:classId', authenticateStaff,authenticateAdmin,authenticateUser,updateClass);
ClassRoutes.put('/status/:classId',updateClassStatus);
ClassRoutes.delete('/:classId',authenticateStaff,authenticateAdmin,authenticateUser, deleteClass);

export default ClassRoutes;
