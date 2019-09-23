const Post = require('../models/post');
exports.createPost = (req, res, next) => {
  console.log("req");
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(result => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...result,
        id: result._id
      }
    });
  })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't create new post!"
      })
    });
};
exports.getAllPosts = (req, res, next) => {
  var pageSize = +req.query.pagesize;
  var currentPage = +req.query.pages;
  let fetchedPosts;
  postQuery = Post.find();
  if (pageSize && currentPage) {
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: 'Posts fetched Successfully',
        posts: fetchedPosts,
        postCount: count
      });
    })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't fetch the posts!"
      })
    });
};

 exports.getPost = (req, res, next) => {
  Post.findById(req.params.postId).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: 'Post not found!'
      })
    }
  })
    .catch((error) => {
      res.status(500).json({
        message: "Couldn't fetch the post!"
      })
    });
};

exports.editPost = (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({ _id: req.params.id, creator: req.userData.userId }, post).then(result => {
    if (result.n > 0) {
      res.status(200).json({
        message: "Update successful!",
        post: result
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }

  }).catch((error) => {
    res.status(500).json({
      message: "Couldn't update post!"
    })
  });
};

exports.deletePost = (req, res, next) => {
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(result => {
    if (result.n > 0) {
      res.status(200).json({
        message: "Delete successful!",
        post: result
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }
  }).catch((error) => {
    res.status(500).json({
      message: "Couldn't delete post!"
    })
  });
};
