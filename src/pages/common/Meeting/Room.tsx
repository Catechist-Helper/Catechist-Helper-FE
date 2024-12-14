import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import {
  CallClient,
  CallAgent,
  LocalVideoStream,
  VideoStreamRenderer,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const Room: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [callAgent, setCallAgent] = useState<CallAgent | null>(null);
  const [call, setCall] = useState<any>(null);
  const [deviceManager, setDeviceManager] = useState<any>(null);
  const [localVideoStream, setLocalVideoStream] =
    useState<LocalVideoStream | null>(null);
  const [localVideoStreamRenderer] = useState<VideoStreamRenderer | null>(null);

  const roomId = searchParams.get("roomid");
  const token = searchParams.get("token");

  useEffect(() => {
    const initializeCallAgent = async () => {
      if (!token) {
        console.error("Token is missing!");
        return;
      }

      try {
        // Create CallClient instance
        const callClient = new CallClient();
        const tokenCredential = new AzureCommunicationTokenCredential(token);

        // Create CallAgent
        const agent = await callClient.createCallAgent(tokenCredential);
        setCallAgent(agent);

        // Get DeviceManager
        const manager = await callClient.getDeviceManager();
        if (!manager) {
          throw new Error("Failed to initialize DeviceManager.");
        }
        setDeviceManager(manager);

        // Request permissions
        await manager.askDevicePermission({ video: true, audio: false }); // Request video permission
        await manager.askDevicePermission({ video: false, audio: true }); // Request audio permission
      } catch (error) {
        console.error("Error initializing call agent:", error);
      }
    };

    initializeCallAgent();

    return () => {
      // Clean up local video stream and call agent on component unmount
      if (localVideoStreamRenderer) localVideoStreamRenderer.dispose();
      if (call) call.hangUp();
    };
  }, [token]);

  const handleJoinRoom = async () => {
    if (!callAgent || !roomId) {
      alert("Call agent or Room ID is not ready.");
      return;
    }

    try {
      const stream = await createLocalVideoStream();
      setLocalVideoStream(stream);
      console.log(localVideoStream);

      const videoOptions = stream ? { localVideoStreams: [stream] } : undefined;

      const callInstance = callAgent.join({ roomId }, { videoOptions });
      setCall(callInstance);

      callInstance.on("stateChanged", () => {
        console.log(`Call state changed: ${callInstance.state}`);
      });

      console.log("Joined room successfully.");
    } catch (error) {
      console.error("Error joining room:", error);
    }
  };

  const createLocalVideoStream = async () => {
    if (!deviceManager) {
      console.error("Device manager not initialized.");
      return null;
    }

    const cameras = await deviceManager.getCameras();
    if (cameras.length === 0) {
      console.error("No cameras available.");
      return null;
    }

    return new LocalVideoStream(cameras[0]);
  };

  const handleHangUp = async () => {
    if (call) {
      await call.hangUp();
      setCall(null);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Phòng phỏng vấn
      </Typography>
      <Box sx={{ marginBottom: 2 }}>
        <Typography variant="body1">ID của phòng: {roomId}</Typography>
      </Box>
      <Box sx={{ marginBottom: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleJoinRoom}
          sx={{ marginRight: 2 }}
        >
          Tham gia phòng
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleHangUp}
          disabled={!call}
        >
          Hang Up
        </Button>
      </Box>
      <Box>
        <Typography variant="h6">Local Video Stream:</Typography>
        <div id="localVideoContainer" />
      </Box>
    </Box>
  );
};

export default Room;
