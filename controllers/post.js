const Post = require("../models/post");

/**create post in mongoose */
exports.createPost = (req, res, next) => {
  const { title, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (image === undefined) {
    return res.status(422).render("addPost", {
      title: "Post create",
      errMsg: "Image extension must be jpg,png and jpeg.",
      oldFormData: { title, description },
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("addPost", {
      title: "Post create",
      errMsg: errors.array()[0].msg,
      oldFormData: { title, description },
    });
  }

  Post.create({ title, description, image_url: image.path, userId: req.user })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong");
      return next(error);
    });
};

exports.renderCreatePage = (req, res, next) => {
  // res.sendFile(path.join(__dirname, "..", "views", "addPost.html"));
  res.render("addPost", { title: "Create Post" });
};

exports.renderHomePage = (req, res, next) => {
  /**isLogin is true */
  // const cookie = req.get("Cookie").split("=")[1].trim() === "true";
  // console.log(cookie);
  // console.log("hello")
  console.log(req.session.userInfo)
/**get title only direct from post model*/
  Post.find()
  .select("title")
  /**populate is get only username from user model in relationship */
  //.populate("userId", "username")
  .populate("userId", "email")
  /**Sort post by desc if 1 & -1 is asc in mongoose */
    .sort({ title: -1 })
    .then((posts) => res.render("home", { 
      title: "Homepage",
       postsArr: posts,
       //email: posts.email,
      currentUserEmail: req.session.userInfo ? req.session.userInfo.email : "",
      //  isLogIn: req.session.isLogIn ? true : false, 
      //  /**release csrf token from express*/
      //  csrfToken: req.csrfToken()
      }))
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong");
      return next(error);
    });
};

/**get post details in mongoose */
exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  console.log(req.user);
  Post.findById(postId)
    .populate("userId", "email")
    .then((post) => {
      res.render("details", {
        title: post.title,
        post,
        date: post.createdAt
          ? formatISO9075(post.createdAt, { representation: "date" })
          : undefined,
        currentLoginUserId: req.session.userInfo
          ? req.session.userInfo._id
          : "",
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Post not found with this ID.");
      return next(error);
    });
};

/**get edit post data in mongoose by findById*/
exports.getEditPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("editPost", {
        postId,
        title: post.title,
        post,
        errMsg: "",
        oldFormData: {
          title: undefined,
          description: undefined,
        },
        isValidationFail: false,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong");
      return next(error);
    });
};

/**edit post data in mongoose by findById*/
exports.updatePost = (req, res, next) => {
  const { postId, title, description } = req.body;

  const image = req.file;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("editPost", {
      postId,
      title,
      errMsg: errors.array()[0].msg,
      oldFormData: { title, description },
      isValidationFail: true,
    });
  }

  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      if (image) {
        fileDelete(post.imgUrl);
        post.imgUrl = image.path;
      }
      return post.save().then(() => {
        console.log("Post Updated");
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong");
      return next(error);
    });
};

/**Delete post by id in mongoose by findByIdAndRemove method*/
// exports.deletePost = (req, res, next) => {
//   const { postId } = req.params;
//   Post.findByIdAndRemove(postId)
//     .then(() => {
//       console.log("Post Deleted!!");
//       res.redirect("/");
//     })
//     .catch((err) => console.log(err));
// };

exports.deletePost = (req, res, next) => {
  const { postId } = req.params;
  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(() => {
      console.log("Post Deleted!!");
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something Went Wrong");
      return next(error);
    });
};