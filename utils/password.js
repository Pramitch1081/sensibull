const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports = {
	async getHash(pass) {
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(pass, salt);
		return hash;
	},
	genJwtToken({ type = 'USER', id }) {
		const payload = { type, id };

		return jwt.sign(payload, process.env.JWT_SECRET, {
			expiresIn: '60d',
		});
	},
};
