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

      const clients = await Client.find();
  
  
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
    } catch (err) {
      next(err); 
    }
  };

  export const updateClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;  
    const { client_name, client_email, address, gender, phone } = req.body;
  
    try {
      const clientToUpdate = await Client.findById(id);
    
      if (!clientToUpdate) {
         res.status(404).json({ success: false, message: 'Client not found!' });
         return;
      }
      if (client_name) clientToUpdate.client_name = client_name;
      if (client_email) clientToUpdate.client_email = client_email;
      if (address) clientToUpdate.address = address;
      if (gender) clientToUpdate.gender = gender;
      if (phone) clientToUpdate.phone = phone;
  
      await clientToUpdate.save();

      res.status(200).json({
        success: true,
        message: 'Client updated successfully!',
        data: clientToUpdate,
      });
    } catch (err) {
      next(err);  
    }
  };
  

  export const updateClientStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.params.id;  
    const { active } = req.body;  
  
    if (typeof active !== 'boolean') {
       res.status(400).json({
        success: false,
        message: 'Active status must be a boolean (true or false).'
      });
    }
  
    try {
      const updatedClient = await Client.findByIdAndUpdate(clientId, { active }, { new: true });
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
    } catch (err) {
      next(err); 
    }
  };

  export const deleteClient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientId = req.params.id; 
  
    try {

      const deletedClient = await Client.findByIdAndDelete(clientId);
  
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
    } catch (err) {
      next(err); 
    }
  };