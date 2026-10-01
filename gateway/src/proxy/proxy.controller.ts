import { All, Controller, Req, Res, Next } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const ROUTES = [
  { paths: ['/auth', '/clientes'], target: process.env.USUARIOS_URL ?? 'http://localhost:3001' },
  { paths: ['/canchas'],              target: process.env.CANCHAS_URL  ?? 'http://localhost:3002' },
  { paths: ['/reservas', '/disponibilidad'], target: process.env.TURNOS_URL ?? 'http://localhost:3003' },
  { paths: ['/pagos'],               target: process.env.PAGOS_URL    ?? 'http://localhost:3004' },
];

const proxies = ROUTES.map((route) =>
  createProxyMiddleware({
    target: route.target,
    changeOrigin: true,
    // Secreto interno que autentica al gateway ante los microservicios. Estos rechazan
    // (403) toda request que no lo traiga, así nadie puede pegarles directo a su URL
    // pública salteándose el gateway. Sobreescribe cualquier valor entrante del cliente.
    headers: { 'x-internal-secret': process.env.INTERNAL_SECRET ?? '' },
    on: {
      proxyRes: (proxyRes) => {
        // El gateway ya agrega los headers CORS (app.enableCors). Borramos los que
        // vengan del microservicio para no duplicar Access-Control-Allow-Origin
        // (header duplicado = el navegador rechaza la respuesta y rompe el login).
        delete proxyRes.headers['access-control-allow-origin'];
        delete proxyRes.headers['access-control-allow-credentials'];
        delete proxyRes.headers['access-control-allow-methods'];
        delete proxyRes.headers['access-control-allow-headers'];
      },
      error: (err, req, res: any) => {
        res.status(502).json({ message: 'Servicio no disponible', statusCode: 502 });
      },
    },
  }),
);

@Controller()
export class ProxyController {
  @All('*')
  proxy(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    const path = req.path;

    for (let i = 0; i < ROUTES.length; i++) {
      const match = ROUTES[i].paths.some((p) => path.startsWith(p));
      if (match) {
        return (proxies[i] as any)(req, res, next);
      }
    }

    res.status(404).json({ message: 'Ruta no encontrada', statusCode: 404 });
  }
}
