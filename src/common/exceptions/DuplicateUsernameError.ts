export default class DuplicateUsernameError extends Error {
  constructor() {
    super('The username is already in use');
    this.name = 'DuplicateUsernameError';
  }
}
