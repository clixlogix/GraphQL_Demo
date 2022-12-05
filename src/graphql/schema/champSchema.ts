export const champSchema = `

  type champ {
    _id: ID
    userId: String
    companyName: String
    industry: String
    zip: String
    city: String
    streetNo: String
    taxId: String
    location: Location
    serviceType: [String]
    isComerialUser: Boolean
  }

  input CreateChampAccountInput {
    userId: String!
    companyName: String!
    industry: String!
    zip: String!
    city: String!
    streetNo: String!
    taxId: String!
    location: LocationInput!
    serviceType: [String]
  }

  input EditBusinessAccountInput {
    businessAccountId: String!
    companyName: String!
    industry: String!
    zip: String!
    city: String!
    streetNo: String!
    taxId: String!
    location: LocationInput!
  }

  type ChampResponse {
    statusCode: Int!
    success: String!
    message: String!
    data: champ
  }
`