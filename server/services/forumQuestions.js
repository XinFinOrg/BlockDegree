const ForumQuestion = require("../models/forumQuestion");
const crypto = require('crypto');

function jsonifyQuestion({answers, __v, _id, ...rest}){
  return ({
    ...rest,
    answers,
    answerCount: answers.length,
    hasAcceptedAnswer: answers.some(a=>a.answersTheQuestion),
  })
}

exports.create = async (req, res) => {
  try {
    const askedBy = req.user
    const {text, description, answers=[]} = req.body
    if (!text) {
      res.json({ status: false, error: "Content can not be empty!" });
      return;
    }
    if (!askedBy) {
      res.json({ status: false, error: "Invalid User!" });
      return;
    }
    const tokenizedText = text.split(" ").join("-").split("?").join("-");
    const urlSlug = tokenizedText + crypto.createHash('md5').update(tokenizedText).digest('hex');
    
    const newForumQuestion = new ForumQuestion({
      urlSlug,
      text,
      askedBy,
    });

    newForumQuestion.description = description
    const question = await newForumQuestion.save();
    res.json({ status: true, question });
  } catch (e) {
    res.json({ status: false, error: "internal error while saving the new question" });
  }
};


exports.addAnswer = async (req, res) => {
  try {
    const answeredBy = req.user
    const answeredOn = new Date()
    const {text} = req.body
    if (!text) {
      res.json({ status: false, error: "Content can not be empty!" });
      return;
    }
    if (!answeredBy) {
      res.json({ status: false, error: "Invalid User!" });
      return;
    }
    const urlSlug = req.params.urlSlug
    const question = await ForumQuestion.findOneAndUpdate(
      {"urlSlug": urlSlug},
      {"$push": {
        "answers": {
          text,
          answeredBy: answeredBy.name,
          answeredOn,
        }
      }},
      {new: true}
    )
    res.json({ status: true, question });
  } catch (e) {
    res.json({ status: false, error: e || "internal error while saving the new question" });
  }
};


exports.addComment = async (req, res) => {
  try {
    const commentedBy = req.user
    const commentedOn = new Date()
    const {text} = req.body
    if (!text) {
      res.json({ status: false, error: "Content can not be empty!" });
      return;
    }
    if (!commentedBy) {
      res.json({ status: false, error: "Invalid User!" });
      return;
    }
    const comment = {
      commentedBy: commentedBy.name,
      commentedOn,
      text
    }
    const urlSlug = req.params.urlSlug
    const answerId = req.params.answerId
    const question = await ForumQuestion.findOneAndUpdate(
      {"urlSlug": urlSlug, "answers._id": answerId},
      {$push: {"answers.$.comments": comment}},
      {new: true}
    )
    res.json({ status: true, question });
  } catch (e) {
    res.json({ status: false, error: e || "internal error while saving the new question" });
  }
};

exports.findAll = async (req, res) => {
  try {
    const search = req.query.search
    const pageNo = parseInt(req.query.pageNo || 0)
    const perPage = parseInt(req.query.perPage || 10) 

    const count = await ForumQuestion.countDocuments({
      "$or": [
        {"text":{'$regex' : search, '$options' : 'i'}},
        {"description":{'$regex' : search, '$options' : 'i'}}
      ]
    });
    const questions = await ForumQuestion.find({
      "$or": [
        {"text":{'$regex' : search, '$options' : 'i'}},
        {"description":{'$regex' : search, '$options' : 'i'}}
      ]
    }).sort({text:1})
      // .skip(pageNo*perPage).limit(perPage)
      .populate('askedBy').lean();
    res.json({ 
      status: true, 
      count, 
      questions: questions.map(jsonifyQuestion) 
    });
  } catch (e) {
    res.json({ status: false, error: e });
  }  
};

exports.renderforumQuestion = async (req, res) => {
  try {
    const urlSlug = req.params.urlSlug
    const question = await ForumQuestion.findOne({"urlSlug": urlSlug})
      .populate({
        path:     'comments',			
        populate: { path:  'user',
              model: 'users' }
      })
      .populate({
        path: 'askedBy',
        // populate: [
        //   {
        //     path: 'answer',
        //     populate: {
        //       path: 'answeredBy',
        //       model: 'User'
        //     }
        //   }
        // ]
      })

      // .populate('askedBy')
      // .populate('answers.answer.answeredBy')
      // .populate("roles.role.roleEntities.entity")
      // .populate({
      //   path: 'answers.answeredBy',
      //   model: 'User'
      // })
      .lean()
    const canMarkAnswered = req.user && req.user.email && question.askedBy.email === req.user.email
    // res.json({ status: true, question: jsonifyQuestion(question) });
    res.render("forumQuestion", {
      question: jsonifyQuestion(question),
      meta: {
        isLoggedIn: req.user && !!req.user.email,
        canMarkAnswered, 
        hasNoAnswers: question.answers.length === 0, 
        hasOneAnswer: question.answers.length === 1,
      }
    })
  } catch (e) {
    // res.json({ status: false });
    res.render("forumQuestion")
  }
};

exports.findOne = async (req, res) => {
  try {
    const urlSlug = req.params.urlSlug
    
    const question = await ForumQuestion.findOne({"urlSlug": urlSlug}).populate('askedBy').lean()
    res.json({
      question: jsonifyQuestion(question),
      meta: {
        isLoggedIn: req.user && !!req.user.email,
        // canMarkAnswered, 
        // hasNoAnswers: question.answers.length === 0, 
        // hasOneAnswer: question.answers.length === 1,
      }
    })
  } catch (e) {
    res.json({ status: false });
  }  
};

exports.update = (req, res) => {
  
};

exports.delete = (req, res) => {
  
};

exports.deleteAll = (req, res) => {
  
};

exports.findAllPublished = (req, res) => {
  
};
