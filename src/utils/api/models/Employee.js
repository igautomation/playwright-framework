/**
 * Employee model
 */
class Employee {
  /**
   * Constructor
   * @param {Object} data - Employee data
   */
  constructor(data = {}) {
    this.id = data.id || null;
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.employeeId = data.employeeId || '';
    this.joinDate = data.joinDate || new Date();
    this.department = data.department || '';
    this.position = data.position || '';
    this.salary = data.salary || 0;
    this.status = data.status || 'Active';
  }

  /**
   * Get full name
   * @returns {string} Full name
   */
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Get formatted join date
   * @returns {string} Formatted date
   */
  getFormattedJoinDate() {
    return this.joinDate instanceof Date 
      ? this.joinDate.toISOString().split('T')[0]
      : this.joinDate;
  }

  /**
   * Convert to API payload
   * @returns {Object} API payload
   */
  toApiPayload() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      employeeId: this.employeeId,
      joinDate: this.getFormattedJoinDate(),
      department: this.department,
      position: this.position,
      status: this.status
    };
  }

  /**
   * Convert to UI form data
   * @returns {Object} UI form data
   */
  toFormData() {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      employeeId: this.employeeId,
      joinDate: this.getFormattedJoinDate()
    };
  }
  
  /**
   * Convert to JSON object
   * @returns {Object} JSON representation of the employee
   */
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      employeeId: this.employeeId,
      joinDate: this.getFormattedJoinDate(),
      department: this.department,
      position: this.position,
      salary: this.salary,
      status: this.status
    };
  }
  
  /**
   * Validate employee data against business rules
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];
    
    // Check required fields
    if (!this.firstName) {
      errors.push('First name is required');
    }
    
    if (!this.lastName) {
      errors.push('Last name is required');
    }
    
    if (!this.employeeId) {
      errors.push('Employee ID is required');
    }
    
    // Check email format if provided
    if (this.email && !this.email.includes('@')) {
      errors.push('Invalid email format');
    }
    
    // Check status is valid
    const validStatuses = ['Active', 'On Leave', 'Terminated'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }
    
    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : null
    };
  }
}

module.exports = Employee;