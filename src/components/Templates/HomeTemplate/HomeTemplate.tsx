import React, { FC } from "react";
import HeaderHome from "../../Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../Organisms/FooterHome/FooterHome";

interface HomeTemplateProps {
  children: React.ReactNode;
}

const HomeTemplate: FC<HomeTemplateProps> = ({ children }) => {
  return (
    <>
      <div className="flex flex-col min-h-screen">
        <HeaderHome />
        <main
          className="flex-grow w-[100vw] bg-[url(../src/assets/images/HomeTemplate/background.png)] relative"
          style={{
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
          }}
        >
          <div
            className="w-[100%] h-[100%] absolute z-1"
            style={{
              background: `linear-gradient(
  to right, 
  rgba(0, 0, 0, 0.8) 0%, 
  rgba(0, 0, 0, 0.75) 4%, 
  rgba(0, 0, 0, 0.7) 18%, 
  rgba(0, 0, 0, 0.75) 100%
)`,
            }}
          ></div>
          <div className="z-100 relative h-[100%]">{children}</div>
        </main>
        <FooterHome />
      </div>
    </>
  );
};

export default HomeTemplate;
