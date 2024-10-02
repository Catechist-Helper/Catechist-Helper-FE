import React from "react";
import { Link } from "react-router-dom";

const HeaderHome: React.FC = () => {
  return (
    <header className="bg-primary text-text_primary_light">
      <div className="px-20 py-3 flex flex-row items-center justify-between">
        <div>
          <h2
            className="text-[1.5rem] inline-block"
            style={{ fontWeight: "bolder" }}
          >
            Catechist Helper
          </h2>
        </div>
        <div className="flex gap-x-10" style={{ fontWeight: "500" }}>
          <Link to={"/"} className="links_dark_hover">
            TRANG CHỦ
          </Link>
          <Link to={"/"} className="links_dark_hover">
            GIỚI THIỆU
          </Link>
          <Link to={"/"} className="links_dark_hover">
            TIN TỨC
          </Link>
          <Link to={"/login"} className="links_dark_hover">
            ĐĂNG NHẬP
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderHome;
