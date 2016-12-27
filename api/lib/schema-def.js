
module.exports = `

type Snippet {
  id: ID
  title: String
  description: String
  owner: User
  isOwner: Boolean
  files: [File]
  dependencies: [Dependency]
  private: Boolean
  temporary: Boolean
  parent: Snippet
  stylesheets: [String]
}

type File {
  filename: String
  content: String
}

type Dependency {
  name: String
  version: String
}

type User {
  id: ID
  name: String
  email: String
  avatarUrl: String
  snippets: [Snippet]
}

type IDWithToken {
  id: ID
  token: String
}


input FileInput {
  filename: String!
  content: String!
}

input DependencyInput {
  name: String!
  version: String!
}



type Query {
  snippet(id: ID!): Snippet

  me: User

  findDependencies(
    dependencies: [DependencyInput]
  ): [Dependency]

  formatCode(code: String!): String
}

type Mutation {
  compile(id: ID!): Boolean

  createSnippet(
  	temporary: Boolean
  	private: Boolean
  	parent: ID
  ): IDWithToken

  saveSnippetFiles(
  	id: ID!
  	files: [FileInput!]
  ): Snippet

  saveSnippetInfo(
  	id: ID!
  	title: String
  	description: String
  	private: Boolean
    dependencies: [DependencyInput]
    stylesheets: [String]
  ): Snippet

  deleteSnippet(id: ID!): Boolean
}
`
