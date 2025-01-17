import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import CommentForm from '@/Components/CommentForm';

interface Canvas {
    id: number;
    url: string;
    description: string | null;
    thumbnail: string | null;
}

interface User {
    id: number;
    name: string;
}

interface Comment {
    id: number | string;
    x: number;
    y: number;
    content: string;
    isOpen: boolean;
    pageUrl: string;
    user: User | null;
    resolved: boolean;
    createdAt: string;
}

interface Props {
    canvas: Canvas;
    comments?: Comment[];
    flash?: {
        comment?: Comment;
        message?: string;
    };
    commentCount?: number;
}

interface CommentDisplay {
    isEditing: boolean;
}

export default function Editor({ canvas, comments: initialComments = [], flash }: Props) {
    const [isLoading, setIsLoading] = useState(true);
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [activeComment, setActiveComment] = useState<Comment | null>(null);
    const [currentPageUrl, setCurrentPageUrl] = useState<string>(canvas.url);
    const overlayRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [commentDisplays, setCommentDisplays] = useState<Record<string | number, CommentDisplay>>({});
    const [isCommentMode, setIsCommentMode] = useState(false);

    const getProxyUrl = (url: string): string => {
        const encodedUrl = btoa(url);
        return route('proxy', { url: encodedUrl });
    };

    const getThumbnailUrl = (canvas: Canvas): string => {
        if (canvas.thumbnail) {
            if (canvas.thumbnail.startsWith('http')) {
                return canvas.thumbnail;
            }
            return `/storage/${canvas.thumbnail}`;
        }
        return 'https://via.placeholder.com/1280x720?text=No+Preview';
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (!isCommentMode) return;
        
        const clickedElement = e.target as HTMLElement;
        const isCommentInterface = clickedElement.closest('.comment-window') || 
                                 clickedElement.closest('.comment-badge') ||
                                 clickedElement.closest('.comment-display');
        
        if (isCommentInterface) {
            return;
        }

        if (overlayRef.current) {
            const rect = overlayRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const tempId = `temp-${Date.now()}`;
            const newComment: Comment = {
                id: tempId,
                x,
                y,
                content: '',
                isOpen: true,
                pageUrl: currentPageUrl,
                user: null,
                resolved: false,
                createdAt: new Date().toISOString()
            };
            
            setComments(prev => [...prev, newComment]);
            setActiveComment(newComment);
        }
    };

    const handleCommentSubmit = async (id: string, content: string) => {
        try {
            const commentToSave = comments.find(c => c.id.toString() === id);
            if (!commentToSave) return;

            await router.post(route('comments.store', { canvas: canvas.id }), {
                x_position: commentToSave.x,
                y_position: commentToSave.y,
                content: content,
                page_url: currentPageUrl,
            }, {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const savedComment = page.props.flash.comment;
                    // Update comments immediately with the saved comment
                    setComments(prev => prev.map(comment => 
                        comment.id.toString() === id 
                            ? { ...savedComment, isOpen: false }
                            : comment
                    ).filter(comment => !comment.id.toString().startsWith('temp-')));

                    // Set display state to show the comment
                    setCommentDisplays(prev => ({
                        ...prev,
                        [savedComment.id]: { isEditing: true }
                    }));

                    setActiveComment(null);
                }
            });
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    const handleCloseComment = (id: string) => {
        setComments(prev => prev.filter(comment => comment.id !== id));
        setActiveComment(null);
    };

    const handleDeleteComment = async (id: string | number) => {
        try {
            await router.delete(route('comments.destroy', { 
                canvas: canvas.id,
                comment: id 
            }), {
                preserveState: true,
                preserveScroll: true,
            });
            
            // Remove comment from local state
            setComments(prev => prev.filter(comment => comment.id !== id));
            setCommentDisplays(prev => {
                const newDisplays = { ...prev };
                delete newDisplays[id];
                return newDisplays;
            });
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Listen for iframe URL changes
    useEffect(() => {
        const handleIframeLoad = () => {
            try {
                if (iframeRef.current) {
                    // Try to get the current URL from the iframe
                    const iframeUrl = iframeRef.current.contentWindow?.location.href;
                    if (iframeUrl) {
                        setCurrentPageUrl(iframeUrl);
                    }
                }
            } catch (error) {
                console.error('Error accessing iframe URL:', error);
            }
            setIsLoading(false);
        };

        if (iframeRef.current) {
            iframeRef.current.addEventListener('load', handleIframeLoad);
        }

        return () => {
            if (iframeRef.current) {
                iframeRef.current.removeEventListener('load', handleIframeLoad);
            }
        };
    }, []);

    useEffect(() => {
        if (flash?.comment) {
            const savedComment = flash.comment;
            setComments(prev => {
                // Remove any temporary version of this comment
                const filtered = prev.filter(comment => 
                    !comment.id.toString().startsWith('temp-') && 
                    comment.id.toString() !== savedComment.id.toString()
                );
                // Add the saved comment
                return [...filtered, { ...savedComment, isOpen: false }];
            });
            
            setCommentDisplays(prev => ({
                ...prev,
                [savedComment.id]: { isEditing: true }
            }));
        }
    }, [flash?.comment]);

    const handleCommentClick = (commentId: string | number) => {
        setCommentDisplays(prev => ({
            ...prev,
            [commentId]: { isEditing: !prev[commentId]?.isEditing }
        }));
    };

    // Add a memoized comment count for the current page
    const currentPageCommentCount = useMemo(() => {
        return comments.filter(c => c.pageUrl === currentPageUrl).length;
    }, [comments, currentPageUrl]);

    return (
        <AuthenticatedLayout
            hideNavigation={true}
            header={
                <div className="flex items-center justify-between w-full">
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
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-14 overflow-hidden rounded-sm bg-gray-100 dark:bg-gray-700">
                                <img
                                    src={getThumbnailUrl(canvas)}
                                    alt={canvas.description || 'Canvas thumbnail'}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                                {canvas.url}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {currentPageCommentCount} comments
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCommentMode(!isCommentMode)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                    isCommentMode ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                                }`}
                            >
                                <span className="sr-only">Toggle comment mode</span>
                                <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isCommentMode ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                />
                            </button>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                {isCommentMode ? 'Comment mode on' : 'Browse mode'}
                            </span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Edit Canvas - ${canvas.url}`} />

            <div className="w-full h-screen">
                <div className="h-full overflow-hidden bg-white dark:bg-gray-800">
                    <div className="h-full text-gray-900 dark:text-gray-100 relative">
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800">
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
                            </div>
                        )}
                        <div className="relative h-full w-full">
                            <iframe 
                                ref={iframeRef}
                                src={getProxyUrl(canvas.url)}
                                className="h-full w-full border-0"
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                referrerPolicy="no-referrer"
                            />
                            <div 
                                ref={overlayRef}
                                onClick={handleOverlayClick}
                                className={`absolute inset-0 ${
                                    isCommentMode ? 'pointer-events-auto cursor-crosshair' : 'pointer-events-none'
                                }`}
                                style={{ background: 'transparent' }}
                            >
                                {comments
                                    .filter(comment => comment.pageUrl === currentPageUrl)
                                    .map(comment => (
                                        <div
                                            key={comment.id}
                                            className="absolute"
                                            style={{
                                                left: `${comment.x}px`,
                                                top: `${comment.y}px`,
                                            }}
                                        >
                                            <div 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCommentClick(comment.id);
                                                }}
                                                className="comment-badge flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-sm cursor-pointer hover:bg-blue-600"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                {comments.indexOf(comment) + 1}
                                            </div>
                                            {comment.isOpen ? (
                                                <CommentForm
                                                    onSubmit={(content) => handleCommentSubmit(comment.id.toString(), content)}
                                                    onCancel={() => handleCloseComment(comment.id.toString())}
                                                    onDelete={() => handleDeleteComment(comment.id)}
                                                    isExisting={!comment.id.toString().startsWith('temp-')}
                                                    isCommentMode={isCommentMode}
                                                    initialContent={comment.content}
                                                />
                                            ) : commentDisplays[comment.id]?.isEditing && comment.content && (
                                                <div className="comment-display absolute -left-[268px] top-0 w-64 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg z-50">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex items-start gap-3">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                                                                    {comment.user?.name?.charAt(0) || '?'}
                                                                </div>
                                                            </div>
                                                            <div className="flex-grow">
                                                                <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                                                    {comment.user?.name || 'Anonymous'}
                                                                </div>
                                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isCommentMode && (
                                                            <button
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                                        {comment.content}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .h-screen {
                    height: calc(100vh - 4rem) !important;
                }
            `}</style>
        </AuthenticatedLayout>
    );
} 