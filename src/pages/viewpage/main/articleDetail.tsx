import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { marked } from "marked"; // For markdown support
import DOMPurify from "dompurify"; // For sanitizing HTML
import LoadingSkeleton from "../../../components/LoadingSkeleton";
import toast from "react-hot-toast";



interface Article {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  author: {
    name: string;
    img: string;
    bio: string;
    _id: string;
  };
  publishedAt: string;
  updatedAt: string;
  views: number;
  likesCount: number;
  tags: string[];
  category: string;
  collaborators: Array<{
    name: string;
    img: string;
    _id: string;
  }>;
}

const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [comments, setComments] = useState<Array<{
    _id: string;
    content: string;
    user: {
      _id: string;
      name: string;
      img?: string;
    };
    createdAt: string;
  }>>([]);
  const [newComment, setNewComment] = useState("");

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/articles/getallarticle/${id}`);

        if (!response.ok) {
          throw new Error(response.status === 404
            ? "Article not found"
            : `HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data) {
          throw new Error("Invalid article data received");
        }

        setArticle(data);

        // Check if user has liked the article (you'll need to implement this)
        // setIsLiked(checkIfLiked(data._id));

        // Check if user has bookmarked the article
        // setIsBookmarked(checkIfBookmarked(data._id));

        // Fetch comments (you'll need to implement this endpoint)
        // const commentsResponse = await fetch(`${API_BASE_URL}/articles/${id}/comments`);
        // const commentsData = await commentsResponse.json();
        // setComments(commentsData.comments || []);
      } catch (error) {
        console.error("Error fetching article:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch article");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  const getImageUrl = (imgPath: string | undefined | null): string | null => {
    // Check if imgPath is a string
    if (typeof imgPath !== 'string') return null;

    // Check if imgPath is empty
    if (!imgPath.trim()) return null;

    // Handle URLs
    if (imgPath.startsWith('http')) return imgPath;

    // Handle relative paths
    return `${API_BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        // Handle unauthorized case
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/${id}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsLiked(!isLiked);
        if (article) {
          setArticle({
            ...article,
            likesCount: isLiked ? article.likesCount - 1 : article.likesCount + 1
          });
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        // Handle unauthorized case
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/${id}/bookmark`, {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsBookmarked(!isBookmarked);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('auth-token');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const data = await response.json();
        setComments([...comments, {
          _id: data._id,
          content: data.content,
          user: {
            _id: data.author._id,
            name: data.author.username,
            img: data.author.profilePicture
          },
          createdAt: data.createdAt
        }]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error('Failed to add comment');
    }
  };

  const renderMarkdown = async (content: string) => {
    try {
      const rawMarkup = await marked(content);
      const cleanMarkup = DOMPurify.sanitize(rawMarkup);
      return { __html: cleanMarkup };
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return { __html: '<p>Error rendering content</p>' };
    }
  };

  // Update the component to handle async markdown rendering
  const [renderedContent, setRenderedContent] = useState<{ __html: string }>({ __html: '' });

  useEffect(() => {
    const renderContent = async () => {
      if (article?.content) {
        const rendered = await renderMarkdown(article.content);
        setRenderedContent(rendered);
      }
    };
    renderContent();
  }, [article?.content]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Back Button Skeleton */}
        <div className="mb-8">
          <LoadingSkeleton type="text" className="w-32" />
        </div>

        {/* Article Header Skeleton */}
        <header className="mb-12">
          {/* Cover Image Skeleton */}
          <div className="mb-8 rounded-lg overflow-hidden aspect-[3/1] max-h-[400px]">
            <LoadingSkeleton type="image" />
          </div>

          {/* Title Skeleton */}
          <div className="mb-6">
            <LoadingSkeleton type="text" className="w-3/4 h-12" />
          </div>

          {/* Author and Actions Skeleton */}
          <div className="flex items-center justify-between mb-8 max-w-4xl">
            <div className="flex items-center space-x-4">
              <LoadingSkeleton type="profile" />
            </div>
            <div className="flex items-center space-x-4">
              <LoadingSkeleton type="text" className="w-20" />
              <LoadingSkeleton type="text" className="w-20" />
            </div>
          </div>

          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-2 mb-8 max-w-4xl">
            {[1, 2, 3].map((index) => (
              <LoadingSkeleton key={index} type="text" className="w-24" />
            ))}
          </div>
        </header>

        {/* Article Content Skeleton */}
        <article className="prose prose-lg max-w-4xl mx-auto mb-12">
          <div className="space-y-4">
            <LoadingSkeleton type="text" className="w-full" />
            <LoadingSkeleton type="text" className="w-5/6" />
            <LoadingSkeleton type="text" className="w-4/6" />
            <LoadingSkeleton type="text" className="w-full" />
            <LoadingSkeleton type="text" className="w-3/4" />
            <LoadingSkeleton type="text" className="w-5/6" />
          </div>
        </article>

        {/* Article Footer Skeleton */}
        <footer className="max-w-4xl mx-auto mb-12 border-t border-gray-200 pt-8">
          {/* Actions Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <LoadingSkeleton type="text" className="w-32" />
              <LoadingSkeleton type="text" className="w-32" />
            </div>
            <div className="flex items-center space-x-4">
              <LoadingSkeleton type="text" className="w-8" />
              <LoadingSkeleton type="text" className="w-8" />
            </div>
          </div>

          {/* Author Bio Skeleton */}
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="flex items-start">
              <LoadingSkeleton type="profile" className="w-20 h-20" />
              <div className="ml-6 flex-1">
                <LoadingSkeleton type="text" className="w-48 mb-2" />
                <LoadingSkeleton type="text" className="w-full mb-2" />
                <LoadingSkeleton type="text" className="w-24" />
              </div>
            </div>
          </div>
        </footer>

        {/* Comments Section Skeleton */}
        <section className="max-w-4xl mx-auto mb-12">
          <LoadingSkeleton type="text" className="w-48 mb-8" />

          {/* Comment Form Skeleton */}
          <div className="mb-8">
            <LoadingSkeleton type="text" className="w-full h-32 mb-4" />
            <LoadingSkeleton type="text" className="w-32" />
          </div>

          {/* Comments List Skeleton */}
          <div className="space-y-8">
            {[1, 2].map((index) => (
              <div key={index} className="border-b border-gray-200 pb-8 last:border-0">
                <div className="flex items-start mb-4">
                  <LoadingSkeleton type="profile" className="w-12 h-12" />
                  <div className="ml-4">
                    <LoadingSkeleton type="text" className="w-32 mb-2" />
                    <LoadingSkeleton type="text" className="w-24" />
                  </div>
                </div>
                <LoadingSkeleton type="text" className="w-full ml-16" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Article</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  const coverImageUrl = getImageUrl(article.coverImage);
  const authorImageUrl = getImageUrl(article.author?.img);
  const readingTime = Math.ceil((article.content?.split(/\s+/) || []).length / 200);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to Articles
      </button>

      {/* Article Header */}
      <header className="mb-12">
        {/* Cover Image */}
        {coverImageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden aspect-[3/1] max-h-[400px]">
            <img
              src={coverImageUrl}
              alt={`Cover for ${article.title}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/default-cover.jpg';
              }}
            />
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight max-w-4xl">
          {article.title}
        </h1>

        <div className="flex items-center justify-between mb-8 max-w-4xl">
          <div className="flex items-center space-x-4">
            {/* Author Info */}
            <div className="flex items-center">
              {authorImageUrl ? (
                <img
                  src={authorImageUrl}
                  alt={article.author.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author.name)}&background=random`;
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                  <span className="text-xl font-medium">
                    {article.author.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 text-lg">{article.author.name}</p>
                <p className="text-sm text-gray-500">
                  {format(new Date(article.publishedAt), 'MMM d, yyyy')} · {readingTime} min read
                </p>
              </div>
            </div>
          </div>

          {/* Social Share and Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">{article.likesCount}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`${isBookmarked ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8 max-w-4xl">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Article Content */}
      <article className="prose prose-lg max-w-4xl mx-auto mb-12">
        {renderedContent && (
          <div dangerouslySetInnerHTML={renderedContent} />
        )}
      </article>

      {/* Article Footer */}
      <footer className="max-w-4xl mx-auto mb-12 border-t border-gray-200 pt-8">
        <div className="flex items-center justify-between mb-8">
          {/* Like and Bookmark Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full ${isLiked ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              <span className="text-lg">{isLiked ? 'Liked' : 'Like'} · {article.likesCount}</span>
            </button>

            <button
              onClick={handleBookmark}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full ${isBookmarked ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              <span className="text-lg">{isBookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Social Share */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-blue-600">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-blue-800">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Author Bio */}
        <div className="bg-gray-50 p-8 rounded-xl">
          <div className="flex items-start">
            {authorImageUrl ? (
              <img
                src={authorImageUrl}
                alt={article.author.name}
                className="w-20 h-20 rounded-full object-cover mr-6"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-6">
                <span className="text-2xl font-medium">
                  {article.author.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-2">
                Written by {article.author.name}
              </h3>
              <p className="text-gray-600 text-lg mb-4">
                {article.author.bio || 'No bio available'}
              </p>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Follow
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Comments Section */}
      <section className="max-w-4xl mx-auto mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments ({comments.length})</h2>

        {/* Add Comment Form */}
        <div className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-6 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4 text-lg"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 text-lg font-medium"
          >
            Post Comment
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-8">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-200 pb-8 last:border-0">
              <div className="flex items-start mb-4">
                {comment.user.img ? (
                  <img
                    src={getImageUrl(comment.user.img) || ''}
                    alt={comment.user.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                    <span className="text-xl font-medium">
                      {comment.user.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">{comment.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 text-lg pl-16">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;