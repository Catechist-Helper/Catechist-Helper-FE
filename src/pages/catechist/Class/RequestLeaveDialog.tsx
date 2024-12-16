import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import sweetAlert from "../../../utils/sweetAlert";
import { formatDate } from "../../../utils/formatDate";

interface RequestLeaveDialogProps {
  open: boolean;
  slotId: string;
  slot?: any;
  onClose: () => void;
  onSubmit: (reason: string, slotId: string, images: File[]) => void;
}

const RequestLeaveDialog: React.FC<RequestLeaveDialogProps> = ({
  open,
  slotId,
  slot,
  onClose,
  onSubmit,
}) => {
  const [reason, setReason] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    images: [] as File[],
  });

  const handleSubmit = () => {
    if (reason.trim() == "") {
      sweetAlert.alertWarning("Vui lòng nhập lý do xin nghỉ phép");
    }

    if (reason.trim()) {
      onSubmit(reason, slotId, formData.images); // Call the onSubmit function with the reason
      setReason(""); // Clear the reason input
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Thay vì ghi đè, thêm ảnh mới vào mảng hiện tại
      setFormData((prevData) => ({
        ...prevData,
        images: [...prevData.images, ...files], // Thêm các file mới vào mảng ảnh
      }));

      // Cập nhật hình ảnh preview
      const imagePreviewsArray = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [
        ...prevPreviews,
        ...imagePreviewsArray,
      ]); // Thêm các ảnh mới vào preview
    }
  };

  const removeImage = (index: number) => {
    setFormData((prevData) => {
      const newImages = prevData.images.filter((_, i) => i !== index); // Lọc bỏ ảnh tại index
      return { ...prevData, images: newImages };
    });

    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    ); // Cập nhật lại previews
  };

  return (
    <Dialog open={open} fullWidth maxWidth="md">
      <DialogTitle>
        <p className="text-[1.5rem] font-bold text-primary">Xin nghỉ phép</p>
      </DialogTitle>
      <DialogContent>
        {slot ? (
          <div className="flex flex-col gap-y-2 mb-3">
            <p>
              <strong>Ngày xin nghỉ phép:</strong>{" "}
              {formatDate.DD_MM_YYYY(slot.date)}
            </p>
            <p>
              <strong>Giờ dạy:</strong>{" "}
              {formatDate.HH_mm(slot.startTime) +
                " - " +
                formatDate.HH_mm(slot.endTime)}
            </p>
          </div>
        ) : (
          <></>
        )}
        <TextField
          label={
            <span>
              Lý do nghỉ phép <span style={{ color: "red" }}>*</span>
            </span>
          }
          multiline
          fullWidth
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-2"
        />
      </DialogContent>
      <DialogContent>
        <label className="block mb-1 text-md font-bold" htmlFor="images">
          Ảnh chứng minh
        </label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <div className="mt-1 text-sm text-gray-500">
          {"Tải lên các ảnh chứng minh"}
        </div>

        {/* Hiển thị hình ảnh đã chọn */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">Xem trước ảnh đã chọn:</h3>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-auto rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)} // Gọi hàm xóa ảnh
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    &times; {/* Biểu tượng xóa */}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
      <DialogActions className="mt-3 mx-3 mb-3">
        <Button onClick={onClose} color="primary" variant="outlined">
          Hủy
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Gửi yêu cầu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RequestLeaveDialog;
