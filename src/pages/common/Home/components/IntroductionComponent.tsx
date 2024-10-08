import React from "react";

const IntroductionComponent: React.FC = () => {
  return (
    <div className="px-20 w-full flex flex-col items-end">
      <h1
        className="text-[3rem] text-text_primary_light text-right mt-4"
        style={{ lineHeight: "60px", fontWeight: "600", letterSpacing: "3px" }}
      >
        Chào Mừng Ghé Thăm
        <br />
        Giáo Xứ Catechist Helper
      </h1>
      <p
        className="text-[1.5rem] text-right text-[#C3C3C3] my-2"
        style={{ letterSpacing: "1px" }}
      >
        Giáo xứ Catechist Helper là ngôi nhà chung <br /> của cộng đoàn tín hữu,
        nơi gìn giữ truyền thống <br /> đức tin và tinh thần phục vụ yêu thương
      </p>
      <button
        className="text-primary_color bg-white py-2 px-3 border-0 mt-2"
        style={{ fontWeight: "bolder", letterSpacing: "0.5px" }}
      >
        THÔNG TIN VỀ GIÁO XỨ
      </button>
    </div>
  );
};

export default IntroductionComponent;
