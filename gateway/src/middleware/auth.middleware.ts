import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';

const RUTAS_PUBLICAS: { method: string; path: string }[] = [
  { method: 'POST', path: '/auth/login' },
  { method: 'POST', path: '/auth/registro' },
  { method: 'GET', path: '/canchas' },
  // Chatbot de búsqueda de canchas en el home, antes de loguearse.
  { method: 'POST', path: '/canchas/chat' },
];

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // El secreto interno lo agrega el proxy del gateway; borramos cualquiera que venga
    // del cliente para que no pueda falsificarlo (igual que con x-cliente-id más abajo).
    delete req.headers['x-internal-secret'];

    // Dejar pasar el preflight CORS (no lleva Authorization); si no, devolveríamos 401.
    if (req.method === 'OPTIONS') return next();

    const esPublica = RUTAS_PUBLICAS.some(
      (r) => r.method === req.method && req.path.startsWith(r.path),
    );

    if (esPublica) return next();

    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      // Inyectar info del usuario para que los microservicios la reciban
      req.headers['x-user-id'] = String(payload.sub);
      req.headers['x-user-email'] = payload.email;
      req.headers['x-user-rol'] = payload.rol;
      // cliente_id viene del token verificado; sobreescribimos cualquier valor entrante
      // para que un cliente no pueda falsificar el header y ver reservas de otro.
      if (payload.cliente_id != null) {
        req.headers['x-cliente-id'] = String(payload.cliente_id);
      } else {
        delete req.headers['x-cliente-id'];
      }
      next();
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
