<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ProxyMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Only allow authenticated users
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
} 