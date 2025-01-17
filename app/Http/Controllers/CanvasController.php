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
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        $canvas = Canvas::create($validated);

        return redirect()->route('canvas')->with('success', 'Canvas created successfully.');
    }

    public function update(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'url' => 'required|url',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if it exists
            if ($canvas->thumbnail && Storage::disk('public')->exists($canvas->thumbnail)) {
                Storage::disk('public')->delete($canvas->thumbnail);
            }
            
            $path = $request->file('thumbnail')->store('thumbnails', 'public');
            $validated['thumbnail'] = $path;
        }

        $canvas->update($validated);

        return redirect()->route('canvas')->with('success', 'Canvas updated successfully.');
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
            'canvas' => [
                'id' => $canvas->id,
                'url' => $canvas->url,
                'description' => $canvas->description,
                'thumbnail' => $canvas->getThumbnailUrl(),
            ]
        ]);
    }
}
