import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { Formik, Form } from "formik";
import gradeApi from "../../../api/Grade";
import classApi from "../../../api/Class";
import sweetAlert from "../../../utils/sweetAlert";
import useAppContext from "../../../hooks/useAppContext";
export type ClassResponse = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  numberOfCatechist: number;
  note: string;
  classStatus: number;
  pastoralYearId: string;
  pastoralYearName: string;
  gradeId: string;
  gradeName: string;
  majorId: string;
  majorName: string;
};

interface CreateUpdateClassDialogProps {
  open: boolean;
  onClose: () => void;
  updateMode?: boolean;
  classData?: ClassResponse;
  pastoralYearId: string;
  pastoralYearName: string;
  refresh: () => void;
  rows?: any[];
}

const CreateUpdateClassDialog: React.FC<CreateUpdateClassDialogProps> = ({
  open,
  onClose,
  updateMode,
  classData,
  pastoralYearId,
  pastoralYearName,
  rows,
  refresh,
}) => {
  const [grades, setGrades] = useState<any[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    if (!updateMode) {
      const fetchGrades = async () => {
        setLoadingGrades(true);
        const firstRes = await gradeApi.getAllGrades();
        const res = await gradeApi.getAllGrades(
          undefined,
          1,
          firstRes.data.data.total
        );
        setGrades(res.data.data.items);
        try {
        } catch (err) {
          console.error("Lỗi khi tải danh sách grades:", err);
        } finally {
          setLoadingGrades(false);
        }
      };
      fetchGrades();
    }
  }, [updateMode]);

  const handleSubmit = async (values: any) => {
    const data = {
      name: values.name,
      numberOfCatechist: values.numberOfCatechist,
      note: values.note,
      pastoralYearId,
      gradeId: updateMode ? classData?.gradeId : values.gradeId,
    };

    if (updateMode && classData) {
      enableLoading();
      await classApi
        .updateClass(classData.id, data)
        .then(() => {
          onClose();
          refresh();
          sweetAlert.alertSuccess("Cập nhật thành công", "", 2500, 22);
        })
        .catch((err) => {
          console.error("Lỗi khi cập nhật lớp:", err);
          sweetAlert.alertFailed("Có lỗi khi cập nhật lớp", "", 2500, 23);
        })
        .finally(() => {
          disableLoading();
        });
    } else {
      if (
        rows &&
        rows?.findIndex(
          (item) =>
            item.name.trim().toLowerCase() == values.name.trim().toLowerCase()
        ) >= 0
      ) {
        sweetAlert.alertWarning(
          "Tên lớp này đã tồn tại trong niên khóa này",
          "",
          2500,
          30
        );
        return;
      }
      enableLoading();
      await classApi
        .createClass(data)
        .then(() => {
          onClose();
          refresh();
          sweetAlert.alertSuccess("Tạo thành công", "", 2500, 22);
        })
        .catch((err) => {
          console.error("Lỗi khi tạo lớp:", err);
          sweetAlert.alertFailed("Có lỗi khi tạo lớp", "", 2500, 23);
        })
        .finally(() => {
          disableLoading();
        });
    }
    disableLoading();
  };

  const validateForm = (values: any) => {
    const errors: { [key: string]: string } = {};
    if (!values.name) {
      errors.name = "Tên lớp không được để trống";
    }
    if (values.numberOfCatechist <= 0) {
      errors.numberOfCatechist = "Số lượng giáo lý viên phải lớn hơn 0";
    }
    if (!values.gradeId) {
      errors.gradeId = "Khối không được để trống";
    }
    return errors;
  };

  return (
    <Dialog open={open}>
      <DialogTitle>
        {updateMode ? (
          <span className="font-bold text-primary">Cập nhật lớp</span>
        ) : (
          <span className="font-bold text-success">Tạo lớp mới</span>
        )}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            name: updateMode ? classData?.name || "" : "",
            numberOfCatechist: updateMode
              ? classData?.numberOfCatechist || 1
              : 1,
            note: updateMode ? classData?.note || "" : "",
            gradeId: updateMode ? classData?.gradeId || "" : "",
          }}
          validate={validateForm}
          onSubmit={handleSubmit}
        >
          {({ values, errors, handleChange, setFieldValue, touched }) => (
            <Form>
              <div>
                <label className="mt-1 text-[0.8rem] text-gray-500  ml-2">
                  Niên khóa <span style={{ color: "red" }}>*</span>
                </label>
                <TextField
                  fullWidth
                  value={
                    pastoralYearName.split("-")[1]
                      ? pastoralYearName.split("-")[0] +
                        " - " +
                        pastoralYearName.split("-")[1]
                      : pastoralYearName
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                  margin="normal"
                  className="mt-0"
                  disabled
                />
              </div>

              {updateMode ? (
                <TextField
                  fullWidth
                  label={
                    <span>
                      Khối <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  value={`${classData?.gradeName} - Ngành: ${classData?.majorName}`}
                  InputProps={{
                    readOnly: true,
                  }}
                  margin="normal"
                  disabled
                />
              ) : (
                <FormControl
                  fullWidth
                  margin="normal"
                  error={touched.gradeId && !!errors.gradeId}
                >
                  <InputLabel>
                    Khối <span style={{ color: "red" }}>*</span>
                  </InputLabel>{" "}
                  <Select
                    value={values.gradeId}
                    onChange={(e) => setFieldValue("gradeId", e.target.value)}
                    label={
                      <span>
                        Khối <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    disabled={loadingGrades}
                    error={touched.gradeId && !!errors.gradeId}
                  >
                    {loadingGrades ? (
                      <MenuItem disabled>
                        <CircularProgress size={24} />
                      </MenuItem>
                    ) : (
                      grades
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .sort(
                          (a, b) =>
                            a.major.hierarchyLevel - b.major.hierarchyLevel
                        )
                        .map((grade) => (
                          <MenuItem key={grade.id} value={grade.id}>
                            {grade.name} - Ngành: {grade.major.name} - Phân cấp
                            ngành: {grade.major.hierarchyLevel}
                          </MenuItem>
                        ))
                    )}
                  </Select>
                  <FormHelperText color="red">
                    {touched.gradeId && errors.gradeId}
                  </FormHelperText>
                </FormControl>
              )}

              <TextField
                fullWidth
                label={
                  <span>
                    Tên lớp <span style={{ color: "red" }}>*</span>
                  </span>
                }
                className="mt-1"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                margin="normal"
                disabled={updateMode}
              />

              <TextField
                fullWidth
                label={
                  <span>
                    Số lượng giáo lý viên{" "}
                    <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="numberOfCatechist"
                value={values.numberOfCatechist}
                onChange={(e) => {
                  const value = e.target.value;
                  setFieldValue("numberOfCatechist", value);
                }}
                type="number"
                error={touched.numberOfCatechist && !!errors.numberOfCatechist}
                helperText={
                  touched.numberOfCatechist && errors.numberOfCatechist
                }
                margin="normal"
              />

              <TextField
                fullWidth
                label="Ghi chú"
                name="note"
                value={values.note}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
              />

              <DialogActions>
                <Button
                  onClick={onClose}
                  color="secondary"
                  variant="outlined"
                  className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  color={updateMode ? "primary" : "success"}
                  variant="outlined"
                  className={`btn ${updateMode ? "btn-primary" : "btn-success"}`}
                >
                  {updateMode ? "Cập nhật" : "Tạo lớp"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUpdateClassDialog;
