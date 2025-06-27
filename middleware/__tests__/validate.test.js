let jestGlobals, Validate, validationResultMock;

beforeAll(async () => {
  jestGlobals = await import('@jest/globals');
  const { jest } = jestGlobals;

  // Mock express-validator
  validationResultMock = jest.fn();
  await jest.unstable_mockModule('express-validator', () => ({
    validationResult: validationResultMock
  }));

  // Import Validate after mocking
  Validate = (await import('../validate.js')).default;
});

afterEach(() => {
  jestGlobals.jest.clearAllMocks();
});

describe('Validate middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jestGlobals.jest.fn().mockReturnThis(),
      json: jestGlobals.jest.fn()
    };
    next = jestGlobals.jest.fn();
  });

  it('should call next() if there are no validation errors', () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => true,
      array: () => []
    });

    Validate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return 422 and the first error message if there are validation errors', () => {
    validationResultMock.mockReturnValue({
      isEmpty: () => false,
      array: () => [
        { msg: 'Email is invalid' },
        { msg: 'Password is too short' }
      ]
    });

    Validate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: { message: 'Email is invalid' }
    });
    expect(next).not.toHaveBeenCalled();
  });
});