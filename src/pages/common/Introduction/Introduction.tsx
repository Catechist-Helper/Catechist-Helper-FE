import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Stack,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ChurchIcon from "@mui/icons-material/Church";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HeaderHome from "../../../components/Organisms/HeaderHome/HeaderHome";
import FooterHome from "../../../components/Organisms/FooterHome/FooterHome";

export const CORE_INFORMATION = {
  MAIL_CONSTANT: "catechisthelper@gmail.com",
  PHONE_CONSTANT: "(+84)989560785",
  PHONE_CONSTANT_DISPLAY: "(+84) 989 560 785",
  ADDRESS: "123 Đường Đức Tin, Thành phố Giáo Xứ, Việt Nam",
  PARISH_NAME: "Giáo Xứ Catechist Helper",
  SERVICE_HOURS: "Chủ Nhật: 8:00 - 12:00, Các ngày trong tuần: 18:00 - 20:00",
};

const ParishIntroduction = () => {
  return (
    <div className="overflow-hidden flex flex-col min-h-screen">
      <HeaderHome />
      <main
        role="main"
        className="overflow-hidden flex-grow w-[100vw] bg-[url(../src/assets/images/HomeTemplate/background.png)] relative"
        style={{
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
        }}
      >
        <Container maxWidth="md" sx={{ marginTop: 4 }}>
          <Box textAlign="center" mb={4} color="white">
            <Typography variant="h3" component="h1" gutterBottom>
              Chào mừng đến với {CORE_INFORMATION.PARISH_NAME}
            </Typography>
            <Typography variant="body1" color="white" mb={2}>
              Giáo xứ của chúng tôi là một cộng đồng sống động và thân thiện,
              nơi đức tin và tình bạn được gắn kết. Chúng tôi cam kết phục vụ
              cộng đồng và chia sẻ tình yêu của Chúa Kitô với mọi người.
            </Typography>
            <Typography variant="body2" color="white" fontStyle="italic">
              "Nơi đức tin lớn lên và cộng đồng thăng hoa."
            </Typography>
          </Box>

          <Stack spacing={3} direction={{ xs: "column", sm: "row" }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <LocationOnIcon color="primary" sx={{ marginRight: 1 }} />
                  <Typography variant="h6">Địa chỉ</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {CORE_INFORMATION.ADDRESS}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ChurchIcon color="primary" sx={{ marginRight: 1 }} />
                  <Typography variant="h6">Giờ lễ</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {CORE_INFORMATION.SERVICE_HOURS}
                </Typography>
              </CardContent>
            </Card>
          </Stack>

          <Stack spacing={3} direction={{ xs: "column", sm: "row" }} mt={3}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmailIcon color="primary" sx={{ marginRight: 1 }} />
                  <Typography variant="h6">Email</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {CORE_INFORMATION.MAIL_CONSTANT}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <PhoneIcon color="primary" sx={{ marginRight: 1 }} />
                  <Typography variant="h6">Số điện thoại</Typography>
                </Box>
                <Typography variant="body1" color="text.secondary">
                  {CORE_INFORMATION.PHONE_CONSTANT_DISPLAY}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Container>
      </main>

      <FooterHome />
    </div>
  );
};

export default ParishIntroduction;
