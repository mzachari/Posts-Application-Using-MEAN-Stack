const express = require("express");

const router = express.Router();
const multer =  require('multer');
const Post = require('../models/post');
const checkAuth = require('../middleware/check-auth');

const MIME_TYPE_MAP = {
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if(isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext)
  }
});

router.post('', checkAuth, multer({storage : storage}).single("image"), (req,res,next) => {
  console.log("req");
  const url =  req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/"  + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(result =>{
    res.status(201).json({
      message:"Post added successfully",
      post: {
        ...result,
        id: result._id
      }
    });
  });
});
router.get('',(req, res, next) => {
  var pageSize = +req.query.pagesize;
  var currentPage = +req.query.pages;
  let fetchedPosts;
  postQuery  = Post.find();
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage -1))
      .limit(pageSize);
  }
  postQuery
      .then(documents =>{
        fetchedPosts = documents;
        return Post.count();
      })
      .then(count =>{
        res.status(200).json({
          message: 'Posts fetched Successfully',
          posts: fetchedPosts,
          postCount: count
        });
      })
});
router.get('/:postId',(req, res, next) => {
  Post.findById(req.params.postId).then(post => {
    if(post){
      res.status(200).json(post);
    } else{
      res.status(404).json({
        message: 'Post not found!'
      })
    }
  })

});


router.put('/:id', checkAuth, multer({storage : storage}).single("image"), (req,res,next) =>{
  let imagePath = req.body.imagePath;
  if(req.file){
    const url =  req.protocol + "://" + req.get("host");
    imagePath = url + "/images/"  + req.file.filename
  }
  const post = new Post({
    _id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });
  Post.updateOne({_id:req.params.id, creator: req.userData.userId }, post).then(result =>{
    if(result.nModified > 0) {
      res.status(200).json({
        message: "Update successful!",
        post: result
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }

  });
});
router.delete('/:id',checkAuth, (req, res, next) => {
  Post.deleteOne({_id: req.params.id, creator: req.userData.userId }).then(result =>{
    if(result.n > 0) {
      res.status(200).json({
        message: "Delete successful!",
        post: result
      });
    } else {
      res.status(401).json({
        message: "Not Authorized!"
      });
    }
  });
});

module.exports = router;
