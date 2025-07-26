'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, type TransactionInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  type: string
  createdAt: string
}

interface SavingsGoal {
  id: string
  title: string
  target: number
  current: number
  createdAt: string
  transactions: Transaction[]
}

export default function GoalDetailPage({ params }: { params: { id: string } }) {
  const { status } = useSession()
  const router = useRouter()
  const [goal, setGoal] = useState<SavingsGoal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      goalId: params.id,
      type: 'deposit'
    }
  })

  const transactionType = watch('type')
  const transactionAmount = watch('amount')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGoal()
    }
  }, [status, params.id])

  useEffect(() => {
    setValue('goalId', params.id)
  }, [params.id, setValue])

  const fetchGoal = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const goals = await response.json()
        const currentGoal = goals.find((g: SavingsGoal) => g.id === params.id)
        if (currentGoal) {
          setGoal(currentGoal)
        } else {
          setError('Target tidak ditemukan')
        }
      } else {
        setError('Gagal memuat data target')
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: TransactionInput) => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        setError(result.error || 'Terjadi kesalahan')
        return
      }

      // Refresh goal data
      await fetchGoal()
      reset({
        goalId: params.id,
        type: 'deposit',
        amount: undefined
      })
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-semibold mb-2">Target tidak ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              Target yang Anda cari tidak ada atau telah dihapus
            </p>
            <Link href="/goals">
              <Button>Kembali ke Daftar Target</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = calculateProgress(goal.current, goal.target)
  const isCompleted = progress >= 100
  const remaining = Math.max(goal.target - goal.current, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{goal.title}</h1>
              <p className="text-muted-foreground">
                Detail target dan riwayat transaksi
              </p>
            </div>
            <Link href="/goals">
              <Button variant="outline">Kembali ke Daftar Target</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Goal Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Progress Tabungan</CardTitle>
                  {isCompleted && (
                    <Badge variant="default" className="bg-green-500">
                      Target Tercapai! 🎉
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span className="font-medium">{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-4" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Tabungan Saat Ini</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(goal.current)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border">
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(goal.target)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg border">
                    <p className="text-sm text-muted-foreground">
                      {isCompleted ? 'Kelebihan' : 'Sisa'}
                    </p>
                    <p className={`text-xl font-bold ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(Math.abs(remaining))}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Transaksi</CardTitle>
                <CardDescription>
                  {goal.transactions.length} transaksi tercatat
                </CardDescription>
              </CardHeader>
              <CardContent>
                {goal.transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">📝</div>
                    <p className="text-muted-foreground">
                      Belum ada transaksi. Mulai dengan menambah setoran pertama!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {goal.transactions.map((transaction, index) => (
                      <div key={transaction.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <div>
                              <p className="font-medium">
                                {transaction.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className={`font-semibold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                        </div>
                        {index < goal.transactions.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Transaction Form */}
          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Tambah Transaksi</CardTitle>
                <CardDescription>
                  Catat setoran atau penarikan tabungan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="type">Jenis Transaksi</Label>
                    <Select
                      value={transactionType}
                      onValueChange={(value) => setValue('type', value as 'deposit' | 'withdrawal')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih jenis transaksi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deposit">Setoran</SelectItem>
                        <SelectItem value="withdrawal">Penarikan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Jumlah (Rupiah)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1000"
                      min="1000"
                      placeholder="100000"
                      {...register('amount', { valueAsNumber: true })}
                      disabled={isSubmitting}
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive">{errors.amount.message}</p>
                    )}
                    {transactionAmount && (
                      <p className="text-sm text-muted-foreground">
                        {transactionType === 'deposit' ? 'Setoran' : 'Penarikan'}: {' '}
                        <span className={`font-medium ${
                          transactionType === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transactionAmount)}
                        </span>
                      </p>
                    )}
                  </div>

                  {transactionType === 'withdrawal' && goal.current < (transactionAmount || 0) && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Jumlah penarikan melebihi saldo yang tersedia ({formatCurrency(goal.current)})
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting || (transactionType === 'withdrawal' && goal.current < (transactionAmount || 0))}
                  >
                    {isSubmitting ? 'Memproses...' : `Tambah ${transactionType === 'deposit' ? 'Setoran' : 'Penarikan'}`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
