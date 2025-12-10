import { Play, Pause, RotateCcw, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: number) => void;
  onSeek: (step: number) => void;
  disabled?: boolean;
}

export function PlaybackControls({
  isPlaying,
  isPaused,
  currentStep,
  totalSteps,
  speed,
  onPlay,
  onPause,
  onReset,
  onStepForward,
  onStepBackward,
  onSpeedChange,
  onSeek,
  disabled,
}: PlaybackControlsProps) {
  const canStepBack = currentStep > 0;
  const canStepForward = currentStep < totalSteps - 1;

  return (
    <Card className="border-card-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Playback
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {currentStep + 1} / {Math.max(totalSteps, 1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(0)}
            disabled={disabled || currentStep === 0}
            data-testid="button-skip-start"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStepBackward}
            disabled={disabled || !canStepBack}
            data-testid="button-step-back"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={isPlaying && !isPaused ? "default" : "outline"}
            size="default"
            onClick={isPlaying && !isPaused ? onPause : onPlay}
            disabled={disabled || totalSteps === 0}
            className="min-w-[100px]"
            data-testid="button-play-pause"
          >
            {isPlaying && !isPaused ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onStepForward}
            disabled={disabled || !canStepForward}
            data-testid="button-step-forward"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onSeek(totalSteps - 1)}
            disabled={disabled || currentStep === totalSteps - 1}
            data-testid="button-skip-end"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onReset}
          disabled={disabled}
          className="w-full"
          data-testid="button-reset"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>

        {totalSteps > 1 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Step Progress</Label>
            <Slider
              value={[currentStep]}
              min={0}
              max={Math.max(totalSteps - 1, 0)}
              step={1}
              onValueChange={([value]) => onSeek(value)}
              disabled={disabled || totalSteps <= 1}
              className="w-full"
              data-testid="slider-progress"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Animation Speed</Label>
            <span className="text-xs font-mono text-muted-foreground">{speed.toFixed(1)}x</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Slow</span>
            <Slider
              value={[speed]}
              min={0.25}
              max={3}
              step={0.25}
              onValueChange={([value]) => onSpeedChange(value)}
              disabled={disabled}
              className="flex-1"
              data-testid="slider-speed"
            />
            <span className="text-xs text-muted-foreground">Fast</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
