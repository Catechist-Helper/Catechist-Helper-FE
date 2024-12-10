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
              sx={{ fontSize: "6rem", fontWeight: "bold" }}
            >
              Trang không tìm thấy
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontSize: "1.9rem", fontWeight: "bold", marginTop: "10px" }}
            >
              Rất tiếc! Trang bạn đang truy cập hiện không được tìm thấy
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 3, fontSize: "1.5rem" }}
              onClick={() => navigate("/")}
              className="bg-black hover:bg-primary_color"
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
