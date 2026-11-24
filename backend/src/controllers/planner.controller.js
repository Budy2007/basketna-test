// Plan analysis. The body is already validated.
import { getSettings, loadMeals } from '../services/catalog.service.js';
import { analyze, parsePeople, parsePlan } from '../services/planner.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const analyzePlan = asyncHandler(async (req, res) => {
  const [meals, cfg] = await Promise.all([loadMeals(), getSettings()]);
  const plan = parsePlan(req.body.plan, meals);
  const people = parsePeople(req.body.people, Number(cfg.default_people));
  sendSuccess(res, await analyze(plan, people, req.app.locals.today()));
});
