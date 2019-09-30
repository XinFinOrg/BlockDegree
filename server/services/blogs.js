const Blog = require("../models/blog");
const Blog_Content = require("../models/blog_content");
const uuidv4 = require("uuid/v4");
const html2Txt = require("html-to-text");
const retext = require("retext");
const pos = require("retext-pos");
const keywords = require("retext-keywords");
const toString = require("nlcst-to-string");
const internalErrorMsg =
  "Its not you, its us. Please try again after sometime or contact us at info@blockdegree.org";
// ---------------------------------- APIs -----------------------------------------

// API - ADMIN
exports.createNewPost = async (req, res) => {
  const hashId = uuidv4();
  const newPost = new Blog({
    blog_id: hashId,
    author: req.user.email,
    likes: 0,
    desc: "",
    topics: [],
    keywords: [],
    other_data: [],
    status: null
  });
  const newPostContent = new Blog_Content({
    blog_id: hashId,
    content: ""
  });
  try {
    await newPost.save();
    await newPostContent.save();
  } catch (e) {
    console.log("Some error occurred while creating new hash: ", e);
    return res.json({
      error:
        "Some error occured while creating new hash, please try again after sometime or contact at info@blockdegree.org",
      hash: null
    });
  }
  res.json({ error: null, hash: hashId });
};

