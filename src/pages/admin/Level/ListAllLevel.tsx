import React, { useState, useEffect } from "react";
import levelApi from "../../../api/Level";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import sweetAlert from "../../../utils/sweetAlert";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Button, Paper } from "@mui/material";
import viVNGridTranslation from "../../../locale/MUITable";
import { PATH_ADMIN } from "../../../routes/paths";
import ImageDialog from "../../../components/Molecules/ImageDialog";
import { CertificateResponse } from "../../../model/Response/Catechist";
import { storeCurrentPath } from "../../../utils/utils";

const ListAllLevel: React.FC = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const { data } = await levelApi.getAllLevel();
      const res: BasicResponse = data;
      if (
        res.statusCode.toString().trim().startsWith("2") &&
        res.data.items != null
      ) {
        setLevels(
          res.data.items.sort(
            (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
          )
        );

        const updatedRows: any = await Promise.all(
          res.data.items.map(async (item: any) => {
            let certificates: any = null;
            const res = await levelApi.certificatesByLevelId(item.id);
            certificates = res.data.data.items;
            return {
              ...item,
              certificates: certificates,
            };
          })
        );

        setLevels(updatedRows);
      } else {
        console.error("No levels found.");
      }
    } catch (error) {
      console.error("Error fetching levels: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    storeCurrentPath(PATH_ADMIN.levels);
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-levels");
  };

  const handleDeleteLevelClick = async (id: string) => {
    const confirm = await sweetAlert.confirm(
      "Bạn có chắc là muốn xóa cấp bậc này không?",
      "",
      undefined,
      undefined,
      "question"
    );

    if (confirm) {
      try {
        await levelApi.deleteLevel(id);
        sweetAlert.alertSuccess("Cấp bậc đã xóa thành công.", "", 3000, 28);
        setLevels((prev) => prev.filter((level: any) => level.id !== id));
      } catch (error) {
        console.error(`Failed to delete level with ID: ${id}`, error);
        sweetAlert.alertFailed(
          "Không thể xóa cấp bậc. Vui lòng thử lại sau.",
          "",
          3000,
          32
        );
      }
    }
  };

  const [dialogCertificateImageOpen, setDialogCertificateImageOpen] =
    useState(false);
  const [dialogData, setDialogData] = useState({
    images: [],
    title: "",
  });

  const handleOpenDialogCertificateImage = (
    certificates: CertificateResponse[],
    levelName: string
  ) => {
    const images: any = certificates
      .filter((cert) => cert.image)
      .map((cert) => ({
        url: cert.image,
      }));

    setDialogData({
      images,
      title: `Các chứng chỉ của cấp bậc ${levelName}`,
    });
    setDialogCertificateImageOpen(true);
  };

  const handleCloseDialogCertificateImage = () =>
    setDialogCertificateImageOpen(false);

  const columns: GridColDef[] = [
    { field: "name", headerName: "Tên", width: 200 },
    { field: "description", headerName: "Mô tả", width: 300 },
    { field: "hierarchyLevel", headerName: "Cấp độ giáo lý", width: 150 },
    {
      field: "certificates",
      headerName: "Chứng chỉ",
      width: 200,
      renderCell: (params) => {
        return (
          <>
            {params.row.certificates && params.row.certificates.length > 0 ? (
              <>
                <span>{params.row.certificates.length}</span>
                <Button
                  color="secondary"
                  onClick={() => {
                    handleOpenDialogCertificateImage(
                      params.row.certificates,
                      params.row.name
                    );
                  }}
                >
                  Xem
                </Button>
              </>
            ) : (
              <>0</>
            )}
            <Button
              color="primary"
              onClick={() => {
                navigate(`${PATH_ADMIN.create_certificates}`, {
                  state: {
                    levelId: params.row.id,
                  },
                });
              }}
            >
              Thêm
            </Button>
          </>
        );
      },
    },
    {
      field: "actions",
      headerName: "Hành động",
      width: 200,
      renderCell: (params) => (
        <div className="space-x-2">
          <Button
            color="error"
            variant="outlined"
            className="btn btn-danger"
            onClick={() => handleDeleteLevelClick(params.row.id)}
          >
            Xóa
          </Button>
        </div>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  return (
    <Paper
      sx={{
        width: "calc(100% - 3.8rem)",
        position: "absolute",
        left: "3.8rem",
      }}
    >
      <h1 className="text-center text-[2.2rem] bg_title text-text_primary_light py-2 font-bold">
        Danh sách cấp bậc
      </h1>
      <div className="flex justify-between mb-3 mt-3 px-3">
        <div className="min-w-[2px]"></div>
        <div className="flex gap-x-2">
          <Button
            color="success"
            variant="outlined"
            className="btn btn-success"
            onClick={handleCreate}
          >
            Tạo cấp bậc
          </Button>
          <Button color="primary" variant="contained" onClick={fetchLevels}>
            Tải lại
          </Button>
        </div>
      </div>
      <div className="px-3">
        <DataGrid
          rows={levels}
          columns={columns}
          loading={loading}
          paginationMode="client"
          localeText={viVNGridTranslation}
          disableRowSelectionOnClick
          sx={{
            height: 480,
            overflowX: "auto",
            "& .MuiDataGrid-root": {
              overflowX: "auto",
            },
          }}
        />
      </div>
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
    </Paper>
  );
};

export default ListAllLevel;
