import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PencilIcon, XMarkIcon, TrashIcon, PhotoIcon, PlusIcon, ExclamationTriangleIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import { router } from '@inertiajs/react';

interface Canvas {
    id: number;
    url: string;
    description: string | null;
    thumbnail: string | null;
}

interface Props {
    canvases: Canvas[];
}

export default function Canvas({ canvases: initialCanvases }: Props) {
    const [canvases, setCanvases] = useState(initialCanvases);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [canvasToDelete, setCanvasToDelete] = useState<Canvas | null>(null);
    const [selectedCanvas, setSelectedCanvas] = useState<Canvas | null>(null);
    const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
    const [loadingThumbnails, setLoadingThumbnails] = useState<Set<number>>(new Set());
    const [needsRefresh, setNeedsRefresh] = useState<Set<number>>(new Set());
    const [removingCanvases, setRemovingCanvases] = useState<Set<number>>(new Set());

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
                },
            });
        } else {
            post(route('canvas.store'), {
                url: data.url,
                description: data.description,
                onSuccess: () => {
                    closeModal();
                },
                onError: (errors) => {
                    alert('Failed to create canvas: ' + Object.values(errors).join('\n'));
                }
            });
        }
    };

    const handleRefresh = (canvasId: number) => {
        setNeedsRefresh(prev => {
            const newSet = new Set(prev);
            newSet.delete(canvasId);
            return newSet;
        });
        router.reload();
    };

    const handleDelete = (canvas: Canvas) => {
        setCanvasToDelete(canvas);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (canvasToDelete) {
            // Close modal first
            setIsDeleteModalOpen(false);
            setCanvasToDelete(null);
            
            // Start removal animation
            setRemovingCanvases(prev => new Set([...prev, canvasToDelete.id]));
            
            // Wait for animation to complete before actual removal
            setTimeout(() => {
                deleteForm.delete(route('canvas.destroy', canvasToDelete.id), {
                    onSuccess: () => {
                        setCanvases(prev => prev.filter(c => c.id !== canvasToDelete.id));
                        setLoadingThumbnails(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(canvasToDelete.id);
                            return newSet;
                        });
                        setFailedImages(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(canvasToDelete.id);
                            return newSet;
                        });
                        setRemovingCanvases(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(canvasToDelete.id);
                            return newSet;
                        });
                    }
                });
            }, 300); // Match this with the CSS transition duration
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setCanvasToDelete(null);
    };

    const handleImageError = (canvasId: number) => {
        setFailedImages(prev => new Set([...prev, canvasId]));
        setLoadingThumbnails(prev => {
            const newSet = new Set(prev);
            newSet.delete(canvasId);
            return newSet;
        });
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
                            <div
                                key={canvas.id}
                                className={`group relative overflow-hidden rounded-lg bg-white shadow-sm dark:bg-gray-800 transition-all duration-300 ease-in-out ${
                                    removingCanvases.has(canvas.id)
                                        ? 'opacity-0 scale-95 transform'
                                        : 'opacity-100 scale-100'
                                }`}
                            >
                                <div className="aspect-w-16 aspect-h-14 bg-gray-100 dark:bg-gray-700">
                                    {loadingThumbnails.has(canvas.id) ? (
                                        <div className="flex flex-col items-center justify-center space-y-4 p-8">
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-indigo-600 animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <PhotoIcon className="h-5 w-5 text-indigo-600" />
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Generating thumbnail</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">This may take a few moments...</p>
                                            </div>
                                        </div>
                                    ) : needsRefresh.has(canvas.id) ? (
                                        <div className="flex flex-col items-center justify-center space-y-4 p-8">
                                            <button
                                                onClick={() => handleRefresh(canvas.id)}
                                                className="rounded-full bg-gray-100 p-3 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                                            >
                                                <svg className="h-8 w-8 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            </button>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Click to refresh</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Thumbnail might be ready</p>
                                            </div>
                                        </div>
                                    ) : !failedImages.has(canvas.id) ? (
                                        <img
                                            src={getThumbnailUrl(canvas)}
                                            alt={canvas.description || 'Canvas thumbnail'}
                                            className="object-contain p-4"
                                            onError={() => handleImageError(canvas.id)}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center space-y-3 p-8">
                                            <div className="rounded-full bg-red-100 p-3">
                                                <PhotoIcon className="h-8 w-8 text-red-600" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium text-red-600">Failed to load thumbnail</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Please try refreshing the page</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between px-4 py-3">
                                    <div className="truncate text-sm text-gray-600 dark:text-gray-300">
                                        {canvas.url}
                                    </div>
                                    <div className="flex space-x-1">
                                        <Link
                                            href={route('canvas.editor', canvas.id)}
                                            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                                        >
                                            <GlobeAltIcon className="h-4 w-4" />
                                        </Link>
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && canvasToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="relative inline-block transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left align-middle shadow-xl transition-all dark:bg-gray-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            <div className="sm:flex sm:items-start">
                                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                                        Delete Canvas
                                    </h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Are you sure you want to delete this canvas? This action cannot be undone.
                                        </p>
                                        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {canvasToDelete.url}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
                                    onClick={cancelDelete}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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