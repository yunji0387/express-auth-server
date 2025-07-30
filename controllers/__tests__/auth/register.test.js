import { jest } from '@jest/globals';

// Mock User model before importing Register
const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule('../../../models/User.js', () => ({
  default: class {
    constructor(data) {
      Object.assign(this, data);
      this.save = mockSave;
    }
    static findOne = mockFindOne;
  }
}));

// Import Register after mocking
let Register;
beforeAll(async () => {
  const auth = await import('../../auth.js');
  Register = auth.Register;
});

describe('Register Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      }
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };
    // Reset mocks before each test
    mockFindOne.mockReset();
    mockSave.mockReset();
  });

  it('should successfully register a new user', async () => {
    // Setup mocks
    mockFindOne.mockResolvedValue(null); // No existing user
    mockSave.mockResolvedValue({}); // Successful save

    // Call the function
    await Register(req, res);

    // Verify the behavior
    expect(mockFindOne).toHaveBeenCalledWith({ email: { $eq: 'john@example.com' } });
    expect(mockSave).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: [{
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com'
      }],
      message: 'Thank you for registering with us. Your account has been successfully created.'
    });
  });

  it('should return 400 if user already exists', async () => {
    // Setup mock to simulate existing user
    mockFindOne.mockResolvedValue({ email: 'john@example.com' });

    // Call the function
    await Register(req, res);

    // Verify the behavior
    expect(mockFindOne).toHaveBeenCalledWith({ email: { $eq: 'john@example.com' } });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: 'failed',
        data: [],
        message: 'It seems you already have an account, please log in instead.'
      }
    });
  });

  it('should handle internal server errors', async () => {
    // Setup mock to simulate error
    mockFindOne.mockRejectedValue(new Error('Database error'));

    // Call the function
    await Register(req, res);

    // Verify the behavior
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: 'error',
        code: 500,
        data: [],
        message: 'Internal Server Error',
        details: 'Database error'
      }
    });
  });
});