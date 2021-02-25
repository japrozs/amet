import { Request, Response, Router, NextFunction } from "express";

import auth from "../middleware/auth";
import user from "../middleware/user";

import Chapter from "../entities/Chapter";
import Story from "../entities/Story";
import User from "../entities/User";

const ownChapter = async (req: Request, res: Response, next: NextFunction) => {
  const { identifier, slug } = req.params;
  const user: User = res.locals.user;

  try {
    const chap = await Chapter.findOneOrFail({ identifier, slug });

    if (!(user.username === chap.username)) {
      return res.json(400).json({
        error: "You don't own this story",
      });
    }

    return next();
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const createChapter = async (req: Request, res: Response) => {
  const { title, body, story } = req.body;
  const { storyName } = req.params;

  const user = res.locals.user;
  const storyRec = await Story.findOneOrFail({ name: storyName });

  if (!(storyRec.username === user.username)) {
    return res.json({
      error: "You don't own this story",
    });
  }

  if (title.trim() === "") {
    res.status(400).json({
      title: "Title must not be empty",
    });
  }

  if (body.trim() === "") {
    res.status(400).json({
      body: "Body must not be empty",
    });
  }

  try {
    const storyRecord = await Story.findOneOrFail({ name: story });
    const chapter = new Chapter({ title, body, user, story: storyRecord });

    await chapter.save();
    return res.json(chapter);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const getChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await Chapter.find({});

    return res.json(chapters);
  } catch (err) {
    console.log(err);
    return res.json(500).json({
      error: "Something went wrong",
    });
  }
};

const getChapter = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const chapter = await Chapter.findOneOrFail(
      { identifier, slug },
      {
        relations: ["story"],
      }
    );

    return res.json(chapter);
  } catch (err) {
    console.log(err);
    return res.status(404).json({
      error: "Something went wrong",
    });
  }
};

const updateChapter = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;
  const { body, title } = req.body;

  try {
    const chapter = await Chapter.findOneOrFail({ identifier, slug });

    chapter.title = title || chapter.title;
    chapter.body = body || chapter.body;

    await chapter.save();
    return res.json(chapter);
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

const deleteStory = async (req: Request, res: Response) => {
  const { identifier, slug } = req.params;

  try {
    const chapter = await Chapter.findOneOrFail({ identifier, slug });

    await chapter.remove();
    return res.json({
      message: "Chapter deleted successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json(500).json({
      error: "Something went wrong",
    });
  }
};
const router = Router();
router.get("/", getChapters);
router.get("/:identifier/:slug", user, getChapter);
router.post("/:storyName", user, auth, createChapter);
router.put("/:identifier/:slug", user, auth, ownChapter, updateChapter);
router.delete("/:identifier/:slug", user, auth, ownChapter, deleteStory);

export default router;
