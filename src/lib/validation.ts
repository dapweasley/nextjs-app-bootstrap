import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const goalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  target: z.number().min(0.01, 'Target must be greater than 0'),
})

export const transactionSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['deposit', 'withdrawal']),
  goalId: z.string().min(1, 'Goal ID is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type GoalInput = z.infer<typeof goalSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
