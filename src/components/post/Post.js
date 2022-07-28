import {
  CommentIcon,
  LikeIcon,
  MoreIcon,
  RemoveIcon,
  SaveIcon,
  ShareIcon,
  UnlikeIcon,
} from "../../icons";
import React from "react";
import { usePostStyles } from "../../styles";
import UserCard from "../shared/UserCard";
import { Link } from "react-router-dom";
import {
  Avatar,
  Button,
  Divider,
  Hidden,
  TextField,
  Typography,
} from "@material-ui/core";
import OptionsDialog from "../shared/OptionsDialog";
import PostSkeleton from "./PostSkeleton";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import { GET_POST } from "../../graphql/subscriptions";
import { UserContext } from "../../App";
import {
  CREATE_COMMENT,
  LIKE_POST,
  SAVE_POST,
  UNLIKE_POST,
  UNSAVE_POST,
} from "../../graphql/mutations";
import { formatDateToNowShort, formatPostDate } from "../../utils/formatDate";
import Img from "react-graceful-image";
function Post({ postId }) {
  const classes = usePostStyles();
  const [showOptionsDialog, setOptionsDialog] = React.useState(false);
  const variables = { postId };
  const { data, loading } = useSubscription(GET_POST, { variables });

  if (loading) return <PostSkeleton />;
  const {
    media,
    id,
    likes,
    likes_aggregate,
    saved_posts,
    default_user,
    caption,
    comments,
    created_at,
    location,
  } = data.default_posts_by_pk;

  const likesCount = likes_aggregate.aggregate.count;
  return (
    <div className={classes.postContainer}>
      <article className={classes.article}>
        {/* { Post Header} */}
        <div className={classes.postHeader}>
          <UserCard user={default_user} location={location} avatarSize={32} />
          <MoreIcon
            className={classes.moreIcon}
            onClick={() => {
              setOptionsDialog(true);
            }}
          />
        </div>
        {/*  Post Image */}
        <div className={classes.postImage}>
          <Img src={media} alt="post media" className={classes.image} />
        </div>
        {/* Post Buttons */}
        <div className={classes.postButtonsWrapper}>
          <div className={classes.postButtons}>
            <LikeButton likes={likes} postId={id} authorId={default_user.id} />
            <Link to={`/p/${id}`}></Link>
            <CommentIcon />
            <ShareIcon />
            <SaveButton savedPosts={saved_posts} postId={id} />
          </div>
          <Typography className={classes.likes} variant="subtitle2">
            <span>{likesCount === 1 ? "1 like" : `${likesCount} likes`}</span>
          </Typography>
          <div
            style={{
              overflowY: "scroll",
              padding: "16px 12px",
              height: "100%",
            }}
          >
            <AuthorCaption
              user={default_user}
              createdAt={created_at}
              caption={caption}
            />
            {comments.map((comment) => (
              <UserComment key={comment.id} comment={comment} />
            ))}
          </div>
          <Typography color="textSecondary" className={classes.dataPosted}>
            {formatPostDate(created_at)}
          </Typography>
          <Hidden xsDown>
            <div className={classes.comment}>
              <Divider />
              <Comment postId={id} />
            </div>
          </Hidden>
        </div>
      </article>
      {showOptionsDialog && (
        <OptionsDialog
          postId={id}
          authorId={default_user.id}
          onClose={() => setOptionsDialog(false)}
        />
      )}
    </div>
  );
}
const AuthorCaption = ({ user, caption, createdAt }) => {
  const classes = usePostStyles();
  return (
    <div style={{ display: "flex" }}>
      <Avatar
        src={user.profile_image}
        alt="User avatar"
        style={{ marginRight: 14, width: 32, height: 32 }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link to={`/${user.username}`}>
          <Typography
            variant="subtitle2"
            component="span"
            className={classes.username}
          >
            {user.username}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            className={classes.postCaption}
            style={{ paddingLeft: 0 }}
            dangerouslySetInnerHTML={{ __html: caption }}
          />
        </Link>
        <Typography
          style={{ marginTop: 16, marginBottom: 4, display: "inline-block" }}
          color="textSecondary"
          variant="caption"
        >
          {formatDateToNowShort(createdAt)}
        </Typography>
      </div>
    </div>
  );
};
const UserComment = ({ comment }) => {
  const classes = usePostStyles();
  return (
    <div style={{ display: "flex" }}>
      <Avatar
        src={comment.user.profile_image}
        alt="User avatar"
        style={{ marginRight: 14, width: 32, height: 32 }}
      />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Link to={`/${comment.user.username}`}>
          <Typography
            variant="subtitle2"
            component="span"
            className={classes.username}
          >
            {comment.user.username}
          </Typography>
          <Typography
            variant="body2"
            component="span"
            className={classes.postCaption}
            style={{ paddingLeft: 0 }}
          >
            {comment.content}
          </Typography>
        </Link>
        <Typography
          style={{ marginTop: 16, marginBottom: 4, display: "inline-block" }}
          color="textSecondary"
          variant="caption"
        >
          {formatDateToNowShort(comment.created_at)}
        </Typography>
      </div>
    </div>
  );
};

const LikeButton = ({ likes, authorId, postId }) => {
  const classes = usePostStyles();
  const { currentUserId } = React.useContext(UserContext);
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId);
  const [liked, setLiked] = React.useState(isAlreadyLiked);
  const Icon = liked ? UnlikeIcon : LikeIcon;
  const className = liked ? classes.liked : classes.like;
  const [likePost] = useMutation(LIKE_POST);
  const [unLikePost] = useMutation(UNLIKE_POST);
  const variables = {
    postId,
    userId: currentUserId,
    profileId: authorId,
  };
  const handleLike = () => {
    setLiked(true);
    likePost({ variables });
  };
  const handleUnlike = () => {
    setLiked(false);
    unLikePost({ variables });
  };
  const onClick = liked ? handleUnlike : handleLike;

  return <Icon className={className} onClick={onClick} />;
};
const SaveButton = ({ savedPosts, postId }) => {
  const classes = usePostStyles();
  const { currentUserId } = React.useContext(UserContext);
  const isAlreadySaved = savedPosts.some(
    ({ user_id }) => user_id === currentUserId
  );
  const [saved, setSaved] = React.useState(isAlreadySaved);
  const Icon = saved ? RemoveIcon : SaveIcon;
  const [savePost] = useMutation(SAVE_POST);
  const [unSavePost] = useMutation(UNSAVE_POST);
  const variables = { postId, userId: currentUserId };
  const handleSave = () => {
    setSaved(true);
    savePost({ variables });
  };
  const handleRemove = () => {
    setSaved(false);
    unSavePost({ variables });
  };
  const onClick = saved ? handleRemove : handleSave;

  return <Icon className={classes.saveIcon} onClick={onClick} />;
};

const Comment = ({ postId }) => {
  const classes = usePostStyles();
  const [content, setContent] = React.useState("");
  const [createComment] = useMutation(CREATE_COMMENT);
  const { currentUserId } = React.useContext(UserContext);
  const handleAddCommment = () => {
    const variables = { content, postId, userId: currentUserId };
    createComment({ variables });
    setContent("");
  };
  return (
    <div className={classes.commentContainer}>
      <TextField
        fullWidth
        vlaue={content}
        placeholder="Add a comment..."
        multiline
        rowsMax={2}
        rows={1}
        onChange={(event) => setContent(event.target.value)}
        className={classes.textField}
        InputProps={{
          classes: {
            root: classes.root,
            underline: classes.underline,
          },
        }}
      />
      <Button
        onClick={handleAddCommment}
        color="primary"
        className={classes.commentButton}
        disabled={!content.trim()}
      >
        Post
      </Button>
    </div>
  );
};
export default Post;
