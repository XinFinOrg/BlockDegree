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
    facebook: [{ postId: String, timestamp: String }],
    twitter: [{ postId: String, timestamp: String }],
    linkedin: [{ postId: String, timestamp: String }],
    telegram: [{ postId: String, timestamp: String }]
  },
  recurring: Boolean, // optional
  recurringRule: {},
  /* 
  
    Event-Based Triggers

    1. conditionVar, ConditionScope, conditionOperator, conditionOperator -> Required to evaluate the expression.
    2. scope for the condition

  */
  variableTrigger: Boolean,
  conditionVar: String,
  conditionScope: String,
  conditionOperator: String,
  conditionValue: Number,
  conditionScopeStart: String,
  conditionScopeStop: String,
  postTemplateId: String, 
  /*

  Next Scheduled Post Timestamp
  
  -> timestamp at which the next social-post is to be posted

  */
  nextPostScheduleTS: String,
  nextPostStatus: String,
  nextPostPath: String
});

module.exports = mongoose.model("Social_Post_Event", socialPostEventSchema);
