/**
 * Employee POJO model for API testing
 */
class Employee {
  // Private properties using # prefix
  #id;
  #firstName;
  #middleName;
  #lastName;
  #employeeId;
  #jobTitle;
  #status;
  #subUnit;
  #supervisor;

  /**
   * Constructor
   * @param {Object} employeeData - Employee data
   */
  constructor(employeeData = {}) {
    this.#id = employeeData.id || 0;
    this.#firstName = employeeData.firstName || '';
    this.#middleName = employeeData.middleName || '';
    this.#lastName = employeeData.lastName || '';
    this.#employeeId = employeeData.employeeId || '';
    this.#jobTitle = employeeData.jobTitle || '';
    this.#status = employeeData.status || '';
    this.#subUnit = employeeData.subUnit || '';
    this.#supervisor = employeeData.supervisor || '';
  }

  // Getters and setters
  get id() {
    return this.#id;
  }

  set id(value) {
    this.#id = value;
  }

  get firstName() {
    return this.#firstName;
  }

  set firstName(value) {
    this.#firstName = value;
  }

  get middleName() {
    return this.#middleName;
  }

  set middleName(value) {
    this.#middleName = value;
  }

  get lastName() {
    return this.#lastName;
  }

  set lastName(value) {
    this.#lastName = value;
  }

  get employeeId() {
    return this.#employeeId;
  }

  set employeeId(value) {
    this.#employeeId = value;
  }

  get jobTitle() {
    return this.#jobTitle;
  }

  set jobTitle(value) {
    this.#jobTitle = value;
  }

  get status() {
    return this.#status;
  }

  set status(value) {
    this.#status = value;
  }

  get subUnit() {
    return this.#subUnit;
  }

  set subUnit(value) {
    this.#subUnit = value;
  }

  get supervisor() {
    return this.#supervisor;
  }

  set supervisor(value) {
    this.#supervisor = value;
  }

  // Get full name
  get fullName() {
    return [this.#firstName, this.#middleName, this.#lastName]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Serialize to JSON
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.#id,
      firstName: this.#firstName,
      middleName: this.#middleName,
      lastName: this.#lastName,
      employeeId: this.#employeeId,
      jobTitle: this.#jobTitle,
      status: this.#status,
      subUnit: this.#subUnit,
      supervisor: this.#supervisor,
    };
  }

  /**
   * Deserialize from JSON
   * @param {Object} json - JSON object
   * @returns {Employee} Employee instance
   */
  static fromJSON(json) {
    return new Employee(json);
  }

  /**
   * Validate employee data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.#firstName) {
      errors.push('First name is required');
    }

    if (!this.#lastName) {
      errors.push('Last name is required');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

module.exports = Employee;
