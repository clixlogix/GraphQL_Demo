
export const SESSIONEXPIREDCODE = 401;
export const ERRORCODE = 400;
export const SUCCESSCODE = 200;
export const EXCEPTIONCODE = 500;
export const ALREADYLOGGEDIN = 406;
export const EXCEPTIONMESSAGE = "We are currently facing some problem. Please Try again after some time";
export const SESSIONEXPIREDMESSAGE = "The user is not logged in or token expired."

// Create a context for holding contextual data
export const context = (req: any) => {
	const data = {
		authorization: req.headers.authorization,
		isAuth: req.isAuth,
		isAdminAuth: req.isAdminAuth,
		user: req.decoded,
		query: req.query,
		remoteAddress: req.connection.remoteAddress
	}
	return data;
};


