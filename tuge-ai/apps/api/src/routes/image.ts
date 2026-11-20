import { Context } from 'hono'

export async function handleImageGenerate(c: Context) {
  return c.json({
    ok: true,
    runtimeContractVersion: 'image-runtime-v11-durable-job-executor-2-post-lease-observable',
    normal: {
      configured: null,
      provider: 'aixoras_normal',
      model: 'gemini-3.1-flash-image',
      supportedAspectRatios: ['1:1', '4:5', '2:3', '3:2', '9:16', '16:9'],
      supportedResolutions: ['1K', '2K', '4K'],
      maxReferenceImages: 8,
      amazonAPlusMaxReferenceImages: 0,
      amazonAPlusReferenceQualification: 'CLOSED_UNSUPPORTED',
    },
    advanced: {
      configured: null,
      provider: 'laogou_advanced',
      model: 'gpt-image-2.5-sunburst',
      supportedAspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '61:25'],
      supportedResolutions: ['1K', '2K'],
      maxReferenceImages: 8,
      amazonAPlusMaxReferenceImages: 8,
      amazonAPlusReferenceQualification: 'USER_SELECTED_FIXED_OUTPUT_UNVERIFIED',
    },
    super: {
      configured: null,
      provider: 'aigcfox',
      model: 'gpt-image-2.5-sunburst',
      supportedAspectRatios: ['1:1', '4:5', '2:3', '3:2', '9:16', '16:9', '4:3', '3:1', '61:25'],
      supportedResolutions: ['1K', '2K', '4K'],
      maxReferenceImages: 8,
      amazonAPlusMaxReferenceImages: 1,
      amazonAPlusReferenceQualification: 'PREVIEW_REQUIRED',
    },
    execution: {
      autoFailover: false,
      maximumAttempts: 1,
    },
  })
}
