import { jest } from '@jest/globals';

let Verify;

beforeAll(async () => {
  const auth = await import('../../auth.js');
  Verify = auth.Verify;
});

describe('Verify Controller', () => {
  it('should return authenticated success message', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await Verify(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "You are authenticated",
    });
  });
});