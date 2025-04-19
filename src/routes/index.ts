import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import  AdminRoutes  from '../app/modules/Admin/routes'; // Fix this import
import  RolesRouter  from '../app/modules/role/route'; // Fix this import
import StaffRoutes from '../app/modules/staff/staff.routes';
import setStuffRoutes from '../app/modules/staff/set.staff.routes';
import ReportRoutes from '../app/modules/Report/Report.Routes';
import ClientRoutes from '../app/modules/contact/client.routes';
import invoiceRoutes from '../app/modules/invoice/invoice.Route';
import LeadsRoutes from '../app/modules/contact/leads.routes';
import AppointmentRoutes from '../app/modules/contact/appoinment.routes';
import ClassRoutes from '../app/modules/class/class.Route';
import EventRoutes from '../app/modules/event/event.routes';
import NotificationRoutes from '../app/modules/notification/notification.Routes';
import CalendarRoutes from '../app/modules/calender/calendar.Routes';

const router = express.Router();

const apiRoutes = [
  { path: '/admin', route: AdminRoutes },
  { path: '/admin', route: StaffRoutes },
  { path: '/admin', route: RolesRouter },
  { path: '/staff', route: setStuffRoutes },
  { path: '/report', route: ReportRoutes },
  { path: '/contact', route: ClientRoutes },
  { path: '/invoice', route: invoiceRoutes },
  { path: '/leads', route: LeadsRoutes },
  { path: '/appointment', route: AppointmentRoutes },
  { path: '/calendar', route: CalendarRoutes },
  { path: '/class', route: ClassRoutes },
  { path: '/event', route: EventRoutes },
  { path: '/notification', route: NotificationRoutes },
];

apiRoutes.forEach(route => {
  console.log(`Registering route: /api/v1${route.path}`);
  router.use(route.path, route.route);
});

export default router;
