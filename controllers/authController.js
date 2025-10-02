const UserModel = require('../models/user.model');

class AuthController {
    // POST /signup - Register new user
    async signup(req, res) {
        try {
            const { name, email, password, userType, profileHeadline, address } = req.body;

            // Validation
            if (!name || !email || !password || !userType || !profileHeadline || !address) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required (name, email, password, userType, profileHeadline, address)'
                });
            }

            // Validate userType
            if (userType !== 'Admin' && userType !== 'Applicant') {
                return res.status(400).json({
                    success: false,
                    message: 'userType must be either "Admin" or "Applicant"'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Check if user already exists
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const hashedPassword = await UserModel.hashPassword(password);

            // Create user
            const userData = {
                name,
                email,
                password_hash: hashedPassword,
                user_type: userType,
                profile_headline: profileHeadline,
                address
            };

            const newUser = await UserModel.create(userData);

            // Generate JWT token
            const token = UserModel.generateAuthToken(newUser.id, newUser.user_type);

            // Remove password from response
            const userResponse = {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                userType: newUser.user_type,
                profileHeadline: newUser.profile_headline,
                address: newUser.address
            };

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Signup error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during signup',
                error: error.message
            });
        }
    }

    // POST /login - Authenticate user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user by email
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Compare password
            const isPasswordValid = await UserModel.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate JWT token
            const token = UserModel.generateAuthToken(user.id, user.user_type);

            // Remove password from response
            const userResponse = {
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.user_type,
                profileHeadline: user.profile_headline,
                address: user.address
            };

            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error during login',
                error: error.message
            });
        }
    }
}

module.exports = new AuthController();