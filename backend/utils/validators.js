const z = require('zod');

const transactionSchema = z.object({
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  type: z.enum(['income', 'expense'], { message: 'Type must be income or expense' }),
  category: z.string().min(1, { message: 'Category is required' }),
  accountId: z.string().optional(),
  date: z.union([z.string(), z.date()]).optional(),
  note: z.string().optional(),
});

const budgetSchema = z
  .object({
    amount: z.number().positive({ message: 'Amount must be greater than zero' }),
    type: z.enum(['overall', 'category'], { message: 'Type must be overall or category' }),
    category: z.string().min(1, { message: 'Category is required' }).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === 'category' && !data.category) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Category is required for category budgets',
      });
    }
  });

// Used by the CSV bulk-import flow, which receives an array of rows.
const transactionArraySchema = z
  .array(transactionSchema)
  .min(1, { message: 'No rows supplied for import' });

const settingsSchema = z.object({
  displayName: z.string().max(80).optional(),
  currency: z.string().regex(/^[A-Za-z]{3}$/, 'Currency must be a 3-letter code').optional(),
  locale: z.string().max(30).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  accent: z.enum(['sage', 'amber', 'blue', 'plum']).optional(),
  dashboardPrefs: z.array(z.string()).max(20).optional(),
});

const categorySchema = z.object({
  name: z.string().min(1).max(40),
});

const quickAddSchema = z.object({
  text: z.string().min(2).max(180),
});

module.exports = {
  transactionSchema,
  transactionArraySchema,
  budgetSchema,
  settingsSchema,
  categorySchema,
  quickAddSchema,
};
