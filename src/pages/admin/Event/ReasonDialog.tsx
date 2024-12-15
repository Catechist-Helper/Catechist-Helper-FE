import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Button,
  TextField,
} from "@mui/material";
import sweetAlert from "../../../utils/sweetAlert";

const ReasonDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, images: File[]) => void;
}> = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState<string>("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    images: [] as File[],
  });

  const handleConfirm = () => {
    if (!reason.trim()) {
      sweetAlert.alertWarning("Vui lòng nhập lý do!", "", 2500, 22);
      return;
    }
    onConfirm(reason, formData.images);
    setReason("");
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <label className="block mb-3 text-sm font-medium">
          Lý do thay đổi ngân sách
        </label>
        <TextField
          label={
            <span>
              Nhập lý do <span style={{ color: "red" }}>*</span>
            </span>
          }
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
      </DialogContent>

      <DialogContent>
        <label className="block mb-1 text-sm font-medium" htmlFor="images">
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
          {"Tải lên các ảnh chứng minh (nếu có)"}
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

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Hủy
        </Button>
        <Button onClick={handleConfirm} color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReasonDialog;
