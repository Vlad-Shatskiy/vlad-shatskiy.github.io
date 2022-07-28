import { Typography } from "@material-ui/core";
import React from "react";
import { LoadingLargeIcon } from "../../icons";
import { useMorePostsFromUserStyles } from "../../styles";
import GridPost from "../shared/GridPost";
import { Link } from "react-router-dom";
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import { GET_POST, GET_MORE_POSTS_FROM_USER } from "../../graphql/queries";
function MorePostsFromUser({ postId }) {
  const variables = { postId };
  const { data, loading } = useQuery(GET_POST, { variables });
  const [getMorePostsFromUser, { data: morePosts, loading: loading2 }] =
    useLazyQuery(GET_MORE_POSTS_FROM_USER);
  const classes = useMorePostsFromUserStyles();

  React.useEffect(() => {
    if (loading) return;
    const userId = data.default_posts_by_pk.default_user.id;
    const postId = data.default_posts_by_pk.id;

    const variables = { userId, postId };
    getMorePostsFromUser({ variables });
  }, [data, loading, getMorePostsFromUser, morePosts]);

  return (
    <div className={classes.container}>
      {loading || loading2 ? (
        <LoadingLargeIcon />
      ) : (
        <>
          <Typography
            color="textSecondary"
            variant="subtitle2"
            component="h2"
            gutterBottom
            className={classes.typography}
          >
            More Posts from{" "}
            <Link
              to={`/${data.default_posts_by_pk.default_user.username}`}
              className={classes.link}
            >
              @{data.default_posts_by_pk.default_user.username}
            </Link>
          </Typography>

          <article className={classes.article}>
            <div className={classes.postContainer}>
              {morePosts?.default_posts.map((post) => (
                <GridPost key={post.id} post={post} />
              ))}
            </div>
          </article>
        </>
      )}
    </div>
  );
}

export default MorePostsFromUser;
