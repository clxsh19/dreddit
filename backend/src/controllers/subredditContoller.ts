import asyncHandler from "express-async-handler";
import { body, validationResult } from "express-validator";
import {query , queryTransaction} from "../db/index";

const post_create_subreddit = [
  body('name', 'Subreddit name must not be empty').trim().isLength({min:1}).escape(),
  body('description').trim().escape(),

  asyncHandler( async(req, res, next) => {
    const errors = validationResult(req);
    const { name, description } = req.body;

    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'subreedit name required',
        name: req.body.name,
        description: req.body.description,
      });
    } else {
      const name_exists_query = await query(`SELECT EXISTS (
        SELECT 1 FROM subreddits WHERE name = $1 )`, [name] 
      );
      const name_exists = name_exists_query.rows[0].exists;
      if (name_exists) {
        res.status(403).json({ error: "Subreddit name already exists"});
      } else {
        await query(`INSERT INTO subreddits (name, description) VALUES ($1, $2)`, // 0 member count currently
        [name, description] );
        res.status(202).json({
          message: 'Subreddit registered successfully',
        });
      };
    };
  }),
];

const get_subbreddit_detail = asyncHandler( async(req, res, next) => {
  const subreddit_name = req.params.name;
  const user_id = req.user?.id
  const subreddit_query = await query(`SELECT 
    s.subreddit_id,
    s.name AS sub_name,
    s.description,
    s.members_count,
    s.created_at,
    COALESCE(sm.role, 'none') AS user_role
    FROM subreddits s
    LEFT JOIN subreddit_members sm 
      ON s.subreddit_id = sm.subreddit_id 
      AND sm.user_id = $1
    WHERE s.name = $2`,
    [user_id, subreddit_name]);
  res.status(200).json({
    subreddit_detail: subreddit_query.rows[0]
  });
});

const user_join_subreddit = [
  body('subreddit_id').not().isEmpty().withMessage('subreddit_id cannot be null').trim().escape(),
  
  asyncHandler( async(req, res, next) => {
    const errors = validationResult(req);
    const { subreddit_id } = req.body;
    const user_id = req.user?.id; 

    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'subreddit_id is required',
        id: req.body.subreddit_id,
      });
    } else {
      const queries = [
        'SELECT 1 FROM subreddits WHERE subreddit_id = $1',
        'SELECT 1 from subreddit_members WHERE user_id = $1 AND subreddit_id = $2'
      ];
      const params = [
        [subreddit_id],
        [user_id, subreddit_id]
      ];

      const result = await queryTransaction(queries, params);

      if (result[0].rows.length === 0 || result[1].rows.length > 0) {
        res.status(409).json({
          message: "sub doesn't exist or user already subscribed"
        });
        return;
      }

      const subscribe_query = await query(`INSERT INTO subreddit_members (user_id, subreddit_id) VALUES ($1, $2)`,
        [user_id, subreddit_id]);
      res.status(200).json({ 
        message: "User subscribed",
        result: subscribe_query.rows[0]
      });
    }
  })
]

const user_leave_subreddit = [
  body('subreddit_id').not().isEmpty().withMessage('subreddit_id cannot be null').trim().escape(),
  
  asyncHandler( async(req, res, next) => {
    const errors = validationResult(req);
    const { subreddit_id } = req.body;
    const user_id = req.user?.id; 

    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'subreddit_id is required',
        id: req.body.subreddit_id,
      });
    } else {
      const queries = [
        'SELECT 1 FROM subreddits WHERE subreddit_id = $1',
        'SELECT 1 from subreddit_members WHERE user_id = $1 AND subreddit_id = $2'
      ];
      const params = [
        [subreddit_id],
        [user_id, subreddit_id]
      ];

      const result = await queryTransaction(queries, params);

      if (result[0].rows.length === 0 || result[1].rows.length === 0) {
        res.status(409).json({
          message: "sub doesn't exist or user already unsubscribed"
        });
        return;
      }

      const unsubscribe_query = await query(`DELETE FROM subreddit_members WHERE user_id = $1 AND subreddit_id = $2`,
        [user_id, subreddit_id]);
      res.status(200).json({ 
        message: "User unsubscribed",
        result: unsubscribe_query.rows[0]
      });
    }
  })
]

export default {
  post_create_subreddit,
  get_subbreddit_detail,
  user_join_subreddit
}