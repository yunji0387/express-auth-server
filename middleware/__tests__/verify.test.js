let jestGlobals, VerifyToken, VerifyRole, User, Blacklist, jwt;
let mockFindOne, mockFindById;

beforeAll(async () => {
  jestGlobals = await import('@jest/globals');
  const { jest } = jestGlobals;

  // Mock Blacklist and User
  mockFindOne = jest.fn();
  mockFindById = jest.fn();

  await jest.unstable_mockModule('../../models/Blacklist.js', () => ({
    default: { findOne: mockFindOne }
  }));
  await jest.unstable_mockModule('../../models/User.js', () => ({
    default: { findById: mockFindById }
  }));

  // Mock JWT
  await jest.unstable_mockModule('jsonwebtoken', () => ({
    default: {
      verify: jest.fn()
    }
  }));

  // Mock config
  await jest.unstable_mockModule('../../config/index.js', () => ({
    SECRET_ACCESS_TOKEN: 'test-secret'
  }));

  // Import after mocks
  ({ VerifyToken, VerifyRole } = await import('../verify.js'));
  jwt = (await import('jsonwebtoken')).default;
  User = (await import('../../models/User.js')).default;
  Blacklist = (await import('../../models/Blacklist.js')).default;
});

afterEach(() => {
  jestGlobals.jest.clearAllMocks();
});

describe('VerifyToken middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: jestGlobals.jest.fn().mockReturnThis(),
      json: jestGlobals.jest.fn(),
      sendStatus: jestGlobals.jest.fn()
    };
    next = jestGlobals.jest.fn();
  });

  it('should return 401 if no cookie header', async () => {
    await VerifyToken(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is blacklisted', async () => {
    req.headers.cookie = 'SessionID=blacklistedtoken;';
    mockFindOne.mockResolvedValue({ token: 'blacklistedtoken' });

    await VerifyToken(req, res, next);

    expect(mockFindOne).toHaveBeenCalledWith({ token: 'blacklistedtoken' });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "failed",
        message: "This session has expired. Please login to continue.",
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if jwt.verify fails', async () => {
    req.headers.cookie = 'SessionID=validtoken;';
    mockFindOne.mockResolvedValue(null);
    jwt.verify.mockImplementation((token, secret, cb) => cb(new Error('jwt expired')));

    await VerifyToken(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'test-secret', expect.any(Function));
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "failed",
        message: "This session has expired. Please login to continue.",
        details: "jwt expired"
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user to req and call next if valid', async () => {
    req.headers.cookie = 'SessionID=goodtoken;';
    mockFindOne.mockResolvedValue(null);
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { id: 'user123' }));
    mockFindById.mockResolvedValue({ _doc: { _id: 'user123', email: 'a@b.com', password: 'secret', role: '0x88' } });

    await VerifyToken(req, res, next);

    expect(mockFindById).toHaveBeenCalledWith('user123');
    expect(req.user).toEqual({ _id: 'user123', email: 'a@b.com', role: '0x88' });
    expect(next).toHaveBeenCalled();
  });

  it('should return 500 on internal error', async () => {
    req.headers.cookie = 'SessionID=goodtoken;';
    mockFindOne.mockRejectedValue(new Error('db error'));

    await VerifyToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "error",
        message: "Internal Server Error",
        code: 500,
        data: [],
        details: "db error"
      }
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe('VerifyRole middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: { role: '0x88' } };
    res = {
      status: jestGlobals.jest.fn().mockReturnThis(),
      json: jestGlobals.jest.fn()
    };
    next = jestGlobals.jest.fn();
  });

  it('should call next if user has role 0x88', () => {
    VerifyRole(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should return 401 if user does not have role 0x88', () => {
    req.user.role = '0x01';
    VerifyRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "failed",
        message: "You are not authorized to view this page.",
      }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 500 on internal error', () => {
    req.user = null; // will cause error
    VerifyRole(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "error",
        code: 500,
        data: [],
        message: "Internal Server Error",
      }
    });
    expect(next).not.toHaveBeenCalled();
  });
});