var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

// db connection

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/graphql");
mongoose.Promise = global.Promise;

const UserModel = require("./models/user");

var schema = buildSchema(`
type Query {
    allUser : [User]
}

type User {
    name : String,
    age : Int,
    admin : Boolean,
    email : String
}
`);

let resolver = {
  allUser: async () => {
    let user = await UserModel.find();
    console.log(user);
    return user;
  },
};
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true,
  })
);

app.listen(3000, () => console.log("Now browse to localhost:4000/graphql"));
