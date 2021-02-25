import { Request, Response, Router, NextFunction } from "express";

import auth from "../middleware/auth";
import user from "../middleware/user";
import User from "../entities/User";
import { isEmpty } from "class-validator";
import { getRepository } from "typeorm";
import Story from "../entities/Story";
import Chapter from "../entities/Chapter";

const createStory = async (req: Request, res: Response) => {
  const { name, description } = req.body;
  const user: User = res.locals.user;

  try {
    let errors: any = {};
    if (isEmpty(name)) errors.name = "Name must not be empty";

    const story = await getRepository(Story)
      .createQueryBuilder("story")
      .where("lower(story.name) = :name", { name: name.toLowerCase() })
      .getOne();

    if (story) errors.name = "Story exists already";

    if (Object.keys(errors).length > 0) {
      throw errors;
    }
  } catch (err) {
    return res.status(400).json(err);
  }

  try {
    const story = new Story({ name, description, user });
    await story.save();

    return res.json(story);
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getStory = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const story = await Story.findOneOrFail({ name });
    const chapters = await Chapter.find({
      where: { story },
      order: { createdAt: "DESC" },
    });

    story.chapters = chapters;
    return res.json(story);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Story not found" });
  }
};

const ownStory = async (req: Request, res: Response, next: NextFunction) => {
  const user: User = res.locals.user;

  try {
    const story = await Story.findOneOrFail({
      where: { name: req.params.name },
    });

    if (story.username !== user.username) {
      return res.status(403).json({
        error: "You don't own this story",
      });
    }

    res.locals.story = story;
    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const updateStory = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { description } = req.body;

  try {
    const story = await Story.findOneOrFail({ name });

    story.description = description || story.description;

    await story.save();
    return res.json(story);
  } catch (err) {
    console.log(err);
    return res.json(500).json({ error: "Something went wrong" });
  }
};

const deleteStory = async (req: Request, res: Response) => {
  const name = req.params.name;

  try {
    const story = await Story.findOneOrFail({ name });

    await story.remove();
    return res.json({
      message: "Story deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json(500).json({
      error: "Something went wrong",
    });
  }
};

const router = Router();
router.post("/new", user, auth, createStory);
router.get("/:name", getStory);
router.put("/:name", user, auth, ownStory, updateStory);
router.delete("/delete/:name", user, auth, ownStory, deleteStory);

export default router;
