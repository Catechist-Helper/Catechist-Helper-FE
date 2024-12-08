import React, { useState, useEffect, useRef } from "react";
import {
  CallClient,
  CallAgent,
  DeviceManager,
  LocalVideoStream,
  VideoStreamRenderer,
  Call,
} from "@azure/communication-calling";
import { AzureCommunicationTokenCredential } from "@azure/communication-common";

const Meeting = () => {
  const [callAgent, setCallAgent] = useState<CallAgent | null>(null);
  const [deviceManager, setDeviceManager] = useState<DeviceManager | null>(
    null
  );
  const [call, setCall] = useState<Call | null>(null);
  const [localVideoStream, setLocalVideoStream] =
    useState<LocalVideoStream | null>(null);
  const [localVideoRenderer, setLocalVideoRenderer] =
    useState<VideoStreamRenderer | null>(null);

  const [isCallConnected, setIsCallConnected] = useState(false);
  const [isStartCallEnabled, setIsStartCallEnabled] = useState(false);
  const [isHangUpEnabled, setIsHangUpEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);

  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideosGalleryRef = useRef<HTMLDivElement>(null);

  const [roomId, setRoomId] = useState<string>("");
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    // Extract query parameters from the URL
    const searchParams = new URLSearchParams(window.location.search);
    const roomIdParam = searchParams.get("roomid");
    const tokenParam = searchParams.get("token");

    if (roomIdParam && tokenParam) {
      setRoomId(roomIdParam);
      setToken(tokenParam);
    }
  }, []);

  const initializeCallAgent = async () => {
    try {
      const callClient = new CallClient();
      const tokenCredential = new AzureCommunicationTokenCredential(token);
      const agent = await callClient.createCallAgent(tokenCredential);
      const manager = await callClient.getDeviceManager();

      setCallAgent(agent);
      setDeviceManager(manager);

      await manager.askDevicePermission({ video: true, audio: true });

      setIsStartCallEnabled(true);
      console.log("Call agent initialized.");
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
      console.log(`Call state changed: ${call.state}`);
      if (call.state === "Connected") {
        setIsCallConnected(true);
        setIsVideoEnabled(true);
      } else if (call.state === "Disconnected") {
        setIsCallConnected(false);
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
      localVideoRenderer.dispose();
      localVideoContainerRef.current.hidden = true;
      setLocalVideoRenderer(null);
    }
  };

  const hangUpCall = async () => {
    if (call) {
      await call.hangUp();
      setCall(null);
      setIsCallConnected(false);
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
    <div>
      <h1>Azure Communication Meeting</h1>
      <button onClick={() => initializeCallAgent()}>
        Initialize Call Agent
      </button>
      <button onClick={() => joinRoomCall()} disabled={!isStartCallEnabled}>
        Join Room Call
      </button>
      <button onClick={hangUpCall} disabled={!isHangUpEnabled}>
        Hang Up Call
      </button>
      <button onClick={displayLocalVideoStream} disabled={!isVideoEnabled}>
        Start Video
      </button>
      <button onClick={removeLocalVideoStream} disabled={!isVideoEnabled}>
        Stop Video
      </button>
      <div id="connectedLabel" hidden={!isCallConnected}>
        Room Call is connected!
      </div>
      <div id="remoteVideosGallery" ref={remoteVideosGalleryRef}></div>
      <div id="localVideoContainer" ref={localVideoContainerRef} hidden></div>
    </div>
  );
};

export default Meeting;
