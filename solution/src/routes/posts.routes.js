const express = require("express");
const router = express.Router();
const {
  create,
  list,
  getOne,
  update,
  remove,
  getLikes,
} = require("../controllers/posts.controller");
const {
  likePost,
  unlikePost,
} = require("../controllers/likes.controller");

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.get("/:id/likes", getLikes);
router.post("/:id/likes", likePost);
router.delete("/:id/likes/:userId", unlikePost);

module.exports = router;
