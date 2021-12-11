import { gql } from "apollo-server"

export const typeDefs = gql`
type Ingredient{
  _id: ID!
  name: String!
  author: String!
}

type Recipe{
  id: ID!
  name: String!
  description: String!
  ingredients: [Ingredient!]!
  author: String!
}

type User{
  id: ID!
  email: String!
  pwd: String
  token: String
}

type Query{
    test:String!
    LogIn(email: String!, pwd: String!): Boolean!
    LogOut: String
    getUser(id: String!): User
    getUsers:[User]
    getRecipe(id: String!): Recipe
    getRecipes(author: String, ingredient: [String]): [Recipe]
}

type Mutation{
    SignIn(email: String!, pwd: String!): User!
    AddIngredient(name: String!): Ingredient
    AddRecipe(name: String!, description: String!, ingredients: [String]!): Recipe
    SignOut:Boolean!
    DeleteRecipe(id: String!): Boolean!
    UpdateRecipe(name: String!, description: String!, ingredients: [String]!): Recipe
    DeleteIngredient(id: String!): Boolean!
}
`

