import { jest } from '@jest/globals';

// ESM: Provide both default and named export for bcrypt
const mockCompare = jest.fn();
jest.unstable_mockModule('bcrypt', () => ({
  default: { compare: mockCompare },
  compare: mockCompare
}));

// Mock User model
const mockFindOne = { select: jest.fn() };
jest.unstable_mockModule('../../../models/User.js', () => ({
  default: { findOne: jest.fn().mockReturnValue(mockFindOne) }
}));

let Login, User, bcrypt;

beforeAll(async () => {
  User = (await import('../../../models/User.js')).default;
  bcrypt = (await import('bcrypt')).default; // <-- Add this line
  const auth = await import('../../auth.js');
  Login = auth.Login;
});

describe('Login Controller', () => {
  let req, res;

  beforeEach(() => {
    // Setup request and response objects
    req = {
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      end: jest.fn()
    };

    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up default mock behavior
    mockFindOne.select.mockReset();
    User.findOne.mockReset();
    bcrypt.compare.mockReset();
  });

  it('should successfully log in a user with valid credentials', async () => {
    // Mock user found with valid credentials
    const mockUser = {
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
      password: 'hashedPassword',
      generateAccessJWT: jest.fn().mockReturnValue('mockJWTToken')
    };
    
    mockFindOne.select.mockResolvedValue(mockUser);
    User.findOne.mockReturnValue(mockFindOne);
    bcrypt.compare.mockResolvedValue(true);

    // Call the controller
    await Login(req, res);

    // Verify behavior
    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockFindOne.select).toHaveBeenCalledWith('+password');
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(mockUser.generateAccessJWT).toHaveBeenCalled();
    expect(res.cookie).toHaveBeenCalledWith('SessionID', 'mockJWTToken', expect.objectContaining({
      httpOnly: true,
      secure: true
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: 'success',
      data: [{ 
        first_name: 'Test', 
        last_name: 'User', 
        email: 'test@example.com' 
      }],
      message: 'You have successfully logged in.'
    });
  });

  it('should return 401 if user is not found', async () => {
    // Mock user not found
    mockFindOne.select.mockResolvedValue(null);
    User.findOne.mockReturnValue(mockFindOne);

    // Call the controller
    await Login(req, res);

    // Verify behavior
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: 'failed',
        data: [],
        message: 'Invalid email or password. Please try again with the correct credentials.'
      }
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should return 401 if password is invalid', async () => {
    // Mock user found but password doesn't match
    const mockUser = {
      email: 'test@example.com',
      password: 'hashedPassword'
    };
    
    mockFindOne.select.mockResolvedValue(mockUser);
    User.findOne.mockReturnValue(mockFindOne);
    bcrypt.compare.mockResolvedValue(false);

    // Call the controller
    await Login(req, res);

    // Verify behavior
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: 'failed',
        data: [],
        message: 'Invalid email or password. Please try again with the correct credentials.'
      }
    });
  });

  it('should handle internal server errors', async () => {
    // Mock a database error
    const errorMessage = 'Database connection failed';
    mockFindOne.select.mockRejectedValue(new Error(errorMessage));
    User.findOne.mockReturnValue(mockFindOne);

    // Call the controller
    await Login(req, res);

    // Verify behavior
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: 'error',
        code: 500,
        data: [],
        message: 'Internal Server Error.',
        details: errorMessage
      }
    });
  });
});