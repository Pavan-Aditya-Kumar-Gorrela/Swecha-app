import { createWorker } from 'mediasoup';

let worker;
let router;
let producerTransport;
const consumerTransports = new Map();

const mediaCodecs = [
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {},
  },
];

export async function setupMediasoup(io) {
  worker = await createWorker();
  router = await worker.createRouter({ mediaCodecs });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('create-room', async () => {
      try {
        producerTransport = await router.createWebRtcTransport({
          listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
          enableTcp: true,
          enableSctp: true,
        });

        socket.emit('transport-created', {
          id: producerTransport.id,
          iceParameters: producerTransport.iceParameters,
          iceCandidates: producerTransport.iceCandidates,
          dtlsParameters: producerTransport.dtlsParameters,
        });
      } catch (err) {
        console.error('Error creating producer transport:', err);
      }
    });

    socket.on('produce', async ({ rtpParameters, kind }) => {
      try {
        const producer = await producerTransport.produce({ kind, rtpParameters });

        const playbackUrl = `http://localhost:3000/stream/${producer.id}.m3u8`; // Simulated HLS URL

        socket.emit('stream-ready', { playbackUrl });
        socket.broadcast.emit('new-stream', { playbackUrl });
      } catch (err) {
        console.error('Error producing stream:', err);
      }
    });

    socket.on('consume', async ({ rtpCapabilities }) => {
      try {
        const producerId = producerTransport.producers?.[0]?.id;
        if (router.canConsume({ producerId, rtpCapabilities })) {
          const consumerTransport = await router.createWebRtcTransport({
            listenIps: [{ ip: '0.0.0.0', announcedIp: '127.0.0.1' }],
            enableTcp: true,
            enableSctp: true,
          });

          consumerTransports.set(socket.id, consumerTransport);

          socket.emit('consumer-transport-created', {
            id: consumerTransport.id,
            iceParameters: consumerTransport.iceParameters,
            iceCandidates: consumerTransport.iceCandidates,
            dtlsParameters: consumerTransport.dtlsParameters,
          });
        }
      } catch (err) {
        console.error('Error consuming stream:', err);
      }
    });
  });
}
