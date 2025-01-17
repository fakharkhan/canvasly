import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

interface Canvas {
    id: number;
    url: string;
    description: string | null;
    thumbnail: string | null;
}

interface Props {
    canvas: Canvas;
}

export default function Editor({ canvas }: Props) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Canvas Editor - {canvas.url}
                </h2>
            }
        >
            <Head title={`Edit Canvas - ${canvas.url}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Editor content will go here */}
                            Editing canvas: {canvas.url}
                            <div className="mt-4 text-sm text-gray-500">
                                Canvas ID: {canvas.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
} 