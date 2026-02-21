// types/comment.ts - 评论类型定义
export interface UserInfo {
  id: number;
  userAvatar: string;
  userName: string;
  speakStatus?: boolean;
}

export interface CommentChildVO {
  id: number;
  parentId: number;
  userId: number;
  userName: string;
  userAvatar: string;
  replierId?: number;
  replierName?: string;
  replierAvatar?: string;
  content: string;
  replyInputStatus?: boolean;
  upvoteFlag: boolean;
  upvoteCount: number;
  contentType: string;
  createTime: string;
  time?: string;
}

export interface CommentParentVO {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  content: string;
  showReplyInput?: boolean;
  childTotal: number;
  upvoteFlag: boolean;
  upvoteCount: number;
  createTime: string;
  time?: string;
  commentChildVOS: CommentChildVO[];
  loadingChildren?: boolean;
  hasMoreChildren?: boolean;
  currentChildPage?: number;
}

export interface EvaluationsVO {
  count: number;
  data: CommentParentVO[];
}

export interface CommentQueryDTO {
  contentId: number;
  contentType: string;
  page: number;
  size: number;
  currentUserId?: number;
}

export interface Evaluations {
  id?: number;
  parentId?: number;
  contentType: string;
  content: string;
  contentId: number;
  replierId?: number;
}

export interface UpvoteResponse {
  count: number;
  haveUpvote: boolean;
}