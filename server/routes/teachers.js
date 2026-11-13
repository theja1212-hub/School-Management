const crudRouter = require('../utils/crudRouter');
const Teacher = require('../models/Teacher');

module.exports = crudRouter(Teacher, {
  readRoles: ['admin', 'teacher'],
  writeRoles: ['admin', 'teacher'],
});