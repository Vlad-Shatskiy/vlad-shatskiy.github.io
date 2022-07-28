import {
  Avatar,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  Divider,
  Hidden,
  Typography,
  Zoom,
} from "@material-ui/core";
import React from "react";
import Layout from "../components/shared/Layout";
// import { defaultCurrentUser } from "../data";
import { useProfilePageStyles } from "../styles";
import ProfilePicture from "../components/shared/ProfilePicture";
import { Link, useHistory, useParams } from "react-router-dom";
import { GearIcon } from "../icons";
import ProfileTabs from "../components/profile/ProfileTabs";
import { AuthContext } from "../auth";
import { useApolloClient, useMutation, useQuery } from "@apollo/react-hooks";
import { GET_USER_PROFILE } from "../graphql/queries";
import LoadingScreen from "../components/shared/LoadingScreen";
import { UserContext } from "../App";
import { FOLLOW_USER, UNFOLLOW_USER } from "../graphql/mutations";
function ProfilePage() {
  const { username } = useParams();
  const [showOptionsMenu, setOptionsMenu] = React.useState(false);
  const variables = { username };
  const { currentUserId } = React.useContext(UserContext);
  const { data, loading } = useQuery(GET_USER_PROFILE, {
    variables,
    fetchPolicy: "no-cache",
  });
  const classes = useProfilePageStyles();
  if (loading) return <LoadingScreen />;
  const [user] = data.default_users;
  const isOwner = user.id === currentUserId;

  const handleOptionsMenuClick = () => setOptionsMenu(true);
  const handleCloseMenu = () => setOptionsMenu(false);
  return (
    <Layout title={`${user.name} (@${user.username})`}>
      <div className={classes.container}>
        <Hidden xsDown>
          <Card className={classes.cardLarge}>
            <ProfilePicture isOwner={isOwner} image={user.profile_image} />
            <CardContent className={classes.cardContentLarge}>
              <ProfileNameSection
                user={user}
                isOwner={isOwner}
                handleOptionsMenuClick={handleOptionsMenuClick}
              />
              <PostCountSection user={user} />
              <NameBioSection user={user} />
            </CardContent>
          </Card>
        </Hidden>
        <Hidden smUp>
          <Card className={classes.cardSmall}>
            <CardContent>
              <section className={classes.sectionSmall}>
                <ProfilePicture
                  size={77}
                  isOwner={isOwner}
                  image={user.profile_image}
                />
                <ProfileNameSection
                  user={user}
                  isOwner={isOwner}
                  handleOptionsMenuClick={handleOptionsMenuClick}
                />
              </section>
              <NameBioSection user={user} />
            </CardContent>
            <PostCountSection user={user} />
          </Card>
        </Hidden>
        {showOptionsMenu && <OptionsMenu handleCloseMenu={handleCloseMenu} />}
        <ProfileTabs user={user} isOwner={isOwner} />
      </div>
    </Layout>
  );
}

const ProfileNameSection = ({ user, isOwner, handleOptionsMenuClick }) => {
  const classes = useProfilePageStyles();
  const [showUnfollowDialog, setUnfollowDialog] = React.useState(false);
  const { currentUserId, followingIds, followerIds } =
    React.useContext(UserContext);
  let followButton;
  const isAlreadyFollowing = followingIds.some((id) => id === user.id);
  const [isFollowing, setFollowing] = React.useState(isAlreadyFollowing);
  const isFollower = !isFollowing && followerIds.some((id) => id === user.id);
  const variables = {
    userIdToFollow: user.id,
    currentUserId,
  };
  const [followUser] = useMutation(FOLLOW_USER);
  const handleFollowUser = () => {
    setFollowing(true);
    followUser({ variables });
  };
  const onUnfollowUser = React.useCallback(() => {
    setUnfollowDialog(false);
    setFollowing(false);
  }, []);
  // const isFollowing = true;
  // const isFollower = false;
  if (isFollowing) {
    followButton = (
      <Button
        onClick={() => setUnfollowDialog(true)}
        variant="outlined"
        className={classes.button}
      >
        Following
      </Button>
    );
  } else if (isFollower) {
    followButton = (
      <Button
        onClick={handleFollowUser}
        variant="contained"
        color="primary"
        className={classes.button}
      >
        Follow Back
      </Button>
    );
  } else {
    followButton = (
      <Button
        onClick={handleFollowUser}
        variant="contained"
        color="primary"
        className={classes.button}
      >
        Follow
      </Button>
    );
  }

  return (
    <>
      <Hidden xsDown>
        <section className={classes.usernameSection}>
          <Typography className={classes.username}>{user.username}</Typography>
          {isOwner ? (
            <>
              <Link to="/accounts/edit">
                <Button variant="outlined">Edit Profile</Button>
              </Link>
              <div
                onClick={handleOptionsMenuClick}
                className={classes.settingsWrapper}
              >
                <GearIcon className={classes.settings} />
              </div>
            </>
          ) : (
            <>{followButton}</>
          )}
        </section>
      </Hidden>
      <Hidden smUp>
        <section>
          <div className={classes.usernameDivSmall}>
            <Typography className={classes.username}>
              {user.username}
            </Typography>
            {isOwner && (
              <div
                onClick={handleOptionsMenuClick}
                className={classes.settingsWrapper}
              >
                <GearIcon className={classes.settings} />
              </div>
            )}
          </div>
          {isOwner ? (
            <Link to="/accounts/edit">
              <Button variant="outlined" style={{ width: "100%" }}>
                Edit Profile
              </Button>
            </Link>
          ) : (
            followButton
          )}
        </section>
      </Hidden>
      {showUnfollowDialog && (
        <UnfollowDialog
          onUnfollowUser={onUnfollowUser}
          user={user}
          onClose={() => setUnfollowDialog(false)}
        />
      )}
    </>
  );
};

