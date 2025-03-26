import express from 'express';
import { getPredefinedClassNames, createClass, getAllClasses } from './class.controller';

const ClassRoutes = express.Router();

// Route to fetch predefined class names
ClassRoutes.get('/names', getPredefinedClassNames);
ClassRoutes.get('/get', getAllClasses);
ClassRoutes.post('/create', createClass);


export default ClassRoutes;
