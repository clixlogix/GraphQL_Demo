import { wrapResponse } from "../../util/response";
import * as resCode from "../../middleware/authMiddleware";
import * as validationRules from "../../validation";
import AssignmentModel from "../../models/assignmentModel";
import { utilMethods } from "../../util/util";
import { ObjectId } from "mongodb";
import { paymentOnCancelAssignment } from "./assignmentPayment";
import AdminCommissionModel from "../../models/adminCommissionModel";
import { saveNotification } from "../../util/notification";

export const assignmentResolver = {

	/**
	 * Method to create assignment/job
	 * @param args :- validationRules.createAssignmentValidation
	 * @param context :- {isAuth: Boolean}
	 */
	createAssignment: async (args: any, context: any) => {
		try {
			const { body, req } = { body: args.createAssignmentInput, req: context };
			if (!req.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const { error } = validationRules.createAssignmentValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			body.userId = req.user._id;
			const obj = new AssignmentModel(body);
			const data = await obj.save();
			return wrapResponse({data:{...data._doc,_id:data._id,timeslot:await convertDateToISODate(data.timeslot)}},"Assignment created!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to get assignment list for home screen
	 * @param args :- {
	 * 									paginationInput:{pageNo: Number, limit: Number},
	 * 									"AssignmentListFilterInput": {
	 * 										"maxDistance": null,
	 * 										"distanceFrom": "myAddress",
	 * 										"currLocation": {
	 * 											"type": "Point",
	 * 											"coordinates": [77.3127, 29.8298]
	 * 										},
	 * 										"minAmount": null
	 * 									}
	 * 								}
	 * @param context :- {isAuth:Boolean,user:{_id:string}}
	 */
	getAssignmentList: async (args: any, context: any) => {
		try {
			const { body, req, filters } = { body: args.paginationInput, req: context, filters: args.filterInput };
			if (!req.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const { error } = validationRules.paginationValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const paginationData = utilMethods.paginationData(body);
			const query: any = [
				{
					$geoNear: {
						near: filters.distanceFrom == "myAddress" ? req.user.location : filters.currLocation,
						maxDistance: filters.maxDistance,
						spherical: true,
						query: {
							userId: { $ne: req.user._id },
							deactivationDate: { $gte: new Date() },
							amount: { $gte: filters.minAmount ? filters.minAmount : 0 },
							paymentStatus: true,
							publishStatus: true,
							jobStatus: "active",
							deleted: 0
						},
						distanceField: "distance"
					}
				},
				{ $sort: { createdAt: -1 } },
				{$lookup: {
					from: "assignmentoffers",
					let: {assignmentId: "$_id"},
					pipeline: [
						{$match: {
							$expr: {$eq: ["$assignmentId", "$$assignmentId"]},
							$or: [
								{userId: new ObjectId(context.user._id)},
								{clientOfferStatus:"Accept"}
							]
						}}
					],
					as: "assignmentOffers"
				}},
				{$match: {
					$expr: {$eq: [{$size: "$assignmentOffers"},0]}
				}},
				{
					$lookup: {
						from: "users",
						let: { userId: "$userId" },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ["$_id", "$$userId"] },
									deleted: 0,
									status: "Active"
								}
							},
							{
								$project: {
									firstName: 1, lastName: 1, profilePic: 1, avgRating: 1
								}
							}
						],
						as: "creatorData"
					}
				},
				{$unwind: "$creatorData"},
				{$skip: paginationData.skip},
				{$limit: paginationData.limit},
				{$lookup: {
					from: "bookmarkassignments",
					let: {assignmentId: "$_id"},
					pipeline: [
						{$match: {
							$expr: { $and: [
								{$eq: ["$assignmentId", "$$assignmentId"]},
								{$eq: ["$userId", new ObjectId(context.user._id)]}
							]}
						}}
					],
					as: "isBookmarked"
				}},
				{$addFields: {
					isBookmarked: {$cond: {
						if: {$eq: [[], "$isBookmarked"]},
						then: false,
						else: true
					}}
				}}
			];
			const list: any = await AssignmentModel.aggregate(query);
			return wrapResponse({ data: list }, "Assignment list!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to get assignment
	 * @param args :- {id: String}
	 * @param context :- {isAuth:Boolean}
	 */
	getAssignmentDetail: async (args: any, context: any) => {
		try {
			const req = context;
			if (!req.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const body = args.assignmnetId;
			const { error } = validationRules.idValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const query = [
				{
					$match: {
						_id: new ObjectId(body.id)
					}
				},
				{
					$lookup: {
						from: 'users',
						let: { userId: "$userId" },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ["$_id", "$$userId"] },
									deleted: 0,
									status: "Active"
								}
							},
							{
								$project: {
									firstName: 1, lastName: 1, profilePic: 1
								}
							}
						],
						as: "creatorData"
					}
				},
				{ $unwind: "$creatorData" }
			];
			const assignmentData = await AssignmentModel.aggregate(query);
			if (!assignmentData || !assignmentData.length) {
				return wrapResponse({ data: null }, "Assignment not found!", resCode.ERRORCODE, false);
			}
			return wrapResponse({ data: assignmentData[0] }, "Assignment data!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to get assignment/job list posted by me
	 * @param args :- 
	 * @param context :- {isAuth:Boolean,user:{_id:string}}
	 */
	postedAssignmentList: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const query: any = [
				{
					$match: {
						status: "Active",
						deleted: 0,
						userId: new ObjectId(context.user._id)
					}
				},
				{
					$lookup: {
						from: "servicecategories",
						let: { categoryIds: "$serviceCategoryId" },
						pipeline: [
							{
								$match: {
									$expr: { $in: ["$_id", "$$categoryIds"] },
									deleted: 0,
									status: "Active"
								}
							}
						],
						as: "jobCategorydata"
					}
				},
				{
					$lookup: {
						from: "userratings",
						let: { assignmentId: "$_id" },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ["$assignmentId", "$$assignmentId"] }
								}
							},
							{
								$group: {
									_id: {
										assignmentId: "$$assignmentId"
									},
									avgRating: { $avg: "$rating" }
								}
							},
							{
								$project: {
									avgRating: 1, _id: 0
								}
							}
						],
						as: "rating"
					}
				},
				{
					$addFields: {
						rating: {
							$cond: {
								if: { $eq: [[], "$rating"] },
								then: 0,
								else: { $arrayElemAt: ["$rating.avgRating", 0] }
							}
						}
					}
				}
			];
			const list = await AssignmentModel.aggregate(query);
			return wrapResponse({ data: list }, "Job list posted by me!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to get assignment/job list received
	 * @param args :- 
	 * @param context :- {isAuth:Boolean,user:{_id:string}}
	 */
	 receivedAssignmentList: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const query: any = [
				{
					$match: {
						status: "Active",
						deleted: 0,
						userId: {$ne: new ObjectId(context.user._id)}
					}
				},
				{
					$lookup: {
						from: "assignmentoffers",
						let: {assignmentId: "$_id"},
						pipeline: [
							{$match: {
								$expr: {$eq:["$assignmentId", "$$assignmentId"]},
								clientOfferStatus: "Accept",
								userId: new ObjectId(context.user._id)
							}}
						],
						as: "assignmentOffers"
					}
				},
				{$unwind: "$assignmentOffers"},
				{
					$lookup: {
						from: "servicecategories",
						let: { categoryIds: "$serviceCategoryId" },
						pipeline: [
							{
								$match: {
									$expr: { $in: ["$_id", "$$categoryIds"] },
									deleted: 0,
									status: "Active"
								}
							}
						],
						as: "jobCategorydata"
					}
				},
				{
					$lookup: {
						from: "userratings",
						let: { assignmentId: "$_id" },
						pipeline: [
							{
								$match: {
									$expr: { $eq: ["$assignmentId", "$$assignmentId"] }
								}
							},
							{
								$group: {
									_id: {
										assignmentId: "$$assignmentId"
									},
									avgRating: { $avg: "$rating" }
								}
							},
							{
								$project: {
									avgRating: 1, _id: 0
								}
							}
						],
						as: "rating"
					}
				},
				{
					$addFields: {
						rating: {
							$cond: {
								if: { $eq: [[], "$rating"] },
								then: 0,
								else: { $arrayElemAt: ["$rating.avgRating", 0] }
							}
						}
					}
				}
			];
			const list = await AssignmentModel.aggregate(query);
			return wrapResponse({ data: list }, "Received Job list!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * My jobs list for home screen(all jobs either posted by me or 
	 * I sent an interest on them)
	 * @param args :-
	 * @param context :- {isAuth:boolean,user:{_id:string}}
	 */
	myJobsHomeScreen: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const query: any = [
				{$match: {
					deactivationDate: {$gt: new Date()},
					publishStatus: true,
					deleted: 0,
					status: "Active",
					jobStatus: {$ne: "cancel"}
				}},
				{$lookup: {
					from: "assignmentoffers",
					let: {asmtId: "$_id"},
					pipeline: [
						{$match: {
							$expr: {$eq: ["$assignmentId", "$$asmtId"]},
							champJobStatus: {$ne: "Decline"},
							paymentStatus: "Completed"
						}},
						{$group: {
							_id: null,
							champIds: {$addToSet: "$champId"}
						}}
					],
					as: "asmtOffers"
				}},
				{$unwind: {path:"$asmtOffers",preserveNullAndEmptyArrays: true}},
				{$match: {
					$or: [
						{userId: context.user._id},
						{$expr: {
							$in: [context.user._id, {$ifNull:["$asmtOffers.champIds",[]]}]
						}}
					]
				}},
				{$project: {
					images:1
				}}
			];
			const list = await AssignmentModel.aggregate(query);
			return wrapResponse({data:list},"My assignments!",resCode.SUCCESSCODE,true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to cancel assignment
	 * @param args :- {id:String}
	 * @param context :- {isAuth:boolean,user:{_id:string}}
	 */
	cancelAssignment: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const body = args.idData;
			const { error } = validationRules.idValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const query = {
				_id: body.id,
				deleted:0,
				userId:context.user._id
			}
			const updatedData = await AssignmentModel.findOneAndUpdate(query,{$set:{jobStatus:"cancel"}},{new:true});
			console.log(updatedData);
			if (!updatedData) {
				return wrapResponse({data:null},"Assignment not found!",resCode.ERRORCODE,false);
			}
			paymentOnCancelAssignment(updatedData);
			return wrapResponse({data:{...updatedData._doc}},"Assignment canceled!",resCode.SUCCESSCODE,true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to calculate all amounts for an assignment
	 * @param args :- {assignmentId: string}
	 * @param context 
	 * @returns 
	 */
	assignmentAmounts: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const body = args.idData;
			const { error } = validationRules.idValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const assignmentData = await AssignmentModel.findById(body.id);
			const obj: any = {
				amount: assignmentData.amount,
				bonus: assignmentData.bonus,
				kudjooServiceCharge: ((((await AdminCommissionModel.findOne()).kudjooServiceCharge)*assignmentData.amount)/100),
				paymentGatewayServiceCharge: parseFloat(process.env.stripeTransactionCharge as string)
			}
			obj['totalAmount'] = obj.amount+obj.bonus+obj.kudjooServiceCharge+obj.paymentGatewayServiceCharge;
			return wrapResponse({data:obj},"Assignment payable amount!",200,true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to get kudjoo service charge
	 * @param args 
	 * @param context 
	 */
	getKudjooServiceCharge: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const serviceCharge = (await AdminCommissionModel.findOne({})).kudjooServiceCharge;
			console.log('serviceCharge ===>>>', serviceCharge)
			return wrapResponse({data: serviceCharge},"Kudjoo service charge!",resCode.SUCCESSCODE,true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to complete assignment
	 * @param args 
	 * @param context 
	 * @returns 
	 */
	completeAssignment: async (args: any, context: any) => {
		try {
			if (!context.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const { error } = validationRules.idValidation.validate(args);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const updatedData = await AssignmentModel.findByIdAndUpdate(args.id,{$set: {jobStatus: "success"}},{new:true});
			if (!updatedData) {
				return wrapResponse({data:null},"Assignment not found!",resCode.ERRORCODE,false);
			}
			saveNotification({
				toUserId: updatedData.userId,
				message: `Your assignment ${updatedData.title} is successfully completed!`,
				title: "Assignment completion",
				notiType: "assignmentCompletion",
				assignmentId: updatedData._id
			})
			return wrapResponse({data:null},"Assignment successfully completed!",resCode.SUCCESSCODE,true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	}
}

/**
 * Convert date to string fromat(iso string)
 * @param array 
 * @returns 
 */
var convertDateToISODate = async (array: any[]) => {
	const convertedData = await Promise.all(array.map(item => {
		return { ...item._doc, startDate: new Date(item.startDate).toISOString(), endDate: new Date(item.endDate).toISOString() }
	}));
	return convertedData;
}