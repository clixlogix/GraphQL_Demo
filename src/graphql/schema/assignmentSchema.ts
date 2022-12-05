export const assignmentSchema = `

	type TimeSlot {
		_id: ID!
		startDate: String!
		startTime: String!
		endDate: String!
		endTime: String!
		exactTime: Boolean!
		untilDate: Boolean
	}

	input TimeSlotInput {
		startDate: String!
		startTime: String!
		endDate: String!
		endTime: String!
		exactTime: Boolean!
		untilDate: Boolean!
	}

	type Assignment {
		_id: ID!
		userId: String!
		jobCategory: String
		serviceCategoryId: [String]
		serviceTypeId: [String]
		title: String!
		images: [String]!
		description: String!
		jobType: String!
		successRate: Boolean!
		country: String!
		city: String!
		zip: String!
		street: String!
		location: Location!
		address: String!
		amount: Float!
		bonus: Float!
		deactivationDate: String!
		timeslot: [TimeSlot]
		isComerialUser: Boolean!
		acceptCounter: Boolean!
		depositeAmount: Float!
		toolsRequired: Boolean!
		details: String
		minRating: Int!
		paymentStatus: Boolean!
		publishStatus: Boolean!
		jobStatus: String!
		status: String
		creatorData: User
		jobCategorydata: [ServiceCategory]
		rating: Float
		isBookmarked: Boolean
	}

	input CreateAssignmentInput {
		jobCategory: String
		serviceCategoryId: [String]!
		serviceTypeId: [String]!
		title: String!
		images: [String]!
		description: String!
		jobType: String!
		successRate: Boolean!
		country: String!
		city: String!
		zip: String!
		street: String!
		location: LocationInput!
		address: String!
		amount: Float!
		bonus: Float!
		deactivationDate: String!
		timeslot: [TimeSlotInput]
		isComerialUser: Boolean!
		acceptCounter: Boolean!
		depositeAmount: Float!
		toolsRequired: Boolean!
		details: String
		minRating: Int!
		paymentStatus: Boolean!
		publishStatus: Boolean!
		jobStatus: String!
	}

	input AssignmentListFilterInput {
		maxDistance: Float
		distanceFrom: String
		currLocation: LocationInput
		minAmount: Float
	}

	input AdminAssignmentFilterInput {
		jobType: String
		jobstatus: String
		title: String
		aState: String
	}

	type AssignmentResponse {
		statusCode: Int!
		success: Boolean!
		message: String!
		data: Assignment
	}

	type AssignmentListResponse {
		statusCode: Int!
		success: Boolean!
		message: String!
		data: [Assignment]
	}

	type AdminAssignmentListResponse{
		statusCode: Int!
		success: Boolean!
		message: String!
		data: AdminAssignmentListData
	}
	
	type AdminAssignmentListData {
		totalCount: Int
		data:[Assignment]
	}

	type AssignmentAmountResponse {
		statusCode: Int!
		success: Boolean!
		message: String!
		data: PayableAmount
	}

	type PayableAmount {
		amount: Float!
		bonus: Float
		kudjooServiceCharge: Float!
		paymentGatewayServiceCharge: Float!
		totalAmount: Float!
	}
`