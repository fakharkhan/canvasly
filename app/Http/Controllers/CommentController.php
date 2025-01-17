<?php

namespace App\Http\Controllers;

use App\Models\Canvas;
use App\Models\Comment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommentController extends Controller
{
    public function index(Canvas $canvas)
    {
        $comments = $canvas->comments()
            ->with('user:id,name')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'x' => $comment->x_position,
                    'y' => $comment->y_position,
                    'content' => $comment->content,
                    'pageUrl' => $comment->page_url,
                    'user' => $comment->user,
                    'resolved' => $comment->resolved,
                    'createdAt' => $comment->created_at,
                    'isOpen' => false
                ];
            });

        return Inertia::render('Editor', [
            'comments' => $comments,
            'canvas' => $canvas
        ]);
    }

    public function store(Request $request, Canvas $canvas)
    {
        $validated = $request->validate([
            'x_position' => 'required|numeric',
            'y_position' => 'required|numeric',
            'content' => 'required|string',
            'page_url' => 'required|string',
        ]);

        $comment = $canvas->comments()->create([
            ...$validated,
            'user_id' => auth()->id(),
        ]);

        $comment->load('user:id,name');

        $formattedComment = [
            'id' => $comment->id,
            'x' => $comment->x_position,
            'y' => $comment->y_position,
            'content' => $comment->content,
            'pageUrl' => $comment->page_url,
            'user' => $comment->user,
            'resolved' => $comment->resolved,
            'createdAt' => $comment->created_at,
            'isOpen' => false
        ];

        return Inertia::render('Editor', [
            'canvas' => $canvas,
            'flash' => [
                'comment' => $formattedComment
            ]
        ]);
    }

    public function update(Request $request, Canvas $canvas, Comment $comment)
    {
        $validated = $request->validate([
            'content' => 'sometimes|string',
            'resolved' => 'sometimes|boolean',
        ]);

        $comment->update($validated);
        $comment->load('user:id,name');

        return Inertia::render('Editor', [
            'canvas' => $canvas,
            'flash' => [
                'comment' => [
                    'id' => $comment->id,
                    'x' => $comment->x_position,
                    'y' => $comment->y_position,
                    'content' => $comment->content,
                    'pageUrl' => $comment->page_url,
                    'user' => $comment->user,
                    'resolved' => $comment->resolved,
                    'createdAt' => $comment->created_at,
                    'isOpen' => false
                ]
            ]
        ]);
    }

    public function destroy(Canvas $canvas, Comment $comment)
    {
        $comment->delete();
        return Inertia::render('Editor', [
            'canvas' => $canvas,
            'flash' => [
                'message' => 'Comment deleted successfully'
            ]
        ]);
    }
} 