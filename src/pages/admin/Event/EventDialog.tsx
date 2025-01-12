import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select as MUISelect,
  // FormControlLabel,
  // Checkbox,
} from "@mui/material";
import Select from "react-select";
import { Formik, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import sweetAlert from "../../../utils/sweetAlert";
import eventCategoryApi from "../../../api/EventCategory";
import eventApi from "../../../api/Event";
import budgetTransactionApi from "../../../api/BudgetTransaction";
import { EventItemResponse } from "../../../model/Response/Event";
import { formatCurrencyVND } from "../../../utils/formatPrice";
import ReasonDialog from "./ReasonDialog";
import useAppContext from "../../../hooks/useAppContext";
import { EventStatus, EventStatusString } from "../../../enums/Event";

interface EventDialogProps {
  open: boolean;
  onClose: () => void;
  refresh: () => void;
  event?: EventItemResponse; // null nếu thêm mới
}

const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onClose,
  refresh,
  event,
}) => {
  const [eventCategories, setEventCategories] = useState<any[]>([]);
  const [openReasonDialog, setOpenReasonDialog] = useState<boolean>(false);

  const [pendingBudgetChange, setPendingBudgetChange] = useState<number | null>(
    null
  );
  const { enableLoading, disableLoading } = useAppContext();

  useEffect(() => {
    const fetchEventCategories = async () => {
      try {
        const { data } = await eventCategoryApi.getAllEventCategories();
        setEventCategories(data.data.items);
      } catch (error) {
        console.error("Lỗi khi tải danh mục sự kiện:", error);
      }
    };
    fetchEventCategories();
  }, []);

  // Schema validation bằng Yup
  const validationSchema = Yup.object().shape({
    startTime: Yup.date()
      .nullable()
      .transform((value, originalValue) => {
        console.log(value);
        if (originalValue === "" || originalValue === null) return null; // Xử lý chuỗi rỗng
        return new Date(originalValue); // Chuyển đổi thành Date
      })
      .required("Thời gian bắt đầu là bắt buộc")
      .min(
        new Date().setHours(0, 0, 0, 0),
        "Thời gian bắt đầu không thể là 1 ngày trong quá khứ"
      ),

    endTime: Yup.date()
      .nullable()
      .transform((value, originalValue) => {
        console.log(value);

        if (originalValue === "" || originalValue === null) return null;
        return new Date(originalValue);
      })
      .required("Thời gian kết thúc là bắt buộc")
      .when("startTime", (startTime, schema) => {
        return startTime && startTime.toString() != ""
          ? schema.min(
              new Date(startTime.toString()),
              "Thời gian kết thúc phải sau thời gian bắt đầu"
            )
          : schema;
      }),

    eventCategoryId: Yup.string().required("Danh mục sự kiện là bắt buộc"),
    name: Yup.string().required("Tên sự kiện là bắt buộc"),
    description: Yup.string().required("Mô tả là bắt buộc"),
    address: Yup.string().required("Địa chỉ tổ chức là bắt buộc"),
  });

  const validationSchema2 = Yup.object().shape({
    address: Yup.string().required("Địa chỉ tổ chức là bắt buộc"),
  });

  const handleSubmit = async (values: any) => {
    try {
      const dataToSend = {
        ...values,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
      };
      enableLoading();
      if (event) {
        if (event.current_budget !== values.current_budget) {
          setPendingBudgetChange(values.current_budget);
          setOpenReasonDialog(true);
          return;
        }
        await eventApi.updateEvent(event.id, dataToSend);

        sweetAlert.alertSuccess("Cập nhật sự kiện thành công!", "", 3000, 25);
      } else {
        await eventApi.createEvent(dataToSend);

        // await budgetTransactionApi.createBudgetTransaction({
        //   eventId: newEvent.data.data.id,
        //   fromBudget: 0,
        //   toBudget: values.current_budget,
        //   note: "Ngân sách khởi tạo",
        //   transactionImages: [],
        // });
        sweetAlert.alertSuccess("Thêm sự kiện mới thành công!", "", 3000, 25);
      }

      refresh();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu sự kiện:", error);
      sweetAlert.alertFailed("Có lỗi xảy ra khi lưu sự kiện!", "", 3000, 25);
    } finally {
      disableLoading();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {event ? (
          <span className="text-primary font-bold">Chỉnh sửa sự kiện</span>
        ) : (
          <span className="text-success font-bold">Thêm mới sự kiện</span>
        )}
      </DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            eventCategoryId: event?.eventCategory?.id || "",
            name: event?.name || "",
            description: event?.description || "",
            startTime: event?.startTime?.split("T")[0] || "",
            endTime: event?.endTime?.split("T")[0] || "",
            address: event?.address || "",
            current_budget: event?.current_budget || 0,
            isPeriodic: event?.isPeriodic || false,
            isCheckedIn: event?.isCheckedIn || false,
            eventStatus: event?.eventStatus || 0,
          }}
          validationSchema={event ? validationSchema2 : validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, handleChange, setFieldValue, errors, touched }) => (
            <Form>
              {/* Danh mục sự kiện */}
              <FormControl
                fullWidth
                margin="none"
                error={touched.eventCategoryId && !!errors.eventCategoryId}
                sx={{ marginBottom: "15px" }}
              >
                <label className="ml-3 text-gray-500 text-[0.8rem]">
                  Danh mục sự kiện <span style={{ color: "red" }}>*</span>
                </label>
                <Select
                  name="eventCategoryId"
                  value={eventCategories
                    .map((category) => ({
                      value: category.id,
                      label: category.name,
                    }))
                    .find((item) => item.value === values.eventCategoryId)}
                  onChange={(selectedOption) => {
                    setFieldValue(
                      "eventCategoryId",
                      selectedOption?.value || ""
                    );
                  }}
                  options={eventCategories.map((category) => ({
                    value: category.id,
                    label: category.name,
                  }))}
                  isDisabled={
                    !!event || values.eventStatus != EventStatus.Not_Started
                  }
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      padding: "4px",
                      boxShadow: "none",
                    }),
                    valueContainer: (provided) => ({
                      ...provided,
                      padding: "0 10px",
                    }),
                    input: (provided) => ({
                      ...provided,
                      margin: "0",
                      padding: "8px 0",
                    }),
                    menu: (provided) => ({
                      ...provided,
                      zIndex: 10,
                    }),
                    menuPortal: (provided) => ({
                      ...provided,
                      zIndex: 10,
                    }),
                  }}
                  placeholder="Chọn danh mục sự kiện"
                />
                <ErrorMessage name="eventCategoryId">
                  {(msg) => (
                    <p className="ml-3 text-[0.8rem]" style={{ color: "red" }}>
                      {msg}
                    </p>
                  )}
                </ErrorMessage>
              </FormControl>

              {/* Tên sự kiện */}
              <TextField
                fullWidth
                label={
                  <span>
                    Tên sự kiện <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && !!errors.name}
                helperText={touched.name && errors.name}
                disabled={values.eventStatus != EventStatus.Not_Started}
                sx={{ marginBottom: "15px" }}
              />

              {/* Mô tả */}
              <TextField
                fullWidth
                label={
                  <span>
                    Mô tả <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="description"
                value={values.description}
                onChange={handleChange}
                multiline
                rows={1}
                disabled={values.eventStatus != EventStatus.Not_Started}
                error={touched.description && !!errors.description}
                helperText={touched.description && errors.description}
              />

              {/* Thời gian */}
              <TextField
                label={
                  <span>
                    Thời gian bắt đầu <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="startTime"
                type="date"
                value={values.startTime || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={touched.startTime && !!errors.startTime}
                helperText={touched.startTime && errors.startTime}
                fullWidth
                rows={3}
                margin="normal"
                disabled={values.eventStatus != EventStatus.Not_Started}
              />

              <TextField
                label={
                  <span>
                    Thời gian kết thúc <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="endTime"
                type="date"
                value={values.endTime || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={touched.endTime && !!errors.endTime}
                helperText={touched.endTime && errors.endTime}
                fullWidth
                rows={3}
                margin="normal"
                disabled={values.eventStatus != EventStatus.Not_Started}
              />

              {/* Địa chỉ */}
              <TextField
                fullWidth
                label={
                  <span>
                    Địa chỉ tổ chức <span style={{ color: "red" }}>*</span>
                  </span>
                }
                name="address"
                value={values.address}
                onChange={handleChange}
                margin="normal"
                error={touched.address && !!errors.address}
                helperText={touched.address && errors.address}
                disabled={
                  values.eventStatus != EventStatus.Not_Started &&
                  values.eventStatus != EventStatus.In_Progress
                }
              />

              {/* Ngân sách */}

              {event ? (
                <>
                  {false ? (
                    <>
                      <TextField
                        fullWidth
                        label={
                          <span>
                            Ngân sách hiện tại{" "}
                            <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        name="current_budget"
                        // type="number"
                        value={formatCurrencyVND(values.current_budget)}
                        onChange={(e) => {
                          const numericValue = Number(
                            e.target.value.replace(/[^\d]/g, "")
                          );
                          setFieldValue("current_budget", numericValue); // Chỉ giữ lại số
                        }}
                        margin="normal"
                        error={
                          touched.current_budget && !!errors.current_budget
                        }
                        helperText={
                          touched.current_budget && errors.current_budget
                        }
                        InputProps={{
                          startAdornment: (
                            <span style={{ marginRight: "5px" }}>₫</span>
                          ),
                        }}
                        disabled={
                          values.eventStatus != EventStatus.Not_Started &&
                          values.eventStatus != EventStatus.In_Progress
                        }
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  <FormControl fullWidth sx={{ marginTop: "10px" }}>
                    <InputLabel>
                      Trạng thái sự kiện <span style={{ color: "red" }}>*</span>
                    </InputLabel>

                    {event.eventStatus == EventStatus.Not_Started ? (
                      <>
                        <MUISelect
                          name="eventStatus"
                          value={values.eventStatus}
                          onChange={handleChange}
                          fullWidth
                          label={
                            <span>
                              Trạng thái sự kiện{" "}
                              <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          sx={{
                            marginTop: 0.9,
                          }}
                          className={`
                ${values.eventStatus == EventStatus.Not_Started ? " text-black" : ""}
                ${values.eventStatus == EventStatus.In_Progress ? " text-black bg-warning" : ""}
                ${values.eventStatus == EventStatus.Completed ? "text-white bg-success" : ""}
              ${values.eventStatus == EventStatus.Cancelled ? "text-white bg-danger" : ""}`}
                        >
                          <MenuItem
                            value={EventStatus.Not_Started}
                            className="text-white bg-black py-3"
                          >
                            {EventStatusString.Not_Started}
                          </MenuItem>

                          <MenuItem
                            value={EventStatus.In_Progress}
                            className="text-black bg-warning py-3"
                          >
                            {EventStatusString.In_Progress}
                          </MenuItem>

                          <MenuItem
                            value={EventStatus.Cancelled}
                            className="text-white bg-danger py-3"
                          >
                            {EventStatusString.Cancelled}
                          </MenuItem>
                        </MUISelect>
                      </>
                    ) : (
                      <></>
                    )}

                    {event.eventStatus == EventStatus.In_Progress ? (
                      <>
                        <MUISelect
                          name="eventStatus"
                          value={values.eventStatus}
                          onChange={handleChange}
                          fullWidth
                          label={
                            <span>
                              Trạng thái sự kiện{" "}
                              <span style={{ color: "red" }}>*</span>
                            </span>
                          }
                          sx={{
                            marginTop: 0.9,
                          }}
                          className={`
                ${values.eventStatus == EventStatus.Not_Started ? " text-black" : ""}
                ${values.eventStatus == EventStatus.In_Progress ? " text-black bg-warning" : ""}
                ${values.eventStatus == EventStatus.Completed ? "text-white bg-success" : ""}
              ${values.eventStatus == EventStatus.Cancelled ? "text-white bg-danger" : ""}`}
                        >
                          <MenuItem
                            value={EventStatus.In_Progress}
                            className=" text-black bg-warning py-3"
                          >
                            {EventStatusString.In_Progress}
                          </MenuItem>

                          <MenuItem
                            value={EventStatus.Completed}
                            className=" text-white bg-success py-3"
                          >
                            {EventStatusString.Completed}
                          </MenuItem>

                          <MenuItem
                            value={EventStatus.Cancelled}
                            className=" text-white bg-danger py-3"
                          >
                            {EventStatusString.Cancelled}
                          </MenuItem>
                        </MUISelect>
                      </>
                    ) : (
                      <></>
                    )}
                  </FormControl>
                </>
              ) : (
                <></>
              )}

              {/* Checkbox */}
              {/* <FormControlLabel
                control={
                  <Checkbox
                    checked={values.isPeriodic}
                    onChange={(e) =>
                      setFieldValue("isPeriodic", e.target.checked)
                    }
                  />
                }
                label="Sự kiện định kỳ"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={values.isCheckedIn}
                    onChange={(e) =>
                      setFieldValue("isCheckedIn", e.target.checked)
                    }
                  />
                }
                label="Có điểm danh"
              /> */}

              <ReasonDialog
                open={openReasonDialog}
                onClose={() => setOpenReasonDialog(false)}
                onConfirm={async (reason, images) => {
                  if (!event) return;
                  enableLoading();
                  try {
                    const dataToSend = {
                      ...values,
                      startTime: new Date(values.startTime).toISOString(),
                      endTime: new Date(values.endTime).toISOString(),
                    };
                    await eventApi.updateEvent(event.id, dataToSend);

                    await budgetTransactionApi.createBudgetTransaction({
                      eventId: event.id,
                      fromBudget: event.current_budget,
                      toBudget: pendingBudgetChange!,
                      note: reason,
                      transactionImages: images,
                    });

                    sweetAlert.alertSuccess(
                      "Cập nhật sự kiện thành công!",
                      "",
                      3000,
                      25
                    );

                    refresh();
                    onClose();
                  } catch (error) {
                    console.error("Lỗi khi cập nhật:", error);
                    sweetAlert.alertFailed(
                      "Có lỗi xảy ra khi lưu sự kiện!",
                      "",
                      3000,
                      25
                    );
                  } finally {
                    setOpenReasonDialog(false);
                    setPendingBudgetChange(null);
                    disableLoading();
                  }
                }}
              />

              {/* Actions */}
              <DialogActions sx={{ marginTop: "0px" }}>
                <Button
                  onClick={onClose}
                  color="secondary"
                  className="hover:bg-purple-800 hover:text-white hover:border-purple-800"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  color={event ? "primary" : "success"}
                  className={`btn ${event ? "btn-primary" : "btn-success"}`}
                >
                  {event ? "Lưu" : "Thêm"}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
