import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Editor } from 'primereact/editor';
import ImageUploadButton from './articlecomponent/imageUpload';

interface ArticleData {
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  category: string;
  isPublished: boolean;
}

const CreateArticle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [data, setData] = useState<ArticleData>({
    title: '',
    content: '',
    excerpt: '', // We'll generate this from content automatically
    tags: [],
    category: 'Technology',
    isPublished: false,
  });

  const API_BASE_URL = import.meta.env.VITE_CONNECTION;

  const handleContentChange = (e: { htmlValue: string | null }) => {
    const content = e.htmlValue || '';
    setData(prev => ({
      ...prev,
      content,
      // Auto-generate excerpt from content
      excerpt: content
        ? new DOMParser().parseFromString(content, 'text/html').body.textContent?.substring(0, 150) + '...'
        : ''
    }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !data.tags.includes(tagInput.trim())) {
      setData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const saveDraft = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/articles/create-article`,
        { ...data, isPublished: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } }
      );
      toast.success('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error.response?.data?.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const publishArticle = async () => {
    setPublishing(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/articles/create-article`,
        { ...data, isPublished: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem('auth-token')}` } }
      );
      toast.success('Article published successfully!');
      navigate(`/article/${response.data._id}`);
    } catch (error: any) {
      console.error('Error publishing article:', error);
      toast.error(error.response?.data?.message || 'Failed to publish article');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button
            onClick={() => navigate('/homepage')}
            className="text-gray-600 hover:text-gray-900 font-medium flex items-center"
            type="button"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex space-x-3">
            <button
              onClick={saveDraft}
              disabled={loading}
              className={`px-4 py-2 rounded-md font-medium text-sm ${loading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              type="button"
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={publishArticle}
              disabled={publishing || !data.title || !data.content}
              className={`px-4 py-2 rounded-md font-medium text-sm text-white ${publishing || !data.title || !data.content
                  ? 'bg-green-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
                }`}
              type="button"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4">
        {data.coverImage && (
          <div className="mb-8 relative group rounded-lg overflow-hidden">
            <img
              src={data.coverImage}
              alt="Cover"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => setData(prev => ({ ...prev, coverImage: undefined }))}
              className="absolute top-3 right-3 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-80 transition-opacity"
              type="button"
              aria-label="Remove cover image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <input
          type="text"
          name="title"
          value={data.title}
          onChange={handleInputChange}
          placeholder="Article Title"
          className="w-full text-4xl font-bold mb-6 outline-none placeholder-gray-400 leading-tight"
        />

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <Editor
            value={data.content}
            onTextChange={handleContentChange}
            style={{ height: '400px' }}
            placeholder="Write your article content here..."
            className="border-none"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Article Settings</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image URL</label>
            {!data.coverImage ? (
              <ImageUploadButton
                onUpload={(url) => setData(prev => ({ ...prev, coverImage: url }))}
                className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer bg-gray-50"
              >
                <div className="flex flex-col items-center justify-center">
                  <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-500">Add cover image URL</span>
                </div>
              </ImageUploadButton>
            ) : (
              <div className="relative group rounded-lg overflow-hidden">
                <img
                  src={data.coverImage}
                  alt="Cover preview"
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setData(prev => ({ ...prev, coverImage: undefined }))}
                  className="absolute top-3 right-3 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-80 transition-opacity"
                  type="button"
                  aria-label="Remove cover image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Add tags..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 text-sm font-medium"
                type="button"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {data.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 text-gray-500 hover:text-gray-700"
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={data.category}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="Technology">Technology</option>
              <option value="Business">Business</option>
              <option value="Health">Health</option>
              <option value="Politics">Politics</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Sports">Sports</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateArticle;