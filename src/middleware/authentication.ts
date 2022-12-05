import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/userModel";
import AdminModel from "../models/adminModel";
import catchAsync from "../util/catchAsync";

export default catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const token = req.get("Authorization");
		if (!token) {
			// @ts-ignore
			req.isAdminAuth = false;
			// @ts-ignore
			req.isAuth = false;
			return next();
		}
		try {
			const decoded: any = await jwt.verify(
				token,
				// @ts-ignore
				process.env.jwtSecretKey
			);
			console.log(decoded)
			if (!decoded) {
				// @ts-ignore
				req.isAdminAuth = false;
				// @ts-ignore
				req.isAuth = false;
				return next();
			}
			let currentUser;
			if (decoded.userType == "admin") { // userType :- admin/user
				currentUser = await AdminModel.findOne({ _id: decoded.id });
			} else if (decoded.userType == "user") {
				currentUser = await UserModel.findOne({ _id: decoded.id, sessionId: token, deleted: 0, status: "Active" });
			} else {
				// @ts-ignore
				req.isAdminAuth = false;
				// @ts-ignore
				req.isAuth = false;
				return next();
			}
			
			if (!currentUser) {
				// @ts-ignore
				req.isAdminAuth = false;
				// @ts-ignore
				req.isAuth = false;
				return next();
			}
			// GRANT ACCESS TO PROTECTED ROUTE
			// @ts-ignore
			req.decoded = currentUser;
			if (decoded.userType == "admin") {
				// @ts-ignore
				req.isAdminAuth = true;
			} else if (decoded.userType == "user") {
				// @ts-ignore
				req.isAuth = true;
			} else {
				
				// @ts-ignore
				req.isAdminAuth = false;
				// @ts-ignore
				req.isAuth = false;
				return next();
			}
			next();
		} catch (e) {
			// @ts-ignore
			req.isAuth = false;
			next();
		}
	});