<?php

namespace App\Http\Controllers;

use App\Models\Canvas;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Browsershot\Browsershot;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CanvasController extends Controller
{
    private function generateScreenshot(string $url): string
    {
        // Generate a unique filename for the screenshot
        $filename = 'thumbnails/' . Str::random(40) . '.jpg';
        $fullPath = Storage::disk('public')->path($filename);

        // Ensure directory exists
        if (!Storage::disk('public')->exists('thumbnails')) {
            Storage::disk('public')->makeDirectory('thumbnails');
        }

        // Take screenshot and save it
        Log::info('Taking screenshot of URL: ' . $url);
        
        // Configure Browsershot with correct paths
        $chromePath = base_path(env('CHROME_BINARY_PATH'));
        
        Browsershot::url($url)
            ->setNodeBinary(env('NODE_BINARY_PATH'))
            ->setChromePath($chromePath)
            ->setNodeModulePath(base_path('node_modules'))
            ->windowSize(1280, 720)
            ->waitUntilNetworkIdle()
            ->setScreenshotType('jpeg', 80)
            ->save($fullPath);

        Log::info('Screenshot saved to: ' . $fullPath);

        // Verify the file was created
        if (!Storage::disk('public')->exists($filename)) {
            throw new \Exception('Screenshot file was not created');
        }

        return $filename;
    }

    public function index()
    {
        $canvases = Canvas::latest()->get()->map(function ($canvas) {
            if ($canvas->thumbnail) {
                $canvas->thumbnail = asset('storage/' . $canvas->thumbnail);
            }
            return $canvas;
        });
        
        return Inertia::render('Canvas', [
            'canvases' => $canvases
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            $filename = $this->generateScreenshot($validated['url']);

            $canvas = Canvas::create([
                ...$validated,
                'thumbnail' => $filename
            ]);

            return redirect()->back()->with('success', 'Canvas created successfully');
        } catch (\Exception $e) {
            Log::error('Screenshot failed during canvas creation: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            Canvas::create($validated);
            return redirect()->back()->with('error', 'Failed to generate thumbnail: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'description' => 'nullable|string|max:255',
        ]);

        try {
            $filename = $this->generateScreenshot($validated['url']);

            // Delete old thumbnail if exists
            if ($canvas->thumbnail) {
                Storage::disk('public')->delete($canvas->thumbnail);
            }

            // Update canvas with new data including thumbnail
            $canvas->update([
                ...$validated,
                'thumbnail' => $filename
            ]);

            return redirect()->back()->with('success', 'Canvas updated successfully');
        } catch (\Exception $e) {
            Log::error('Screenshot failed: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            // If screenshot fails, just update the URL and description
            $canvas->update($validated);
            return redirect()->back()->with('error', 'Failed to generate thumbnail: ' . $e->getMessage());
        }
    }

    public function destroy(Canvas $canvas)
    {
        // Delete thumbnail if exists
        if ($canvas->thumbnail) {
            Storage::disk('public')->delete($canvas->thumbnail);
        }
        
        $canvas->delete();
        
        return redirect()->back();
    }
}
