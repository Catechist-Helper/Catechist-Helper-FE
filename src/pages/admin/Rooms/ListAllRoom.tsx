import React, { useState, useEffect } from "react";
import roomsApi from "../../../api/Room";
import { AxiosResponse } from "axios";
import { BasicResponse } from "../../../model/Response/BasicResponse";
import { useNavigate } from "react-router-dom";

const ListAllChristianNames: React.FC = () => {
  const [christianNames, setChristianNames] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    roomsApi
      .getAllRoom(1, 100)
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
        console.error("Không thấy danh sách phòng học: ", err);
      });
  }, []);

  const handleCreate = () => {
    navigate("/admin/create-room");
  };

  const handleEditNameClick = (id: string): void => {
    navigate(`/admin/update-room/${id}`);
  };

  const handleDeleteNameClick = (id: string): void => {
    if (window.confirm("Bạn có chắc là muốn xóa phòng học này không?")) {
      roomsApi
        .deleteRoom(id)
        .then(() => {
          alert(`Lớp học đã xóa thành công.`);
          window.location.reload();
        })
        .catch((err: Error) => {
          console.error(`Không thể xóa phòng học với ID: ${id}`, err);
        });
    }
  };

  return (
    <div className="container mt-5 ">
      <div className="mb-10 text-center fw-bold">
        <h1>DANH SÁCH PHÒNG HỌC</h1>
      </div>
      <div className="d-flex align-items-center mb-3 ">
        <div className="ml-6">
          <button
            className="px-4 py-2 border border-black text-black bg-white hover:bg-gray-200"
            onClick={handleCreate}
          >
            Tạo phòng học
          </button>
        </div>
      </div>

      <div className="flex relative overflow-x-auto justify-center p-6">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500">
          <thead className="text-xs text-white uppercase bg-[#422A14] h-20">
            <tr>
              <th scope="col" className="px-6 py-3">
                Phòng học
              </th>
              <th scope="col" className="px-6 py-3">
                Mô tả
              </th>
              <th scope="col" className="px-6 py-3">
                Hình ảnh
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
                      {name.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-dark text-decoration-none">
                      {name.image && name.image != "" ? (
                        <>
                          <img
                            src={name.image}
                            alt={name.name}
                            style={{
                              width: "100px",
                              height: "100px",
                              borderRadius: "5px",
                            }}
                          />
                        </>
                      ) : (
                        <></>
                      )}
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
