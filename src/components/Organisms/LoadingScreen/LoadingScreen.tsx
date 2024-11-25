import NProgress from "nprogress";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
// material
import { styled, useTheme } from "@mui/material/styles";
import { Box, GlobalStyles } from "@mui/material";
//
// import Logo from "./Logo";

// ----------------------------------------------------------------------

const RootStyle = styled("div")(({ theme }) => ({
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.default,
}));

// ----------------------------------------------------------------------

export function ProgressBarStyle() {
  const theme = useTheme();

  return (
    <GlobalStyles
      styles={{
        "#nprogress": {
          pointerEvents: "none",
          "& .bar": {
            top: 0,
            left: 0,
            height: 2,
            width: "100%",
            position: "fixed",
            zIndex: theme.zIndex.snackbar,
            backgroundColor: theme.palette.primary.main,
            boxShadow: `0 0 2px ${theme.palette.primary.main}`,
          },
          "& .peg": {
            right: 0,
            opacity: 1,
            width: 100,
            height: "100%",
            display: "block",
            position: "absolute",
            transform: "rotate(3deg) translate(0px, -4px)",
            boxShadow: `0 0 10px ${theme.palette.primary.main}, 0 0 5px ${theme.palette.primary.main}`,
          },
        },
      }}
    />
  );
}

function ProgressBar() {
  NProgress.configure({
    showSpinner: false,
  });

  useMemo(() => {
    NProgress.start();
  }, []);

  useEffect(() => {
    NProgress.done();
  }, []);

  return null;
}

export default function LoadingScreen({ ...other }) {
  const { transparent } = other;

  return (
    <>
      <ProgressBar />

      <RootStyle
        {...other}
        style={{
          background: `${
            transparent
              ? `linear-gradient(
to right, 
rgba(0, 0, 0, 0.8) 0%, 
rgba(0, 0, 0, 0.75) 4%, 
rgba(0, 0, 0, 0.7) 18%, 
rgba(0, 0, 0, 0.75) 100%
)`
              : ``
          }`,
        }}
      >
        <motion.div
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 360 }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeatDelay: 1,
            repeat: Infinity,
          }}
        >
          {/* <Logo sx={{ width: 64, height: 64 }} /> */}
        </motion.div>

        <Box
          component={motion.div}
          animate={{
            scale: [1.2, 1, 1, 1.2, 1.2],
            rotate: [270, 0, 0, 270, 270],
            opacity: [0.25, 1, 1, 1, 0.25],
            borderRadius: ["25%", "25%", "50%", "50%", "25%"],
          }}
          transition={{ ease: "linear", duration: 3.2, repeat: Infinity }}
          sx={{
            width: 100,
            height: 100,
            borderRadius: "25%",
            position: "absolute",
            border: () => `solid 3px #957f5f`,
          }}
        />

        <Box
          component={motion.div}
          animate={{
            scale: [1, 1.2, 1.2, 1, 1],
            rotate: [0, 270, 270, 0, 0],
            opacity: [1, 0.25, 0.25, 0.25, 1],
            borderRadius: ["25%", "25%", "50%", "50%", "25%"],
          }}
          transition={{
            ease: "linear",
            duration: 3.2,
            repeat: Infinity,
          }}
          sx={{
            width: 120,
            height: 120,
            borderRadius: "25%",
            position: "absolute",
            border: () => `solid 8px #957f5f`,
          }}
        />
      </RootStyle>
    </>
  );
}
