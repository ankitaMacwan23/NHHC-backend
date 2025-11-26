import React, { useState } from 'react';

const Blogs = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Health');
  const [status, setStatus] = useState('draft');
  const [blogImage, setBlogImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [blogs, setBlogs] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('status', status);
    formData.append('blog_image', blogImage);

    try {
      const res = await fetch('${import.meta.env.VITE_API_BASE_URL}/blogs/add-blog', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage('Blog added successfully!');
        setTitle('');
        setContent('');
        setAuthor('');
        setCategory('Health');
        setStatus('draft');
        setBlogImage('');
        setImagePreview('');
      } else {
        setErrorMessage(data.message || 'Failed to add blog.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong while adding the blog.');
    }
  };

  const handleFetchBlogs = async () => {
    if (!showTable) {
      try {
        const res = await fetch('${import.meta.env.VITE_API_BASE_URL}/blogs/blog-list');
        const data = await res.json();

        if (data.success) {
          setBlogs(data.blogs);
          setShowTable(true);
        } else {
          setErrorMessage('Failed to fetch blogs');
        }
      } catch (err) {
        console.error(err);
        setErrorMessage('Error fetching blogs');
      }
    } else {
      setShowTable(false);
      setBlogs([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      const res = await fetch('${import.meta.env.VITE_API_BASE_URL}/blogs/delete-blog', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (result.success) {
        setBlogs((prev) => prev.filter((b) => b._id !== id));
        setSuccessMessage('Blog deleted successfully.');
      } else {
        setErrorMessage(result.message || 'Failed to delete blog.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Something went wrong while deleting the blog.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <button
        onClick={handleFetchBlogs}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        {showTable ? 'Hide Blogs' : 'Show All Blogs'}
      </button>

      {showTable && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Blog List</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Title</th>
                <th className="border p-2">Image</th>
                <th className="border p-2">Author</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{blog.title}</td>
                  <td className="border p-2">
                    {blog.image && (
                      <img
                        src={`http://localhost:3000${blog.image}`}
                        alt="blog"
                        className="w-16 h-16 object-cover"
                      />
                    )}
                  </td>
                  <td className="border p-2">{blog.author}</td>
                  <td className="border p-2">{blog.category}</td>
                  <td className="border p-2">{blog.status}</td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleDelete(blog._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h1 className="text-3xl font-bold text-center text-green-800 mb-6">Add New Blog</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        {successMessage && <div className="text-green-500">{successMessage}</div>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Author:</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          >
            <option value="Health">Health</option>
            <option value="Wellness">Wellness</option>
            <option value="Care">Care</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="News">News</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status:</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Blog Image (optional):</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setBlogImage(file);
                setImagePreview(URL.createObjectURL(file));
              }
            }}
            className="mt-2 p-2 w-full border rounded-md shadow-sm"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="max-w-xs rounded-md" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
        >
          Add Blog
        </button>
      </form>
    </div>
  );
};

export default Blogs;
