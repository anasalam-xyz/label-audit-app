export type RuleAspect = {
  ruleCode: string;
  label: string;
};

// Mirrors RULES_TEXT in app/core/gemini.py — keep these two in sync manually.
export const RULE_ASPECTS: RuleAspect[] = [
  { ruleCode: "Rule 6(1)(c)", label: "Manufacturer Details" },
  { ruleCode: "Rule 6(1)(d)", label: "Net Quantity" },
  { ruleCode: "Rule 6(1)(e)", label: "Manufacturing Date" },
  { ruleCode: "Rule 6(1)(f)", label: "MRP Declaration" },
  { ruleCode: "Rule 6(1)(h)", label: "Consumer Care Info" },
];
