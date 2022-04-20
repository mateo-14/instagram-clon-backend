// @ts-nocheck

import loginValidator from 'auth/validators/login.validator';
import signupValidator from 'auth/validators/signup.validator';

async function testValidator(validator, mockRequest, mockResponse) {
  const next = jest.fn();

  for (let i = 0; i < validator.length - 1; i++) {
    await validator[i](mockRequest, mockResponse, next);
  }
  await validator[validator.length - 1](mockRequest, mockResponse, next);
}

let mockRequest;
let mockResponse;

beforeEach(() => {
  mockRequest = {};
  mockResponse = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
  };
});

describe('Signup validator', () => {
  test('Should return Username is required', async () => {
    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.username).toBe('Username is required');
  });

  test('Should return Username must be 3 to 25 characters long (Lower than min)', async () => {
    mockRequest.body = {
      username: '1',
    };

    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.username).toBe('Username must be 3 to 25 characters long');
  });

  test('Should return Username must be 3 to 25 characters long (Greater than max)', async () => {
    mockRequest.body = {
      username: 'averyveryveryveryverylongusername',
    };

    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.username).toBe('Username must be 3 to 25 characters long');
  });

  test('Should return Username must contains only letters, numbers, dots and underscores', async () => {
    mockRequest.body = {
      username: '.$invalid..use#rnameñ',
    };

    await testValidator(signupValidator, mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.username).toBe(
      'Username must contains only letters, numbers, dots and underscores'
    );
  });

  test('Should return Password is required', async () => {
    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.password).toBe('Password is required');
  });

  test('Should return Password must be 4 to 25 characters long (Lower than min)', async () => {
    mockRequest.body = { password: 'css' };
    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.password).toBe('Password must be 4 to 25 characters long');
  });

  test('Should return Password must be 4 to 25 characters long (Greater than max)', async () => {
    mockRequest.body = { password: 'Cascading Style Sheets Language' };
    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.password).toBe('Password must be 4 to 25 characters long');
  });

  test('Should return Name must be less than 30 characters', async () => {
    mockRequest.body = { displayName: 'This name is too long. Hmmmmmmm' };
    await testValidator(signupValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.displayName).toBe('Name must be less than 30 characters');
  });
});

describe('Login validator', () => {
  test('Should return Username is required', async () => {
    await testValidator(loginValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.username).toBe('Username is required');
  });

  test('Should return Password is required', async () => {
    await testValidator(loginValidator, mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toBeCalled();
    const errors = mockResponse.json.mock.calls[0][0];
    expect(errors.errors.password).toBe('Password is required');
  });
});
