"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("../app/modules/Admin/routes")); // Fix this import
const route_1 = __importDefault(require("../app/modules/role/route")); // Fix this import
const staff_routes_1 = __importDefault(require("../app/modules/staff/staff.routes"));
const set_staff_routes_1 = __importDefault(require("../app/modules/staff/set.staff.routes"));
const Report_Routes_1 = __importDefault(require("../app/modules/Report/Report.Routes"));
const client_routes_1 = __importDefault(require("../app/modules/contact/client.routes"));
const invoice_Route_1 = __importDefault(require("../app/modules/invoice/invoice.Route"));
const leads_routes_1 = __importDefault(require("../app/modules/contact/leads.routes"));
const appoinment_routes_1 = __importDefault(require("../app/modules/contact/appoinment.routes"));
const class_Route_1 = __importDefault(require("../app/modules/class/class.Route"));
const event_routes_1 = __importDefault(require("../app/modules/event/event.routes"));
const notification_Routes_1 = __importDefault(require("../app/modules/notification/notification.Routes"));
const calendar_Routes_1 = __importDefault(require("../app/modules/calender/calendar.Routes"));
const router = express_1.default.Router();
const apiRoutes = [
    { path: '/admin', route: routes_1.default },
    { path: '/admin', route: staff_routes_1.default },
    { path: '/admin', route: route_1.default },
    { path: '/staff', route: set_staff_routes_1.default },
    { path: '/report', route: Report_Routes_1.default },
    { path: '/contact', route: client_routes_1.default },
    { path: '/invoice', route: invoice_Route_1.default },
    { path: '/leads', route: leads_routes_1.default },
    { path: '/appointment', route: appoinment_routes_1.default },
    { path: '/calendar', route: calendar_Routes_1.default },
    { path: '/class', route: class_Route_1.default },
    { path: '/event', route: event_routes_1.default },
    { path: '/notification', route: notification_Routes_1.default },
];
apiRoutes.forEach(route => {
    router.use(route.path, route.route);
});
exports.default = router;
