const app = require("express")();
const { ApolloServer, gql } = require('apollo-server-express')


const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/graphql");
mongoose.Promise = global.Promise;

const UserModel = require("./models/user");
const ArticleModel = require("./models/article");
const CommentModel = require("./models/comment");

let typeDefs = gql`
  type Query {
    user(id: String): User
    allUsers(page: Int, limit: Int): UsersResult
    article(id: String!): Article
    allArticles: [Article]
  }

  type UsersResult {
    users: [User]
    paginate: Paginate
  }

  type Paginate {
    total: Int
    limit: Int
    page: Int
    pages: Int
  }

  type User {
    name: String
    address: String
    age: Int
    admin: Boolean
    email: String
    articles: [Article]
    updateAt: String
    createdAt: String
  }

  type Article {
    user: User
    title: String
    body: String
    comments: [Comment]
    updateAt: String
    createdAt: String
  }

  type Comment {
    user: User
    article: Article
    approved: Boolean
    comment: String
  }
`


let resolvers = {
  Query : {
    user: async (parent,args) => await UserModel.findById(args.id),
    allUsers: async (parent,args) => {
      let page = args.page || 1;
      let limit = args.limit || 10;

      let users = await UserModel.paginate({}, { page, limit });
 
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
    article: async (parent,args) => await ArticleModel.findById(args.id),
    allArticles: async () =>  await ArticleModel.find({})
  },
  User : { 
      articles : async (parent, args) => await ArticleModel.find({ user : parent.id }),
  },
  Article : {
      user : async (parent, args) => await UserModel.findById(parent.user),
      comments : async (parent, args) => await CommentModel.find({ article : parent.id , approved : true })
  },
   Comment : {
      user : async (parent, args) => await User.findById(parent.user),
      article : async (parent, args) => await ArticleModel.findById( parent.article )
  }
};

const server = new ApolloServer({ typeDefs , resolvers })
server.start().then(() => {
  server.applyMiddleware({
    app,
    cors: true
  });
});

app.listen(3000, () => console.log("Now browse to localhost:4000/graphql"));
