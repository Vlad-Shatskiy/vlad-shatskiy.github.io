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
import { useFeedPostStyles } from "../../styles";
import UserCard from "../shared/UserCard";
import { Link } from "react-router-dom";
import {
  Button,
  Divider,
  Hidden,
  TextField,
  Typography,
} from "@material-ui/core";
import HTMLEllipsis from "react-lines-ellipsis/lib/html";
import FollowSuggestions from "../shared/FollowSuggestions";
import OptionsDialog from "../shared/OptionsDialog";
import { formatDateToNow } from "../../utils/formatDate";
import Img from "react-graceful-image";
import {
  SAVE_POST,
  UNSAVE_POST,
  LIKE_POST,
  UNLIKE_POST,
  CREATE_COMMENT,
} from "../../graphql/mutations";
import { GET_FEED } from "../../graphql/queries";
import { useMutation } from "@apollo/react-hooks";
import { UserContext } from "../../App";

function FeedPost({ post, index }) {
  const classes = useFeedPostStyles();
  const [showCaption, setCaption] = React.useState(false);
  const [showOptionsDialog, setOptionsDialog] = React.useState(false);
  const {
    media,
    id,
    likes,
    likes_aggregate,
    default_user,
    caption,
    comments,
    saved_posts,
    location,
    comments_aggregate,
    created_at,
  } = post;
  const showFollowSuggestions = index === 1;
  const likesCount = likes_aggregate.aggregate.count;
  const commentsCount = comments_aggregate.aggregate.count;

  return (
    <>
      <article
        className={classes.article}
        style={{ marginBottom: showFollowSuggestions && 30 }}
      >
        {/* {Feed Post Header} */}
        <div className={classes.postHeader}>
          <UserCard location={location} user={default_user} />
          <MoreIcon
            className={classes.MoreIcon}
            onClick={() => {
              setOptionsDialog(true);
            }}
          />
        </div>
        {/* Feed Post Image */}
        <div>
          <Img src={media} alt="post media" className={classes.image} />
        </div>
        {/* Feed Post Buttons */}
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
          <div className={showCaption ? classes.expended : classes.collapsed}>
            <Link to={`/${default_user.username}`}>
              <Typography
                variant="subtitle2"
                component="span"
                className={classes.username}
              >
                {default_user.username}
              </Typography>
            </Link>
            {showCaption ? (
              <Typography
                variant="body2"
                component="span"
                dangerouslySetInnerHTML={{ __html: caption }}
              />
            ) : (
              <div className={classes.captionWrapper}>
                <HTMLEllipsis
                  unsafeHTML={caption}
                  className={classes.caption}
                  maxLine="0"
                  ellipsis="..."
                  basedOn="letters"
                />
                <Button
                  className={classes.moreButton}
                  onClick={() => setCaption(true)}
                >
                  more
                </Button>
              </div>
            )}
          </div>
          <Link to={`/p/${id}`}>
            <Typography
              className={classes.commentsLink}
              variant="body2"
              component="div"
            >
              View all {commentsCount} comments
            </Typography>
          </Link>
          {comments.map((comment) => (
            <div key={comment.id}>
              <Link to={`/${comment.user.username}`}>
                <Typography
                  variant="subtitle2"
                  component="span"
                  className={classes.componentUsername}
                >
                  {comment.user.username}
                </Typography>{" "}
                <Typography variant="body2" component="span">
                  {comment.content}
                </Typography>
              </Link>
            </div>
          ))}
          <Typography color="textSecondary" className={classes.dataPosted}>
            {formatDateToNow(created_at)}
          </Typography>
        </div>
        <Hidden xsDown>
          <Divider />
          <Comment postId={id} />
        </Hidden>
      </article>
      {showFollowSuggestions && <FollowSuggestions />}
      {showOptionsDialog && (
        <OptionsDialog
          authorId={default_user.id}
          postId={id}
          onClose={() => setOptionsDialog(false)}
        />
      )}
    </>
  );
}

