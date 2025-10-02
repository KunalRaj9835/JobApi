const userModel = require('../models/user.model');

exports.registerUser = async (req, res) => {
    try {
        const user = await userModel.create(req.body, req.file);
        const token = userModel.generateAuthToken(user.id);

        res.status(201).json({
            message: "User registered successfully",
            user,
            token
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
