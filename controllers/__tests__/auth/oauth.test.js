import { jest } from '@jest/globals';

let GoogleAuth;

beforeAll(async () => {
  const auth = await import('../../auth.js');
  GoogleAuth = auth.GoogleAuth;
});

describe('GoogleAuth Controller', () => {
  it('should return Google Auth message', async () => {
    const req = {};
    const res = {
      json: jest.fn()
    };

    await GoogleAuth(req, res);

    expect(res.json).toHaveBeenCalledWith({ message: "Google Auth" });
  });
});