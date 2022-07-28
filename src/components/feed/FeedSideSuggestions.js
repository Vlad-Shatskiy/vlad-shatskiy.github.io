import { Paper, Typography } from "@material-ui/core";
import React from "react";
import { useFeedSideSuggestionsStyles } from "../../styles";
import UserCard from "../shared/UserCard";
import FollowButton from "../shared/FollowButton";
import { LoadingIcon } from "../../icons";
import { useQuery } from "@apollo/react-hooks";
import { SUGGEST_USER } from "../../graphql/queries";
import { UserContext } from "../../App";
function FeedSideSuggestions() {
  const classes = useFeedSideSuggestionsStyles();
  const { me, followerIds } = React.useContext(UserContext);
  const variables = { limit: 5, followerIds, createdAt: me.created_at };
  const { data, loading } = useQuery(SUGGEST_USER, { variables });
  return (
    <article className={classes.article}>
      <Paper className={classes.paper}>
        <Typography
          color="textSecondary"
          variant="subtitle2"
          component="h2"
          align="left"
          gutterBottom
          className={classes.typography}
        >
          Suggestions For You
        </Typography>
        {loading ? (
          <LoadingIcon />
        ) : (
          data.default_users.map((user) => (
            <div key={user.id} className={classes.card}>
              <UserCard user={user} />
              <FollowButton id={user.id} side />
            </div>
          ))
        )}
      </Paper>
    </article>
  );
}

export default FeedSideSuggestions;
