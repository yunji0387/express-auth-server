import { validationResult } from 'express-validator';

const Validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Retrieve the first error message
        const firstErrorMessage = errors.array()[0].msg;

        // Return it under a 'message' key
        return res.status(422).json({
            error: {
                message: firstErrorMessage
            }
        });
    }
    next();
};

export default Validate;