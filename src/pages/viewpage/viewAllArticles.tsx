import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingSkeleton from "../../components/LoadingSkeleton";

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
    _id: string;
  };
  publishedAt: string;
  views: number;
  likesCount: number;
  tags: string[];
  category: string;
}

const ViewAllArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/articles/getallarticle`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        if (!data.articles || !Array.isArray(data.articles)) {
          throw new Error('Invalid data format received from server');
        }
        setArticles(data.articles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        setError(error instanceof Error ? error.message : 'Failed to fetch articles');
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  // Get all unique tags with null check
  const allTags = Array.from(new Set(
    articles
      .filter(article => article && article.tags)
      .flatMap(article => article.tags || [])
  ));

  // Get all unique categories with null check
  const allCategories = Array.from(new Set(
    articles
      .filter(article => article && article.category)
      .map(article => article.category)
  ));

  // Filter articles based on selected tag and category with null checks
  const filteredArticles = articles.filter(article => {
    if (!article) return false;
    const matchesTag = !selectedTag || (article.tags && article.tags.includes(selectedTag));
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesTag && matchesCategory;
  });

  const handleArticleClick = (id: string) => {
    if (!id) return;
    navigate(`/articles/${id}`);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedCategory(null);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Go Back Button Skeleton */}
          <div className="mb-8">
            <LoadingSkeleton type="text" className="w-32" />
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content - Articles List (Left) */}
            <div className="md:w-2/3">
              <LoadingSkeleton type="text" className="w-48 mb-8" />
              
              <div className="space-y-8">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                    <LoadingSkeleton type="text" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar - Tags & Categories (Right) */}
            <div className="md:w-1/3">
              <div className="sticky top-8 space-y-8">
                {/* Categories Section Skeleton */}
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                  <LoadingSkeleton type="text" className="w-32 mb-4" />
                  <div className="space-y-2">
                    {[1, 2, 3].map((index) => (
                      <LoadingSkeleton key={index} type="text" className="w-full" />
                    ))}
                  </div>
                </div>

                {/* Tags Section Skeleton */}
                <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                  <LoadingSkeleton type="text" className="w-24 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <LoadingSkeleton key={index} type="text" className="w-20" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Articles</h2>
            <p className="text-gray-400">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-md hover:bg-purple-500/30 border border-purple-500/20 transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Go Back Button */}
        <button
          onClick={() => navigate('/homepage')}
          className="mb-8 flex items-center text-purple-400 hover:text-purple-300 transition-colors"
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
          Back to Homepage
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content - Articles List (Left) */}
          <div className="md:w-2/3">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
              All Articles
            </h1>
            
            {/* Filters */}
            {(selectedTag || selectedCategory) && (
              <div className="mb-6 flex items-center">
                <span className="text-gray-400 mr-2">Filtering by:</span>
                {selectedTag && (
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm mr-2 border border-purple-500/20">
                    #{selectedTag}
                  </span>
                )}
                {selectedCategory && (
                  <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm mr-2 border border-purple-500/20">
                    {selectedCategory}
                  </span>
                )}
                <button 
                  onClick={clearFilters}
                  className="text-sm text-purple-400 hover:text-purple-300 underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 bg-black/40 backdrop-blur-xl rounded-xl border border-purple-500/20">
                <h3 className="text-lg font-medium text-white">No articles found</h3>
                <p className="mt-2 text-gray-400">
                  {selectedTag || selectedCategory 
                    ? "Try clearing your filters" 
                    : "No articles have been published yet"}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredArticles.map((article) => {
                  if (!article) return null;
                  
                  const coverImageUrl = getImageUrl(article.coverImage);
                  const authorImageUrl = getImageUrl(article.author?.img);
                  const readingTime = Math.ceil((article.content?.split(/\s+/) || []).length / 200);

                  return (
                    <article 
                      key={article._id} 
                      className="group cursor-pointer bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
                      onClick={() => handleArticleClick(article._id)}
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Article Content */}
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {authorImageUrl ? (
                              <img
                                src={authorImageUrl}
                                alt={article.author?.name || 'Author'}
                                className="w-6 h-6 rounded-full object-cover mr-2 border border-purple-500/20"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(article.author?.name || 'A')}&background=random`;
                                }}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mr-2">
                                <span className="text-xs font-medium text-purple-400">
                                  {(article.author?.name || 'A').charAt(0)}
                                </span>
                              </div>
                            )}
                            <span className="text-sm text-gray-400">
                              {article.author?.name || 'Anonymous'}
                            </span>
                          </div>
                          <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                            {article.title || 'Untitled Article'}
                          </h2>
                          <p className="text-gray-400 mb-3 line-clamp-2">
                            {article.excerpt || article.content?.substring(0, 150) + '...' || 'No content available'}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-500">
                                {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }) : 'No date'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {readingTime} min read
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {article.likesCount || 0} likes
                              </span>
                              <span className="text-sm text-gray-500">
                                {article.views || 0} views
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Article Cover Image */}
                        {coverImageUrl && (
                          <div className="sm:w-32 sm:h-32 w-full h-48 overflow-hidden rounded-lg">
                            <div className="relative w-full h-full">
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <img
                                src={coverImageUrl}
                                alt={article.title || 'Article cover'}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar - Tags & Categories (Right) */}
          <div className="md:w-1/3">
            <div className="sticky top-8 space-y-8">
              {/* Categories Section */}
              <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                  Categories
                </h3>
                <div className="space-y-2">
                  {allCategories.length > 0 ? (
                    allCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === category 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'text-gray-400 hover:bg-purple-500/10 border border-transparent hover:border-purple-500/20'
                        }`}
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No categories available</p>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.length > 0 ? (
                    allTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          selectedTag === tag 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'bg-black/40 text-gray-400 hover:text-purple-400 border border-purple-500/20 hover:border-purple-500/30'
                        }`}
                      >
                        #{tag}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No tags available</p>
                  )}
                </div>
              </div>

              {/* Popular Articles Section */}
              <div className="bg-black/40 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
                <h3 className="font-semibold text-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
                  Popular Articles
                </h3>
                <div className="space-y-4">
                  {articles
                    .filter(article => article && article.views)
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 3)
                    .map((article) => (
                      <div 
                        key={article._id} 
                        className="cursor-pointer hover:bg-purple-500/10 p-2 rounded-md transition-colors border border-transparent hover:border-purple-500/20"
                        onClick={() => handleArticleClick(article._id)}
                      >
                        <h4 className="font-medium text-white line-clamp-2">
                          {article.title || 'Untitled Article'}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                          {article.views || 0} views
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllArticles;