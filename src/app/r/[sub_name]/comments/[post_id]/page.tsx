import { fetchPostById } from "@/lib/data_api";
import PostView from "@/components/post/PostView";
import { buildCommentTree } from '@/lib/utils';

interface PostPageProp {
  params: {
    post_id: string,
    sub_name: string
  }
}

export default async function Page({ params } : PostPageProp) {
  const { post_id, sub_name } = params;
  const { post, comments} = await fetchPostById(post_id);


  //include the sub name from url
  post.subreddit_name = sub_name;
  post.post_id = post_id;
  const commentTree = buildCommentTree(comments);
  return (
    <PostView {...post} comments={commentTree} />
  )
}