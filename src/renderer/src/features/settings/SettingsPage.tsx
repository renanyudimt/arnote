import { useNavigate } from 'react-router-dom'

import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useApiKeyInput } from './hooks/useApiKeyInput'
import { useSettings } from './hooks/useSettings'

export function SettingsPage(): React.JSX.Element {
  const navigate = useNavigate()
  const { transcriptionMode, isLoaded, setTranscriptionMode } = useSettings()
  const {
    keyInput,
    showKey,
    validationState,
    validationError,
    handleSaveKey,
    handleValidate,
    handleKeyInputChange,
    toggleShowKey,
  } = useApiKeyInput()

  if (!isLoaded) return <div />

  return (
    <div className="mx-auto flex h-screen max-w-2xl flex-col p-6">
      <div className="flex items-center gap-3 pb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">OpenAI API Key</h2>
          <div className="flex flex-col gap-3">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={keyInput}
                  onChange={(e) => handleKeyInputChange(e.target.value)}
                  placeholder="sk-..."
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                  onClick={toggleShowKey}
                >
                  {showKey ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={handleValidate}
                disabled={!keyInput.trim() || validationState === 'loading'}
              >
                {validationState === 'loading' && <Loader2 className="size-4 animate-spin" />}
                Validate
              </Button>
              <Button onClick={handleSaveKey} disabled={!keyInput.trim()}>
                Save
              </Button>
            </div>
            {validationState === 'valid' && (
              <p className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle2 className="size-3.5" />
                API key is valid
              </p>
            )}
            {validationState === 'invalid' && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <XCircle className="size-3.5" />
                {validationError}
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Transcription Mode</h2>
          <div className="flex flex-col gap-3">
            <button
              className={`flex cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors ${
                transcriptionMode === 'realtime'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => void setTranscriptionMode('realtime')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Realtime</span>
                <span className="text-muted-foreground text-xs">~$0.06/min</span>
              </div>
              <span className="text-muted-foreground mt-1 text-sm">
                Instant transcription via WebSocket. Text appears in ~1 second.
              </span>
            </button>

            <button
              className={`flex cursor-pointer flex-col rounded-lg border p-4 text-left transition-colors ${
                transcriptionMode === 'whisper'
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => void setTranscriptionMode('whisper')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Whisper</span>
                <span className="text-muted-foreground text-xs">~$0.006/min</span>
              </div>
              <span className="text-muted-foreground mt-1 text-sm">
                Batch transcription every ~10 seconds. 10x cheaper than Realtime.
              </span>
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
