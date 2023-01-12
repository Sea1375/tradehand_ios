import NotFoundPage from '../pages/404.vue';

import SelfProjects from '../pages/projects/index-self';
import Projects from '../pages/projects/index';
import ProjectShow from '../pages/projects/show';
import ProjectCreate from '../pages/projects/create';
import ProjectEdit from '../pages/projects/edit';

import ClientIndex from '../pages/client/index';
import ClientCreate from '../pages/client/create';
import ClientEdit from '../pages/client/edit';
import ClientShow from '../pages/client/show';

import SelfLeads from '../pages/lead/index-self';
import Leads from '../pages/lead/index';
import LeadCreate from '../pages/lead/create';
import LeadEdit from '../pages/lead/edit';
import LeadShow from '../pages/lead/show';

import Employee from '../pages/employee/index';
import EmployeeShow from '../pages/employee/show';
import EmployeeCreate from '../pages/employee/create';
import EmployeeEdit from '../pages/employee/edit';

import Expense from '../pages/expense/index';
import ExpenseShow from '../pages/expense/show';
import ExpenseCreate from '../pages/expense/create';
import ExpenseEdit from '../pages/expense/edit';

import Attendance from '../pages/attendance/index';

import Leave from '../pages/leave/index';
import LeaveShow from '../pages/leave/show';
import LeaveCreate from '../pages/leave/create';
import LeaveEdit from '../pages/leave/edit';

import SelfTasks from '../pages/tasks/index-self';
import Tasks from '../pages/tasks/index';
import TasksShow from '../pages/tasks/show';
import TaskCreate from '../pages/tasks/create';
import TaskEdit from '../pages/tasks/edit';

import NoticeIndex from '../pages/noticeboard/index';
import NoticeShow from '../pages/noticeboard/show';

import MessageIndex from '../pages/message/index';
import MessageShow from '../pages/message/show';
import MessageCreate from '../pages/message/create';

import SelfTicket from '../pages/ticket/index-self';
import TicketIndex from '../pages/ticket/index';
import TicketShow from '../pages/ticket/show';
import TicketCreate from '../pages/ticket/create';

import EstimateIndex from '../pages/estimates/index';
import EstimateShow from '../pages/estimates/show';

import InvoiceIndex from '../pages/invoices/index';
import InvoiceShow from '../pages/invoices/show';

import Calendar from '../pages/event/calendar';
import EventShow from '../pages/event/show';

import Dashboard from '../pages/dashboard';

import TimerIndex from '../pages/timer/index';

