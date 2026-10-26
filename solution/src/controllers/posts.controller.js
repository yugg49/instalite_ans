const {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
} = require("../services/posts.service");
const { getUserById } = require("../services/users.service");
const { parsePagination, buildMeta } = require("../utils/pagination");

const create = async (req, res) => {
  const { imageUrl, authorId, caption, location } = req.body;

  if (!imageUrl || !authorId) {
    return res
      .status(400)
      .json({ error: "imageUrl and authorId are required" });
  }

  const user = await getUserById(Number(authorId));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const postData = {
    imageUrl,
    authorId: Number(authorId),
  };

  if (caption !== undefined) postData.caption = caption;
  if (location !== undefined) postData.location = location;

  const result = await createPost(postData);
  res.status(201).json(result);
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;

  const sortBy = req.query.sortBy || "createdAt";
  const allowedSortBy = ["createdAt", "updatedAt", "likes"];
  if (!allowedSortBy.includes(sortBy)) {
    return res
      .status(400)
      .json({ error: "sortBy must be one of: createdAt, updatedAt, likes" });
  }

  const order = req.query.order || "desc";
  const allowedOrder = ["asc", "desc"];
  if (!allowedOrder.includes(order)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  const { from, to, location, search } = req.query;

  if (from && isNaN(Date.parse(from))) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }

  if (to && isNaN(Date.parse(to))) {
    return res.status(400).json({ error: "from and to must be valid dates" });
  }

  const { data, total } = await listPosts({
    skip,
    limit,
    sortBy,
    order,
    location,
    search,
    from,
    to,
  });

  res.json({
    data,
    meta: buildMeta(page, limit, total),
  });
};

const getOne = async (req, res) => {
  const post = await getPostById(Number(req.params.id));

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json(post);
};

const update = async (req, res) => {
  try {
    const { caption, location } = req.body;
    const updateData = {};

    if (caption !== undefined) updateData.caption = caption;
    if (location !== undefined) updateData.location = location;

    const updatedPost = await updatePost(Number(req.params.id), updateData);
    res.json(updatedPost);
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const remove = async (req, res) => {
  try {
    await deletePost(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "Post not found" });
  }
};

const getLikes = async (req, res) => {
  const post = await getPostById(Number(req.params.id));
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const users = await getPostLikes(Number(req.params.id));
  res.json(users);
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getLikes,
};
