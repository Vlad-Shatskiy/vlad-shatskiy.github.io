import { useMutation, useQuery } from "@apollo/react-hooks";
import {
  Button,
  Drawer,
  Hidden,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  Snackbar,
  TextField,
  Typography,
} from "@material-ui/core";
import { Menu } from "@material-ui/icons";
import React from "react";
import { UserContext } from "../App";
import Layout from "../components/shared/Layout";
import LoadingScreen from "../components/shared/LoadingScreen";
import ProfilePicture from "../components/shared/ProfilePicture";
import { GET_EDIT_USER_PROFILE } from "../graphql/queries";
import { useEditProfilePageStyles } from "../styles";
import { useForm } from "react-hook-form";
import isURL from "validator/lib/isURL";
import isMobilePhone from "validator/lib/isMobilePhone";
import isEmail from "validator/lib/isEmail";
import { EDIT_USER, EDIT_USER_AVATAR } from "../graphql/mutations";
import { AuthContext } from "../auth";
import handleImageUpload from "../utils/handleImageUpload";
function EditProfilePage({ history }) {
  const { currentUserId } = React.useContext(UserContext);
  const variables = { id: currentUserId };
  const { data, loading } = useQuery(GET_EDIT_USER_PROFILE, { variables });
  const classes = useEditProfilePageStyles();
  const path = history.location.pathname;
  const [showDrawer, setDrawer] = React.useState(false);

  if (loading) return <LoadingScreen />;
  const handleToggleDrawer = () => {
    setDrawer((prev) => !prev);
  };
  const handleSelected = (index) => {
    switch (index) {
      case 0:
        return path.includes("edit");
      default:
        break;
    }
  };
  const handleListClick = (index) => {
    switch (index) {
      case 0:
        history.push("/accounts/edit");
        break;
      default:
        break;
    }
  };
  const options = [
    "Edit Profile",
    "Change Password",
    "Apps and Websites",
    "Email and SMS",
    "Push Notifications",
    "Manage Contacts",
    "Privacy and Security",
    "Login Activity",
    "Emails from Instagram",
  ];
  const drawer = (
    <List>
      {options.map((option, index) => (
        <ListItem
          key={option}
          button
          selected={handleSelected(index)}
          onClick={handleListClick}
          classes={{
            selected: classes.listItemSelected,
            button: classes.listItemButton,
          }}
        >
          <ListItemText primary={option} />
        </ListItem>
      ))}
    </List>
  );
  return (
    <Layout title="Edit Profile">
      <section className={classes.section}>
        <IconButton
          edge="start"
          onClick={handleToggleDrawer}
          className={classes.menuButton}
        >
          <Menu />
        </IconButton>
        <nav>
          <Hidden
            xsDown
            implementation="css"
            className={classes.permanentDrawerRoot}
          >
            <Drawer
              open
              variant="permanent"
              classes={{
                paper: classes.permanentDrawerPaper,
                root: classes.permanentDrawerRoot,
              }}
            >
              {drawer}
            </Drawer>
          </Hidden>
          <Hidden smUp implementation="css">
            <Drawer
              variant="temporary"
              anchor="left"
              open={showDrawer}
              onClose={handleToggleDrawer}
              classes={{ paperAnchorLeft: classes.temporaryDrawer }}
            >
              {drawer}
            </Drawer>
          </Hidden>
        </nav>
        <main>
          {path.includes("edit") && (
            <EditUserInfo user={data.default_users_by_pk} />
          )}
        </main>
      </section>
    </Layout>
  );
}
const DEFAULT_ERROR = { type: "", message: "" };
const EditUserInfo = ({ user }) => {
  const { register, handleSubmit } = useForm({ mode: "onBlur" });
  const { updateEmail } = React.useContext(AuthContext);
  const [editUser] = useMutation(EDIT_USER);
  const [editUserAvatar] = useMutation(EDIT_USER_AVATAR);
  const [profileImage, setProfileImage] = React.useState(user.profile_image);
  const [error, setError] = React.useState(DEFAULT_ERROR);
  const classes = useEditProfilePageStyles();
  const [open, setOpen] = React.useState(false);
  async function onSubmit(data) {
    try {
      setError(DEFAULT_ERROR);
      const variables = { ...data, id: user.id };
      await updateEmail(data.email);
      await editUser({ variables });
      setOpen(true);
    } catch (error) {
      console.error("Error updating profile", error);
      handleError(error);
    }
  }
  function handleError(error) {
    if (error.message.includes("users_username_key")) {
      setError({ type: "username", message: "This username is already taken" });
    } else if (error.code.includes("auth")) {
      setError({ type: "email", message: error.message });
    }
  }
  async function handleUpdateProfilePic(event) {
    const url = await handleImageUpload(
      event.target.files[0],
      "instagram-avatar"
    );
    const variables = { id: user.id, profileImage: url };
    await editUserAvatar({ variables });
    setProfileImage(url);
  }
  return (
    <section className={classes.container}>
      <div className={classes.pictureSectionItem}>
        <ProfilePicture size={38} image={profileImage} />
        <div className={classes.justifySelfStart}>
          <Typography className={classes.typography}>
            {user.username}
          </Typography>
          <input
            accept="image/*"
            id="image"
            type="file"
            style={{ display: "none" }}
            onChange={handleUpdateProfilePic}
          />
          <label htmlFor="image">
            <Typography
              color="primary"
              variant="body2"
              className={classes.typographyChangePic}
            >
              Change Profile Photo
            </Typography>
          </label>
        </div>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
        <SectionItem
          name="name"
          inputRef={register({
            required: true,
            minLength: 5,
            maxLength: 20,
          })}
          text="Name"
          formItem={user.name}
        />
        <SectionItem
          name="username"
          inputRef={register({
            required: true,
            pattern: /^[a-zA-Z0-9_.]*$/,
            minLength: 5,
            maxLength: 20,
          })}
          error={error}
          text="Username"
          formItem={user.username}
        />
        <SectionItem
          name="website"
          inputRef={register({
            validate: (input) =>
              Boolean(input)
                ? isURL(input, {
                    protocols: ["http", "https"],
                    require_protocol: true,
                  })
                : true,
          })}
          text="Website"
          formItem={user.website}
        />

        <div className={classes.sectionItem}>
          <aside>
            <Typography className={classes.bio}>Bio</Typography>
          </aside>
          <TextField
            name="bio"
            inputRef={register({
              maxLength: 120,
            })}
            variant="outlined"
            multiline
            rowsMax={3}
            rows={3}
            defaultValue={user.bio}
            fullWidth
          />
        </div>
        <div className={classes.sectionItem}>
          <div />
          <Typography
            color="textSecondary"
            className={classes.justifySelfStart}
          >
            Personal Information
          </Typography>
        </div>
        <SectionItem
          error={error}
          name="email"
          inputRef={register({
            required: true,
            validate: (input) => isEmail(input),
          })}
          text="Email"
          formItem={user.email}
          type="email"
        />
        <SectionItem
          name="phoneNumber"
          inputRef={register({
            validate: (input) => (Boolean(input) ? isMobilePhone(input) : true),
          })}
          text="Phone Number"
          formItem={user.phone_number}
        />
        <div className={classes.sectionItem}>
          <div />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.justifySelfStart}
          >
            Submit
          </Button>
        </div>
      </form>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        TransitionComponent={Slide}
        message={<span>Profile updated</span>}
        onClose={() => setOpen(false)}
      />
    </section>
  );
};
const SectionItem = ({
  type = "text",
  text,
  formItem,
  inputRef,
  name,
  register,
  error,
}) => {
  const classes = useEditProfilePageStyles();
  return (
    <div className={classes.sectionItemWrapper}>
      <aside>
        <Hidden xsDown>
          <Typography className={classes.typography} align="right">
            {text}
          </Typography>
        </Hidden>
        <Hidden smUp>
          <Typography className={classes.typography}>{text}</Typography>
        </Hidden>
      </aside>
      <TextField
        name={name}
        inputRef={inputRef}
        variant="outlined"
        helperText={error?.type === name && error.message}
        fullWidth
        defaultValue={formItem}
        type={type}
        className={classes.textField}
        inputProps={{ className: classes.textFieldInput }}
      />
    </div>
  );
};
export default EditProfilePage;
