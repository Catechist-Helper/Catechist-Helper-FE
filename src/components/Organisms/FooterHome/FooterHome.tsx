import React from "react";
import { CORE_INFORMATION } from "../../../constants/CoreInformation";

const FooterHome: React.FC = () => {
  return (
    <footer className="bg-primary_color text-text_primary_light">
      <div className="px-20 py-3 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <h2
            className="text-[1rem] inline-block"
            style={{ fontWeight: "bolder" }}
          >
            Catechist Helper
          </h2>
          <p className="text-[0.8rem]">Ho Chi Minh City, Vietnam</p>
          <p className="text-[0.8rem]">
            {CORE_INFORMATION.PHONE_CONSTANT_DISPLAY}
          </p>
        </div>
        <div>
          <p
            className="text-[1.1rem] pl-8 py-2"
            style={{ borderLeft: "2px solid #fff" }}
          >
            Liên hệ giáo xứ
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterHome;
