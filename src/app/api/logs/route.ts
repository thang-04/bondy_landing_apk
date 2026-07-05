import http from 'http';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const expectedToken = process.env.LOGS_API_TOKEN || 'default_secret_token_123';

  if (token !== expectedToken) {
    return new Response('Unauthorized', { status: 401 });
  }

  const socketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';
  const containerName = 'bondy_app'; // Target container name
  
  const stream = new ReadableStream({
    start(controller) {
      const options = {
        socketPath: socketPath,
        path: `/containers/${containerName}/logs?stderr=1&stdout=1&timestamps=1&follow=1&tail=200`,
        method: 'GET',
      };

      const req = http.request(options, (res) => {
        if (res.statusCode !== 200) {
          controller.enqueue(`data: Error connecting to Docker API (Status ${res.statusCode}). Make sure bondy_app container exists.\n\n`);
          // Note: we don't close immediately here because we want to send the message first
          return;
        }

        let buffer = Buffer.alloc(0);
        let isMultiplexed: boolean | null = null;

        res.on('data', (chunk: Buffer) => {
          if (isMultiplexed === null && chunk.length > 0) {
            // Check if the stream is multiplexed (tty=false). 
            // Header is [STREAM_TYPE (0, 1, or 2), 0, 0, 0, SIZE1, SIZE2, SIZE3, SIZE4]
            if ((chunk[0] === 1 || chunk[0] === 2) && chunk[1] === 0 && chunk[2] === 0 && chunk[3] === 0) {
              isMultiplexed = true;
            } else {
              isMultiplexed = false;
            }
          }

          if (isMultiplexed === false) {
            // Raw text stream (tty=true)
            const text = chunk.toString('utf8');
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.trim()) {
                controller.enqueue(`data: ${line}\n\n`);
              }
            }
            return;
          }

          // Multiplexed stream parsing
          buffer = Buffer.concat([buffer, chunk]);

          while (buffer.length >= 8) {
            const frameSize = buffer.readUInt32BE(4);

            if (buffer.length >= 8 + frameSize) {
              const payload = buffer.subarray(8, 8 + frameSize);
              const text = payload.toString('utf8');
              
              const lines = text.split('\n');
              for (const line of lines) {
                if (line.trim()) {
                  controller.enqueue(`data: ${line}\n\n`);
                }
              }

              buffer = buffer.subarray(8 + frameSize);
            } else {
              break;
            }
          }
        });

        res.on('end', () => {
          controller.enqueue('data: [Connection closed by Docker]\n\n');
          controller.close();
        });
      });

      req.on('error', (err) => {
        controller.enqueue(`data: Error: ${err.message}\n\n`);
        controller.close();
      });

      req.end();

      request.signal.addEventListener('abort', () => {
        req.destroy();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
