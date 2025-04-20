import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert, Linking } from 'react-native';
import { MediaStream, RTCView, mediaDevices } from 'react-native-webrtc';
import io from 'socket.io-client';
import * as Permissions from 'expo-permissions';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Replace with your deployed server URL
const SERVER_URL = 'https://swecha-server.onrender.com/'; // Your Render URL
const VIEWER_URL = SERVER_URL; // Viewer webpage URL

// Mock emergency contacts
const emergencyContacts = [
  { name: 'Contact 1', phone: '+916304228639' },
  { name: 'Contact 2', phone: '+919703663860' },
];

export default function LiveStream() {
  const [streaming, setStreaming] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const socketRef = useRef(null);
  const peersRef = useRef({});
  const peerConnectionsRef = useRef({});

  // Request permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status: cameraStatus } = await Permissions.askAsync(Permissions.CAMERA);
      const { status: audioStatus } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
      if (cameraStatus === 'granted' && audioStatus === 'granted') {
        setPermissionsGranted(true);
      } else {
        Alert.alert('Permissions Denied', 'Camera and microphone permissions are required.');
      }
    };
    requestPermissions();

    // Initialize Socket.IO
    socketRef.current = io(SERVER_URL);
    socketRef.current.on('watcher', (id) => {
      const peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });
      peerConnectionsRef.current[id] = peerConnection;
      peersRef.current[id] = true;

      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socketRef.current.emit('candidate', id, event.candidate);
        }
      };

      peerConnection
        .createOffer()
        .then((sdp) => peerConnection.setLocalDescription(sdp))
        .then(() => {
          socketRef.current.emit('offer', id, peerConnection.localDescription);
        });

      peerConnection.onconnectionstatechange = () => {
        if (peerConnection.connectionState === 'disconnected') {
          delete peerConnectionsRef.current[id];
          delete peersRef.current[id];
        }
      };
    });

    socketRef.current.on('answer', (id, description) => {
      peerConnectionsRef.current[id].setRemoteDescription(description);
    });

    socketRef.current.on('candidate', (id, candidate) => {
      peerConnectionsRef.current[id].addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [localStream]);

  // Start or stop the stream
  const toggleStream = async () => {
    if (!permissionsGranted) {
      Alert.alert('Error', 'Permissions not granted.');
      return;
    }

    if (streaming) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      socketRef.current.emit('broadcasterDisconnected');
      Object.keys(peerConnectionsRef.current).forEach((id) => {
        peerConnectionsRef.current[id].close();
      });
      peerConnectionsRef.current = {};
      peersRef.current = {};
      setStreaming(false);
      Alert.alert('Stream Stopped', 'Live stream has been stopped.');
    } else {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: { facingMode: 'user' },
        });
        setLocalStream(stream);
        socketRef.current.emit('broadcaster');
        setStreaming(true);
        sendLinkToContacts();
        Alert.alert('Stream Started', 'Live stream is active and link sent to emergency contacts.');
      } catch (error) {
        Alert.alert('Error', 'Failed to start stream: ' + error.message);
      }
    }
  };

  // Send viewer URL to emergency contacts via SMS
  const sendLinkToContacts = () => {
    emergencyContacts.forEach((contact) => {
      const message = `Emergency: View live stream at ${VIEWER_URL}`;
      const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(message)}`;
      Linking.openURL(smsUrl).catch((err) => {
        console.error('Failed to send SMS to', contact.phone, err);
      });
    });
  };

  return (
    <View style={styles.container}>
      {localStream ? (
        <RTCView streamURL={localStream.toURL()} style={styles.streamView} />
      ) : (
        <View style={styles.streamView}>
          <Text style={styles.streamText}>Ready to stream</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: streaming ? 'red' : 'green' }]}
        onPress={toggleStream}
        disabled={!permissionsGranted}
      >
        <Ionicons
          name={streaming ? 'stop-circle' : 'play-circle'}
          size={30}
          color="white"
        />
        <Text style={styles.buttonText}>
          {streaming ? 'Stop Live Stream' : 'Start Live Stream'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  streamView: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamText: {
    color: 'white',
    fontSize: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 50,
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});