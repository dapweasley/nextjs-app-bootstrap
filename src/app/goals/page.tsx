'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

interface SavingsGoal {
  id: string
  title: string
  target: number
  current: number
  createdAt: string
  transactions: Array<{
    id: string
    amount: number
    type: string
    createdAt: string
  }>
}

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGoals()
    }
  }, [status])

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals')
      if (response.ok) {
        const data = await response.json()
        setGoals(data)
      } else {
        setError('Gagal memuat data target')
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Kelola Target Tabungan</h1>
              <p className="text-muted-foreground">
                Lihat dan kelola semua target tabungan Anda
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Kembali ke Dashboard</Button>
              </Link>
              <Link href="/goals/new">
                <Button>Tambah Target Baru</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {goals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Belum ada target tabungan</h3>
              <p className="text-muted-foreground mb-4">
                Mulai perjalanan menabung Anda dengan membuat target pertama
              </p>
              <Link href="/goals/new">
                <Button>Buat Target Pertama</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Target</CardDescription>
                  <CardTitle className="text-xl">
                    {goals.length}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Target Tercapai</CardDescription>
                  <CardTitle className="text-xl text-green-600">
                    {goals.filter(goal => calculateProgress(goal.current, goal.target) >= 100).length}
                  </CardTitle>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Tabungan</CardDescription>
                  <CardTitle className="text-xl text-blue-600">
                    {formatCurrency(goals.reduce((total, goal) => total + goal.current, 0))}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              {goals.map((goal) => {
                const progress = calculateProgress(goal.current, goal.target)
                const isCompleted = progress >= 100
                const remaining = Math.max(goal.target - goal.current, 0)

                return (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-xl">{goal.title}</CardTitle>
                            {isCompleted && (
                              <Badge variant="default" className="bg-green-500">
                                Tercapai!
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Dibuat pada {formatDate(goal.createdAt)}
                          </CardDescription>
                        </div>
                        <Link href={`/goals/${goal.id}`}>
                          <Button variant="outline">
                            Detail & Transaksi
                          </Button>
                        </Link>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={progress} className="h-3" />
                        </div>

                        {/* Financial Info */}
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tabungan Saat Ini</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(goal.current)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Target</p>
                            <p className="font-semibold text-blue-600">
                              {formatCurrency(goal.target)}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              {isCompleted ? 'Kelebihan' : 'Sisa'}
                            </p>
                            <p className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-orange-600'}`}>
                              {formatCurrency(Math.abs(remaining))}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Summary */}
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm text-muted-foreground">
                            {goal.transactions.length} transaksi
                          </span>
                          <div className="flex gap-2">
                            <Link href={`/goals/${goal.id}`}>
                              <Button variant="outline" size="sm">
                                Lihat Detail
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
