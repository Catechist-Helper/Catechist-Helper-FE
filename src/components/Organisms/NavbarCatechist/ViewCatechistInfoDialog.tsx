import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import catechistApi from "../../../api/Catechist";
import {
  CatechistItemResponse,
  CertificateResponse,
} from "../../../model/Response/Catechist";
import { getUserInfo } from "../../../utils/utils";
import ImageDialog from "../../Molecules/ImageDialog";
import { formatDate } from "../../../utils/formatDate";

interface ViewCatechistInfoDialogProps {
  open: boolean;
  onClose: () => void;
}

const ViewCatechistInfoDialog: React.FC<ViewCatechistInfoDialogProps> = ({
  open,
  onClose,
}) => {
  const [catechist, setCatechist] = useState<CatechistItemResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy catechistId từ userLogin
  useEffect(() => {
    const fetchCatechistInfo = async () => {
      try {
        const user = getUserInfo();
        if (user?.catechistId) {
          const response = await catechistApi.getCatechistById(
            user.catechistId
          );
          setCatechist(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching catechist data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCatechistInfo();
  }, []);

  const [dialogCertificateImageOpen, setDialogCertificateImageOpen] =
    useState(false);
  const [dialogData, setDialogData] = useState({
    images: [],
    title: "",
  });

  const handleOpenDialogCertificateImage = (
    certificates: CertificateResponse[],
    fullName: string,
    code: string
  ) => {
    const images: any = certificates
      .filter((cert) => cert.image)
      .map((cert) => ({
        name: cert.name,
        url: cert.image,
      }));

    setDialogData({
      images,
      title: `Chứng chỉ của giáo lý viên ${fullName} - ${code}`,
    });
    setDialogCertificateImageOpen(true);
  };

  const handleCloseDialogCertificateImage = () =>
    setDialogCertificateImageOpen(false);

  if (loading) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <h2 className="text-primary font-bold">
          Thông tin giáo lý viên {catechist?.fullName || ""}
        </h2>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <div className="mt-4">
              <div className="w-full flex flex-col items-center">
                <img
                  src={catechist?.imageUrl ?? "https://via.placeholder.com/150"}
                  alt="Preview"
                  style={{
                    borderRadius: "3px",
                    width: "300px",
                    height: "400px",
                  }}
                />
              </div>
            </div>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tên đầy đủ"
              value={catechist?.fullName || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "10px" }}
            />
            <TextField
              label="Mã giáo lý viên"
              value={catechist?.code || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Giới tính"
              value={catechist?.gender || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Ngày sinh"
              value={formatDate.DD_MM_YYYY(catechist?.dateOfBirth ?? "")}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Nơi sinh"
              value={catechist?.birthPlace || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Tên Thánh"
              value={catechist?.christianName || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              value={catechist?.email || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại"
              value={catechist?.phone || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Địa chỉ"
              value={catechist?.address || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Học vấn"
              value={catechist?.qualification || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tên cha"
              value={catechist?.fatherName || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại cha"
              value={catechist?.fatherPhone || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tên mẹ"
              value={catechist?.motherName || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại mẹ"
              value={catechist?.motherPhone || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cấp độ giáo lý"
              value={catechist?.level?.name || ""}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Chứng chỉ giáo lý"
              onClick={() => {
                if (catechist) {
                  const { certificates, fullName, code } = catechist;
                  handleOpenDialogCertificateImage(
                    certificates,
                    fullName,
                    code
                  );
                }
              }}
              value={
                catechist?.certificates
                  ? catechist?.certificates.filter(
                      (item) => item.image && item.image != ""
                    ).length +
                    `${
                      catechist?.certificates.filter(
                        (item) => item.image && item.image != ""
                      ).length >= 0
                        ? " chứng chỉ (Bấm vào để xem)"
                        : ""
                    }`
                  : "0"
              }
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ color: "blue" }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Đóng
        </Button>
      </DialogActions>

      {dialogCertificateImageOpen ? (
        <>
          <ImageDialog
            images={dialogData.images}
            title={dialogData.title}
            open={dialogCertificateImageOpen}
            onClose={handleCloseDialogCertificateImage}
            imageTitle="Tên chứng chỉ"
          />
        </>
      ) : (
        <></>
      )}
    </Dialog>
  );
};

export default ViewCatechistInfoDialog;
