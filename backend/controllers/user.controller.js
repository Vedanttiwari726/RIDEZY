const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // ✅ bcrypt only (as before)
const blackListTokenModel = require('../models/blacklistToken.model');

// ================= REGISTER USER =================
module.exports.registerUser = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullname: {
                firstname: fullname.firstname,
                lastname: fullname.lastname
            },
            email,
            password: hashedPassword
        });

        // 🔙 OLD STYLE JWT (as you had before)
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({ user, token });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= LOGIN USER =================
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 🔙 OLD STYLE JWT
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({ user, token });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= USER PROFILE =================
module.exports.getUserProfile = async (req, res) => {
    try {
        // OLD STYLE: fetch again using req.user.id
        const user = await userModel
            .findById(req.user.id)
            .select('-password');

        res.status(200).json({ user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ================= LOGOUT USER =================
module.exports.logoutUser = async (req, res) => {
    try {
        const token =
            req.cookies.token ||
            req.headers.authorization?.split(' ')[1];

        if (token) {
            await blackListTokenModel.create({ token });
        }

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
