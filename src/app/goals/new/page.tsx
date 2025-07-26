'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { goalSchema, type GoalInput } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { useEffect } from 'react'

export default function NewGoalPage() {
  const { status } = useSession()
  const router = useRouter()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<GoalInput>({
    resolver: zodResolver(goalSchema)
  })

  const targetValue = watch('target')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const formatCurrency = (amount: number) => {
    if (!amount) return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const onSubmit = async (data: GoalInput) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/goals', {
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

      router.push('/goals')
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <h1 className="text-2xl font-bold">Buat Target Tabungan Baru</h1>
              <p className="text-muted-foreground">
                Tetapkan target tabungan untuk mencapai tujuan finansial Anda
              </p>
            </div>
            <Link href="/goals">
              <Button variant="outline">Kembali</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Target Tabungan</CardTitle>
              <CardDescription>
                Isi informasi di bawah untuk membuat target tabungan baru
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Nama Target</Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Contoh: Liburan ke Bali, Beli Laptop, Dana Darurat"
                    {...register('title')}
                    disabled={isLoading}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Berikan nama yang jelas untuk target tabungan Anda
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target">Jumlah Target (Rupiah)</Label>
                  <Input
                    id="target"
                    type="number"
                    step="1000"
                    min="1000"
                    placeholder="5000000"
                    {...register('target', { valueAsNumber: true })}
                    disabled={isLoading}
                  />
                  {errors.target && (
                    <p className="text-sm text-destructive">{errors.target.message}</p>
                  )}
                  {targetValue && (
                    <p className="text-sm text-muted-foreground">
                      Target: <span className="font-medium text-blue-600">{formatCurrency(targetValue)}</span>
                    </p>
                  )}
                </div>

                {/* Preview Card */}
                {targetValue && (
                  <div className="mt-6">
                    <Label className="text-base font-medium">Preview Target</Label>
                    <Card className="mt-2 border-dashed">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {watch('title') || 'Nama Target'}
                            </h3>
                            <p className="text-muted-foreground">
                              Target: {formatCurrency(targetValue)}
                            </p>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Progress</span>
                              <span>0%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full w-0"></div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Tabungan saat ini: Rp 0
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Membuat Target...' : 'Buat Target'}
                  </Button>
                  <Link href="/goals" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">💡 Tips Menabung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Tetapkan target yang realistis dan dapat dicapai</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Bagi target besar menjadi beberapa target kecil</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Sisihkan uang secara rutin, meskipun jumlahnya kecil</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">Pantau progress secara berkala untuk tetap termotivasi</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
