import { FormEvent, useState } from 'react';

interface CommentFormProps {
    onSubmit: (content: string) => void;
    onCancel: () => void;
    onDelete?: () => void;
    initialContent?: string;
    isExisting?: boolean;
    isCommentMode?: boolean;
}

export default function CommentForm({ 
    onSubmit, 
    onCancel, 
    onDelete, 
    initialContent = '',
    isExisting = false,
    isCommentMode = false
}: CommentFormProps) {
    const [content, setContent] = useState(initialContent);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content);
            setContent('');
            onCancel();
        }
    };

    return (
        <div className="comment-window absolute left-8 top-0 w-64 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-lg z-50">
            <form onSubmit={handleSubmit}>
                <textarea
                    className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-600 mb-3"
                    placeholder="Add your comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={3}
                    autoFocus
                />
                <div className="flex justify-between items-center">
                    {isExisting && isCommentMode && onDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Delete
                        </button>
                    )}
                    <div className="flex gap-2 ml-auto">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim()}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
} 