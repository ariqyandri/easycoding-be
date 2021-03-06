const { Router } = require("express");
const authMiddleware = require("../auth/middleware");
const {
  post: Post,
  comment: Comment,
  answer: Answer,
  user: User,
  picture: Picture,
} = require("../models");

const router = new Router();

router.get("/", async (req, res, next) => {
  try {
    const response = await Post.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Comment,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Answer,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: User,
                  attributes: { exclude: ["password"] },
                },
              ],
            },
            {
              model: User,
              attributes: { exclude: ["password"] },
            },
          ],
        },
        { model: User, as: "author", attributes: { exclude: ["password"] } },
        { model: Picture },
      ],
    });
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .send({ message: "Please provide a title and content" });
  }
  try {
    const newPost = await Post.create({
      title,
      content,
      userId: req.user.dataValues["id"],
    });
    const assignedPictures = await Picture.update(
      {
        postId: newPost.id,
      },
      { where: { id: [...req.body.picturesIds] } }
    );
    const returnPost = await Post.findByPk(newPost.id, {
      include: [
        { model: Comment, include: [{ model: Answer }] },
        { model: User, as: "author", attributes: { exclude: ["password"] } },
        { model: Picture },
      ],
    });
    res.status(200).send(returnPost);
  } catch (error) {
    next(error);
  }
});

router.put("/:postId", authMiddleware, async (req, res, next) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res
      .status(400)
      .send({ message: "Please provide a title and content" });
  }
  try {
    await Post.update(
      {
        title,
        content,
      },
      { where: { id: parseInt(req.params.postId) } }
    );

    await Picture.update(
      {
        postId: parseInt(req.params.postId),
      },
      { where: { id: [...req.body.picturesIds] } }
    );

    const returnPost = await Post.findByPk(req.params.postId, {
      include: [
        {
          model: Comment,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Answer,
              order: [["createdAt", "DESC"]],
              include: [
                {
                  model: User,
                  attributes: { exclude: ["password"] },
                },
              ],
            },
            {
              model: User,
              attributes: { exclude: ["password"] },
            },
          ],
        },
        { model: User, as: "author", attributes: { exclude: ["password"] } },
        { model: Picture },
      ],
    });
    res.status(200).send(returnPost);
  } catch (error) {
    next(error);
  }
});

router.delete("/:postId", authMiddleware, async (req, res, next) => {
  try {
    await Post.destroy({
      where: {
        id: parseInt(req.params.postId),
        userId: req.user.dataValues["id"],
      },
    });
    await Picture.destroy({ where: { postId: parseInt(req.params.postId) } });
    res
      .status(200)
      .send({ message: `Deleted post with id:${req.params.postId}` });
  } catch (error) {
    next(error);
  }
});

router.delete("/admin/:postId", authMiddleware, async (req, res, next) => {
  const admin = req.user.dataValues.isAdmin;
  if (admin === false) {
    return res
      .status(403)
      .send({ message: "You are not authorized to delete this post" });
  }
  try {
    await Post.destroy({
      where: {
        id: parseInt(req.params.postId),
      },
    });
    await Picture.destroy({ where: { postId: parseInt(req.params.postId) } });
    res
      .status(200)
      .send({ message: `Deleted post with id:${req.params.postId}` });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
