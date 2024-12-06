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
import { DataGrid } from "@mui/x-data-grid";
import memberApi from "../../../api/EventMember";
import eventApi from "../../../api/Event";
import accountApi from "../../../api/Account";
import roleEventApi from "../../../api/RoleEvent";
import sweetAlert from "../../../utils/sweetAlert";
import { UpdateMemberRequest } from "../../../model/Request/EventMember";
import { RoleEventName } from "../../../enums/RoleEventEnum";
import useAppContext from "../../../hooks/useAppContext";

interface OrganizersDialogProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  refresh: () => void;
}

const OrganizersDialog: React.FC<OrganizersDialogProps> = ({
  open,
  onClose,
  eventId,
  refresh,
}) => {
  const [availableAccounts, setAvailableAccounts] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<
    (UpdateMemberRequest & {
      fullName: string;
      avatar: string;
      phone: string;
    })[]
  >([]);
  const [roles, setRoles] = useState<any[]>([]);
  const { enableLoading, disableLoading } = useAppContext();

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
          })
        );

        // Lọc các accounts chưa được thêm vào ban tổ chức
        const available = filteredAccounts.filter(
          (acc) => !currentOrganizers.some((org: any) => org.id === acc.id)
        );

        setAvailableAccounts(available);
        setOrganizers(currentOrganizers);
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
        1000,
        22
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
        1000,
        22
      );
      return;
    }

    if (phoCount < 1 || phoCount > 2) {
      sweetAlert.alertWarning(
        "Cần ít nhất 1 và tối đa 2 Phó Ban Tổ Chức!",
        "",
        1000,
        22
      );
      return;
    }

    if (memberCount < 1) {
      sweetAlert.alertWarning(
        "Cần ít nhất 1 Thành Viên Ban Tổ Chức!",
        "",
        1000,
        22
      );
      return;
    }

    try {
      console.log("request nè", "eventId: " + eventId, "data" + organizers);
      await memberApi.updateEventMember(eventId, organizers);
      sweetAlert.alertSuccess("Cập nhật ban tổ chức thành công!", "", 1000, 22);
      refresh();
      onClose();
    } catch (error) {
      console.error("Error saving organizers:", error);
    } finally {
      sweetAlert.alertSuccess("Cập nhật ban tổ chức thành công!", "", 1000, 22);
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>Cập nhật Ban Tổ Chức</DialogTitle>
      <DialogContent>
        <h4>Danh sách Người Dùng</h4>
        <DataGrid
          rows={availableAccounts}
          columns={[
            {
              field: "avatar",
              headerName: "Avatar",
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
            { field: "phone", headerName: "Số Điện Thoại", width: 150 },
            {
              field: "action",
              headerName: "Thêm",
              width: 300,
              renderCell: (params) => (
                <FormControl fullWidth>
                  <MuiSelect
                    onChange={(e) =>
                      handleAddOrganizer(params.row, e.target.value as string)
                    }
                    defaultValue=""
                    value={
                      availableAccounts.find((item) => item.id == params.row.id)
                        .roleEventId
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
          autoHeight
        />
        <h4 className="mt-3">Danh sách Ban Tổ Chức</h4>
        <DataGrid
          rows={sortedOrganizers}
          columns={[
            {
              field: "avatar",
              headerName: "Avatar",
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
            { field: "phone", headerName: "Số Điện Thoại", width: 150 },
            {
              field: "roleEventId",
              headerName: "Vai trò",
              width: 300,
              renderCell: (params) => (
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
            {
              field: "action",
              headerName: "Xóa",
              width: 150,
              renderCell: (params) => (
                <Button
                  color="error"
                  onClick={() => handleRemoveOrganizer(params.row.id)}
                >
                  Xóa
                </Button>
              ),
            },
          ]}
          autoHeight
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleSave} color="primary">
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrganizersDialog;
