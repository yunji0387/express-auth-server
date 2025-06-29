import { jest } from '@jest/globals';

// config/index.test.js

jest.unstable_mockModule('dotenv', () => ({ config: jest.fn() }));
jest.unstable_mockModule('nodemailer', () => ({
  default: { createTransport: jest.fn(() => ({ sendMail: jest.fn() })) }
}));
jest.unstable_mockModule('passport', () => ({
  default: {
    use: jest.fn(),
    serializeUser: jest.fn(),
    deserializeUser: jest.fn()
  }
}));
jest.unstable_mockModule('passport-google-oauth20', () => {
  let lastInstance;
  class MockStrategy {
    constructor(opts, verify) {
      this.opts = opts;
      this.verify = verify;
      lastInstance = this;
    }
    static getLastInstance() {
      return lastInstance;
    }
  }
  return { Strategy: MockStrategy };
});
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { sign: jest.fn(() => 'signed-jwt') }
}));
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockFindById = jest.fn();
jest.unstable_mockModule('../../models/User.js', () => ({
  default: {
    findOne: mockFindOne,
    findById: mockFindById,
    prototype: { save: mockSave }
  }
}));

let passport, Strategy, jwt, User, SECRET_ACCESS_TOKEN;

beforeAll(async () => {
  const config = await import('../index.js');
  passport = config.passport;
  SECRET_ACCESS_TOKEN = config.SECRET_ACCESS_TOKEN;
  Strategy = (await import('passport-google-oauth20')).Strategy;
  jwt = (await import('jsonwebtoken')).default;
  User = (await import('../../models/User.js')).default;

  // Capture the actual functions passed to the mocks
  serializeUserFn = passport.serializeUser.mock.calls[0][0];
  deserializeUserFn = passport.deserializeUser.mock.calls[0][0];
});

describe('Passport GoogleStrategy', () => {
  const profile = {
    id: 'google123',
    name: { givenName: 'John', familyName: 'Doe' },
    emails: [{ value: 'john@example.com' }]
  };
  const accessToken = 'access';
  const refreshToken = 'refresh';
  const done = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find existing user and return token', async () => {
    const user = { _id: 'id1' };
    mockFindOne.mockResolvedValue(user);

    const strategyInstance = Strategy.getLastInstance();
    await strategyInstance.verify(accessToken, refreshToken, profile, done);

    expect(mockFindOne).toHaveBeenCalledWith({ googleId: 'google123' });
    expect(jwt.sign).toHaveBeenCalledWith({ id: 'id1' }, SECRET_ACCESS_TOKEN, { expiresIn: '20m' });
    expect(done).toHaveBeenCalledWith(null, { user, token: 'signed-jwt' });
  });

  it('should create and save user if not found', async () => {
    mockFindOne.mockResolvedValue(null);
    const user = {
      googleId: 'google123',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      save: mockSave,
      _id: 'id2'
    };
    mockSave.mockResolvedValue(user);
    jwt.sign.mockReturnValue('signed-jwt2');

    // Simulate the constructor returning your user object
    const originalUser = User;
    const tempUser = function (data) {
      Object.assign(this, data);
      this.save = mockSave;
      this._id = 'id2';
    };
    Object.setPrototypeOf(tempUser, originalUser);


    const strategyInstance = Strategy.getLastInstance();
    await strategyInstance.verify(accessToken, refreshToken, profile, done);

    expect(mockFindOne).toHaveBeenCalledWith({ googleId: 'google123' });
  });

  it('should handle errors and call done with error', async () => {
    const error = new Error('db error');
    mockFindOne.mockRejectedValue(error);

    const strategyInstance = Strategy.getLastInstance();
    await strategyInstance.verify(accessToken, refreshToken, profile, done);

    expect(done).toHaveBeenCalledWith(error, null);
  });
});

describe('passport.serializeUser', () => {
  it('should call done with data', () => {
    const data = { foo: 'bar' };
    const done = jest.fn();
    serializeUserFn(data, done);
    expect(done).toHaveBeenCalledWith(null, data);
  });
});

describe('passport.deserializeUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should find user by id and call done', async () => {
    const user = { _id: 'id1' };
    mockFindById.mockResolvedValue(user);
    const data = { user: { _id: 'id1' }, token: 'tok' };
    const done = jest.fn();

    await deserializeUserFn(data, done);

    expect(mockFindById).toHaveBeenCalledWith('id1');
    expect(done).toHaveBeenCalledWith(null, { user, token: 'tok' });
  });

  it('should handle errors and call done with error', async () => {
    const error = new Error('fail');
    mockFindById.mockRejectedValue(error);
    const data = { user: { _id: 'id1' }, token: 'tok' };
    const done = jest.fn();

    await deserializeUserFn(data, done);

    expect(done).toHaveBeenCalledWith(error, null);
  });
});