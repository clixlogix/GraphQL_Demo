import * as Joi from 'joi';


export const createAssignmentValidation = Joi.object({
	jobCategory: Joi.string().optional().allow("",null),
	serviceCategoryId: Joi.array().items(Joi.string()).required(),
	serviceTypeId: Joi.array().items(Joi.string()).required(),
	title: Joi.string().required(),
	images: Joi.array().items(Joi.string()).required(),
	description: Joi.string().required(),
	jobType: Joi.string().required(),
	successRate: Joi.boolean().required(),
	country: Joi.string().required(),
	city: Joi.string().required(),
	zip: Joi.string().required(),
	street: Joi.string().required(),
	location: Joi.object({
		type: Joi.string().required(),
		coordinates: Joi.array().items(Joi.number().required()).required().min(2)
	}),
	address: Joi.string().required(),
	amount: Joi.number().required(),
	bonus: Joi.number().required(),
	deactivationDate: Joi.string().required(),
	timeslot: Joi.array().items(Joi.object({
		startDate: Joi.string().required(),
		startTime: Joi.string().required(),
		endDate: Joi.string().required(),
		endTime: Joi.string().required(),
		exactTime: Joi.boolean().required(),
		untilDate: Joi.boolean().required()
	})).required(),
	isComerialUser: Joi.boolean().required(),
	acceptCounter: Joi.boolean().required(),
	depositeAmount: Joi.number().required(),
	toolsRequired: Joi.boolean().required(),
	details: Joi.string().optional().allow("",null),
	minRating: Joi.number().required().max(5),
	paymentStatus: Joi.boolean().required(),
	publishStatus: Joi.boolean().required(),
	jobStatus: Joi.string().required()
}).required();

export const paginationValidation = Joi.object({
	pageNo: Joi.number().required(),
	limit: Joi.number().required()
}).required();

export const assignmentIdValidation = Joi.object({
	assignmentId: Joi.string().required()
}).required();

