import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PencilIcon, XMarkIcon, TrashIcon, PhotoIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

interface Canvas {
    id: number;
    url: string;
    description: string | null;
    thumbnail: string | null;
}

interface Props {
    canvases: Canvas[];
}

export default function Canvas({ canvases }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

    const { data, setData, post, patch, processing, errors, reset } = useForm({
        url: '',
        description: '',
    });

    const deleteForm = useForm({});

    const openModal = (canvas?: Canvas) => {
        if (canvas) {
            setSelectedCanvas(canvas);
            setData({
                url: canvas.url,
                description: canvas.description || '',
            });
        } else {
            setSelectedCanvas(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
        setSelectedCanvas(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedCanvas) {
            patch(route('canvas.update', selectedCanvas.id), {
                onSuccess: () => {
                    closeModal();
                    setFailedImages(new Set());
                },
            });
        } else {
            post(route('canvas.store'), {
                onSuccess: () => {
                    closeModal();
                    setFailedImages(new Set());
                },
            });
        }
    };

    const handleDelete = (canvas: Canvas) => {
        if (confirm('Are you sure you want to delete this canvas?')) {
            deleteForm.delete(route('canvas.destroy', canvas.id));
        }
    };

    const handleImageError = (canvasId: number) => {
        setFailedImages(prev => new Set([...prev, canvasId]));
        console.error(`Failed to load image for canvas ${canvasId}`);
    };

    const getThumbnailUrl = (canvas: Canvas): string => {
        if (canvas.thumbnail) {
            return canvas.thumbnail;
        }
        return 'https://via.placeholder.com/1280x720?text=No+Preview';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Canvas
                    </h2>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
                        New Canvas
                    </button>
                </div>
            }
        >
            <Head title="Canvas" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {canvases.map((canvas) => (
                            <div key={canvas.id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                <div className="aspect-w-16 aspect-h-14 bg-gray-100 dark:bg-gray-700">
                                    {!failedImages.has(canvas.id) ? (
                                        <img
                                            src={getThumbnailUrl(canvas)}
                                            alt={canvas.description || 'Canvas thumbnail'}
                                            className="object-contain p-4"
                                            onError={() => handleImageError(canvas.id)}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <PhotoIcon className="h-20 w-20 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="truncate text-sm text-gray-600 dark:text-gray-300">
                                        {canvas.url}
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => openModal(canvas)}
                                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(canvas)}
                                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700 dark:hover:text-red-400"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-bottom shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6 sm:align-middle">
                            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none dark:hover:text-gray-300"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                                        {selectedCanvas ? 'Edit Canvas' : 'Create New Canvas'}
                                    </h3>
                                </div>

                                <div>
                                    <InputLabel htmlFor="url" value="URL" />
                                    <TextInput
                                        id="url"
                                        type="text"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                    />
                                    <InputError message={errors.url} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <TextInput
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="mt-6 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <PrimaryButton disabled={processing}>
                                        {selectedCanvas ? 'Save Changes' : 'Create Canvas'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
} 