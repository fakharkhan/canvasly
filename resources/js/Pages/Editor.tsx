import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

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
}

interface CommentFormData {
    content: string;
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
    const [commentForm, setCommentForm] = useState<CommentFormData>({ content: '' });
    const [commentDisplays, setCommentDisplays] = useState<Record<string | number, CommentDisplay>>({});

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
        const clickedElement = e.target as HTMLElement;
        const isCommentWindow = clickedElement.closest('.comment-window');
        
        if (isCommentWindow) {
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

    const handleCommentSubmit = async (id: string) => {
        try {
            const commentToSave = comments.find(c => c.id.toString() === id);
            if (!commentToSave) return;

            await router.post(route('comments.store', { canvas: canvas.id }), {
                x_position: commentToSave.x,
                y_position: commentToSave.y,
                content: commentForm.content,
                page_url: currentPageUrl,
            }, {
                preserveState: true,
                preserveScroll: true,
            });
            
            setActiveComment(null);
            setCommentForm({ content: '' });
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    };

    const handleCloseComment = (id: string) => {
        setComments(prev => prev.filter(comment => comment.id !== id));
        setActiveComment(null);
        setCommentForm({ content: '' });
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
            setComments(prev => prev.map(comment => 
                comment.id.toString() === flash.comment?.id.toString() 
                    ? { ...flash.comment, isOpen: false }
                    : comment
            ));
            // Set display state for the new comment
            setCommentDisplays(prev => ({
                ...prev,
                [flash.comment.id]: { isEditing: false }
            }));
        }
    }, [flash?.comment]);

    const handleCommentClick = (commentId: string | number) => {
        setCommentDisplays(prev => ({
            ...prev,
            [commentId]: { isEditing: !prev[commentId]?.isEditing }
        }));
    };

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
            }
        >
            <Head title={`Edit Canvas - ${canvas.url}`} />

            <div className="mt-2 px-2">
                <div className="h-[calc(100vh-7.5rem)] w-full">
                    <div className="h-full overflow-hidden bg-white shadow-sm dark:bg-gray-800">
                        <div className="h-full p-6 text-gray-900 dark:text-gray-100 relative">
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
                                    className="absolute inset-0 pointer-events-auto"
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
                                                    onClick={() => handleCommentClick(comment.id)}
                                                    className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-sm cursor-pointer hover:bg-blue-600"
                                                >
                                                    {comments.indexOf(comment) + 1}
                                                </div>
                                                {comment.isOpen ? (
                                                    <div className="comment-window absolute left-8 top-0 w-64 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg z-50">
                                                        <textarea
                                                            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 mb-3"
                                                            placeholder="Add your comment..."
                                                            value={commentForm.content}
                                                            onChange={(e) => setCommentForm({ content: e.target.value })}
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => handleCloseComment(comment.id.toString())}
                                                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleCommentSubmit(comment.id.toString())}
                                                                disabled={!commentForm.content.trim()}
                                                                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                Save
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : commentDisplays[comment.id]?.isEditing && comment.content && (
                                                    <div className="absolute left-8 top-0 w-64 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg z-50">
                                                        <div className="flex items-start gap-3 mb-2">
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
            </div>
        </AuthenticatedLayout>
    );
} 