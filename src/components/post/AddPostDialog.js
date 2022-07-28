import { useMutation } from "@apollo/react-hooks";
import {
  AppBar,
  Avatar,
  Button,
  Dialog,
  Divider,
  InputAdornment,
  Paper,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { ArrowBackIos, PinDrop } from "@material-ui/icons";
import React from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { UserContext } from "../../App";
import { CREATE_POST } from "../../graphql/mutations";
import { useAddPostDialogStyles } from "../../styles";
import handleImageUpload from "../../utils/handleImageUpload";
import serialize from "../../utils/serialize";

const initialValue = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];
const AddPostDialog = ({ media, handleClose }) => {
  const classes = useAddPostDialogStyles();
  const { me, currentUserId } = React.useContext(UserContext);
  const [editor] = React.useState(() => withReact(createEditor()));
  const [value, setValue] = React.useState([]);
  const [location, setLocation] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [createPost] = useMutation(CREATE_POST);
  async function handleSharePost() {
    setSubmitting(true);
    const url = await handleImageUpload(media);
    const variables = {
      userId: currentUserId,
      location,
      caption: serialize({ children: value }),
      media: url,
    };
    await createPost({ variables });
    setSubmitting(false);
    window.location.reload();
  }
  return (
    <Dialog fullScreen open onClose={handleClose}>
      <AppBar className={classes.appBar}>
        <Toolbar className={classes.toolbar}>
          <ArrowBackIos onClick={handleClose} />
          <Typography align="center" variant="body1" className={classes.title}>
            New Post
          </Typography>
          <Button
            color="primary"
            className={classes.share}
            disabled={submitting}
            onClick={handleSharePost}
          >
            Share
          </Button>
        </Toolbar>
      </AppBar>
      <Divider />
      <div style={{ paddingTop: "45px" }}>
        <Paper className={classes.paper}>
          <Avatar src={me.profile_image} />
          <Slate
            editor={editor}
            value={initialValue}
            onChange={(value) => setValue(value)}
          >
            <Editable
              className={classes.editor}
              placeholder="Write your caption."
            />
          </Slate>

          <Avatar
            src={URL.createObjectURL(media)}
            className={classes.avatarLarge}
            variant="square"
          />
        </Paper>
        <TextField
          fullWidth
          placeholder="Location"
          InputProps={{
            classes: {
              root: classes.root,
              input: classes.input,
              underline: classes.underline,
            },
            startAdornment: (
              <InputAdornment>
                <PinDrop />
              </InputAdornment>
            ),
          }}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>
    </Dialog>
  );
};

export default AddPostDialog;
