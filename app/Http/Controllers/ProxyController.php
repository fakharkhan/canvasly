<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ProxyController extends Controller
{
    public function proxy($url)
    {
        try {
            $response = Http::get(base64_decode($url));
            
            return response($response->body())
                ->header('Content-Type', $response->header('Content-Type'))
                ->header('X-Frame-Options', 'SAMEORIGIN');
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load URL'], 500);
        }
    }
} 