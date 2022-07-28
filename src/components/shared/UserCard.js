import { Avatar, Typography } from "@material-ui/core";
import React from "react";
import { Link } from "react-router-dom";
import { useUserCardStyles } from "../../styles";

function UserCard({ user, avatarSize = 44, location }) {
  const classes = useUserCardStyles({ avatarSize });

  const { username, profile_image, name } = user;
  return (
    <div className={classes.wrapper}>
      <Link to={`/${username}`}>
        <Avatar
          src={profile_image}
          alt="User avatar"
          className={classes.avatar}
        />
      </Link>
      <div className={classes.nameWrapper}>
        <Link to={`/${username}`}>
          <Typography variant="subtitle1" className={classes.typography}>
            {username}
          </Typography>
        </Link>
        <Typography
          color="textSecondary"
          variant="body2"
          className={classes.typography}
        >
          {location || name}
        </Typography>
      </div>
    </div>
  );
}

export default UserCard;
