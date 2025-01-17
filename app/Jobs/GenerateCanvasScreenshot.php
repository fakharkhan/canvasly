<?php

namespace App\Jobs;

use App\Models\Canvas;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Events\CanvasUpdated;

class GenerateCanvasScreenshot implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $canvas;

    public function __construct(Canvas $canvas)
    {
        $this->canvas = $canvas;
    }

    public function handle(): void
    {
        try {
            // Generate a unique filename for the screenshot
            $filename = 'thumbnails/' . Str::random(40) . '.jpg';
            $fullPath = Storage::disk('public')->path($filename);

            // Ensure directory exists
            if (!Storage::disk('public')->exists('thumbnails')) {
                Storage::disk('public')->makeDirectory('thumbnails');
            }

           
            
            Browsershot::url($this->canvas->url)
                ->windowSize(1280, 720)
                ->waitUntilNetworkIdle()
                ->setScreenshotType('jpeg', 80)
                ->save($fullPath);

            

            // Delete old thumbnail if exists
            if ($this->canvas->thumbnail) {
                Storage::disk('public')->delete($this->canvas->thumbnail);
            }

            // Update canvas with new thumbnail
            $this->canvas->update([
                'thumbnail' => $filename
            ]);

            // Broadcast the update
            broadcast(new CanvasUpdated($this->canvas->fresh()))->toOthers();

        } catch (\Exception $e) {
            Log::error('Screenshot job failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
        }
    }
}
