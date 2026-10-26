const prisma = require("../db");

const createPost = async (data) => {
  return await prisma.post.create({
    data,
  });
};

const listPosts = async ({
  skip,
  limit,
  sortBy,
  order,
  location,
  search,
  from,
  to,
}) => {
  const where = {};

  if (location) {
    where.location = { equals: location, mode: "insensitive" };
  }

  if (search) {
    where.caption = { contains: search, mode: "insensitive" };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lt = new Date(to);
  }

  let orderBy;
  if (sortBy === "likes") {
    orderBy = [{ likes: { _count: order } }, { createdAt: "desc" }];
  } else {
    orderBy = [{ [sortBy]: order }];
  }

  const [data, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullname: true,
          },
        },
        _count: {
          select: { likes: true },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return { data, total };
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          fullname: true,
        },
      },
      _count: {
        select: { likes: true },
      },
    },
  });
};

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

const getPostLikes = async (postId) => {
  return await prisma.user.findMany({
    where: {
      likes: {
        some: { postId },
      },
    },
    select: {
      id: true,
      username: true,
      fullname: true,
    },
    orderBy: {
      username: "asc",
    },
  });
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostLikes,
};
