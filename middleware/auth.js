const jwt = require('jsonwebtoken');

// const UserModel = require('../model/user');
// const ParentModel = require('../model/parent');
// const StudentModel = require('../model/student');

const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');

// keep strings in lowercase
const allowedRoutes = [
	'/api/v1/otp',
	'/api/get_token',
];

const authorize = catchAsync(async (req, res, next) => {
	if (allowedRoutes.includes(req.path.toLowerCase())) return next();

	const authHeader = req.headers.authorization;

	if (!authHeader) return next(new ErrorResponse('Not authorized', 401));

	const token = authHeader.split(' ')[1];

	if (!token) return next(new ErrorResponse('Not authorized', 401));

	const decoded = jwt.verify(token, process.env.JWT_SECRET);

	if (!decoded) return next(new ErrorResponse('Invalid token', 401));

	let model = null;

	switch (decoded.type) {
		case 'USER':
			// model = UserModel;
			break;
		case 'PARENT':
			// model = ParentModel;
			break;
		case 'STUDENT':
			// model = StudentModel;
			break;
		default:
			return next(new ErrorResponse('Invalid token', 401));
	}

	const user = await model
		.findById(decoded.id)
		.select({
			profile_type: 1,
			secondary_profile_type: 1,
			username: 1,
			school_id: 1,
			branch_id: 1,
			primary_class: 1,
			primary_section: 1,
			name: 1,
		})
		.lean();

	if (!user) return next(new ErrorResponse('Invalid token', 401));

	req.user = { ...user, type: decoded.type };

	next();
});

module.exports = authorize;
