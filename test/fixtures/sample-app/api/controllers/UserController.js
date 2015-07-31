/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	index: function(req, res) {
		User.findAll({
			include: [
				{model: Image, as: 'images'}
			]
		}).then(function(users) {
			res.json(users);
		}).catch(function(err) {
			res.json(err);
		});
	},

	create: function(req, res) {
		User.create(req.body).then(function(user) {
			res.json(user);
		}).catch(function(err) {
			res.json(err);
		});
	}
};
