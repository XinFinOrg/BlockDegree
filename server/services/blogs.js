const Blog = require("../models/blog");
const Blog_Content = require("../models/blog_content");
const uuidv4 = require("uuid/v4");

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
  const blog_topics = req.body["topics[]"];
  const blog_keywords = req.body["keywords[]"];
  const blog_desc = req.body.desc;
  console.log(`Blog ID: ${blog_id}`);
  let blog, blogContent;
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
  const blog_topics = req.body["topics[]"];
  const blog_keywords = req.body["keywords[]"];
  const blog_desc = req.body.desc;
  let blog, blogContent;
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
  viewArr.forEach(obj => {
    if (viewArr.email === user_email) {
      // found the user, increase the count
      viewArr.count++;
      found = true;
    }
  });
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
  res.json({ error: null, blog: blog, content: blogContent.content });
};

// API - OPEN
exports.loadBlogs = async (req, res) => {
  let allBlogs;
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
  res.json({ blogs: allBlogs, error: null, status: true });
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

// API - OPEN
exports.makeFav = async (req, res) => {
  const email = req.user.email;
  const blog_id = req.body.blog_id;
  let blog;
  try {
    blog = await Blog.findOne({ email: email });
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
  favArr.forEach(usrObj => {
    if (usrObj.email === email) {
      // found user.
      found = false;
      if (usrObj.fav) {
        // already favorite, return as it is
        return res.json({
          error: "Already Favorited",
          status: false
        });
      }
      usrObj.fav = true;
    }
  });
  if (!found) {
    // not found, push new
    favArr.push({ email: email, fav: true });
  }
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

// API - OPEN
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

//  API - OPEN
exports.getMyFavs = async (req, res) => {
  const email = req.user.email;
  let blogs;
  try {
    blogs = await Blog.find({ "favs.email": email });
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
  res.render("readBlog", { blog: blog, content: blogContent.content });
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
