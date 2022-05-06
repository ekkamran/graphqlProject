var express = require("express");
var { graphqlHTTP } = require("express-graphql");
var { buildSchema } = require("graphql");

// db connection

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/graphql");
mongoose.Promise = global.Promise;

const UserModel = require("./models/user");
const ArticleModel = require("./models/article");
const CommentModel = require("./models/comment");

var schema = buildSchema(`
type Query {
    user(id : String) : User
    allUsers(page : Int, limit : Int) : UsersResult
    article(id : String!) : Article
    allArticles : [Article]
}

type UsersResult {
  users : [User],
  paginate : Paginate
}

type Paginate {
  total : Int,
  limit : Int,
  page : Int,
  pages : Int
}

type User {
    name : String
    address : String
    age : Int
    admin : Boolean
    email : String
    articles: [Article]
    updateAt : String
    createdAt : String
}

type Article {
  user : User
  title : String
  body : String
  comments : [Comment]
  updateAt : String
  createdAt : String
}

type Comment {
  user : User
  article : Article
  approved : Boolean
  comment : String
}
`);

let resolver = {
  user: async (args) => await UserModel.findById(args.id).populated('articles').exec(),
  
  allUsers: async (args) => {
    let page = args.page || 1;
    let limit = args.limit || 10;
    let users = await UserModel.paginate({}, { page, limit });
    console.log(users);
    return {
      users: users.docs,
      paginate: {
        total: users.total,
        limit: users.limit,
        page: users.page,
        pages: users.pages
      }
    };
  },
  article: async (args) =>  await ArticleModel.findById(args.id).populate(['user']).exec(),
  allArticles: async () => {
    let articles = await ArticleModel.find({}).populate(['user' ,{
      path : 'comments',
      match : {
        approved : true
      },
      populate : ['user']
    }])
    return articles;
  }
};
var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: resolver,
    graphiql: true
  })
);

app.listen(3000, () => console.log("Now browse to localhost:4000/graphql"));
