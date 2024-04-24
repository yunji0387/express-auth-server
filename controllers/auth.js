import User from "../models/User.js";

export async function Register(req, res) {
    const { first_name, last_name, email, password } = req.body;
    try {
        const newUser = new User({
            first_name,
            last_name,
            email,
            password,
        });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });
        }
        const savedUser = await newUser.save();
        // const userObject = savedUser.toObject();
        // let { _id, __v, role, ...userWithoutSensitiveData } = userObject;
        // console.log(userWithoutSensitiveData);
        res.status(200).json({
            status: "success",
            // data: [userWithoutSensitiveData],
            data: [],
            message: "Thank you for registering with us. Your account has been successfully created.",
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
            details: error.message,
        });
    }
    res.end();
}