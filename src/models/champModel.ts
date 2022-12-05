import { model, Schema } from "mongoose";

const champSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	companyName: {
		type: String,
		trim: true
	},
	industry: {
		type: String,
		trim: true
	},
	zip: {
		type: String,
		trim: true
	},
	city: {
		type: String,
		trim: true
	},
	streetNo: {
		type: String,
		trim: true
	},
	taxId: {
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
	serviceType: [{
		type: Schema.Types.ObjectId,
		ref: "ServiceType"
	}],
	superChamp: {
		type: Boolean,
		default: false
	},
	isComerialUser: {
		type: Boolean,
		default: false
	}
},
	{
		timestamps: true
	})

	champSchema.index({ location: '2dsphere' });

const Champ = model("Champ", champSchema);

export default Champ;