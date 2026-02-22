import http from 'http';
import net from 'net';

export interface EgressProxyConfig {
  port: number;           // 0 = OS-assigned ephemeral port
  allowList: string[];    // FQDNs / CIDR blocks (populated later)
  dnsResolver?: string;   // upstream DNS IP (optional, wired in task 03)
  logger?: Logger;
}

export interface Logger {
  info?(msg: string, meta?: Record<string, unknown>): void;
  warn?(msg: string, meta?: Record<string, unknown>): void;
  error?(msg: string, meta?: Record<string, unknown>): void;
}

export default class EgressProxy {
  private config: EgressProxyConfig;
  private server?: http.Server;
  private _running = false;
  private _port = 0;
  private logger: Logger;

  constructor(config: EgressProxyConfig) {
    this.config = config;
    this.logger = config.logger ?? console;
  }

  get port(): number {
    return this._port;
  }

  isRunning(): boolean {
    return this._running;
  }

  async start(): Promise<void> {
    if (this._running) return;

    this.server = http.createServer((req, res) => {
      // Default-deny for all plain HTTP requests in this skeleton task.
      const host = (req.headers.host as string) || req.url || '';
      this.logger.warn?.('egress_proxy_denied', { host, reason: 'default-deny', method: req.method });
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
    });

    // Handle CONNECT tunnelling (HTTPS) - default-deny baseline
    this.server.on('connect', (req: http.IncomingMessage, clientSocket: net.Socket, head: Buffer) => {
      const target = req.url || '';
      this.logger.warn?.('egress_proxy_denied', { host: target, reason: 'default-deny', method: 'CONNECT' });
      try {
        // Respond with 407 Proxy Authentication Required (allowed by tests as an acceptable default-deny)
        clientSocket.write('HTTP/1.1 407 Proxy Authentication Required\r\n');
        clientSocket.write('Proxy-Authenticate: Basic realm="devs"\r\n');
        clientSocket.write('Content-Length: 0\r\n\r\n');
        clientSocket.end();
      } catch (err) {
        clientSocket.destroy();
      }

      clientSocket.on('error', (err) => {
        this.logger.error?.('socket_error', { err });
      });
    });

    // Ensure client errors don't crash the process
    this.server.on('clientError', (err, socket) => {
      try {
        if (socket && (socket as net.Socket).writable) {
          socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        } else {
          socket.destroy();
        }
      } catch (e) {
        // swallow
      }
    });

    this.server.on('error', (err) => {
      this.logger.error?.('server_error', { err });
    });

    await new Promise<void>((resolve, reject) => {
      this.server!.once('error', reject);
      this.server!.listen(this.config.port, '127.0.0.1', () => {
        const addr = this.server!.address();
        if (addr && typeof addr === 'object' && 'port' in addr) {
          this._port = (addr as net.AddressInfo).port;
        }
        this._running = true;
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.server) {
      this._running = false;
      return;
    }
    await new Promise<void>((resolve, reject) => {
      this.server!.close((err) => {
        this._running = false;
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
