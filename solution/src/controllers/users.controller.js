const {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserPosts,
  getUserLikedPosts,
} = require("../services/users.service");
const { parsePagination, buildMeta } = require("../utils/pagination");

const create = async (req, res) => {
  try {
    const { username, email, fullname, bio } = req.body;

    if (!username || !email || !fullname) {
      return res
        .status(400)
        .json({ error: "username, email and fullname are required" });
    }

    const userData = { username, email, fullname };
    if (bio !== undefined) {
      userData.bio = bio;
    }

    const result = await createUser(userData);
    res.status(201).json(result);
  } catch (err) {
    res.status(409).json({ error: "username or email already taken" });
  }
};

const list = async (req, res) => {
  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;

  const sortBy = req.query.sortBy || "createdAt";
  const allowedSortBy = ["createdAt", "username", "fullname"];
  if (!allowedSortBy.includes(sortBy)) {
    return res
      .status(400)
      .json({ error: "sortBy must be one of: createdAt, username, fullname" });
  }

  const order = req.query.order || "desc";
  const allowedOrder = ["asc", "desc"];
  if (!allowedOrder.includes(order)) {
    return res.status(400).json({ error: "order must be asc or desc" });
  }

  let isPrivate;
  if (req.query.isPrivate !== undefined) {
    if (req.query.isPrivate === "true") {
      isPrivate = true;
    } else if (req.query.isPrivate === "false") {
      isPrivate = false;
    } else {
      return res
        .status(400)
        .json({ error: "isPrivate must be true or false" });
    }
  }

  let hasPosts;
  if (req.query.hasPosts !== undefined) {
    if (req.query.hasPosts === "true") {
      hasPosts = true;
    } else if (req.query.hasPosts === "false") {
      hasPosts = false;
    } else {
      return res
        .status(400)
        .json({ error: "hasPosts must be true or false" });
    }
  }

  const search = req.query.search;

  const { data, total } = await listUsers({
    skip,
    limit,
    sortBy,
    order,
    isPrivate,
    search,
    hasPosts,
  });

  res.json({
    data,
    meta: buildMeta(page, limit, total),
  });
};

const getOne = async (req, res) => {
  const user = await getUserById(Number(req.params.id));

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
};

const update = async (req, res) => {
  try {
    const { fullname, bio, isPrivate } = req.body;
    const updateData = {};

    if (fullname !== undefined) updateData.fullname = fullname;
    if (bio !== undefined) updateData.bio = bio;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const updatedUser = await updateUser(Number(req.params.id), updateData);
    res.json(updatedUser);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const remove = async (req, res) => {
  try {
    await deleteUser(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

const getPosts = async (req, res) => {
  const user = await getUserById(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;
  const { data, total } = await getUserPosts(Number(req.params.id), {
    skip,
    limit,
  });

  res.json({
    data,
    meta: buildMeta(page, limit, total),
  });
};

const getLikedPosts = async (req, res) => {
  const user = await getUserById(Number(req.params.id));
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);
  if (pagination.error) {
    return res.status(400).json({ error: pagination.error });
  }

  const { page, limit, skip } = pagination;
  const { data, total } = await getUserLikedPosts(Number(req.params.id), {
    skip,
    limit,
  });

  res.json({
    data,
    meta: buildMeta(page, limit, total),
  });
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
  getPosts,
  getLikedPosts,
};
