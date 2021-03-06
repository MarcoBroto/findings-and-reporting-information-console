/**
 * 
 */

const router = require('express').Router();
const Subtask = require('../models/subtask.model'); // Mongoose model created from tasks collection

/**
 * 
 */
router.route('/').get(async (req, res) => {
	if (req.query.hasOwnProperty('id')) { // This block is for fetching one subtask by id
		await Subtask
			.findOne({ _id: req.query.id })
			.then(subtask => res.status(200).json(subtask))
			.catch(err => res.status(404).json('Error: ' + err));
	}
	else { // This block is for fetching all tasks without params
		await Subtask
			.find()
			.then(tasks => res.status(200).json(tasks))
			.catch(err => res.status(400).json('Error: ' + err));
	}
});


/**
 * 
 */
router.route('/table').get(async (req, res) => {
	await Subtask
		.aggregate([
			{
				$match: {
					archived: false
				}
			},
			{
				$project: {
					id: "$_id",
					name: 1,
					progress: 1,
					dueDate: 1,
					analysts: 1,
					ownerTask: 1,
					numFindings: {
						$size: "$associations" //TODO: needs to be fixed with $lookup to get associated findings
					}
				}
			}
		])
		.then(tasks => res.status(200).json(tasks))
		.catch(err => res.status(400).json('Error: ' + err));
});

router.route('/names').get(async (req, res) => {
	await Subtask
		.aggregate([
			{
				$match: {
					archived: false
				}
			},
			{
				$project: {
					name: 1,
				}
			}
		])
		.then(tasks => res.status(200).json(tasks))
		.catch(err => res.status(400).json('Error: ' + err));
});


/**
 * 
 */
router.route('/new').post(async (req, res) => {
	if (req.body.params != null) {
		const document = new Subtask(req.body.params);

		await document
			.save()
			.then(subtask => res.status(201).json(subtask))
			.catch(err => res.status(400).json('Error: ' + err));
	}
});


/**
 * 
 */
router.route('/delete').delete(async (req, res) => {
	//TODO: implement delete request
	console.log(req.body);
	if (req.body.params.hasOwnProperty('id')) {
		const id = req.body.params.id; // '_id' to be requested from tasks collection

		await Subtask
			.deleteMany()
			.then(tasks => {
				console.log(tasks);
				res.status(200).json(tasks)
			})
			.catch(err => res.status(404).json('Error: ' + err));

		// await Subtask.findOneAndDelete()
		// 	.then(msg => {})
		// 	.catch(err => res.status(400).send());
	}
});


/**
 * 
 */
router.route('/update').put(async (req, res) => {
	if (req.body.params.hasOwnProperty('id')) {
		const id = req.body.params.id; // '_id' to be requested from tasks collection
		var document = null; // Stores Document returned by findOne

		await Subtask
			.findOne({ _id: id })
			.then(subtask => {
				document = subtask;
				document.set(req.body.params);
			})
			.catch(err => res.status(404).json('Error: ' + err));

		await document
			.save() // This method provides validation
			.then(subtask => res.status(200).json(subtask))
			.catch(err => res.status(400).json('Error: ' + err));
	}
	else res.status(400).send();
});


/**
 * 
 */
router.route('/archive').put(async (req, res) => {
	if (req.body.params.hasOwnProperty('id') && req.body.params.id instanceof Array) {
		await Subtask.updateMany(
			{
				_id: {
					$in: req.body.params.id
				}
			},
			{
				archived: true
			}
		)
			.then(result => res.status(200).json(result))
			.catch(err => res.status(404).json());
	} else res.status(400).json();
});

module.exports = router;
