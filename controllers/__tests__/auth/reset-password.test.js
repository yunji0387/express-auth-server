import { jest } from '@jest/globals';

// Mock User model
const mockFindOne = jest.fn();
const mockSave = jest.fn();
const mockGenerateResetPasswordToken = jest.fn();

jest.unstable_mockModule('../../../models/User.js', () => ({
    default: {
        findOne: mockFindOne
    }
}));

// Mock transporter
const mockSendMail = jest.fn();
jest.unstable_mockModule('../../../config/index.js', () => ({
    transporter: { sendMail: mockSendMail },
    SECRET_ACCESS_TOKEN: 'mock-secret',
}));

let RequestResetPassword, ResetPassword, VerifyResetPasswordToken, User, transporter;

beforeAll(async () => {
    User = (await import('../../../models/User.js')).default;
    transporter = (await import('../../../config/index.js')).transporter;
    const auth = await import('../../auth.js');
    RequestResetPassword = auth.RequestResetPassword;
    ResetPassword = auth.ResetPassword;
    VerifyResetPasswordToken = auth.VerifyResetPasswordToken;
});

describe('RequestResetPassword Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { body: { email: 'test@example.com' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        mockFindOne.mockReset();
        mockSave.mockReset();
        mockSendMail.mockReset();
        mockGenerateResetPasswordToken.mockReset();
    });

    it('should return 404 if user not found', async () => {
        mockFindOne.mockResolvedValue(null);

        await RequestResetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "failed",
                data: [],
                message: "User not found.",
            }
        });
    });

    it('should send reset email if user exists', async () => {
        const mockUser = {
            generateResetPasswordToken: mockGenerateResetPasswordToken,
            save: mockSave
        };
        mockFindOne.mockResolvedValue(mockUser);
        mockGenerateResetPasswordToken.mockReturnValue('resettoken');
        mockSave.mockResolvedValue({});
        mockSendMail.mockImplementation((opts, cb) => cb(null, { response: 'ok' }));

        await RequestResetPassword(req, res);

        expect(mockFindOne).toHaveBeenCalledWith({ email: 'test@example.com' });
        expect(mockGenerateResetPasswordToken).toHaveBeenCalled();
        expect(mockSave).toHaveBeenCalled();
        expect(mockSendMail).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            message: "Password reset link sent to your email address.",
        });
    });

    it('should handle sendMail error', async () => {
        const mockUser = {
            generateResetPasswordToken: mockGenerateResetPasswordToken,
            save: mockSave
        };
        mockFindOne.mockResolvedValue(mockUser);
        mockGenerateResetPasswordToken.mockReturnValue('resettoken');
        mockSave.mockResolvedValue({});
        mockSendMail.mockImplementation((opts, cb) => cb(new Error('Mail error')));

        await RequestResetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Failed to send reset email.",
                details: "Mail error",
            }
        });
    });

    it('should handle internal server error', async () => {
        // Simulate User.findOne throwing an error
        mockFindOne.mockRejectedValue(new Error('DB failure'));

        const req = { body: { email: 'test@example.com' } };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await RequestResetPassword(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error.",
                details: "DB failure",
            }
        });
    });
});

describe('ResetPassword Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: { token: 'resettoken' },
            body: { password: 'newpass', confirmPassword: 'newpass' }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        mockFindOne.mockReset();
        mockSave.mockReset();
    });

    it('should return 400 if passwords do not match', async () => {
        req.body.confirmPassword = 'different';
        await ResetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "failed",
                data: [],
                message: "Passwords do not match.",
            }
        });
    });

    it('should return 400 if token is invalid or expired', async () => {
        mockFindOne.mockResolvedValue(null);
        await ResetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "failed",
                data: [],
                message: "Password reset token is invalid or has expired.",
            }
        });
    });

    it('should reset password if token is valid', async () => {
        const mockUser = {
            password: '',
            resetPasswordToken: 'resettoken',
            resetPasswordExpires: Date.now() + 10000,
            save: mockSave
        };
        mockFindOne.mockResolvedValue(mockUser);
        mockSave.mockResolvedValue({});

        await ResetPassword(req, res);

        expect(mockFindOne).toHaveBeenCalledWith({
            resetPasswordToken: 'resettoken',
            resetPasswordExpires: { $gt: expect.any(Number) }
        });
        expect(mockSave).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            message: "Password has been reset.",
        });
    });

    it('should handle server error', async () => {
        mockFindOne.mockRejectedValue(new Error('DB error'));
        await ResetPassword(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error.",
                details: "DB error",
            }
        });
    });
});

describe('VerifyResetPasswordToken Controller', () => {
    let req, res;

    beforeEach(() => {
        req = { params: { token: 'resettoken' } };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
        mockFindOne.mockReset();
    });

    it('should return 400 if token is invalid or expired', async () => {
        mockFindOne.mockResolvedValue(null);
        await VerifyResetPasswordToken(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "failed",
                data: [],
                message: "Password reset token is invalid or has expired.",
            }
        });
    });

    it('should return 200 if token is valid', async () => {
        mockFindOne.mockResolvedValue({ resetPasswordToken: 'resettoken' });
        await VerifyResetPasswordToken(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            status: "success",
            message: "Password reset token is valid.",
        });
    });

    it('should handle server error', async () => {
        mockFindOne.mockRejectedValue(new Error('DB error'));
        await VerifyResetPasswordToken(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            error: {
                status: "error",
                code: 500,
                data: [],
                message: "Internal Server Error.",
                details: "DB error",
            }
        });
    });
});