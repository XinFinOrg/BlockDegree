const blogServices = require("../services/blogs");
const requireLogin = require("../middleware/requireLogin");
const requireAdmin = require("../middleware/requireAdmin");
const requireBlogOwner = require("../middleware/requireBlogOwner");

module.exports = app => {
  app.get("/blogs/loadBlogs", blogServices.loadBlogs);
  app.get("/blogs/read", blogServices.readBlog);
  app.post("/blogs/keywordSearch", blogServices.keywordSearch);
  app.get("/blogs/getFavs", requireLogin, blogServices.getMyFavs);
  app.post("/blogs/makeFav", requireLogin, blogServices.makeFav);
  app.get("/blogs/postBlog", requireLogin, requireBlogOwner, blogServices.postBlog);
  app.post(
    "/blogs/deleteBlog",
    requireLogin,
    requireBlogOwner,
    blogServices.deleteBlog
  );
  app.post(
    "/blogs/editBlog",
    requireLogin,
    requireBlogOwner,
    blogServices.editBlog
  );
};