import  About from '../pages/about.vue';
export default [

  {
    path: '/self/',
    name:'dashboard',
    component: Dashboard
  },
  {
    path: '/',
    name:'dashboard',
    component: Dashboard
  },
  {
    path: '/about/',
    name: 'about',
    component: About
  },
  {
    path: '/projects',
    name: 'projects',
    component: Projects
  },
  {
    path: '/project/create',
    name:'projects.create',
    component: ProjectCreate
  },
  {
    path: '/project/:id/self/tasks',
    name:'projects.tasks',
    component: SelfTasks
  },
  {
    path: '/project/:id/tasks',
    name:'projects.tasks',
    component: Tasks
  },
  {
    path: '/project/:id/edit',
    name:'projects.edit',
    component: ProjectEdit
  },
  {
    path: '/project/:id',
    name:'projects.show',
    component: ProjectShow
  },
  {
    path: '/self/projects',
    name: 'projects.self',
    component: SelfProjects
  },
  {
    path: '/self/project/:id',
    name:'projects.show',
    component: ProjectShow
  },
  {
    path: '/clients',
    name: 'clients',
    component: ClientIndex
  },
  {
    path: '/client/create',
    name: 'client.create',
    component: ClientCreate
  },
  {
    path: '/client/:id/edit',
    name:'client.edit',
    component: ClientEdit
  },
  {
    path: '/client/:id',
    name: 'client.show',
    component: ClientShow
  },
  {
    path: '/leads',
    name: 'leads',
    component: Leads
  },
  {
    path: '/self/leads',
    name: 'leads.self',
    component: SelfLeads
  },
  {
    path: '/lead/create',
    name: 'lead.create',
    component: LeadCreate
  },
  {
    path: '/self/lead/create',
    name: 'lead.create',
    component: LeadCreate
  },
  {
    path: '/lead/:id/edit',
    name:'lead.edit',
    component: LeadEdit
  },
  {
    path: '/self/lead/:id/edit',
    name:'lead.edit',
    component: LeadEdit
  },
  {
    path: '/lead/:id',
    name: 'lead.show',
    component: LeadShow
  },
  {
    path: '/self/lead/:id',
    name: 'lead.show',
    component: LeadShow
  },
  {
    path: '/employees',
    name:'employee',
    component: Employee
  },
  {
    path: '/employee/create',
    name:'employee.create',
    component: EmployeeCreate
  },
  {
    path: '/employee/:id/edit',
    name:'employee.edit',
    component: EmployeeEdit
  },
  {
    path: '/employee/:id',
    name:'employee.show',
    component: EmployeeShow
  },
  {
    path: '/leaves',
    name:'leave',
    component: Leave
  },
  {
    path: '/leave/create',
    name:'leave.create',
    component: LeaveCreate
  },
  {
    path: '/leave/:id/edit',
    name:'leave.edit',
    component: LeaveEdit
  },
  {
    path: '/leave/:id',
    name:'leave.show',
    component: LeaveShow
  },
  {
    path: '/self/leaves',
    name:'leave',
    component: Leave
  },
  {
    path: '/self/leave/create',
    name:'leave.create',
    component: LeaveCreate
  },
  {
    path: '/self/leave/:id/edit',
    name:'leave.edit',
    component: LeaveEdit
  },
  {
    path: '/self/leave/:id',
    name:'leave.show',
    component: LeaveShow
  },
  {
    path: '/expenses',
    name:'expense',
    component: Expense
  },
  {
    path: '/expense/create',
    name:'expense.create',
    component: ExpenseCreate
  },
  {
    path: '/expense/:id/edit',
    name:'expense.edit',
    component: ExpenseEdit
  },
  {
    path: '/expense/:id',
    name:'expense.show',
    component: ExpenseShow
  },
  {
    path: '/self/expenses',
    name:'expense',
    component: Expense
  },
  {
    path: '/self/expense/create',
    name:'expense.create',
    component: ExpenseCreate
  },
  {
    path: '/self/expense/:id/edit',
    name:'expense.edit',
    component: ExpenseEdit
  },
  {
    path: '/self/expense/:id',
    name:'expense.show',
    component: ExpenseShow
  },
  {
    path: '/tasks',
    name:'tasks',
    component: Tasks
  },
  {
    path: '/task/create',
    name:'task.create',
    component: TaskCreate
  },
  {
    path: '/task/:id',
    name:'task.show',
    component: TasksShow
  },
  {
    path: '/task/:id/edit',
    name:'task.edit',
    component: TaskEdit
  },
  {
    path: '/self/tasks',
    name:'tasks.self',
    component: SelfTasks
  },
  {
    path: '/self/task/create',
    name:'task.create',
    component: TaskCreate
  },
  {
    path: '/self/task/:id',
    name:'task.show',
    component: TasksShow
  },
  {
    path: '/self/task/:id/edit',
    name:'task.edit',
    component: TaskEdit
  },
  {
    path: '/notice',
    name: 'notice',
    component: NoticeIndex
  },
  {
    path: '/notice/:id',
    name: 'notice.show',
    component: NoticeShow
  },
  {
    path: '/self/notice',
    name: 'notice',
    component: NoticeIndex
  },
  {
    path: '/self/notice/:id',
    name: 'notice.show',
    component: NoticeShow
  },
  {
    path: '/estimates',
    name: 'estimates',
    component: EstimateIndex
  },
  {
    path: '/estimate/:id',
    name: 'estimate.show',
    component: EstimateShow
  },
  {
    path: '/invoices',
    name: 'invoices',
    component: InvoiceIndex
  },
  {
    path: '/invoice/:id',
    name: 'invoice.show',
    component: InvoiceShow
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: Calendar
  },
  {
    path: '/event/:id',
    name: 'event.show',
    component: EventShow
  },
  {
    path: '/attendance',
    name:'attendance',
    component: Attendance
  },
  {
    path: '/messages',
    name: 'messages',
    component: MessageIndex
  },
  {
    path: '/message/create',
    name: 'message.create',
    component: MessageCreate
  },
  {
    path: '/message/:id',
    name: 'message.show',
    component: MessageShow
  },
  {
    path: '/tickets',
    name: 'tickets',
    component: TicketIndex
  },
  {
    path: '/self/tickets',
    name: 'tickets.self',
    component: SelfTicket
  },
  {
    path: '/ticket/create',
    name: 'ticket.create',
    component: TicketCreate
  },
  {
    path: '/self/ticket/create',
    name: 'ticket.create',
    component: TicketCreate
  },
  {
    path: '/ticket/:id',
    name: 'ticket.show',
    component: TicketShow
  },
  {
    path: '/self/ticket/:id',
    name: 'ticket.show',
    component: TicketShow
  },
  {
    path: '/self/timer',
    name: 'timer',
    component: TimerIndex
  },
  {
    path: '(.*)',
    name: '404',
    component: NotFoundPage,
  },
];
