<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends Model
{
    protected $fillable = [
        'canvas_id',
        'user_id',
        'page_url',
        'x_position',
        'y_position',
        'content',
        'resolved',
    ];

    protected $casts = [
        'resolved' => 'boolean',
        'x_position' => 'float',
        'y_position' => 'float',
    ];

    public function canvas(): BelongsTo
    {
        return $this->belongsTo(Canvas::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
