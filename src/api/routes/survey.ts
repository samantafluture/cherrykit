import type { FastifyInstance } from "fastify";
import { getExperiment } from "../../tracker/experiments.js";
import { recordSurveyResponse } from "../../tracker/surveys.js";

interface SurveyBody {
  signup_id?: string;
  responses: { question_key: string; response_text: string }[];
}

export async function surveyRoutes(fastify: FastifyInstance) {
  fastify.post<{ Params: { experimentId: string }; Body: SurveyBody }>(
    "/:experimentId/survey",
    async (request, reply) => {
      const { experimentId } = request.params;
      const body = request.body;

      const experiment = getExperiment(experimentId);
      if (!experiment) {
        return reply.status(404).send({ error: "Experiment not found" });
      }

      if (!Array.isArray(body.responses) || body.responses.length === 0) {
        return reply.status(400).send({ error: "No responses provided" });
      }

      for (const resp of body.responses) {
        recordSurveyResponse({
          experiment_id: experimentId,
          signup_id: body.signup_id,
          question_key: resp.question_key,
          response_text: resp.response_text,
        });
      }

      return { success: true };
    }
  );
}
