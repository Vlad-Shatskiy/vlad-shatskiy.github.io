import { Typography } from "@material-ui/core";
import React from "react";
import { useNavbarStyles } from "../../styles";

function NotificationTooltip({ notifications }) {
  const classes = useNavbarStyles();

  const countNotifications = (notificationType) => {
    return notifications.filter(({ type }) => type === notificationType).length;
  };
  let followCount = countNotifications("follow");
  let likeCount = countNotifications("like");

  return (
    <div className={classes.tooltipContainer}>
      {followCount > 0 && (
        <div className={classes.tooltip}>
          <span aria-label="Followers" className={classes.followers} />
          <Typography>{followCount}</Typography>
        </div>
      )}
      {likeCount && (
        <div className={classes.tooltip}>
          <span aria-label="Likes" className={classes.likes} />
          <Typography>{likeCount}</Typography>
        </div>
      )}
    </div>
  );
}

export default NotificationTooltip;
