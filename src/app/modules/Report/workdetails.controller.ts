// import { Request, Response } from 'express';
// import WorkDetails from './work.model/workdetails.model';  // Make sure the import path is correct
// import { IWorkdetails  from './work.model/workdetails.model';

// // Create a new WorkDetail
// export const createWorkDetail = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const newWorkDetail: IWorkdetails = new WorkDetails({
//       staff: req.body.staff,
//       lead: req.body.lead,
//       staffName: req.body.staffName,
//       leadName: req.body.leadName,
//       periodBeginning: req.body.periodBeginning,
//       periodEnding: req.body.periodEnding,
//       date: req.body.date,
//       milesDetails: req.body.milesDetails,
//       workDetails: req.body.workDetails,
//     });

//     const savedWorkDetail = await newWorkDetail.save();
//     res.status(201).json(savedWorkDetail);
//   } catch (error) {
//     res.status(500).json({ message: error});
//   }
// };

// // Update an existing WorkDetail
// export const updateWorkDetail = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const workDetailId = req.params.id;
//     const updatedWorkDetail = await WorkDetails.findByIdAndUpdate(
//       workDetailId,
//       {
//         $set: {
//           staff: req.body.staff,
//           lead: req.body.lead,
//           staffName: req.body.staffName,
//           leadName: req.body.leadName,
//           periodBeginning: req.body.periodBeginning,
//           periodEnding: req.body.periodEnding,
//           date: req.body.date,
//           milesDetails: req.body.milesDetails,
//           workDetails: req.body.workDetails,
//         },
//       },
//       { new: true }  // returns the updated document
//     );

//     if (!updatedWorkDetail) {
//       res.status(404).json({ message: "Work detail not found" });
//       return;
//     }

//     res.status(200).json(updatedWorkDetail);
//   } catch (error) {
//     res.status(500).json({ message: error });
//   }
// };

// // Delete a WorkDetail
// export const deleteWorkDetail = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const workDetailId = req.params.id;
//     const deletedWorkDetail = await WorkDetails.findByIdAndDelete(workDetailId);

//     if (!deletedWorkDetail) {
//       res.status(404).json({ message: "Work detail not found" });
//       return;
//     }

//     res.status(200).json({ message: "Work detail deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ message: error });
//   }
// };
