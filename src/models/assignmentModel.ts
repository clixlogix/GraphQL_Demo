import { model, Schema } from "mongoose";

const assignmentSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	jobCategory: {
		type: String,
		trim: true
	},
	serviceCategoryId: [{
		type: Schema.Types.ObjectId,
		ref: "ServiceCategory"
	}],
	serviceTypeId: [{
		type: Schema.Types.ObjectId,
		ref: "ServiceType"
	}],
	title: {
		type: String,
		trim: true
	},
	images: [{
		type: String,
		trim: true,
		default: []
	}],
	description: {
		type: String,
		trim: true
	},
	jobType: {
		type: String,
		enum: ["regular", "successOriented"],
		default: "regular"
	},
	successRate: {
		type: Boolean,
		default: false
	},
	country: {
		type: String,
		trim: true
	},
	city: {
		type: String,
		trim: true
	},
	zip: {
		type: String,
		trim: true
	},
	street: {
		type: String,
		trim: true
	},
	location: {
		type: {
			type: String,
			enum: ["Point"],
			default: "Point"
		},
		coordinates: {
			type: [Number] // [longitude,lattitude]
		}
	},
	address: {
		type: String,
		trim: true
	},
	amount: {
		type: Number,
		default: 0
	},
	bonus: {
		type: Number,
		default: 0
	},
	deactivationDate: {
		type: Date
	},
	timeslot: [{
		startDate: {
			type: Date
		},
		startTime: {
			type: String
		},
		endDate: {
			type: Date
		},
		endTime: {
			type: String
		},
		exactTime: {
			type: Boolean,
			default: false
		},
		untilDate: {
			type: Boolean,
			default: false
		}
	}],
	isComerialUser: {
		type: Boolean,
		default: false
	},
	acceptCounter: {
		type: Boolean,
		default: false
	},
	depositeAmount: {
		type: Number,
		default: 0
	},
	toolsRequired: {
		type: Boolean,
		default: false
	},
	details: {
		type: String,
		trim: true
	},
	minRating: {
		type: Number
	},
	paymentStatus: {
		type: Boolean,
		default: false
	},
	publishStatus: {
		type: Boolean,
		default: false
	},
	jobStatus: {
		type: String,
		enum: ["draft", "active","success", "disputed","expire", "cancel"], // draft->pending, success-> success ,disputed->disputed
		default: "draft"
	},
	status: {
		type: String,
		enum: ["Active", "Inactive"],
		default: "Active"
	},
	deleted: {
		type: Number,
		enum: [0, 1],
		default: 0
	},
},
	{
		timestamps: true
	})

assignmentSchema.index({ location: '2dsphere' });
assignmentSchema.index({ createdAt: -1 });

const assignment = model("assignment", assignmentSchema);

export default assignment;