const UnfollowDialog = ({ onClose, user, onUnfollowUser }) => {
  const classes = useProfilePageStyles();
  const { currentUserId } = React.useContext(UserContext);
  const [unFollowUser] = useMutation(UNFOLLOW_USER);
  const handleUnfollowUser = () => {
    const variables = { userIdToFollow: user.id, currentUserId };
    unFollowUser({ variables });
    onUnfollowUser();
  };
  return (
    <Dialog
      open
      classes={{ scrollPaper: classes.unfollowDialogScrollPaper }}
      onClose={onClose}
      TransitionComponent={Zoom}
    >
      <div className={classes.wrapper}>
        <Avatar
          src={user.profile_image}
          alt={`${user.username}'s avatar`}
          className={classes.avatar}
        />
      </div>
      <Typography align="center" className={classes.unfollowDialogText}>
        Unfollow @{user.username} ?
      </Typography>
      <Divider />
      <Button onClick={handleUnfollowUser} className={classes.unfollowButton}>
        Unfollow
      </Button>
      <Divider />
      <Button onClick={onClose} className={classes.cancelButton}>
        Cancel
      </Button>
    </Dialog>
  );
};

const PostCountSection = ({ user }) => {
  const classes = useProfilePageStyles();
  const options = ["posts", "followers", "following"];
  console.log(user);
  return (
    <>
      <Hidden smUp>
        <Divider />
      </Hidden>
      <section className={classes.followingSection}>
        {options.map((option) => (
          <div key={option} className={classes.followingText}>
            <Typography className={classes.followingCount}>
              {user[`${option}_aggregate`].aggregate.count}
            </Typography>
            <Hidden xsDown>
              <Typography>{option}</Typography>
            </Hidden>
            <Hidden smUp>
              <Typography color="textSecondary">{option}</Typography>
            </Hidden>
          </div>
        ))}
      </section>
      <Hidden smUp>
        <Divider />
      </Hidden>
    </>
  );
};
const NameBioSection = ({ user }) => {
  const classes = useProfilePageStyles();
  return (
    <section className={classes.section}>
      <Typography className={classes.typography}>{user.name}</Typography>
      <Typography>{user.bio}</Typography>
      <a href={user.website} target="_blank" rel="noopener noreferrer">
        <Typography color="secondary" className={classes.typography}>
          {user.website}
        </Typography>
      </a>
    </section>
  );
};
const OptionsMenu = ({ handleCloseMenu }) => {
  const classes = useProfilePageStyles();
  const { signOut } = React.useContext(AuthContext);
  const [showLogoutMessage, setLogOutMessage] = React.useState(false);
  const history = useHistory();
  const client = useApolloClient();
  const handleLogOutClick = () => {
    setLogOutMessage(true);
    setTimeout(async () => {
      await client.clearStore();
      signOut();
      history.push("/accounts/login");
    }, 2000);
  };
  return (
    <Dialog
      open
      classes={{
        scrollPaper: classes.dialogScrollPaper,
        paper: classes.dialogPaper,
      }}
      TransitionComponent={Zoom}
    >
      {showLogoutMessage ? (
        <DialogTitle className={classes.dialogTitle}>
          Logging Out
          <Typography color="textSecondary">
            You need to log back in to continue using Instagram.
          </Typography>
        </DialogTitle>
      ) : (
        <>
          <OptionsItem text="Change Password" />
          <OptionsItem text="Nametag" />
          <OptionsItem text="Authorized Apps" />
          <OptionsItem text="Notification" />
          <OptionsItem text="Privacy and Security" />
          <OptionsItem text="Log Out" onClick={handleLogOutClick} />
          <OptionsItem text="Cancel" onClick={handleCloseMenu} />
        </>
      )}
    </Dialog>
  );
};

const OptionsItem = ({ text, onClick }) => {
  return (
    <>
      <Button style={{ padding: "12px 8px" }} onClick={onClick}>
        {text}
      </Button>
      <Divider />
    </>
  );
};
export default ProfilePage;
