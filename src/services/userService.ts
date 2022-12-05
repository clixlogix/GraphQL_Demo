import UserModel from "../models/userModel";
import UserRatingModel from "../models/userRating";
import { ObjectId } from "mongodb";

/**
 * Method to update user rating detail in user collection
 * @param data :- {_id: string,userId:string,ratedBy:string,comment:string,rating:float}
 */
export const updateRatingInUserModel = async (data: any) => {
  try {
    if (data.userId) {
      const query = [
        {$group: {
          _id: {
            userId: new ObjectId(data.userId)
          },
          avgRating: {$avg: "$rating"}
        }}
      ];
      const totalUserRating = await UserRatingModel.aggregate(query);
      if (totalUserRating && totalUserRating.length) {
        await UserModel.findByIdAndUpdate(data.userId, {$set:{avgRating:totalUserRating[0].avgRating}},{new:true});
      }
    }
  } catch (error: any) {
    console.log(error);
  }
}