import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { signupRoutes } from "./routes/signup.js";
import { surveyRoutes } from "./routes/survey.js";

export async function buildServer() {
  const fastify = Fastify({ logger: true });

  await fastify.register(cors, {
    origin: [
      "https://validate.samantafluture.com",
      /\.validate\.samantafluture\.com$/,
    ],
    methods: ["POST"],
  });

  await fastify.register(rateLimit, {
    max: 10,
    timeWindow: "1 minute",
  });

  fastify.get("/health", async () => ({ status: "ok" }));
  fastify.get("/api/health", async () => ({ status: "ok" }));

  await fastify.register(signupRoutes, { prefix: "/api/validate" });
  await fastify.register(surveyRoutes, { prefix: "/api/validate" });

  return fastify;
}
