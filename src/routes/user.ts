import {Request, Response, Router} from "express";
import user from "../middleware/user";
import User from "../entities/User"
import Chapter from "../entities/Chapter";

const getUserSubmissions = async (req : Request, res : Response) => {
    try {
        const user = await User.findOneOrFail({
            where : { username : req.params.username},
            select : ["username", "createdAt"]
        })

        const chapters = await Chapter.find({
            where : { user },
            relations : ["story"]
        })

        let submissions : any[] = []
        chapters.forEach((c) => submissions.push({ type : "Chapter",  ...c.toJSON()}))

        submissions.sort((a, b) => {
            if (b.createdAt > a.createdAt) return 1;
            if (b.createdAt < a.createdAt) return -1;
            return 0;
        });

        return res.json({ user, submissions });
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error : "Something went wrong"
        })
    }
}

const router = Router()
router.get("/:username", user, getUserSubmissions);

export default router;