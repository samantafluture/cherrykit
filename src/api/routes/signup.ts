import type { FastifyInstance } from "fastify";
import { getExperiment } from "../../tracker/experiments.js";
import { recordSignup } from "../../tracker/signups.js";

interface SignupBody {
  email: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signupRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { experimentId: string }; Body: SignupBody }>(
    "/:experimentId/signup",
    async (request, reply) => {
      const { experimentId } = request.params;
      const body = request.body;

      // Validate experiment exists and is active
      const experiment = getExperiment(experimentId);
      if (!experiment) {
        return reply.status(404).send({ error: "Experiment not found" });
      }
      if (!["live", "collecting"].includes(experiment.status)) {
        return reply
          .status(400)
          .send({ error: "Experiment is not accepting signups" });
      }

      // Validate email
      if (!body.email || !EMAIL_REGEX.test(body.email)) {
        return reply.status(400).send({ error: "Invalid email address" });
      }

      recordSignup(experimentId, {
        email: body.email,
        utm_source: body.utm_source,
        utm_medium: body.utm_medium,
        utm_campaign: body.utm_campaign,
        utm_content: body.utm_content,
      });

      return { success: true };
    }
  );
}
