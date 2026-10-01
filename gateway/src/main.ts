import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as dotenv from "dotenv";

dotenv.config();

async function bootstrap() {
  // bodyParser:false → el gateway es un proxy puro y NO debe leer el body de la request.
  // Si Nest parsea el body, http-proxy-middleware reenvía la petición sin cuerpo y el
  // microservicio queda esperando para siempre (POST/PUT/PATCH cuelgan). El JWT se valida
  // desde los headers, así que el gateway nunca necesita el cuerpo.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  app.enableCors({ origin: '*' });

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Gateway corriendo en puerto ${port}`);
}

bootstrap();