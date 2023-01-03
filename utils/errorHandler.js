const ErrorResponse = require('./errorResponse');
const winston = require('../config/winston');

const { NODE_ENV } = process.env;

// Dev error response
const sendErrorDev = (err, req, res) => {
	console.error(err);

	res.status(err.statusCode).json({
		isSuccess: false,
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});
};

// Prod error response
const sendErrorProd = (err, req, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			isSuccess: false,
			status: err.status,
			message: err.message,
		});

		// Programming or other unknown error
	} else {
		console.error('ERROR: ', err);

		res.status(500).json({
			isSuccess: false,
			status: 'error',
			message: 'Something went wrong!',
		});
	}
};

const modifyError = error => {
	const err = { ...error };

	// JWT Expired
	if (error.name === 'TokenExpiredError') {
		const message = 'Invalid Token';
		return new ErrorResponse(message, 401);
	}

	if (error.name === 'JsonWebTokenError') {
		const message = 'Invalid Token';
		return new ErrorResponse(message, 401);
	}

	// Mongoose bad ObjectId
	if (error.name === 'CastError') {
		const message = `Invalid ${err.path}: ${err.value}`;
		return new ErrorResponse(message, 400);
	}

	// Mongoose duplicate key
	if (error.code === 11000) {
		const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
		const message = `Duplicate field value: ${value}. Please use anothe value!`;
		return new ErrorResponse(message, 400);
	}

	// Mongoose validation error
	if (error.name === 'ValidationError') {
		const errors = Object.values(err.errors).map(el => el.message);

		const message = `Invalid input data. ${errors.join('. ')}`;
		return new ErrorResponse(message, 400);
	}

	// ENOTFOUND
	if (error.code === 'ENOTFOUND') {
		const message = `ERROR`;
		return new ErrorResponse(message, 500);
	}

	if (error.code === 'ESOCKET') {
		const message = `Network Error`;
		return new ErrorResponse(message, 400);
	}

	// verify email
	if (error.name === 'emailverifier') {
		const message = `Invalid Email`;
		return new ErrorResponse(message, 400);
	}

	// File system error
	if (error.code === 'ENOENT') {
		const message = 'Page not found';
		return new ErrorResponse(message, 404);
	}

	return error;
};

const errorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	winston.error(
		`${err.status || 500} - ${err.message} - ${req.originalUrl} - 
		${req.method} - ${req.ip}`
	);

	if (NODE_ENV === 'preprod' || NODE_ENV === 'production') {
		const error = modifyError(err);

		sendErrorProd(error, req, res);
	} else {
		sendErrorDev(err, req, res);
	}
};

module.exports = errorHandler;