// API - ADMIN
exports.postBlog = async (req, res) => {
  let blog_id = req.body.blog_id;
  const content = req.body.content;
  const blog_title = req.body.title;
  const blog_topics = filterKeyword(req.body["topics[]"]);
  const blog_desc = req.body.desc;
  console.log(`Blog ID: ${blog_id}`);
  let blog, blogContent;

  const contentText = html2Txt.fromString(content, { wordwrap: 130 });
  let blog_keywords = [];
  retext()
    .use(pos) // Make sure to use `retext-pos` before `retext-keywords`.
    .use(keywords)
    .process(contentText, (err, file) => {
      file.data.keywords.forEach(function(keyword) {
        blog_keywords.push(
          toString(keyword.matches[0].node)
            .trim()
            .toLowerCase()
        );
      });
    });
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
    blogContent = await Blog_Content.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while retrieving the blog ${blog_id} : `, e);
    return res.json({
      error: internalErrorMsg,
      posted: false
    });
  }
  if (blog == null) {
    return res.json({ error: "No such blog exists", posted: false });
  }
  if (blog.status == null || blog.status == "draft") {
    // state matches, ready to post
    blog.status = "posted";
    blogContent.content = content;
    blog.title = blog_title;
    blog.keywords = blog_keywords;
    blog.topics = blog_topics;
    blog.desc = blog_desc;
    try {
      await blog.save();
      await blogContent.save();
    } catch (e) {
      console.error(
        `Exception while saving the blog status at postBlog for blog ${blog_id}: `,
        e
      );
      return res.json({
        error: internalErrorMsg,
        posted: false
      });
    }
    res.json({ error: null, posted: true });
  } else {
    return res.json({
      error: "Looks like this blog is already posted",
      posted: false
    });
  }
};

// API - ADMIN
exports.saveDraft = async (req, res) => {
  let content = req.body.content;
  let blog_id = req.body.blog_id;
  const blog_title = req.body.title;
  const blog_topics = filterKeyword(req.body["topics[]"]);
  const blog_desc = req.body.desc;
  let blog, blogContent;
  const contentText = html2Txt.fromString(content, { wordwrap: 130 });
  let blog_keywords = [];
  retext()
    .use(pos)
    .use(keywords)
    .process(contentText, (err, file) => {
      file.data.keywords.forEach(function(keyword) {
        blog_keywords.push(
          toString(keyword.matches[0].node)
            .trim()
            .toLowerCase()
        );
      });
    });
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
    blogContent = await Blog_Content.findOne({ blog_id: blog_id });
  } catch (e) {
    console.log(`Exception while retrieving the blog with id ${blog_id}: `, e);
    return res.json({
      saved: false,
      error: internalErrorMsg
    });
  }
  if (blog == null) {
    return res.json({
      saved: false,
      error: "No such blogs exists"
    });
  }
  if (blog.status == null || blog.status == "draft") {
    // state matches, go ahead
    if (
      blogContent.content == content &&
      blog.title == blog_title &&
      JSON.stringify(blog.keywords) == JSON.stringify(blog_keywords) &&
      JSON.stringify(blog.topics) == JSON.stringify(blog_topics) &&
      blog.desc == blog_desc
    ) {
      // save content, no need to save again.
      return res.json({
        saved: false,
        error: "Same content"
      });
    } else {
      blogContent.content = content;
      blog.status = "draft";
      blog.keywords = [];
      blog.desc = blog_desc;
      if (typeof blog_keywords === "string") {
        blog.keywords.push(blog_keywords);
      } else {
        blog_keywords.forEach(keyword => {
          if (keyword != "") blog.keywords.push(keyword);
        });
      }

      blog.topics = [];

      if (typeof blog_topics === "string") {
        blog.topics.push(blog_topics);
      } else {
        blog_topics.forEach(topic => {
          if (topic != "") blog.topics.push(topic);
        });
      }
      blog.title = blog_title;
      try {
        await blog.save();
        await blogContent.save();
      } catch (e) {
        console.error(`Error while saving the blog ${blog_id} : `, e);
        return res.json({
          saved: false,
          error: internalErrorMsg
        });
      }
      return res.json({ saved: true, error: null });
    }
  } else {
    res.json({
      saved: false,
      error: "The article that you're trying to save is not a draft."
    });
  }
};

// API - USER
exports.fetchBlog = async (req, res) => {
  let user_email = req.user.email;
  let blog_id = req.body.blog_id;
  console.log(`Called fetch blog API for blog_id: ${req.body.blog_id}`);
  let blog, blogContent;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
    blogContent = await Blog_Content.findOne({ blog_id: blog_id });
  } catch (e) {
    console.log(
      `Exception while fetching the blog ${blog_id} from the database: `,
      e
    );
    return res.json({
      error: internalErrorMsg,
      blog: null
    });
  }
  if (blog == null || blogContent == null) {
    // no corresponding blog exists
    return res.json({
      error: "No such blog exists.",
      blog: null
    });
  }

  // update the view for blog_id
  let viewArr = blog.views;
  let found = false;
  for (let i = 0; i < viewArr.length; i++) {
    if (viewArr[i].email === user_email) {
      // found the user, increase the count
      viewArr[i].count++;
      found = true;
      break;
    }
  }
  if (!found) {
    // first visit, insert the object
    viewArr.push({ email: user_email, count: 1 });
  }
  blog.views = viewArr;
  try {
    await blog.save();
  } catch (e) {
    console.error(
      `Exception at blogs.fetchBlog for user ${user_email} while saving: `,
      e
    );
    return res.json({ error: internalErrorMsg, blog: null });
  }
  blog._id = "";
  res.json({ error: null, blog: blog, content: blogContent.content });
};

// API - OPEN
exports.loadBlogs = async (req, res) => {
  let allBlogs;
  let retBlogs = [];
  try {
    allBlogs = await Blog.find({});
  } catch (e) {
    console.error(`Some exception  occured while loading blogs: `, e);
    return res.json({
      status: false,
      error:
        "Some error occurred while fetching the blogs, please try again later or contact us at info@blockdegree.org",
      blogs: null
    });
  }
  allBlogs.forEach(blog => {
    if (blog.status == "posted") {
      retBlogs.push(blog);
    }
  });
  res.json({ blogs: retBlogs, error: null, status: true });
};

//  API - ADMIN
exports.deleteBlog = async (req, res) => {
  console.log("called delete API");
  let blog_id = req.body.blog_id;
  if (blog_id == undefined || blog_id == null || blog_id == "") {
    return res.json({ error: "bad request", deleted: false });
  }
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
    blogContent = await Blog_Content.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while fetching blog ${blog_id} : `, e);
    return res.json({
      error: internalErrorMsg,
      deleted: false
    });
  }
  if (blog == null || blogContent == null) {
    return res.json({ error: "No such blog exists.", deleted: false });
  }
  try {
    await Blog.findOneAndDelete({ blog_id: blog_id });
    await Blog_Content.findOneAndDelete({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while deleting the blog ${blog_id}: `, e);
    return res.json({
      error: internalErrorMsg,
      deleted: false
    });
  }
  res.json({ error: null, deleted: true });
};

// API - USER
exports.makeFav = async (req, res) => {
  console.log("called make FAV");
  const email = req.user.email;
  const blog_id = req.body.blog_id;
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(
      `Exception at blogs/makeFav while fetching blog ${blog_id} by user ${email}: `,
      e
    );
    return res.json({
      status: false,
      error: internalErrorMsg
    });
  }
  if (blog == null) {
    return res.json({
      status: false,
      error: "The blog that you're trying to favorite does not exist."
    });
  }
  // Got the blog properly
  let favArr = blog.favs;
  let found = false;
  for (let i = 0; i < favArr.length; i++) {
    if (favArr[i].email == email) {
      // found user.
      found = true;
      if (favArr[i].fav) {
        // already favorite, return as it is
        return res.json({
          error: "Already Favorited",
          status: false
        });
      }
      favArr[i].fav = true;
      break;
    }
  }

  if (!found) {
    // not found, push new
    favArr.push({ email: email, fav: true });
  }
  // reassign fav arr.
  blog.favs = [];
  blog.favs = favArr;
  try {
    await blog.save();
  } catch (e) {
    console.error(
      `Exception at blogs.makeFav for blog ${blog_id} by user ${email}: `,
      e
    );
    return res.json({
      status: false,
      error: internalErrorMsg
    });
  }
  res.json({ status: true, error: null });
};

// API - USER
exports.removeFav = async (req, res) => {
  console.log("called remove FAV");
  const email = req.user.email;
  const blog_id = req.body.blog_id;
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(
      `Exception at blogs/removeFav while fetching blog ${blog_id} by user ${email}: `,
      e
    );
    return res.json({
      status: false,
      error: internalErrorMsg
    });
  }
  if (blog == null) {
    return res.json({
      status: false,
      error: "The blog that you're trying to un-favorite does not exist."
    });
  }
  // Got the blog properly
  let favArr = blog.favs;
  let found = false;
  for (let i = 0; i < favArr.length; i++) {
    if (favArr[i].email == email) {
      // found user.
      found = true;
      if (!favArr[i].fav) {
        // already un-favorite, return as it is
        return res.json({
          error: "Already Un-Favorited",
          status: false
        });
      }
      favArr[i].fav = false;
    }
  }

  if (!found) {
    // not found, push new
    favArr.push({ email: email, fav: false });
  }
  blog.favs = [];
  blog.favs = favArr;
  try {
    await blog.save();
  } catch (e) {
    console.error(
      `Exception at blogs.removeFav for blog ${blog_id} by user ${email}: `,
      e
    );
    return res.json({
      status: false,
      error: internalErrorMsg
    });
  }
  res.json({ status: true, error: null });
};

// API - OPEN - depreciated
exports.keywordSearch = async (req, res) => {
  const keyword = req.body["keyword"];
  let retBlogs = [];
  try {
    // filering by a property of all the objects over the array
    const blogs = await Blog.find({ keywords: keyword });
    blogs.forEach(blog => {
      retBlogs.push(blog);
    });
  } catch (e) {
    console.error(
      `Exception at blogs.keywordSearch for keyword ${keyword} by user: `,
      e
    );
    return res.json({
      status: false,
      error: internalErrorMsg,
      blogs: null
    });
  }
  res.json({ status: true, error: null, blogs: retBlogs });
};

// API - OPEN

/*

Enable complex search by doing an intersection on results from all individual results.

Queries : keywords, topics

*/
exports.complexSearch = async (req, res) => {
  let keywords = req.body.keyword;
  const onlyFav = req.body.onlyFav;
  if (typeof keywords != "string") {
    console.log("Error at blogs.complexSearch:  Bad Request");
    return res.json({ status: false, error: "Bad Request", blogs: null });
  }
  let fmtKeywords = [],
    retBlogs = [];

  keywords = keywords.split(/[\s,]+/);
  keywords = filterKeyword(keywords);
  keywords.forEach(keyword => {
    fmtKeywords.push(keyword);
  });
  console.log(fmtKeywords);
  let allBlogs;
  try {
    allBlogs = await Blog.find({});
  } catch (e) {
    console.error(`Exception at blogs.complexSearch: `, e);
    return res.json({ status: false, errro: internalErrorMsg, blogs: null });
  }
  for (let j = 0; j < allBlogs.length; j++) {
    loop2: {
      if (onlyFav == "true") {
        let found = false;
        for (let k = 0; k < allBlogs[j].favs.length; k++) {
          if (
            allBlogs[j].favs[k].email == req.user.email &&
            allBlogs[j].favs[k].fav
          ) {
            found = true;
            break;
          }
          if (!found) {
            // blog is not to be added
            break loop2;
          }
        }
      }
      for (let i = 0; i < fmtKeywords.length; i++) {
        if (
          allBlogs[j].keywords.includes(fmtKeywords[i]) ||
          allBlogs[j].topics.includes(fmtKeywords[i])
        ) {
          // has a keyword, push and break.
          retBlogs.push(allBlogs[j]);
          break loop2;
        }
      }
    }
  }
  res.json({ status: true, error: null, blogs: retBlogs });
};

//  API - USER
exports.getMyFavs = async (req, res) => {
  const email = req.user.email;
  let blogs;
  try {
    blogs = await Blog.find({
      $and: [{ "favs.email": email }, { "favs.fav": true }]
    });
  } catch (e) {
    console.error(`Exception at blogs.getMyFavs for user ${email}: `, e);
    return res.json({ status: false, error: internalErrorMsg, blogs: null });
  }
  return res.json({ status: true, error: null, blogs: blogs });
};

// API - ADMIN
exports.getDrafts = async (req, res) => {
  let drafts;
  try {
    drafts = await Blog.find({ status: "draft" });
  } catch (e) {
    console.error(
      `Exception at blogs.getDrafts for user ${req.user.email}: `,
      e
    );
    res.json({ status: false, error: internalErrorMsg, drafts: null });
  }
  res.json({ status: true, error: null, drafts: drafts });
};

// --------------------------------- Views ---------------------------------------

// View - USER
exports.readBlog = async (req, res) => {
  console.log(`Called read blog by ${req.user.email}`);
  const blog_id = req.originalUrl.split("?")[1].split("=")[1];
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
    blogContent = await Blog_Content.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(
      `Exception at blogs.readBlog for user ${req.user.email}:  `,
      e
    );
    return res.render("displayError", { error: internalErrorMsg });
  }
  blog = blog.toObject();
  delete blog._id;
  delete blog.id;
  res.render("readBlog", {
    blog: JSON.stringify(blog),
    content: blogContent.content,
    userEmail: req.user.email,
    title: blog.title
  });
};

// View - ADMIN
exports.newPost = async (req, res) => {
  let blog_id = req.originalUrl.split("?")[1].split("=")[1];
  console.log(`Article ID: ${blog_id}`);
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.log(
      `Some exception occured while getting article ${blog_id} : `,
      e
    );
    return res.render("displayError", {
      error:
        "Its not you, its us. Please try again after sometime or contact-us at info@blockdegree.org"
    });
  }
  if (blog == null) {
    return res.render("error");
  }
  // found the blog, YEAH!
  if (!blog.status) {
    // new post, ok!
    return res.render("newPost");
  } else {
    // states are not matching
    res.render("displayError", {
      error:
        "can't edit a draft via newPost, please try to update it using editBlog"
    });
  }
};

// View - ADMIN
exports.editBlog = (req, res) => {
  res.render("editBlog");
};

function filterKeyword(keywords) {
  let retKeywords = [];
  keywords.forEach(keyword => {
    let trimKeyword = keyword.trim();
    if (trimKeyword == "") {
      return;
    }
    trimKeyword = trimKeyword.toLowerCase();
    retKeywords.push(trimKeyword);
  });
  return retKeywords;
}
