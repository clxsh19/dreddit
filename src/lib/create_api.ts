"use server"
import { cookies } from 'next/headers';

interface CreateCommentParams {
  post_id: number;
  parent_comment_id?: number | null;
  comment: string;
}

export async function createComment({ post_id, parent_comment_id=null, comment }: CreateCommentParams) {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    console.log({
      post_id,
      parent_comment_id,
      comment,
    })
    const res = await fetch('http://localhost:5000/api/comment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: allCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '),
      },
      credentials: 'include',    
      body: JSON.stringify({
        post_id,
        parent_comment_id,
        comment,
      }),
    });  
    const data = await res.json();
    
    console.log(data);
  } catch (error) {
    console.error('Create comment failed', error);
    throw new Error('Failed to create comment.');
  }
}

export async function submitPostVote(post_id: number, voteType: -1|1) {
  try {
    const res = await fetch('http://localhost:5000/api/comment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        post_id,
        voteType
      }),
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error('Couldn\'t submit vote', error);
  }  
}