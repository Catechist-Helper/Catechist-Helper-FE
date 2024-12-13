import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import registrationApi from "../../../api/Registration";
import { RegistrationItemResponse } from "../../../model/Response/Registration";
import { RegistrationStatus } from "../../../enums/Registration";
import { RegistrationProcessStatus } from "../../../enums/RegistrationProcess";
import { formatDate } from "../../../utils/formatDate";

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

  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle
        style={{ fontSize: "1.5rem", fontWeight: "bolder", marginBottom: "0" }}
      >
        Thông tin chi tiết ứng viên
      </DialogTitle>
      <DialogContent>
        {registration ? (
          <>
            {/* Khối 1: Thông tin ứng viên */}
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
              </ul>
            </div>
            <hr />

            {/* Khối 2: Các chứng chỉ */}
            {registration.certificateOfCandidates.length > 0 && (
              <div className="my-2">
                <h3 className="text-[1.2rem]">
                  <strong>Chứng chỉ</strong>
                </h3>
                {registration.certificateOfCandidates.map((certificate) => (
                  <>
                    <img
                      key={certificate.id}
                      src={certificate.imageUrl}
                      alt="Certificate"
                      width={800}
                      height={800}
                      style={{ margin: "5px" }}
                    />
                  </>
                ))}
              </div>
            )}
            <hr />

            {/* Khối 3: Cột mốc ứng viên */}
            <div className="my-2">
              <h3 className="text-[1.2rem] mb-1">
                <strong>Cột mốc của ứng viên</strong>
              </h3>
              <ul style={{ listStyle: "inside" }}>
                {registration.registrationProcesses
                  .sort((a: any, b: any) => {
                    return (
                      new Date(a.createdAt).getTime() -
                      new Date(b.createdAt).getTime()
                    );
                  })
                  .map((process) => (
                    <li key={process.id}>
                      <span className="italic text-gray-500">
                        {formatDate.DD_MM_YYYY_Time(process.createdAt)}
                      </span>{" "}
                      - {process.name} - {renderProcessStatus(process.status)}
                    </li>
                  ))}
              </ul>
            </div>
            <hr />

            {/* Khối 4: Thông tin phỏng vấn */}
            {(registration.status === RegistrationStatus.Approved_Duyet_Don ||
              registration.status === RegistrationStatus.Approved_Phong_Van ||
              registration.status ===
                RegistrationStatus.Rejected_Phong_Van) && (
              <div className="my-2">
                <h3 className="text-[1.2rem] mb-1">
                  <strong>Thông tin phỏng vấn</strong>
                </h3>
                <ul style={{ listStyle: "inside" }}>
                  <li>
                    <strong>Thời gian</strong>:{" "}
                    {formatDate.DD_MM_YYYY_Time(
                      registration.interview?.meetingTime
                    )}
                  </li>
                  <li>
                    <strong>Người phỏng vấn</strong>:{" "}
                    {registration.interview && registration.interview.recruiters
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
                        Chưa phỏng vấn
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
            )}
          </>
        ) : (
          <p>Đang tải...</p>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegistrationDetailDialog;
