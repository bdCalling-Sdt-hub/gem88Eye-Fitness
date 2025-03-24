import { NextFunction } from "express";
import { Request, Response } from "express";
import Client from './client.model'; 
export const addClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { client_name, client_email, address, gender, phone } = req.body;
  
    if (!client_name || !client_email || !address || !gender || !phone) {
       res.status(400).json({ success: false, message: 'All fields are required!' });
       return
    }
  
    try {
      const newClient = new Client({
        client_name,
        client_email,
        address,
        gender,
        phone,
      });
  
      await newClient.save();
  
      res.status(201).json({ success: true, message: 'Client added successfully!' });
    } catch (err) {
      next(err);
    }
  };

  export const getAllClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Fetch all clients from the database
      const clients = await Client.find();
  
      // If no clients are found
      if (clients.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No clients found'
        });
        return;
      }
  
      // Return the list of clients
      res.status(200).json({
        success: true,
        data: clients
      });
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };

  export const updateClientStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.params.id;  // Get the client ID from the URL
    const { active } = req.body;  // Get the new active status from the request body
  
    if (typeof active !== 'boolean') {
       res.status(400).json({
        success: false,
        message: 'Active status must be a boolean (true or false).'
      });
    }
  
    try {
      // Find the client by ID and update the active status
      const updatedClient = await Client.findByIdAndUpdate(clientId, { active }, { new: true });
  
      // If the client is not found
      if (!updatedClient) {
         res.status(404).json({
          success: false,
          message: 'Client not found'
          
        });
      }
  
      // Return the updated client
      res.status(200).json({
        success: true,
        message: 'Client status updated successfully!',
        data: updatedClient
      });
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };

  export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.params.id;  // Get the client ID from the URL
  
    try {
      // Try to find and remove the client by ID
      const deletedClient = await Client.findByIdAndDelete(clientId);
  
      // If the client is not found
      if (!deletedClient) {
         res.status(404).json({
          success: false,
          message: 'Client not found'
        });
      }
  
      // Return success message
      res.status(200).json({
        success: true,
        message: 'Client deleted successfully!',
        data: deletedClient
      });
    } catch (err) {
      next(err); // Pass the error to the global error handler
    }
  };