const LikeButton = ({ likes, postId, authorId }) => {
  const classes = useFeedPostStyles();
  const { currentUserId, feedIds, me } = React.useContext(UserContext);
  const isAlreadyLiked = likes.some(({ user_id }) => user_id === currentUserId);
  const [liked, setLiked] = React.useState(isAlreadyLiked);
  const Icon = liked ? UnlikeIcon : LikeIcon;
  const className = liked ? classes.liked : classes.like;
  const [likePost] = useMutation(LIKE_POST);
  const [unLikePost] = useMutation(UNLIKE_POST);
  const variables = { postId, userId: currentUserId, profileId: authorId };
  function handleUpdate(cache, result) {
    const variables = { limit: 2, feedIds, lastTimestamp: me.created_at };
    const data = cache.readQuery({ query: GET_FEED, variables });
    const typename = result.data.insert_default_likes?.__typename;
    const count = typename === "default_likes_mutation_response" ? 1 : -1;
    const default_posts = data.default_posts.map((default_post) => ({
      ...default_post,
      likes_aggregate: {
        ...default_post.likes_aggregate,
        aggregate: {
          ...default_post.likes_aggregate.aggregate,
          count: default_post.likes_aggregate.aggregate.count + count,
        },
      },
    }));
    cache.writeQuery({ query: GET_FEED, data: { default_posts } });
  }
  const handleLike = () => {
    setLiked(true);
    likePost({ variables, update: handleUpdate });
  };
  const handleUnlike = () => {
    setLiked(false);
    unLikePost({ variables, update: handleUpdate });
  };
  const onClick = liked ? handleUnlike : handleLike;

  return <Icon className={className} onClick={onClick} />;
};

const SaveButton = ({ savedPosts, postId }) => {
  const classes = useFeedPostStyles();
  const { currentUserId } = React.useContext(UserContext);
  const isAlreadySaved = savedPosts.some(
    ({ user_id }) => user_id === currentUserId
  );
  const [saved, setSaved] = React.useState(isAlreadySaved);
  const Icon = saved ? RemoveIcon : SaveIcon;
  const [savePost] = useMutation(SAVE_POST);
  const [removePost] = useMutation(UNSAVE_POST);
  const variables = {
    postId,
    userId: currentUserId,
  };

  const handleSave = () => {
    setSaved(true);
    savePost({ variables });
  };
  const handleRemove = () => {
    setSaved(false);
    removePost({ variables });
  };
  const onClick = saved ? handleRemove : handleSave;

  return <Icon className={classes.saveIcon} onClick={onClick} />;
};

const Comment = ({ postId }) => {
  const classes = useFeedPostStyles();
  const { currentUserId, feedIds, me } = React.useContext(UserContext);
  const [createComment] = useMutation(CREATE_COMMENT);
  function handleUpdate(cache, result) {
    const variables = { limit: 2, feedIds, lastTimestamp: me.created_at };
    const data = cache.readQuery({
      query: GET_FEED,
      variables,
    });
    const oldComment = result.data.insert_default_comments.returning[0];
    const newComment = { ...oldComment, user: { ...oldComment.user } };

    const default_posts = data.default_posts.map((default_post) => {
      const newPost = {
        ...default_post,
        comments: [...default_post.comments, newComment],
        comments_aggregate: {
          ...default_post.comments_aggregate,
          aggregate: {
            ...default_post.comments_aggregate.aggregate,
            count: default_post.comments_aggregate.aggregate.count + 1,
          },
        },
      };
      return default_post.id === postId ? newPost : default_post;
    });
    cache.writeQuery({ query: GET_FEED, data: { default_posts } });
    setContent("");
  }
  function handleAddComment() {
    const variables = {
      content,
      postId,
      userId: currentUserId,
    };
    createComment({ variables, update: handleUpdate });
  }
  const [content, setContent] = React.useState("");
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
        onClick={handleAddComment}
        color="primary"
        className={classes.commentButton}
        disabled={!content.trim()}
      >
        Post
      </Button>
    </div>
  );
};
export default FeedPost;
