// src/pages/NotFoundPage.tsx

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import HomeTemplate from "../../components/Templates/HomeTemplate/HomeTemplate";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <HomeTemplate>
        <div>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              height: "70vh",
              color: "#fff",
            }}
          >
            <Typography
              variant="h1"
              sx={{ fontSize: "10rem", fontWeight: "bold" }}
            >
              404
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontSize: "3rem", fontWeight: "bold" }}
            >
              Trang không tìm thấy
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, fontSize: "1.5rem" }}
              onClick={() => navigate("/")} // Chuyển hướng về trang chính
              style={{ background: "#000" }}
            >
              Quay lại trang chính
            </Button>
          </Box>
        </div>
      </HomeTemplate>
    </>
  );
};

export default NotFoundPage;
