export default class InvalidPasswordError extends Error {
  constructor() {
    super('The password is wrong');
    this.name = 'InvalidPasswordError';
  }
}
