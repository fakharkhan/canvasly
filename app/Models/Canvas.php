<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Canvas extends Model
{
    use HasFactory;

    protected $fillable = [
        'url',
        'description',
        'thumbnail'
    ];

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function getThumbnailUrl(): string
    {
        if (!$this->thumbnail) {
            return 'https://via.placeholder.com/1280x720?text=No+Preview';
        }

        if (filter_var($this->thumbnail, FILTER_VALIDATE_URL)) {
            return $this->thumbnail;
        }

        return Storage::disk('public')->url($this->thumbnail);
    }
}
