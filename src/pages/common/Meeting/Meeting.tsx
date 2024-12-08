import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  CallClient,
  CallAgent,
  DeviceManager,
  LocalVideoStream,
  VideoStreamRenderer,
  Call,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

import { AppBar, IconButton, Toolbar, Box, Button } from "@mui/material";
import CallEndIcon from "@mui/icons-material/CallEnd";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";

const Meeting = () => {
  const navigate = useNavigate();
  const [callAgent, setCallAgent] = useState<CallAgent | null>(null);
  const [deviceManager, setDeviceManager] = useState<DeviceManager | null>(
    null
  );
  const [call, setCall] = useState<Call | null>(null);
  const [localVideoStream, setLocalVideoStream] =
    useState<LocalVideoStream | null>(null);
  const [localVideoRenderer, setLocalVideoRenderer] =
    useState<VideoStreamRenderer | null>(null);

  const [isStartCallEnabled, setIsStartCallEnabled] = useState(false);
  const [isHangUpEnabled, setIsHangUpEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideosGalleryRef = useRef<HTMLDivElement>(null);

  const [roomId, setRoomId] = useState<string>("");

  useEffect(() => {
    // Extract query parameters from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const roomIdParam = searchParams.get("roomid");
    const tokenParam = searchParams.get("token");

    if (roomIdParam && tokenParam) {
      setRoomId(roomIdParam);
      initializeCallAgent(tokenParam);
    }
  }, []);

  const initializeCallAgent = async (token: string) => {
    try {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      const agent = await callClient.createCallAgent(tokenCredential);
      const manager = await callClient.getDeviceManager();

      setCallAgent(agent);
      setDeviceManager(manager);

      await manager.askDevicePermission({ video: true, audio: true });

      setIsStartCallEnabled(true);
    } catch (error) {
      console.error("Failed to initialize call agent:", error);
    }
  };

  const joinRoomCall = async () => {
    if (!callAgent || !deviceManager) return;

    try {
      const roomCallLocator = { roomId };
      const localStream = await createLocalVideoStream();
      const videoOptions = localStream
        ? { localVideoStreams: [localStream] }
        : undefined;

      const newCall = callAgent.join(roomCallLocator, { videoOptions });
      setCall(newCall);
      subscribeToCall(newCall);

      setIsStartCallEnabled(false);
      setIsHangUpEnabled(true);
    } catch (error) {
      console.error("Failed to join room call:", error);
    }
  };

  const subscribeToCall = (call: Call) => {
    call.on("stateChanged", () => {
      if (call.state === "Connected") {
        setIsVideoEnabled(true);
      } else if (call.state === "Disconnected") {
        setIsStartCallEnabled(true);
        setIsHangUpEnabled(false);
        setIsVideoEnabled(false);
        console.log("Call ended:", call.callEndReason);
      }
    });

    call.remoteParticipants.forEach((participant) => {
      subscribeToRemoteParticipant(participant);
    });

    call.on("remoteParticipantsUpdated", (e) => {
      e.added.forEach((participant) =>
        subscribeToRemoteParticipant(participant)
      );
      e.removed.forEach(() => console.log("Remote participant removed."));
    });
  };

  const subscribeToRemoteParticipant = (participant: any) => {
    participant.on("stateChanged", () => {
      console.log(`Remote participant state changed: ${participant.state}`);
    });

    participant.videoStreams.forEach((stream: any) => {
      subscribeToRemoteVideoStream(stream);
    });

    participant.on("videoStreamsUpdated", (e: any) => {
      e.added.forEach((stream: any) => subscribeToRemoteVideoStream(stream));
      e.removed.forEach(() => console.log("Remote video stream removed."));
    });
  };

  const subscribeToRemoteVideoStream = async (remoteVideoStream: any) => {
    const renderer = new VideoStreamRenderer(remoteVideoStream);
    const view = await renderer.createView();
    const container = remoteVideosGalleryRef.current;

    if (container) {
      const remoteVideoContainer = document.createElement("div");
      remoteVideoContainer.className = "remote-video-container";
      remoteVideoContainer.appendChild(view.target);
      container.appendChild(remoteVideoContainer);

      remoteVideoStream.on("isAvailableChanged", async () => {
        if (remoteVideoStream.isAvailable) {
          remoteVideoContainer.appendChild(view.target);
        } else {
          view.dispose();
          container.removeChild(remoteVideoContainer);
        }
      });
    }
  };

  const createLocalVideoStream = async (): Promise<LocalVideoStream | null> => {
    if (!deviceManager) return null;

    try {
      const cameras = await deviceManager.getCameras();
      const camera = cameras[0];
      if (camera) {
        const stream = new LocalVideoStream(camera);
        setLocalVideoStream(stream);
        return stream;
      } else {
        console.error("No camera device found.");
        return null;
      }
    } catch (error) {
      console.error("Failed to create local video stream:", error);
      return null;
    }
  };

  const displayLocalVideoStream = async () => {
    if (localVideoStream && localVideoContainerRef.current) {
      const renderer = new VideoStreamRenderer(localVideoStream);
      const view = await renderer.createView();

      localVideoContainerRef.current.hidden = false;
      localVideoContainerRef.current.appendChild(view.target);
      setLocalVideoRenderer(renderer);
    }
  };

  const removeLocalVideoStream = () => {
    if (localVideoRenderer && localVideoContainerRef.current) {
      localVideoContainerRef.current.hidden = true;
      setLocalVideoRenderer(null);
    }
  };

  const hangUpCall = async () => {
    if (call) {
      await call.hangUp();
      setCall(null);
      navigate("/");
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (localVideoRenderer) {
        localVideoRenderer.dispose();
      }
    };
  }, [localVideoRenderer]);

  return (
    <>
      {isStartCallEnabled ? (
        <Box
          sx={{
            height: "100vh", // Full viewport height
            display: "flex", // Flexbox for layout
            justifyContent: "center", // Horizontally center
            alignItems: "center", // Vertically center
            backgroundColor: "#f5f5f5", // Light background
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => joinRoomCall()}
            disabled={!isStartCallEnabled}
            sx={{
              fontSize: "1.25rem", // Larger font size for text
              padding: "12px 24px", // Padding inside the button
              borderRadius: "8px", // Rounded corners
              textTransform: "none", // Prevent uppercase transformation
            }}
          >
            Join Meeting
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div id="localVideoContainer" ref={localVideoContainerRef}></div>
            <div id="remoteVideosGallery" ref={remoteVideosGalleryRef}></div>
          </Box>

          <AppBar
            position="fixed"
            color="default"
            sx={{
              top: "auto",
              bottom: 0,
              backgroundColor: "transparent",
              color: "white",
              padding: "10px 0",
              boxShadow: "none",
            }}
          >
            <Toolbar
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 2, // Space between buttons
              }}
            >
              {/* Hang Up Call Button */}
              <IconButton
                onClick={hangUpCall}
                disabled={!isHangUpEnabled}
                sx={{
                  color: "#ff4d4d", // Red for hang-up
                  fontSize: "1.5rem", // Adjust size
                  backgroundColor: "rgba(255, 77, 77, 0.1)", // Semi-transparent background
                  borderRadius: "50%", // Circle
                  padding: "10px", // Adjust padding for circle
                }}
              >
                <CallEndIcon fontSize="large" />
              </IconButton>

              {/* Start Video Button */}
              <IconButton
                onClick={displayLocalVideoStream}
                disabled={!isVideoEnabled}
                sx={{
                  color: "black", // White icon color
                  fontSize: "1.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent background
                  borderRadius: "50%", // Circle
                  padding: "10px", // Adjust padding for circle
                }}
              >
                <VideoCallIcon fontSize="large" />
              </IconButton>

              {/* Stop Video Button */}
              <IconButton
                onClick={removeLocalVideoStream}
                disabled={!isVideoEnabled}
                sx={{
                  color: "black", // White icon color
                  fontSize: "1.5rem",
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Semi-transparent background
                  borderRadius: "50%", // Circle
                  padding: "10px", // Adjust padding for circle
                }}
              >
                <VideocamOffIcon fontSize="large" />
              </IconButton>
            </Toolbar>
          </AppBar>
        </Box>
      )}
    </>
  );
};

export default Meeting;
