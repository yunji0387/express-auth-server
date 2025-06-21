import { jest } from '@jest/globals';

let GetUser;

beforeAll(async () => {
  const auth = await import('../../auth.js');
  GetUser = auth.GetUser;
});

describe('GetUser Controller', () => {
  it('should return user info with status 200', async () => {
    const req = {
      user: {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      end: jest.fn()
    };

    await GetUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      user: {
        first_name: 'Jane',
        last_name: 'Doe',
        email: 'jane@example.com'
      }
    });
    expect(res.end).toHaveBeenCalled();
  });
});