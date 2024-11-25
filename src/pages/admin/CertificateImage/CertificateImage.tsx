import React from "react";

interface CertificateProps {
    name: string;
    description: string;
    levelId: string;
    imageUrl: string;
}

const CertificateImage: React.FC<CertificateProps> = ({ name, description, levelId, imageUrl }) => {
    return (
        <div
            style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize: "cover",
                width: "800px",
                height: "600px",
                position: "relative",
                textAlign: "center",
                color: "#333",
                fontFamily: "Arial, sans-serif"
            }}
        >
            <div style={{ position: "absolute", top: "200px", left: "50%", transform: "translateX(-50%)", fontSize: "30px", fontWeight: "bold" }}>
                {name}
            </div>
            <div style={{ position: "absolute", top: "300px", left: "50%", transform: "translateX(-50%)", fontSize: "20px" }}>
                {description}
            </div>
            <div style={{ position: "absolute", top: "400px", left: "50%", transform: "translateX(-50%)", fontSize: "18px", fontStyle: "italic" }}>
               {levelId}
            </div>
        </div>
    );
};

export default CertificateImage;
