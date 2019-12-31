const mongoose = require("mongoose");

const socialPostEventSchema = mongoose.Schema({
  id: { type: String, unique: true },
  autoPost: Boolean,
  eventName: String,
  eventPurpose: String,
  /**
   * Status the current status of the events
   */
  status: String,
  platform: {
    facebook: Boolean,
    twitter: Boolean,
    linkedin: Boolean,
    telegram: Boolean
  },
  posts: {
    facebook: [{ postId: String }],
    twitter: [{ postId: String }],
    linkedin: [{ postId: String }],
    telegram: [{ postId: String }]
  },
  recurring: Boolean, // optional
  /* 
  
    Event-Based Triggers

    1. conditionVar, ConditionScope, conditionOperator, conditionOperator -> Required to evaluate the expression.
    2. scope for the condition

  */
  conditionVar: String,
  conditionScope: String,
  conditionOperator: String,
  conditionValue: Number,
  conditionScopeStart: String,
  conditionScopeStop: String,
  /*

  Next Scheduled Post Timestamp
  
  -> timestamp at which the next social-post is to be posted

  */
  nextPostScheduleTS: String,
  nextPostStatus: String,
  nextPostPath: String
});

module.exports = mongoose.model("Social_Post_Event", socialPostEventSchema);
