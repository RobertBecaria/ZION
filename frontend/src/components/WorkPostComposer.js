import React, { useState } from 'react';
import { Send, X } from 'lucide-react';

const WorkPostComposer = ({ organizationId, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) return;

    setPosting(true);
    setError(null);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('zion_token');

      const response = await fetch(`${BACKEND_URL}/api/work/organizations/${organizationId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось создать пост');
      }

      const data = await response.json();
      setContent('');
      onPostCreated && onPostCreated(data.post);
    } catch (error) {
      console.error('Create post error:', error);
      setError(error.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-6">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Что у вас нового?..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
        />

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            {content.length} / 5000 символов
          </p>
          <div className="flex gap-3">
            {content && (
              <button
                type="button"
                onClick={() => setContent('')}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                Очистить
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || posting}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {posting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Публикация...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Опубликовать
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default WorkPostComposer;