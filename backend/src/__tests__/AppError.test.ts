import { AppError } from '../utils/AppError';

describe('AppError', () => {
  it('should create error with correct message and status', () => {
    const error = new AppError('Not found', 404);
    expect(error.message).toBe('Not found');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it('should be instance of Error', () => {
    const error = new AppError('Bad request', 400);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should have stack trace', () => {
    const error = new AppError('Server error', 500);
    expect(error.stack).toBeDefined();
  });
});
