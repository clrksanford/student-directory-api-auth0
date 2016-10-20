const mongoose = require('mongoose');

const studentSchema = {
  firstName: String,
  lastName: String,
  email: String,
  slackHandle: String,
  currentlyEnrolled: Boolean
}

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
