import React, { useState, useEffect } from "react";
import levelApi from "../../../api/Level";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
const ListAllLevel: React.FC = () => {
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    levelApi
      .getAllLevel()
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        console.log("Response data: ", res);

        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          console.log(
            "Items: ",
            res.data.items.sort(
              (a: any, b: any) => a.hierarchyLevel - b.hierarchyLevel
            )
          );
          setLevels(res.data.items);
        } else {
          console.log("No items found");
        }
      })
      .catch((err) => {
        console.error("Không thấy cấp bậc: ", err);
      });
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-levels");
  };

  // const handleEditCategoryClick = (id: string): void => {
  //   navigate(`/admin/update-levels/${id}`);
  // };

  const handleDeleteLevelClick = (id: string): void => {
    if (window.confirm("Bạn có chắc là muốn xóa cấp bậc này không?")) {
      levelApi
        .deleteLevel(id)
        .then(() => {
          alert(`Level đã xóa thành công.`);
          window.location.reload();
        })
        .catch((err: Error) => {
          console.error(`Failed to delete level with ID: ${id}`, err);
        });
    }
  };

  console.log(ListAllLevel);
  return (
    <>
      <div className="container mt-5 ">
        <div className="mb-10 text-center fw-bold">
          <h1>CẤP BẬC</h1>
        </div>
        <div className="d-flex align-items-center mb-3 ">
          <div className="ml-6">
            <button
              className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
              onClick={handleCreate}
            >
              Tạo cấp bậc
            </button>
          </div>
        </div>

        <div className="flex relative overflow-x-auto justify-center p-6">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500">
            <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Tên
                </th>
                <th scope="col" className="px-6 py-3">
                  Mô tả
                </th>
                <th scope="col" className="px-6 py-3">
                  Cấp độ giáo lý
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Action
                </th> */}
              </tr>
            </thead>
            <tbody>
              {levels.length > 0 ? (
                levels.map((level: any) => (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={level.id}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      <div className="text-dark">{level.name}</div>
                    </th>
                    <td className="px-6 py-4">
                      <div className="text-dark text-decoration-none">
                        {level.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-dark text-decoration-none">
                        {level.hierarchyLevel}
                      </div>
                    </td>
                    <td className="px-4 py-4 space-x-2">
                      {/* <button
                        onClick={() => handleEditCategoryClick(level.id)}
                        className="btn btn-info"
                      >
                        Chỉnh sửa
                      </button> */}
                      <button
                        onClick={() => handleDeleteLevelClick(level.id)}
                        className="btn btn-warning"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center">
                    Không thấy danh sách danh mục
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ListAllLevel;
