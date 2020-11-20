import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from "graphql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type Query = {
  __typename?: "Query";
  _?: Maybe<Scalars["Boolean"]>;
  me?: Maybe<User>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
  messages?: Maybe<Array<Maybe<Message>>>;
  message?: Maybe<Message>;
};

export type QueryUserArgs = {
  id: Scalars["String"];
};

export type QueryMessagesArgs = {
  created_at: Scalars["String"];
};

export type QueryMessageArgs = {
  id: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  _?: Maybe<Scalars["Boolean"]>;
  signUpUser: User;
  loginUser: User;
  logoutUser: Scalars["Boolean"];
  updateUser: User;
  deleteUser: User;
  createMessage: Message;
  updateMessage: Message;
  deleteMessage: Message;
};

export type MutationSignUpUserArgs = {
  nickname: Scalars["String"];
  username: Scalars["String"];
  password: Scalars["String"];
  first_name?: Maybe<Scalars["String"]>;
  last_name?: Maybe<Scalars["String"]>;
};

export type MutationLoginUserArgs = {
  username: Scalars["String"];
  password: Scalars["String"];
};

export type MutationUpdateUserArgs = {
  id: Scalars["ID"];
  first_name?: Maybe<Scalars["String"]>;
  last_name?: Maybe<Scalars["String"]>;
  nickname?: Maybe<Scalars["String"]>;
  username?: Maybe<Scalars["String"]>;
  password?: Maybe<Scalars["String"]>;
};

export type MutationDeleteUserArgs = {
  id: Scalars["ID"];
};

export type MutationCreateMessageArgs = {
  content: Scalars["String"];
};

export type MutationUpdateMessageArgs = {
  id: Scalars["ID"];
  content: Scalars["String"];
};

export type MutationDeleteMessageArgs = {
  id: Scalars["ID"];
};

export type Subscription = {
  __typename?: "Subscription";
  _?: Maybe<Scalars["Boolean"]>;
  userLoggedIn: User;
  userLoggedOut: User;
  userTyping: User;
  messageCreated: Message;
  messageUpdated: Message;
  messageDeleted: Message;
};

export type User = {
  __typename?: "User";
  id: Scalars["ID"];
  first_name?: Maybe<Scalars["String"]>;
  last_name?: Maybe<Scalars["String"]>;
  nickname: Scalars["String"];
  username: Scalars["String"];
  messages?: Maybe<Array<Maybe<Message>>>;
  created_at: Scalars["String"];
  updated_at: Scalars["String"];
};

export type Token = {
  __typename?: "Token";
  token: Scalars["String"];
};

export type Message = {
  __typename?: "Message";
  id: Scalars["ID"];
  content: Scalars["String"];
  user_id: Scalars["String"];
  created_at: Scalars["String"];
  updated_at: Scalars["String"];
  user?: Maybe<User>;
};

export enum CacheControlScope {
  Public = "PUBLIC",
  Private = "PRIVATE",
}

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  Mutation: ResolverTypeWrapper<{}>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Subscription: ResolverTypeWrapper<{}>;
  User: ResolverTypeWrapper<User>;
  Token: ResolverTypeWrapper<Token>;
  Message: ResolverTypeWrapper<Message>;
  CacheControlScope: CacheControlScope;
  Upload: ResolverTypeWrapper<Scalars["Upload"]>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  Boolean: Scalars["Boolean"];
  String: Scalars["String"];
  Mutation: {};
  ID: Scalars["ID"];
  Subscription: {};
  User: User;
  Token: Token;
  Message: Message;
  Upload: Scalars["Upload"];
};

export type QueryResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Query"] = ResolversParentTypes["Query"]
> = {
  _?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  user?: Resolver<
    Maybe<ResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<QueryUserArgs, "id">
  >;
  users?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["User"]>>>,
    ParentType,
    ContextType
  >;
  messages?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["Message"]>>>,
    ParentType,
    ContextType,
    RequireFields<QueryMessagesArgs, "created_at">
  >;
  message?: Resolver<
    Maybe<ResolversTypes["Message"]>,
    ParentType,
    ContextType,
    RequireFields<QueryMessageArgs, "id">
  >;
};

export type MutationResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Mutation"] = ResolversParentTypes["Mutation"]
> = {
  _?: Resolver<Maybe<ResolversTypes["Boolean"]>, ParentType, ContextType>;
  signUpUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationSignUpUserArgs, "nickname" | "username" | "password">
  >;
  loginUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationLoginUserArgs, "username" | "password">
  >;
  logoutUser?: Resolver<ResolversTypes["Boolean"], ParentType, ContextType>;
  updateUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserArgs, "id">
  >;
  deleteUser?: Resolver<
    ResolversTypes["User"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteUserArgs, "id">
  >;
  createMessage?: Resolver<
    ResolversTypes["Message"],
    ParentType,
    ContextType,
    RequireFields<MutationCreateMessageArgs, "content">
  >;
  updateMessage?: Resolver<
    ResolversTypes["Message"],
    ParentType,
    ContextType,
    RequireFields<MutationUpdateMessageArgs, "id" | "content">
  >;
  deleteMessage?: Resolver<
    ResolversTypes["Message"],
    ParentType,
    ContextType,
    RequireFields<MutationDeleteMessageArgs, "id">
  >;
};

export type SubscriptionResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Subscription"] = ResolversParentTypes["Subscription"]
> = {
  _?: SubscriptionResolver<
    Maybe<ResolversTypes["Boolean"]>,
    "_",
    ParentType,
    ContextType
  >;
  userLoggedIn?: SubscriptionResolver<
    ResolversTypes["User"],
    "userLoggedIn",
    ParentType,
    ContextType
  >;
  userLoggedOut?: SubscriptionResolver<
    ResolversTypes["User"],
    "userLoggedOut",
    ParentType,
    ContextType
  >;
  userTyping?: SubscriptionResolver<
    ResolversTypes["User"],
    "userTyping",
    ParentType,
    ContextType
  >;
  messageCreated?: SubscriptionResolver<
    ResolversTypes["Message"],
    "messageCreated",
    ParentType,
    ContextType
  >;
  messageUpdated?: SubscriptionResolver<
    ResolversTypes["Message"],
    "messageUpdated",
    ParentType,
    ContextType
  >;
  messageDeleted?: SubscriptionResolver<
    ResolversTypes["Message"],
    "messageDeleted",
    ParentType,
    ContextType
  >;
};

export type UserResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["User"] = ResolversParentTypes["User"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  first_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  last_name?: Resolver<
    Maybe<ResolversTypes["String"]>,
    ParentType,
    ContextType
  >;
  nickname?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  username?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  messages?: Resolver<
    Maybe<Array<Maybe<ResolversTypes["Message"]>>>,
    ParentType,
    ContextType
  >;
  created_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TokenResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Token"] = ResolversParentTypes["Token"]
> = {
  token?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MessageResolvers<
  ContextType = any,
  ParentType extends ResolversParentTypes["Message"] = ResolversParentTypes["Message"]
> = {
  id?: Resolver<ResolversTypes["ID"], ParentType, ContextType>;
  content?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user_id?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  created_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  updated_at?: Resolver<ResolversTypes["String"], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes["User"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface UploadScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes["Upload"], any> {
  name: "Upload";
}

export type Resolvers<ContextType = any> = {
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  Message?: MessageResolvers<ContextType>;
  Upload?: GraphQLScalarType;
};

/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
