<?php

namespace App\Events;

use App\Models\Canvas;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CanvasUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $canvas;

    public function __construct(Canvas $canvas)
    {
        $this->canvas = $canvas;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('canvas')
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'canvas' => [
                'id' => $this->canvas->id,
                'url' => $this->canvas->url,
                'description' => $this->canvas->description,
                'thumbnail' => $this->canvas->thumbnail ? asset('storage/' . $this->canvas->thumbnail) : null,
            ],
        ];
    }
}
