import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageIcon, Upload, Loader2, Plus, X } from 'lucide-react'

interface ImageConfig {
  normal: {
    model: string
    supportedAspectRatios: string[]
    supportedResolutions: string[]
    maxReferenceImages: number
  }
  advanced: {
    model: string
    supportedAspectRatios: string[]
    supportedResolutions: string[]
    maxReferenceImages: number
  }
  super: {
    model: string
    supportedAspectRatios: string[]
    supportedResolutions: string[]
    maxReferenceImages: number
  }
}

interface ReferenceImage {
  id: string
  url: string
  name: string
}

export default function ImageStudio() {
  const [config, setConfig] = useState<ImageConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  // Form state
  const [prompt, setPrompt] = useState('')
  const [businessTier, setBusinessTier] = useState<'normal' | 'advanced' | 'super'>('normal')
  const [resolution, setResolution] = useState('1K')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([])

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/image-generate', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setGenerating(true)
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          prompt,
          businessTier,
          resolution,
          aspectRatio,
          referenceImageIds: referenceImages.map(img => img.id),
        }),
      })

      if (response.ok) {
        const task = await response.json()
        window.location.href = '/tasks'
      }
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setGenerating(false)
    }
  }

  const addReferenceImage = () => {
    // In a real app, this would open a file picker or image upload dialog
    const newImage: ReferenceImage = {
      id: `ref-${Date.now()}`,
      url: 'https://picsum.photos/200',
      name: `参考图 ${referenceImages.length + 1}`,
    }
    setReferenceImages([...referenceImages, newImage])
  }

  const removeReferenceImage = (id: string) => {
    setReferenceImages(referenceImages.filter(img => img.id !== id))
  }

  const currentTier = config?.[businessTier]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">图片工作室</h1>
        <p className="text-muted-foreground">上传参考图，生成独特的AI图片</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>生成设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">提示词</Label>
                <textarea
                  id="prompt"
                  className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="描述你想要生成的图片..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>等级</Label>
                  <Select value={businessTier} onValueChange={(v) => setBusinessTier(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="super">Super</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>分辨率</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentTier?.supportedResolutions.map(res => (
                        <SelectItem key={res} value={res}>{res}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>比例</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currentTier?.supportedAspectRatios.map(ratio => (
                        <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    生成图片
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Reference Images */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>参考图库</CardTitle>
                <Button size="sm" variant="outline" onClick={addReferenceImage}>
                  <Plus className="mr-1 h-4 w-4" />
                  添加
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                最多添加 {currentTier?.maxReferenceImages ?? 0} 张参考图
              </p>
            </CardHeader>
            <CardContent>
              {referenceImages.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                  <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">暂无参考图</p>
                  <Button variant="outline" size="sm" onClick={addReferenceImage}>
                    上传参考图
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {referenceImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt={img.name}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      <button
                        onClick={() => removeReferenceImage(img.id)}
                        className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{img.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Model Info */}
          <Card>
            <CardHeader>
              <CardTitle>当前配置</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-1">
                <p><span className="font-medium">模型:</span> {currentTier?.model}</p>
                <p><span className="font-medium">最大参考图:</span> {currentTier?.maxReferenceImages}</p>
                <p><span className="font-medium">支持比例:</span> {currentTier?.supportedAspectRatios.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
