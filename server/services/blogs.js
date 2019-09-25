const Blog = require("../models/blog");
const uuidv4 = require("uuid/v4");

exports.createNewPost = async (req, res) => {
  const hashId = uuidv4();
  const newPost = new Blog({
    blog_id: hashId,
    author: req.user.email,
    content: "",
    likes: 0,
    topics: [],
    keywords: [],
    other_data: [],
    status: null
  });
  try {
    await newPost.save();
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
  console.log(blog);
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

// API
exports.postBlog = async (req, res) => {
  let blog_id = req.body.blog_id;
  console.log(`Blog ID: ${blog_id}`);
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while retrieving the blog ${blog_id} : `, e);
    return res.json({
      error:
        "Its not you, its us. Please try again after sometime or contact us at info@blockdegree.org",
      posted: false
    });
  }
  if (blog == null) {
    return res.json({ error: "No such blog exists", posted: false });
  }
  if (blog.status == null || blog.status == "draft") {
    // state matches, ready to post
    blog.status = "posted";
    try {
      await blog.save();
    } catch (e) {
      console.error(
        `Exception while saving the blog status at postBlog for blog ${blog_id}: `,
        e
      );
      return res.json({
        error:
          "Its not you, its us. Please try again after sometime or contact us at info@blockdegree.org",
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

// API
exports.saveDraft = async (req, res) => {
  let content = req.body.content;
  let blog_id = req.body.blog_id;
  console.log(`Blog ID: ${blog_id}`);
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.log(`Exception while retrieving the blog with id ${blog_id}: `, e);
    return res.json({
      saved: false,
      error: "Error occurred while fetching the blog from the databse"
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
    if (blog.content == content) {
      // save content, no need to save again.
      return res.json({
        saved: false,
        error: "Same content"
      });
    } else {
      blog.content = content;
      blog.status = "draft";
      try {
        await blog.save();
      } catch (e) {
        console.error(`Error while saving the blog ${blog_id} : `, e);
        return res.json({
          saved: false,
          error: "error while saving to the database"
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

exports.readBlog = (req, res) => {
  console.log(`Called read blog by ${req.user.email}`);
  res.render("readBlog");
};

exports.fetchBlog = async (req, res) => {
  let blog_id = req.body.blog_id;
  console.log(`Called fecth blog API for blog_id: ${req.body.blog_id}`);
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.log(
      `Exception while fetching the blog ${blog_id} from the database: `,
      e
    );
    return res.json({
      error:
        "Error while fetching data from the database, please try again later or contact us at info@blockdegree.org",
      blog: null
    });
  }
  if (blog == null) {
    // no corresponding blog exists
    return res.json({
      error: "No such blog exists.",
      blog: null
    });
  }
  res.json({ error: null, blog: blog });
};

exports.loadBlogs = async (req, res) => {
  console.log(`Called load blogs ${req.user.email}`);
  let allBlogs;
  try {
    allBlogs = await Blog.find({});
  } catch (e) {
    console.error(
      `Some exception  occured while loading blogs for ${req.user.email}: `,
      e
    );
    return res.json({
      status: false,
      error:
        "Some error occurred while fetching the blogs, please try again later or contact us at info@blockdegree.org",
      blogs: null
    });
  }
  res.json({ blogs: allBlogs, error: null, status: true });
};
exports.keywordSearch = (req, res) => {};
exports.getMyFavs = (req, res) => {};
exports.makeFav = (req, res) => {};
exports.editBlog = (req, res) => {
  res.render("editBlog");
};
exports.deleteBlog = async (req, res) => {
  console.log("called delete API");
  let blog_id = req.body.blog_id;
  if (blog_id == undefined || blog_id == null || blog_id == "") {
    return res.json({ error: "bad requuest", deleted: false });
  }
  let blog;
  try {
    blog = await Blog.findOne({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while fetching blog ${blog_id} : `, e);
    return res.json({
      error:
        "Its not you, its us. Please try again later or contact us at info@blockdegree.org",
      deleted: false
    });
  }
  if (blog == null) {
    return res.json({ error: "No such blog exists.", deleted: false });
  }
  try {
    await Blog.findOneAndDelete({ blog_id: blog_id });
  } catch (e) {
    console.error(`Exception while deleting the blog ${blog_id}: `, e);
    return res.json({
      error:
        "Its not you, its us. Please try again later or contact us at info@blockdegree.org"
    });
  }
  res.json({ error: null, deleted: true });
};
exports.getDrafts = (req, res) => {};
