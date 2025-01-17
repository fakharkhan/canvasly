<?php

namespace Database\Seeders;

use App\Models\Canvas;
use Illuminate\Database\Seeder;

class CanvasSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            Canvas::create([
                'url' => 'https://canvas' . $i . '.example.com/drawing',
                'description' => $i % 2 === 0 ? 'A beautiful canvas drawing #' . $i : null,
            ]);
        }
    }
}
