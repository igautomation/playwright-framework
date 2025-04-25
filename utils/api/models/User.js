class User {
    #id;
    #name;
    #email;
  
    constructor({ id, name, email }) {
      this.#id = id;
      this.#name = name;
      this.#email = email;
    }
  
    get id() {
      return this.#id;
    }
  
    set name(name) {
      this.#name = name;
    }
  
    get name() {
      return this.#name;
    }
  
    set email(email) {
      this.#email = email;
    }
  
    get email() {
      return this.#email;
    }
  
    toJSON() {
      return {
        id: this.#id,
        name: this.#name,
        email: this.#email,
      };
    }
  }
  
  module.exports = { User };