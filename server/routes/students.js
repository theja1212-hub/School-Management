const crudRouter = require('../utils/crudRouter');
const Student = require('../models/Student');

module.exports = crudRouter(Student, {
  readRoles: ['admin', 'teacher', 'student'],
  writeRoles: ['admin'],
});