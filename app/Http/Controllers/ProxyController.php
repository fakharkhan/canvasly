<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProxyController extends Controller
{
    public function proxy($url)
    {
        try {
            $decodedUrl = base64_decode($url);
            
            $response = Http::timeout(30)->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            ])->get($decodedUrl);
            
            if (!$response->successful()) {
                Log::error('Proxy request failed', [
                    'url' => $decodedUrl,
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                throw new \Exception("Failed to load URL: HTTP {$response->status()}");
            }

            return response($response->body())
                ->header('Content-Type', $response->header('Content-Type', 'text/html'))
                ->header('X-Frame-Options', 'SAMEORIGIN');
        } catch (\Exception $e) {
            Log::error('Proxy error', [
                'url' => $url,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'error' => 'Failed to load URL',
                'message' => $e->getMessage()
            ], 500);
        }
    }
} 