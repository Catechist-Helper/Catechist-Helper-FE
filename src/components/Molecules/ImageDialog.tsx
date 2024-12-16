import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import ButtonAtom from "../Atoms/ButtonAtom";
import { formatDate } from "../../utils/formatDate";

interface ImageData {
  name?: string;
  url?: string;
  createdAt?: string;
}

interface ImageDialogProps {
  images: ImageData[];
  title: string;
  open: boolean;
  onClose: () => void;
  imageTitle?: string;
}

const ImageDialog: React.FC<ImageDialogProps> = ({
  images,
  title,
  open,
  onClose,
  imageTitle,
}) => {
  console.log("images", images);
  return (
    <div>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {images.length > 0 ? (
            images.map((image, index) => (
              <Box key={index} mb={2}>
                {image.url && (
                  <img
                    src={image.url}
                    alt={image.name || "Image"}
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  />
                )}
                {image.name && (
                  <Typography
                    variant="subtitle1"
                    color="textPrimary"
                    align="center"
                  >
                    {imageTitle ? <strong>{imageTitle}:</strong> : <></>}{" "}
                    {image.name}
                  </Typography>
                )}
                {image.createdAt && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    align="center"
                  >
                    <strong>Thời gian:</strong>{" "}
                    {formatDate.DD_MM_YYYY_Time(image.createdAt)}
                  </Typography>
                )}
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Không có ảnh để hiển thị.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <ButtonAtom
            color={"primary"}
            onClickFunc={onClose}
            text="Đóng"
            variant={"contained"}
          />
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImageDialog;
