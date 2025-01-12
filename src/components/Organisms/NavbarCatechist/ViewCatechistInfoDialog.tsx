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
import { AuthUser } from "../../../types/authentication";
import gradeApi from "../../../api/Grade";
import { GradeResponse } from "../../../model/Response/Grade";

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
  const [catechistGrade, setCatechistGrade] = useState<
    (GradeResponse & { isMain: boolean }) | null
  >(null);

  // Lấy catechistId từ userLogin
  useEffect(() => {
    const fetchCatechistInfo = async () => {
      try {
        const user: AuthUser = getUserInfo();
        if (user?.catechistId) {
          const response = await catechistApi.getCatechistById(
            user.catechistId
          );
          setCatechist(response.data.data);

          const gradeResponse = await catechistApi.getCatechistGrades(
            user.catechistId
          );
          if (
            gradeResponse.data.data &&
            gradeResponse.data.data.items[0] &&
            gradeResponse.data.data.items[0].grade
          ) {
            const detailGradeResponse = await gradeApi.getGradeById(
              gradeResponse.data.data.items[0].grade.id
            );
            if (detailGradeResponse.data.data) {
              setCatechistGrade({
                ...detailGradeResponse.data.data,
                isMain: gradeResponse.data.data.items[0].isMain,
              });
            }
          }
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
                  src={
                    catechist?.imageUrl ??
                    "https://firebasestorage.googleapis.com/v0/b/catechisthelper-1f8af.appspot.com/o/defaultAvatar%2FDefaultAvatar.png?alt=media&token=e117852a-f40f-47d8-9801-b802e438de96"
                  }
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
              label="Mã giáo lý viên"
              value={catechist?.code || ""}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Tên Thánh"
              value={catechist?.christianName || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
            <TextField
              label="Tên đầy đủ"
              value={catechist?.fullName || ""}
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
              value={catechist?.birthPlace || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ marginTop: "15px" }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              value={catechist?.email || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại"
              value={catechist?.phone || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Địa chỉ"
              value={catechist?.address || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Học vấn"
              value={catechist?.qualification || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tên cha"
              value={catechist?.fatherName || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại cha"
              value={catechist?.fatherPhone || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tên mẹ"
              value={catechist?.motherName || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Số điện thoại mẹ"
              value={catechist?.motherPhone || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Cấp độ giáo lý"
              value={catechist?.level?.name || "Chưa cập nhật"}
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Chứng chỉ giáo lý"
              onClick={() => {
                if (
                  catechist &&
                  catechist.certificates &&
                  catechist?.certificates &&
                  catechist?.certificates.filter(
                    (item) => item.image && item.image != ""
                  ).length > 0
                ) {
                  const { certificates, fullName, code } = catechist;
                  handleOpenDialogCertificateImage(
                    certificates,
                    fullName,
                    code
                  );
                }
              }}
              value={
                catechist && catechist.certificates && catechist?.certificates
                  ? catechist?.certificates.filter(
                      (item) => item.image && item.image != ""
                    ).length +
                    `${
                      catechist?.certificates.filter(
                        (item) => item.image && item.image != ""
                      ).length > 0
                        ? " chứng chỉ (Bấm vào để xem)"
                        : " chứng chỉ"
                    }`
                  : "0"
              }
              fullWidth
              InputProps={{ readOnly: true }}
              sx={{ color: "blue" }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Ngành giáo lý hiện tại"
              value={
                catechistGrade &&
                catechistGrade.major &&
                catechistGrade.major.name
                  ? catechistGrade.major.name +
                    ` (Phân cấp ngành: ${catechistGrade.major.hierarchyLevel})`
                  : "Không có"
              }
              fullWidth
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Khối giáo lý hiện tại"
              value={
                catechistGrade && catechistGrade.id && catechistGrade.name
                  ? catechistGrade.name +
                    `${catechistGrade.isMain ? " (Trưởng khối)" : ""}`
                  : "Không có"
              }
              fullWidth
              InputProps={{ readOnly: true }}
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
