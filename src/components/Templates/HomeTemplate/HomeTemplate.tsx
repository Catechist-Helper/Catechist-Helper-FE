import React, { FC } from "react";
import HeaderHome from "../../Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../Organisms/FooterHome/FooterHome";
import LoadingScreen from "../../Organisms/LoadingScreen/LoadingScreen";
import useAppContext from "../../../hooks/useAppContext";

interface HomeTemplateProps {
  children: React.ReactNode;
}

const HomeTemplate: FC<HomeTemplateProps> = ({ children }) => {
  const { isLoading } = useAppContext();

  return (
    <>
      <div
        className="w-screen h-screen absolute z-[999]"
        style={{
          display: `${isLoading ? "block" : "none"}`,
        }}
      >
        <LoadingScreen transparent={true} />
      </div>
      <div className="overflow-hidden flex flex-col min-h-screen">
        <HeaderHome />
        <main
          className="overflow-hidden flex-grow w-[100vw] bg-[url(../src/assets/images/HomeTemplate/background.png)] relative"
          style={{
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
          }}
        >
          <div
            className="w-full h-full absolute z-1"
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
          <div className="z-[100] relative h-full">{children}</div>
        </main>
        <FooterHome />
      </div>
    </>
  );
};

export default HomeTemplate;
