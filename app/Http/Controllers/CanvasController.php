<?php

namespace App\Http\Controllers;

use App\Models\Canvas;
use App\Jobs\GenerateCanvasScreenshot;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CanvasController extends Controller
{
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

        $canvas = Canvas::create($validated);
        
        // Dispatch job to generate screenshot
        GenerateCanvasScreenshot::dispatch($canvas);

        return redirect()->back()->with('canvas', [
            'id' => $canvas->id,
            'url' => $canvas->url,
            'description' => $canvas->description,
            'thumbnail' => null
        ]);
    }

    public function update(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'description' => 'nullable|string|max:255',
        ]);

        $canvas->update($validated);
        
        // Dispatch job to generate new screenshot
        GenerateCanvasScreenshot::dispatch($canvas);

        return redirect()->back()->with('success', 'Canvas updated successfully. Screenshot is being generated...');
    }

    public function destroy(Canvas $canvas)
    {
        // Delete thumbnail if exists
        if ($canvas->thumbnail) {
            Storage::disk('public')->delete($canvas->thumbnail);
        }
        
        $canvas->delete();
        
        return redirect()->back()->with('success', 'Canvas deleted successfully');
    }

    public function editor(Canvas $canvas)
    {
        return Inertia::render('Editor', [
            'canvas' => $canvas
        ]);
    }
}
