import { FastifyJWT } from "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { 
      id: string;
      username: string;
      type: string;
    };
    admin: {
      id: string;
      username: string;
    };
  }
}
