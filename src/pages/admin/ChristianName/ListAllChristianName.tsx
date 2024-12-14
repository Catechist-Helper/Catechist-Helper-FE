import React, { useState, useEffect } from "react";
import christianNamesApi from "../../../api/ChristianName";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../utils/formatDate";

const ListAllChristianNames: React.FC = () => {
  const [christianNames, setChristianNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    christianNamesApi
      .getAllChristianNames(1, 1000)
      .then((axiosRes: AxiosResponse) => {
        const res: BasicResponse = axiosRes.data;
        console.log("Response data: ", res);

        if (
          res.statusCode.toString().trim().startsWith("2") &&
          res.data.items != null
        ) {
          console.log("Items: ", res.data.items);
          setChristianNames(res.data.items);
        } else {
          console.log("No items found");
        }
      })
      .catch((err) => {
        console.error("Không thấy danh sách tên thánh: ", err);
      });
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-christian-name");
  };

  const handleEditNameClick = (id: string): void => {
    navigate(`/admin/update-christian-name/${id}`);
  };

  const handleDeleteNameClick = (id: string): void => {
    if (window.confirm("Bạn có chắc là muốn xóa tên thánh này không?")) {
      christianNamesApi
        .deleteChristianNames(id)
        .then(() => {
          alert(`Tên Thánh đã xóa thành công.`);
          window.location.reload();
        })
        .catch((err: Error) => {
          console.error(`Không thể xóa tên thánh với ID: ${id}`, err);
        });
    }
  };

  return (
    <div className="container mt-5 ">
      <div className="mb-10 text-center fw-bold">
        <h1>DANH SÁCH TÊN THÁNH</h1>
      </div>
      <div className="d-flex align-items-center mb-3 ">
        <div className="ml-6">
          <button
            className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
            onClick={handleCreate}
          >
            Tạo tên thánh
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
                Giới tính
              </th>
              <th scope="col" className="px-6 py-3">
                Ngày thánh
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {christianNames.length > 0 ? (
              christianNames.map((name: any) => (
                <tr
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  key={name.id}
                >
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                  >
                    <div className="text-dark">{name.name}</div>
                  </th>
                  <td className="px-6 py-4">
                    <div className="text-dark text-decoration-none">
                      {name.gender}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-dark text-decoration-none">
                      {formatDate.DD_MM_YYYY(name.holyDay)}
                    </div>
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      onClick={() => handleEditNameClick(name.id)}
                      className="btn btn-info"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDeleteNameClick(name.id)}
                      className="btn btn-warning"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Không thấy danh sách tên thánh
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListAllChristianNames;
