export default class DuplicateEmailError extends Error {
  constructor() {
    super('The email is already in use');
    this.name = 'DuplicateEmailError';
  }
}
