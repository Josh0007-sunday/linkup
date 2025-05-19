// ArticleView.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

interface Article {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    coverImage?: { url: string };
    tags: string[];
    category: string;
    isPublished: boolean;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
    updatedAt: string;
    likes: string[];
    comments: Comment[];
}

interface Comment {
    _id: string;
    content: string;
    author: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    createdAt: string;
}

const ArticleView = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [commentContent, setCommentContent] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const API_BASE_URL = import.meta.env.VITE_CONNECTION;

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_BASE_URL}/articles/getallarticle/${id}`);
                setArticle(response.data);
                setIsLiked(response.data.likes.includes(localStorage.getItem('userId')));
                setLikeCount(response.data.likes.length);
                setLoading(false);
            } catch (err) {
                setError('Failed to load article');
                setLoading(false);
                toast.error('Article not found');
                navigate('/');
            }
        };

        fetchArticle();
    }, [id, API_BASE_URL, navigate]);

    const handleLike = async () => {
        try {
            // @ts-ignore
            const response = await axios.post(
                `${API_BASE_URL}/articles/${id}/like`,
                {},
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
                }
            );
            setIsLiked(!isLiked);
            setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        } catch (err) {
            toast.error('Failed to like article');
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        try {
            const response = await axios.post(
                `${API_BASE_URL}/articles/${id}/comments`,
                { content: commentContent },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` },
                }
            );

            if (article) {
                setArticle({
                    ...article,
                    comments: [...article.comments, response.data]
                });
            }
            setCommentContent('');
            toast.success('Comment added');
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Article Header */}
                <div className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-4 text-white">{article.title}</h1>

                    <div className="flex items-center mb-4">
                        {article.author.profilePicture && (
                            <img
                                src={article.author.profilePicture}
                                alt={article.author.username}
                                className="w-10 h-10 rounded-full mr-3 border border-purple-500/30"
                            />
                        )}
                        <div>
                            <p className="font-medium text-purple-300">{article.author.username}</p>
                            <p className="text-sm text-gray-400">
                                {format(new Date(article.createdAt), 'MMMM d, yyyy')}
                            </p>
                        </div>
                    </div>

                    {article.coverImage?.url && (
                        <img
                            src={article.coverImage.url}
                            alt={`Cover for ${article.title}`}
                            className="w-full h-auto max-h-96 object-cover rounded-lg mb-6 border border-purple-500/30"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/default-cover.jpg';
                            }}
                        />
                    )}

                    <div className="flex flex-wrap gap-2 mb-6">
                        {article.tags.map(tag => (
                            <span
                                key={tag}
                                className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                        <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 px-3 py-1 rounded-full text-sm">
                            {article.category}
                        </span>
                    </div>
                </div>

                {/* Article Content */}
                <div
                    className="prose prose-lg max-w-none mb-12 backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 p-8 text-white prose-headings:text-white prose-p:text-white prose-a:text-purple-400 prose-strong:text-purple-300 prose-code:text-purple-300 prose-pre:bg-black/50 prose-pre:border-purple-500/30 prose-li:text-white prose-blockquote:text-white prose-blockquote:border-purple-500/30"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Like and Comment Section */}
                <div className="backdrop-blur-sm bg-black/50 rounded-lg border border-purple-500/30 p-8">
                    <div className="flex items-center mb-8">
                        <button
                            onClick={handleLike}
                            className={`flex items-center mr-6 transition-colors ${
                                isLiked ? 'text-pink-500' : 'text-purple-300 hover:text-pink-500'
                            }`}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 mr-1"
                                fill={isLiked ? "currentColor" : "none"}
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            <span>{likeCount} Likes</span>
                        </button>
                        <div className="text-purple-300">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 inline mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                            <span>{article.comments.length} Comments</span>
                        </div>
                    </div>

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="mb-8">
                        <div className="flex items-start">
                            <textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-gray-500"
                                rows={3}
                            />
                            <button
                                type="submit"
                                className="ml-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
                            >
                                Post
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="space-y-6">
                        {article.comments.map(comment => (
                            <div key={comment._id} className="flex">
                                {comment.author.profilePicture && (
                                    <img
                                        src={comment.author.profilePicture}
                                        alt={comment.author.username}
                                        className="w-10 h-10 rounded-full mr-3 border border-purple-500/30"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="backdrop-blur-sm bg-black/30 rounded-lg p-4 border border-purple-500/30">
                                        <div className="flex items-center mb-2">
                                            <p className="font-medium mr-2 text-purple-300">{comment.author.username}</p>
                                            <p className="text-sm text-gray-400">
                                                {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                            </p>
                                        </div>
                                        <p className="text-gray-300">{comment.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleView;