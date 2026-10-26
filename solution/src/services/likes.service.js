const prisma = require("../db");

const createLike = async (postId, userId) => {
  return await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
};

const deleteLike = async (postId, userId) => {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
};

module.exports = {
  createLike,
  deleteLike,
};
