import asyncHandler from "express-async-handler";
import { validationResult } from "express-validator";
import handleValidationErrors from "../utils/handleValidationErrors";
import CustomError from "../utils/customError";
import { deleteUploadedFile } from "../utils/deleteUploadedFile";
import { 
  createPost, 
  getPostInfoById,
  getAllPost,
  getPostByName,
  userVotePost,
} from "../services/postServices";

const allowedSorts: Record<string, string> = {
  new: "ORDER BY p.created_at DESC, p.post_id DESC",
  top: "ORDER BY p.vote_count DESC, p.post_id DESC",
  hot: "ORDER BY p.hotness DESC, p.post_id DESC"
};

const allowedTimes: Record<string, string> = {
  day: "AND p.created_at >= NOW() - INTERVAL '1 day'",
  week: "AND p.created_at >= NOW() - INTERVAL '1 week'",
  month: "AND p.created_at >= NOW() - INTERVAL '1 month'",
  year: "AND p.created_at >= NOW() - INTERVAL '1 year'",
  all: ""
};

const sortAndTimeCondition = (sort: string, t: string) => {
  const sortCondition = allowedSorts[sort];
  // no time condition if sorting by hot
  const timeCondition = sort === "hot" ? "" : allowedTimes[t];

  return { sortCondition, timeCondition };
};

const postCreate = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const filePath = req.file?.path;
    if (filePath) deleteUploadedFile(filePath);

    throw new CustomError("Validation Error", 400, {
      errors: errors.array(),
      location: "postController/postCreate"
    });
  } 

  const { sub_name:subName, title, text, link} = req.body;
  const userId = req.user?.id;
  const mediaUrl = req.file?.path; 
  const postType = req.query.type as string;
  const result = await createPost({ subName, title, text, link, mediaUrl, postType, userId})

  res.status(202).json({ success: true, post_id: result.data });
});


const getInfoById = asyncHandler(async (req, res, next) => {
  handleValidationErrors(req, "postController/getById");
  
  const postId = req.params.post_id;
  const userId = req.user?.id;
  const result = await getPostInfoById({ postId, userId })
  
  res.status(200).json({ success: true, post: result.data });
}); 

const getAll = asyncHandler(async (req, res, next) => {
  handleValidationErrors(req, "postController/getAll")

  const limit = 5;
  const userId = req.user?.id;
  const { sort = 'new', t = 'all' } = req.query;
  const { sortCondition, timeCondition } = sortAndTimeCondition(sort as string, t as string);
  const offset = Number(req.query.offset);
  const result = await getAllPost({ userId, offset, limit, timeCondition, sortCondition });
  
  res.status(200).json({
    success: true,
    hasMore: result.hasMore,
    posts: result.posts,
  });
});

const getBySubName = asyncHandler( async(req, res, next) => {
  handleValidationErrors(req, "/postController/getBySubName");

  const limit = 5;
  const userId = req.user?.id;
  const subName = req.params.sub_name;
  const { sort = 'new', t = 'all' } = req.query;
  const { sortCondition, timeCondition } = sortAndTimeCondition(sort as string, t as string);
  const offset = Number(req.query.offset);
  const result = await getPostByName({ subName, userId, offset, limit, timeCondition, sortCondition });
  
  res.status(200).json({
    success: true,
    hasMore: result.hasMore,
    posts: result.posts,
  });
});

const postVote = asyncHandler(async (req, res, next) => {
  handleValidationErrors(req, '/postController/postVote');

  const { post_id: postId, vote_type: voteType} = req.body;
  const userId = req.user?.id;
  const result = await userVotePost({ userId, postId, voteType });
  
  res.status(200).json({ success: true, message: result.message })
});

export default {
  postCreate,
  getBySubName,
  getAll,
  getInfoById,
  postVote
};

