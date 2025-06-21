import { jest } from '@jest/globals';

// Mock Blacklist model
const mockFindOne = jest.fn();
const mockSave = jest.fn();

jest.unstable_mockModule('../../../models/Blacklist.js', () => ({
  default: class {
    constructor(data) {
      Object.assign(this, data);
      this.save = mockSave;
    }
    static findOne = mockFindOne;
  }
}));

let Logout, Blacklist;

beforeAll(async () => {
  Blacklist = (await import('../../../models/Blacklist.js')).default;
  const auth = await import('../../auth.js');
  Logout = auth.Logout;
});

describe('Logout Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      headers: {
        cookie: 'SessionID=mocktoken;'
      }
    };
    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      sendStatus: jest.fn(),
      end: jest.fn()
    };
    jest.clearAllMocks();
    mockFindOne.mockReset();
    mockSave.mockReset();
  });

  it('should return 204 if no cookie header is present', async () => {
    req.headers = {};
    await Logout(req, res);
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should return 204 if token is already blacklisted', async () => {
    mockFindOne.mockResolvedValue({ token: 'mocktoken' });
    await Logout(req, res);
    expect(mockFindOne).toHaveBeenCalledWith({ token: 'mocktoken' });
    expect(res.sendStatus).toHaveBeenCalledWith(204);
  });

  it('should blacklist the token and return 200', async () => {
    mockFindOne.mockResolvedValue(null);
    mockSave.mockResolvedValue({});
    await Logout(req, res);
    expect(mockFindOne).toHaveBeenCalledWith({ token: 'mocktoken' });
    expect(mockSave).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith('Clear-Site-Data', '"cookies"');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "You are logged out!" });
  });

  it('should handle server errors', async () => {
    mockFindOne.mockRejectedValue(new Error('DB error'));
    await Logout(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: {
        status: "error",
        code: 500,
        data: [],
        message: "Internal Server Error",
      }
    });
  });
});