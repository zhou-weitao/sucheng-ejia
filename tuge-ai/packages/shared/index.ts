// User types
export interface User {
  id: string
  email: string
  username: string
  usernameOriginal: string
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED'
}

// Credits types
export interface CreditsAccount {
  userId: string
  balanceInteger: number
  versionInteger: number
  createdAt: string
  updatedAt: string
}

export interface PricingTier {
  businessTier: 'normal' | 'advanced' | 'super'
  resolution: '1K' | '2K' | '4K'
  priceInteger: number
  enabled: boolean
}

// Task types
export type TaskStatus = 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED'

export interface Task {
  id: string
  userId: string
  status: TaskStatus
  businessTier: 'normal' | 'advanced' | 'super'
  resolution: '1K' | '2K' | '4K'
  aspectRatio: string
  prompt: string
  resultUrl?: string
  error?: string
  createdAt: string
  completedAt?: string
}

export interface TaskSummary {
  total: number
  succeeded: number
  generating: number
  other: number
  today: number
  yesterday: number
}

// Image generation config
export interface ImageTierConfig {
  configured: null
  provider: string
  model: string
  supportedAspectRatios: string[]
  supportedResolutions: string[]
  maxReferenceImages: number
  amazonAPlusMaxReferenceImages: number
  amazonAPlusReferenceQualification: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  ok?: boolean
  code?: string
  message?: string
  user?: User
  account?: CreditsAccount
  tasks?: Task[]
  summary?: TaskSummary
}
