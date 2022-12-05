import { wrapResponse } from "../../util/response";
import * as resCode from "../../middleware/authMiddleware";
import ChampModel from "../../models/champModel";
import * as validationRules from "../../validation";

export const champResolver = {

	/**
	 * Method to create champ account/ business account
	 * @param args :-   {
	 *                      userId: String,
	 *                      companyName: String,
	 *                      industry: String,
	 *                      zip: String,
	 *                      city: String,
	 *                      streetNo: String,
	 *                      taxId: String,
	 *                      location: {
	 *                          type: String,
	 *                          coordinates: [lattitude, longitude]
	 *                      },
	 *                      serviceType: String
	 *                  }
	 * @param context :- {isAuth: Boolean}
	 */
	createChampAccount: async (args: any, context: any) => {
		try {
			const { body, req } = { body: args.createChampAccountInput, req: context };
			if (!req.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const { error } = validationRules.createChampAccountValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const existingAccount = await ChampModel.findOne({ userId: req.user._id });
			if (existingAccount) {
				return wrapResponse({ data: null }, "Business account already created", resCode.ERRORCODE, false);
			}
			body.isComerialUser = true;
			const champObj = new ChampModel(body);
			const champData = await champObj.save();
			return wrapResponse({ data: { ...champData._doc, _id: champData._id } }, "Business account created!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	},

	/**
	 * Method to edit user's business account
	 * @param args :- {
	 *                  businessAccountId: String,
	 *                  companyName: String,
	 *                  industry: String,
	 *                  zip: String,
	 *                  city: String,
	 *                  streetNo: String,
	 *                  taxId: String,
	 *                  location: {
	 *                      type: "Point",
	 *                      coordinates: [float]
	 *                  }
	 *                }
	 * @param context :- {isAuth:boolean, user: {_id: string}}
	 */
	editBusinessAcount: async (args: any, context: any) => {
		try {
			const { body, req } = { body: args.editBusinessAccountInput, req: context };
			if (!req.isAuth) {
				return wrapResponse({ user: null }, resCode.SESSIONEXPIREDMESSAGE, resCode.SESSIONEXPIREDCODE, false)
			}
			const { error } = validationRules.editBusinessAccountValidation.validate(body);
			if (error) {
				return wrapResponse({ data: null }, error.details[0].message, resCode.ERRORCODE, false);
			}
			const { businessAccountId, ...rest } = body;
			const data = await ChampModel.findByIdAndUpdate(businessAccountId, { $set: rest }, { new: true });
			if (!data) {
				return wrapResponse({ data: null }, "Business account not found!", resCode.ERRORCODE, false);
			}
			return wrapResponse({ data: { ...data._doc, _id: data._id } }, "Business account updated!", resCode.SUCCESSCODE, true);
		} catch (error: any) {
			console.log('editBusinessAcount error ===>>>', error);
			return wrapResponse({ data: null }, error.message ? error.message : resCode.EXCEPTIONMESSAGE, resCode.EXCEPTIONCODE, false);
		}
	}
}