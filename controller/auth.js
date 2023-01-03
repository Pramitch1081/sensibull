const UserModel = require('../model/user');
const ParentModel = require('../model/parent');
const StudentModel = require('../model/student');

const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');
const successResponse = require('../utils/successResponse');

exports.getMe = catchAsync(async (req, res, next) => {
	const { _id: id, type } = req.user;
	let model = null;

	switch (type) {
		case 'USER':
			model = UserModel;
			break;
		case 'PARENT':
			model = ParentModel;
			break;
		case 'STUDENT':
			model = StudentModel;
			break;
		default:
			model = null;
			break;
	}

	if (!model) return next(new ErrorResponse('Not authorized', 401));

	const user = await model.findById(id).populate('profile_type school_id');

	if (!user) return next(new ErrorResponse('User not found', 404));

	res.status(200).json(successResponse(user, 1));
});
