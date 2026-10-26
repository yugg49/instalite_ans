const { createLike, deleteLike } = require("../services/likes.service");
const { getPostById } = require("../services/posts.service");
const { getUserById } = require("../services/users.service");

const likePost = async (req, res) => {
  const { userId } = req.body;
  const postId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const post = await getPostById(postId);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const user = await getUserById(Number(userId));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const like = await createLike(postId, Number(userId));
    res.status(201).json(like);
  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const unlikePost = async (req, res) => {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  try {
    await deleteLike(postId, userId);
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Like not found" });
  }
};

module.exports = {
  likePost,
  unlikePost,
};
