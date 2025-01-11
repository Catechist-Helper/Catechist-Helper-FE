import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Select as MuiSelect,
  MenuItem,
  FormControl,
} from "@mui/material";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import memberApi from "../../../api/EventMember";
import eventApi from "../../../api/Event";
import accountApi from "../../../api/Account";
import roleEventApi from "../../../api/RoleEvent";
import sweetAlert from "../../../utils/sweetAlert";
import { UpdateMemberRequest } from "../../../model/Request/EventMember";
import { RoleEventName } from "../../../enums/RoleEventEnum";
import useAppContext from "../../../hooks/useAppContext";
import viVNGridTranslation from "../../../locale/MUITable";

interface OrganizersDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  refresh: () => void;
  viewOrganizersDialogMode: boolean;
  catechistMode?: boolean;
}

const OrganizersDialog: React.FC<OrganizersDialogProps> = ({
  open,
  onClose,
  eventId,
  refresh,
  viewOrganizersDialogMode,
  catechistMode,
}) => {
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<
    (UpdateMemberRequest & {
      fullName: string;
      email: string;
      avatar: string;
      phone: string;
    })[]
  >([]);
  const [roles, setRoles] = useState<any[]>([]);
  const { enableLoading, disableLoading } = useAppContext();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 8,
  });
  const [paginationModel2, setPaginationModel2] = useState<GridPaginationModel>(
    {
      page: 0,
      pageSize: 8,
    }
  );

  const resetVietnamese = () => {
    let count = 1;
    let theInterval = setInterval(() => {
      const elements = document.querySelectorAll<HTMLElement>(
        ".MuiTablePagination-selectLabel"
      );
      if (elements) {
        elements.forEach((element) => {
          element.innerHTML = "Số hàng mỗi trang";
        });
      }

      const elements2 = document.querySelectorAll<HTMLElement>(
        ".MuiTablePagination-displayedRows"
      );
      if (elements2) {
        elements2.forEach((element2) => {
          let text = element2.innerHTML;
          text = text.replace(/\bof\b/g, "trong");
          element2.innerHTML = text;
        });
      }
      count++;
      if (count == 5) {
        clearInterval(theInterval);
      }
    }, 200);
  };

  useEffect(() => {
    const fetchAccountsAndRoles = async () => {
      enableLoading();
      try {
        // Fetch tất cả accounts (role = "Catechist")
        const firstResponse = await accountApi.getAllAccounts(1, 1);
        const totalAccounts = firstResponse.data.data.total;
        const fullResponse = await accountApi.getAllAccounts(1, totalAccounts);
        const filteredAccounts = fullResponse.data.data.items.filter(
          (account: any) => account.role?.roleName === "Catechist"
        );

        // Fetch danh sách roles
        const roleResponse = await roleEventApi.getAllRoleEvents(1, 100);
        setRoles(roleResponse.data.data.items);

        // Fetch danh sách ban tổ chức hiện tại
        const organizerResponse = await eventApi.getEventMembers(
          eventId,
          1,
          10000
        );
        const currentOrganizers = organizerResponse.data.data.items.map(
          (item: any) => ({
            id: item.account.id,
            roleEventId: item.roleEvent.id,
            fullName: item.account.fullName,
            avatar: item.account.avatar,
            phone: item.account.phone,
            email: item.account.email,
          })
        );

        // Lọc các accounts chưa được thêm vào ban tổ chức
        const available = filteredAccounts.filter(
          (acc) => !currentOrganizers.some((org: any) => org.id === acc.id)
        );

        setAvailableAccounts(available);
        setOrganizers(currentOrganizers);
        resetVietnamese();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        disableLoading();
      }
    };

    if (open) {
      fetchAccountsAndRoles();
    }
  }, [open, eventId]);

  const handleAddOrganizer = (
    account: any,
    roleId: string,
    callback?: () => void
  ) => {
    const currentRoleName = roles.find((r) => r.id === roleId)?.name;

    // Check Business Rules
    if (
      currentRoleName === RoleEventName.TRUONG_BTC &&
      organizers.some(
        (org) =>
          roles.find((r) => r.id === org.roleEventId)?.name ===
          RoleEventName.TRUONG_BTC
      )
    ) {
      sweetAlert.alertWarning(
        "Chỉ được có 1 Trưởng Ban Tổ Chức!",
        "",
        3000,
        27
      );
      return;
    }

    const phoCount = organizers.filter(
      (org) =>
        roles.find((r) => r.id === org.roleEventId)?.name ===
        RoleEventName.PHO_BTC
    ).length;

    if (currentRoleName === RoleEventName.PHO_BTC && phoCount >= 2) {
      sweetAlert.alertWarning("Tối đa 2 Phó Ban Tổ Chức!", "", 1000, 22);
      return;
    }

    if (callback) {
      callback();
    }

    setAvailableAccounts((prev) => prev.filter((acc) => acc.id !== account.id));
    setOrganizers((prev) => [...prev, { ...account, roleEventId: roleId }]);
  };

  const handleRemoveOrganizer = (accountId: string) => {
    const organizerToRemove = organizers.find((org) => org.id === accountId);
    if (organizerToRemove) {
      setOrganizers((prev) => prev.filter((org) => org.id !== accountId));
      setAvailableAccounts((prev) => [
        ...prev,
        {
          id: organizerToRemove.id,
          fullName: organizerToRemove.fullName,
          avatar: organizerToRemove.avatar,
          phone: organizerToRemove.phone,
        },
      ]);
    }
  };

  const handleSave = async () => {
    // Check Business Rules
    const truongCount = organizers.filter(
      (org) =>
        roles.find((r) => r.id === org.roleEventId)?.name ===
        RoleEventName.TRUONG_BTC
    ).length;

    const phoCount = organizers.filter(
      (org) =>
        roles.find((r) => r.id === org.roleEventId)?.name ===
        RoleEventName.PHO_BTC
    ).length;

    const memberCount = organizers.filter(
      (org) =>
        roles.find((r) => r.id === org.roleEventId)?.name ===
        RoleEventName.MEMBER_BTC
    ).length;

    if (truongCount !== 1) {
      sweetAlert.alertWarning(
        "Cần chính xác 1 Trưởng Ban Tổ Chức!",
        "",
        2500,
        26
      );
      return;
    }
    if (phoCount < 1 || phoCount > 2) {
      sweetAlert.alertWarning(
        "Cần chính xác 1 hoặc 2 Phó Ban Tổ Chức!",
        "",
        2500,
        30
      );
      return;
    }

    if (memberCount <= 0) {
      sweetAlert.alertWarning(
        "Cần ít nhất 1 Thành Viên Ban Tổ Chức!",
        "",
        2500,
        30
      );
      return;
    }

    try {
      await memberApi.updateEventMember(eventId, organizers);
      sweetAlert.alertSuccess("Cập nhật ban tổ chức thành công!", "", 3000, 28);
      refresh();
      onClose();
    } catch (error) {
      console.error("Error saving organizers:", error);
      sweetAlert.alertFailed("Có lỗi khi cập nhật ban tổ chức!", "", 3000, 28);
    } finally {
      refresh();
      onClose();
    }
  };

  const getRoleOrder = (roleName: string): number => {
    switch (roleName) {
      case RoleEventName.TRUONG_BTC:
        return 1; // Thứ tự cao nhất
      case RoleEventName.PHO_BTC:
        return 2;
      case RoleEventName.MEMBER_BTC:
        return 3; // Thứ tự thấp nhất
      default:
        return 4; // Vai trò không xác định (nếu có)
    }
  };

  const sortedOrganizers = [...organizers].sort((a, b) => {
    const roleNameA = roles.find((r) => r.id === a.roleEventId)?.name || "";
    const roleNameB = roles.find((r) => r.id === b.roleEventId)?.name || "";

    return getRoleOrder(roleNameA) - getRoleOrder(roleNameB);
  });
  const [updateMode, setUpdateMode] = useState<boolean>(false);
  const columns: GridColDef[] = [
    {
      field: "avatar",
      headerName: "Ảnh",
      width: 100,
      renderCell: (params) => (
        <img
          src={params.row.avatar || "https://via.placeholder.com/50"}
          alt="Avatar"
          width={50}
          height={50}
          style={{ borderRadius: "3px" }}
        />
      ),
    },
    { field: "fullName", headerName: "Họ và Tên", width: 200 },
    { field: "email", headerName: "Email", width: 220 },

    { field: "phone", headerName: "Số Điện Thoại", width: 150 },
    {
      field: "roleEventId",
      headerName: "Vai trò",
      width: 300,
      renderCell: (params) =>
        viewOrganizersDialogMode ? (
          <>
            {roles.find((r) => r.id === params.value)
              ? roles.find((r) => r.id === params.value).name
              : ""}
          </>
        ) : (
          <>
            <FormControl fullWidth>
              <MuiSelect
                onChange={(e) => {
                  handleAddOrganizer(
                    params.row,
                    e.target.value as string,
                    () => {
                      handleRemoveOrganizer(params.row.id);
                    }
                  );
                }}
                defaultValue={
                  roles.find((r) => r.id === params.value)
                    ? roles.find((r) => r.id === params.value).id
                    : ""
                }
                value={
                  organizers.find((item) => item.id == params.row.id)
                    ?.roleEventId
                }
                disabled={viewOrganizersDialogMode}
              >
                <MenuItem value="" disabled>
                  Chọn vai trò
                </MenuItem>
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </MuiSelect>
            </FormControl>
          </>
        ),
    },
  ];

  if (!viewOrganizersDialogMode || (viewOrganizersDialogMode && updateMode)) {
    columns.push({
      field: "action",
      headerName: "Hành động",
      width: 150,
      renderCell: (params) => (
        <Button
          color="error"
          onClick={() => handleRemoveOrganizer(params.row.id)}
        >
          Xóa
        </Button>
      ),
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        {viewOrganizersDialogMode ? (
          <>
            {updateMode ? (
              <span className="text-primary font-bold">
                Cập Nhật Ban Tổ Chức
              </span>
            ) : (
              <span className="text-secondary font-bold">Xem Ban Tổ Chức</span>
            )}
          </>
        ) : (
          <span className="text-success font-bold">Thêm Ban Tổ Chức</span>
        )}
      </DialogTitle>
      <DialogContent>
        {!viewOrganizersDialogMode ||
        (viewOrganizersDialogMode && updateMode) ? (
          <>
            <h4>Danh sách Chưa Gán</h4>
            <DataGrid
              rows={availableAccounts}
              columns={[
                {
                  field: "avatar",
                  headerName: "Ảnh",
                  width: 100,
                  renderCell: (params) => (
                    <img
                      src={
                        params.row.avatar || "https://via.placeholder.com/50"
                      }
                      alt="Avatar"
                      width={50}
                      height={50}
                      style={{ borderRadius: "3px" }}
                    />
                  ),
                },
                { field: "fullName", headerName: "Họ và Tên", width: 200 },
                { field: "email", headerName: "Email", width: 220 },
                { field: "phone", headerName: "Số Điện Thoại", width: 150 },
                {
                  field: "action",
                  headerName: "Thêm",
                  width: 300,
                  renderCell: (params) => (
                    <FormControl fullWidth>
                      <MuiSelect
                        onChange={(e) =>
                          handleAddOrganizer(
                            params.row,
                            e.target.value as string
                          )
                        }
                        defaultValue=""
                        value={
                          availableAccounts.find(
                            (item) => item.id == params.row.id
                          ).roleEventId
                        }
                      >
                        <MenuItem value="" disabled>
                          Chọn vai trò
                        </MenuItem>
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                  ),
                },
              ]}
              paginationModel={paginationModel}
              onPaginationModelChange={setPaginationModel}
              pageSizeOptions={[8, 10, 25, 50, 100, 250]}
              disableRowSelectionOnClick
              localeText={viVNGridTranslation}
              paginationMode="client"
              sx={{
                maxHeight: 300,
                overflowX: "auto",
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
              }}
            />
          </>
        ) : (
          <></>
        )}

        <h4 className="mt-3">Danh sách Ban Tổ Chức</h4>
        {sortedOrganizers.length > 0 ? (
          <>
            <DataGrid
              rows={sortedOrganizers}
              columns={columns}
              paginationModel={paginationModel2}
              onPaginationModelChange={setPaginationModel2}
              pageSizeOptions={[8, 10, 25, 50, 100, 250]}
              disableRowSelectionOnClick
              localeText={viVNGridTranslation}
              sx={{
                maxHeight: 300,
                overflowX: "auto",
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
              }}
            />
          </>
        ) : (
          <p className="text-primary mt-2">Hiện chưa có ai trong ban tổ chức</p>
        )}
      </DialogContent>
      <DialogActions>
        {viewOrganizersDialogMode ? (
          <>
            {updateMode ? (
              <>
                <Button variant="outlined" onClick={handleSave} color="primary">
                  Lưu
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setUpdateMode(false);
                  }}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                {catechistMode ? (
                  <></>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setUpdateMode(true);
                        resetVietnamese();
                      }}
                      color="primary"
                    >
                      Cập nhật
                    </Button>
                  </>
                )}

                <Button variant="contained" color="secondary" onClick={onClose}>
                  Đóng
                </Button>
              </>
            )}
          </>
        ) : (
          <>
            <Button variant="outlined" color="secondary" onClick={onClose}>
              Hủy
            </Button>
            <Button variant="outlined" onClick={handleSave} color="primary">
              Lưu
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OrganizersDialog;
