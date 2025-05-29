/**
 * Environment Configuration
 * 
 * Centralized environment URLs and credentials
 */

// Base URLs for different environments
const urls = {
  orangeHRM: process.env.ORANGE_HRM_URL || 'https://opensource-demo.orangehrmlive.com',
  reqres: process.env.REQRES_API_URL || 'https://reqres.in',
  todoMVC: process.env.TODO_MVC_URL || 'https://todomvc.com/examples/vue/',
  salesforce: process.env.SALESFORCE_URL || 'https://login.salesforce.com'
};

// Paths for different applications
const paths = {
  orangeHRM: {
    login: '/web/index.php/auth/login',
    dashboard: '/web/index.php/dashboard/index',
    admin: '/web/index.php/admin/viewSystemUsers',
    pim: '/web/index.php/pim/viewEmployeeList'
  },
  reqres: {
    users: '/api/users',
    register: '/api/register',
    login: '/api/login'
  }
};

module.exports = {
  urls,
  paths
};