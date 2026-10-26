const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

const seed = async () => {
  try {
    await prisma.like.deleteMany();
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();

    const createdUsers = await prisma.user.createManyAndReturn({
      data: users,
    });

    const userMap = new Map();
    for (const u of createdUsers) {
      userMap.set(u.username, u.id);
    }

    const postsToInsert = posts.map((p) => {
      const { author, ...rest } = p;
      return {
        ...rest,
        authorId: userMap.get(author),
      };
    });

    const createdPosts = await prisma.post.createManyAndReturn({
      data: postsToInsert,
    });

    const postMap = new Map();
    for (const p of createdPosts) {
      const match = p.imageUrl.match(/insta\d+/);
      if (match) {
        postMap.set(match[0], p.id);
      }
    }

    const likesToInsert = likes.map((l) => ({
      userId: userMap.get(l.user),
      postId: postMap.get(l.post),
    }));

    const createdLikes = await prisma.like.createMany({
      data: likesToInsert,
    });

    console.log(
      `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.count} likes`
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seed();
