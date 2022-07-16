import {
  AppBar,
  Avatar,
  Fade,
  Grid,
  Hidden,
  InputBase,
  Typography,
} from "@material-ui/core";
import React from "react";
import { Link, useHistory } from "react-router-dom";
import { useNavbarStyles, WhiteTooltip, RedTooltip } from "../../styles";
import logo from "../../images/logo.png";
import {
  LoadingIcon,
  AddIcon,
  LikeIcon,
  LikeActiveIcon,
  ExploreIcon,
  ExploreActiveIcon,
  HomeActiveIcon,
  HomeIcon,
} from "../../icons";
import { defaultCurrentUser, getDefaultUser } from "../../data";
import NotificationTooltip from "../notification/NotificationTooltip";
import NotificationList from "../notification/NotificationList";
import { useNProgress } from "@tanem/react-nprogress";

function Navbar({ minimalNavbar }) {
  const classes = useNavbarStyles();
  const history = useHistory();
  const [isLoadingPage, setLoadingPage] = React.useState(true);
  const path = history.location.pathname;

  React.useEffect(() => {
    setLoadingPage(false);
  }, [path]);
  return (
    <>
      <Progress isAnimating={isLoadingPage} />
      <AppBar
        sx={{
          backgroundColor: "#ffffff !important",
          color: "#000000",
          display: "flex",
          alignItems: "center",
          order: 0,
          zIndex: "100 !important",
        }}
      >
        <section className={classes.section}>
          <Logo />
          {!minimalNavbar && (
            <>
              <Search history={history} />
              <Links path={path} />{" "}
            </>
          )}
        </section>
      </AppBar>
    </>
  );
}
const Logo = () => {
  const classes = useNavbarStyles();
  return (
    <div className={classes.logoContainer}>
      <Link to="/">
        <div className={classes.logoWrapper}>
          <img src={logo} alt="Instagram" className={classes.logo} />
        </div>
      </Link>
    </div>
  );
};
function Search({ history }) {
  const classes = useNavbarStyles();
  const [loading] = React.useState(false);
  const [results, setResults] = React.useState([]);
  const [query, setQuery] = React.useState("");
  const hasResults = Boolean(query) && results.length > 0;
  // let loading = true;
  React.useEffect(() => {
    console.log(hasResults);
    if (!query.trim()) return;

    setResults(Array.from({ length: 5 }, () => getDefaultUser()));
  }, [query, hasResults]);
  const handleClearInput = () => {
    setQuery("");
  };
  return (
    <Hidden xsDown>
      <WhiteTooltip
        arrow
        interactive
        open={hasResults}
        TransitionComponent={Fade}
        title={
          hasResults && (
            <Grid className={classes.resultContainer} container>
              {results.map((result) => (
                <Grid
                  key={result.id}
                  item
                  className={classes.resultLink}
                  onClick={() => {
                    history.push(`/${result.username}`);
                    handleClearInput();
                  }}
                >
                  <div className={classes.resultWrapper}>
                    <div className={classes.avatarWrapper}>
                      <Avatar src={result.profile_image} alt="user avatar" />
                    </div>
                    <div className={classes.nameWrapper}>
                      <Typography variant="body1">{result.username}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {result.name}
                      </Typography>
                    </div>
                  </div>
                </Grid>
              ))}
            </Grid>
          )
        }
      >
        <span>
          <InputBase
            className={classes.input}
            onChange={(event) => setQuery(event.target.value)}
            startAdornment={<span className={classes.searchIcon} />}
            endAdornment={
              loading ? (
                <LoadingIcon />
              ) : (
                <span
                  onClick={handleClearInput}
                  className={classes.clearIcon}
                />
              )
            }
            placeholder="Search"
            value={query}
          />{" "}
        </span>
      </WhiteTooltip>
    </Hidden>
  );
  // return <div>search</div>;
}
function Links({ path }) {
  const classes = useNavbarStyles();
  const [showTooltip, setTooltip] = React.useState(true);
  const [showList, setList] = React.useState(false);
  React.useEffect(() => {
    const timeout = setTimeout(handleHideTooltip, 5000);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
  const handleToggleList = () => {
    setList((prev) => !prev);
  };
  const handleHideTooltip = () => {
    setTooltip(false);
  };

  const handleHideList = () => {
    setList(false);
  };
  return (
    <div className={classes.linksContainer}>
      {showList && <NotificationList handleHideList={handleHideList} />}
      <div className={classes.linksWrapper}>
        <Hidden xsDown>
          <AddIcon />
        </Hidden>
        <Link to="/">{path === "/" ? <HomeActiveIcon /> : <HomeIcon />}</Link>
        <Link to="/explore">
          {path === "/explore" ? <ExploreActiveIcon /> : <ExploreIcon />}
        </Link>
        <RedTooltip
          arrow
          open={showTooltip}
          onOpen={handleHideTooltip}
          title={<NotificationTooltip />}
        >
          <span>
            <div className={classes.notifications} onClick={handleToggleList}>
              {showList ? <LikeActiveIcon /> : <LikeIcon />}
            </div>
          </span>
        </RedTooltip>

        <Link to={`/${defaultCurrentUser.username}`}>
          <div
            className={
              path === `/${defaultCurrentUser.username}`
                ? classes.profileActive
                : ""
            }
          ></div>
          <Avatar
            src={defaultCurrentUser.profile_image}
            className={classes.profileImage}
          />
        </Link>
      </div>
    </div>
  );
}
function Progress({ isAnimating }) {
  const classes = useNavbarStyles();
  const { animationDuration, isFinished, progress } = useNProgress({
    isAnimating,
  });
  return (
    <div
      className={classes.progressContainer}
      style={{
        opacity: isFinished ? 0 : 1,
        transition: `opacity ${animationDuration}ms linear`,
      }}
    >
      <div
        className={classes.progressBar}
        style={{
          marginLeft: `${(-1 + progress) * 100}%`,
          transition: `margin-left ${animationDuration}ms linear`,
        }}
      >
        <div className={classes.progressBackground} />
      </div>
    </div>
  );
}
export default Navbar;