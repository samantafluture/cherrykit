import type { ProductType, SurveyQuestion } from "../types/index.js";

export const DEFAULT_SURVEYS: Record<ProductType, SurveyQuestion[]> = {
  app: [
    {
      key: "current_solution",
      text: "What do you currently use to solve this?",
    },
    {
      key: "frustration",
      text: "What frustrates you most about your current approach?",
    },
    {
      key: "willingness_to_pay",
      text: "Would you pay $X/month for a better solution?",
      type: "select",
      options: ["Yes", "Maybe", "No"],
    },
  ],
  kdp: [
    {
      key: "current_solution",
      text: "What resources do you currently use for this?",
    },
    {
      key: "frustration",
      text: "What's missing from what's available?",
    },
    {
      key: "purchase_recency",
      text: "When did you last buy a book/journal like this?",
      type: "select",
      options: ["This month", "Last 3 months", "6+ months ago", "Never"],
    },
  ],
  notion: [
    {
      key: "current_solution",
      text: "What tools do you currently use for this workflow?",
    },
    {
      key: "frustration",
      text: "What takes the most time in your current process?",
    },
    {
      key: "time_spent",
      text: "How many hours per week do you spend on this task?",
      type: "select",
      options: ["< 1 hour", "1-3 hours", "3-5 hours", "5+ hours"],
    },
  ],
  etsy: [
    {
      key: "current_solution",
      text: "Where do you currently shop for products like this?",
    },
    {
      key: "frustration",
      text: "What's hardest about finding the right product?",
    },
    {
      key: "price_range",
      text: "What would you expect to pay for this?",
      type: "select",
      options: ["Under $15", "$15-30", "$30-50", "$50+"],
    },
  ],
  saas: [
    {
      key: "current_solution",
      text: "What do you currently use to handle this?",
    },
    {
      key: "frustration",
      text: "What's the biggest pain point with your current tool?",
    },
    {
      key: "willingness_to_pay",
      text: "Would you pay $X/month for a better solution?",
      type: "select",
      options: ["Yes", "Maybe", "No"],
    },
  ],
};

export function getSurveyQuestions(productType: ProductType): SurveyQuestion[] {
  return DEFAULT_SURVEYS[productType];
}
