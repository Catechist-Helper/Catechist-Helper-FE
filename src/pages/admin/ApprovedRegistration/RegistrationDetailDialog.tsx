import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from "@mui/material";
import registrationApi from "../../../api/Registration";
import {
  CertificateOfCandidateResponse,
  RegistrationItemResponse,
} from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import { RegistrationProcessStatus } from "../../../enums/RegistrationProcess";
import { formatDate } from "../../../utils/formatDate";
import ImageDialog from "../../../components/Molecules/ImageDialog";

type RegistrationDetailDialogProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

const RegistrationDetailDialog: React.FC<RegistrationDetailDialogProps> = ({
  id,
  open,
  onClose,
}) => {
  const [registration, setRegistration] =
    useState<RegistrationItemResponse | null>(null);

  useEffect(() => {
    if (open) {
      registrationApi
        .getRegistrationById(id)
        .then((response) => setRegistration(response.data.data))
        .catch((error) => console.error("Error fetching registration:", error));
    }
  }, [id, open]);
  console.log(registration);

  const renderStatus = (status: number) => {
    switch (status) {
      case RegistrationStatus.Pending:
        return (
          <span className="text-yellow-600" style={{ fontWeight: "600" }}>
            Đang đợi duyệt đơn
          </span>
        );
      case RegistrationStatus.Approved_Duyet_Don:
        return (
          <span className="text-primary" style={{ fontWeight: "600" }}>
            Đã được duyệt đơn
          </span>
        );
      case RegistrationStatus.Approved_Phong_Van:
        return (
          <span className="text-success" style={{ fontWeight: "600" }}>
            Đã đậu phỏng vấn
          </span>
        );
      case RegistrationStatus.Rejected_Phong_Van:
        return (
          <span className="text-danger" style={{ fontWeight: "600" }}>
            Bị từ chối vòng phỏng vấn
          </span>
        );
      case RegistrationStatus.Rejected_Duyet_Don:
        return (
          <span className="text-danger" style={{ fontWeight: "600" }}>
            Bị từ chối vòng duyệt đơn
          </span>
        );
      default:
        return "Không xác định";
    }
  };

  const renderProcessStatus = (status: number) => {
    switch (status) {
      case RegistrationProcessStatus.Pending:
        return (
          <span className="text-yellow-600" style={{ fontWeight: "600" }}>
            Đang xử lý
          </span>
        );
      case RegistrationProcessStatus.Approved:
        return (
          <span className="text-success" style={{ fontWeight: "600" }}>
            Đã thông qua
          </span>
        );
      case RegistrationProcessStatus.Rejected:
        return (
          <span className="text-danger" style={{ fontWeight: "600" }}>
            Bị từ chối
          </span>
        );
      default:
        return "Không xác định";
    }
  };

  const [dialogCertificateImageOpen, setDialogCertificateImageOpen] =
    useState(false);
  const [dialogData, setDialogData] = useState({
    images: [],
    title: "",
  });

  const handleOpenDialogCertificateImage = (
    certificates: CertificateOfCandidateResponse[],
    fullName: string
  ) => {
    console.log("certificates", certificates);
    const images: any = certificates
      .filter((cert) => cert.imageUrl)
      .map((cert) => ({
        url: cert.imageUrl,
      }));

    setDialogData({
      images,
      title: `Chứng chỉ của ứng viên ${fullName}`,
    });
    setDialogCertificateImageOpen(true);
  };

  const handleCloseDialogCertificateImage = () =>
    setDialogCertificateImageOpen(false);

  return (
    <Dialog
      open={open}
      maxWidth={`${
        registration &&
        (registration.status === RegistrationStatus.Approved_Duyet_Don ||
          registration.status === RegistrationStatus.Approved_Phong_Van ||
          registration.status === RegistrationStatus.Rejected_Phong_Van)
          ? "md"
          : "sm"
      }`}
      fullWidth
    >
      <DialogContent>
        {registration ? (
          <Grid container spacing={10}>
            <Grid
              item
              xs={
                registration.status === RegistrationStatus.Approved_Duyet_Don ||
                registration.status === RegistrationStatus.Approved_Phong_Van ||
                registration.status === RegistrationStatus.Rejected_Phong_Van
                  ? 6
                  : 12
              }
            >
              <h3 className="text-[1.2rem] mb-2">
                <strong> Thông tin chi tiết ứng viên</strong>
              </h3>
              <div className="my-2 mt-0">
                <ul style={{ listStyle: "inside" }}>
                  <li>
                    <strong>Họ và tên:</strong> {registration.fullName}
                  </li>
                  <li>
                    <strong>Giới tính:</strong> {registration.gender}
                  </li>
                  <li>
                    <strong>Ngày sinh:</strong>{" "}
                    {formatDate.DD_MM_YYYY(registration.dateOfBirth)}
                  </li>
                  <li>
                    <strong>Địa chỉ:</strong> {registration.address}
                  </li>
                  <li>
                    <strong>Email:</strong> {registration.email}
                  </li>
                  <li>
                    <strong>Số điện thoại:</strong> {registration.phone}
                  </li>
                  <li>
                    <strong>Đã từng dạy:</strong>{" "}
                    {registration.isTeachingBefore ? "Có" : "Không"}
                  </li>
                  <li>
                    <strong>Số năm dạy:</strong> {registration.yearOfTeaching}
                  </li>
                  {registration.note && (
                    <li>
                      <strong>Ghi chú:</strong>
                      <div className="ml-6" style={{ whiteSpace: "pre-line" }}>
                        {`${registration.note}`}
                      </div>
                    </li>
                  )}
                  <li>
                    <strong>Ngày nộp đơn:</strong>{" "}
                    {formatDate.DD_MM_YYYY_Time(registration.createdAt)}
                  </li>
                  <li>
                    <strong>Trạng thái:</strong>{" "}
                    {renderStatus(registration.status)}
                  </li>
                  {registration.certificateOfCandidates.length > 0 && (
                    <>
                      <hr className="mt-2" />
                      <p className="mt-3 flex items-center">
                        <span>
                          <span>
                            <strong>Chứng chỉ: </strong>
                            {registration.certificateOfCandidates.length} chứng
                            chỉ
                          </span>
                          <span>
                            <Button
                              variant="contained"
                              size="small"
                              style={{ marginLeft: "15px" }}
                              onClick={() =>
                                handleOpenDialogCertificateImage(
                                  registration.certificateOfCandidates,
                                  registration.fullName
                                )
                              }
                            >
                              Xem
                            </Button>
                          </span>
                        </span>
                      </p>
                    </>
                  )}
                </ul>
              </div>
            </Grid>

            <Grid
              item
              xs={
                registration.status === RegistrationStatus.Approved_Duyet_Don ||
                registration.status === RegistrationStatus.Approved_Phong_Van ||
                registration.status === RegistrationStatus.Rejected_Phong_Van
                  ? 6
                  : 12
              }
            >
              <div className="w-full overflow-hidden">
                <h3 className="text-[1.2rem] mb-3">
                  <strong>Cột mốc của ứng viên</strong>
                </h3>
                <ol className="ml-4 mt-2 relative text-gray-500 border-s border-gray-200 dark:border-gray-700 dark:text-gray-400">
                  {registration.registrationProcesses
                    .sort((a: any, b: any) => {
                      return (
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                      );
                    })
                    .map((process) => (
                      <li className="mb-10 ms-6" key={process.id}>
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-green-200 rounded-full -start-4 ring-4 ring-white dark:ring-gray-900 dark:bg-green-900">
                          <svg
                            className="w-3.5 h-3.5 text-green-500 dark:text-green-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 16 12"
                          >
                            <path
                              stroke="currentColor"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M1 5.917 5.724 10.5 15 1.5"
                            />
                          </svg>
                        </span>
                        <h3 className="font-medium leading-tight">
                          {formatDate.DD_MM_YYYY_Time(process.createdAt)}
                        </h3>
                        <p className="text-sm">
                          {process.name} - {renderProcessStatus(process.status)}
                        </p>
                      </li>
                    ))}
                </ol>
              </div>
              {(registration.status === RegistrationStatus.Approved_Duyet_Don ||
                registration.status === RegistrationStatus.Approved_Phong_Van ||
                registration.status ===
                  RegistrationStatus.Rejected_Phong_Van) && (
                <>
                  <hr />
                  <div>
                    <h3 className="text-[1.2rem] mb-2 mt-3">
                      <strong>Thông tin phỏng vấn</strong>
                    </h3>
                    <ul style={{ listStyle: "inside" }}>
                      <li>
                        <strong>Thời gian</strong>:{" "}
                        {formatDate.DD_MM_YYYY_Time(
                          registration.interview?.meetingTime
                        )}
                      </li>
                      {registration.interview.recruiterInInterviews.findIndex(
                        (item) => item.evaluation && item.evaluation != ""
                      ) >= 0 ? (
                        <li>
                          <strong>Nhận xét của người phỏng vấn</strong>:
                          {registration.interview &&
                          registration.interview.recruiterInInterviews ? (
                            <>
                              {registration.interview.recruiterInInterviews.map(
                                (item) => {
                                  return (
                                    <div
                                      key={item.accountId}
                                      className="my-2 ml-5"
                                    >
                                      <p>
                                        - Nhận xét của{" "}
                                        {
                                          registration.interview.recruiters.find(
                                            (item2) =>
                                              item2.id == item.accountId
                                          )?.fullName
                                        }
                                        :
                                      </p>
                                      <div
                                        className="mt-2"
                                        dangerouslySetInnerHTML={{
                                          __html: item.evaluation,
                                        }}
                                      />
                                    </div>
                                  );
                                }
                              )}
                            </>
                          ) : (
                            <></>
                          )}
                        </li>
                      ) : (
                        <></>
                      )}
                      <li>
                        <strong>Người phỏng vấn</strong>:{" "}
                        {registration.interview &&
                        registration.interview.recruiters
                          ? registration.interview.recruiters
                              .map((recruiter) => recruiter.fullName)
                              .join(", ")
                          : ""}
                      </li>
                      <li>
                        <strong>Kết quả</strong>:{" "}
                        {registration.status ===
                        RegistrationStatus.Approved_Duyet_Don ? (
                          <span
                            className="text-yellow-600"
                            style={{ fontWeight: "600" }}
                          >
                            Chưa quyết định
                          </span>
                        ) : registration.interview?.isPassed ? (
                          <span
                            className="text-success"
                            style={{ fontWeight: "600" }}
                          >
                            Đậu phỏng vấn
                          </span>
                        ) : (
                          <span
                            className="text-danger"
                            style={{ fontWeight: "600" }}
                          >
                            Bị từ chối
                          </span>
                        )}
                      </li>
                      {registration.status !==
                        RegistrationStatus.Approved_Duyet_Don && (
                        <li>
                          <strong>Nhận xét</strong>:
                          <div
                            dangerouslySetInnerHTML={{
                              __html: registration.interview?.note || "",
                            }}
                          />
                        </li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </Grid>
          </Grid>
        ) : (
          <p>Đang tải...</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
      {dialogCertificateImageOpen ? (
        <>
          <ImageDialog
            images={dialogData.images}
            title={dialogData.title}
            open={dialogCertificateImageOpen}
            onClose={handleCloseDialogCertificateImage}
          />
        </>
      ) : (
        <></>
      )}
    </Dialog>
  );
};

export default RegistrationDetailDialog;
