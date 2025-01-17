import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

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
            hideNavigation={true}
            header={
                <div className="flex items-center gap-3">
                    <Link
                        href={route('canvas')}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="h-6 w-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                            />
                        </svg>
                    </Link>
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Canvas Editor - {canvas.url}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit Canvas - ${canvas.url}`} />

            <div className="mt-2 px-2">
                <div className="h-[calc(100vh-7.5rem)] w-full">
                    <div className="h-full overflow-hidden bg-white shadow-sm dark:bg-gray-800">
                        <div className="h-full p-6 text-gray-900 dark:text-gray-100">
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