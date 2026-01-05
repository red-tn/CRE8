'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { FileText, Plus, Pencil, Trash2, X, Upload, Pin, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { BlogPost } from '@/types'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    imageUrl: '',
    isPublished: false,
    isPinned: false,
    publishedAt: '',
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      imageUrl: '',
      isPublished: false,
      isPinned: false,
      publishedAt: '',
    })
    setEditingPost(null)
    setShowForm(false)
  }

  const startEdit = (post: BlogPost) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      imageUrl: post.image_url || '',
      isPublished: post.is_published,
      isPinned: post.is_pinned,
      publishedAt: post.published_at ? post.published_at.split('T')[0] : '',
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const payload = {
        ...(editingPost ? { id: editingPost.id } : {}),
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || null,
        imageUrl: formData.imageUrl || null,
        isPublished: formData.isPublished,
        isPinned: formData.isPinned,
        publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : null,
      }

      const res = await fetch('/api/admin/blog', {
        method: editingPost ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        resetForm()
        fetchPosts()
      }
    } catch (error) {
      console.error('Error saving post:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This will also delete all comments.')) return

    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const togglePin = async (post: BlogPost) => {
    try {
      await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, isPinned: !post.is_pinned }),
      })
      fetchPosts()
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const togglePublish = async (post: BlogPost) => {
    try {
      await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: post.id, isPublished: !post.is_published }),
      })
      fetchPosts()
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'blog')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, imageUrl: data.url })
      } else {
        alert(data.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">
          <span className="text-white">BLOG</span>
        </h1>
        <div className="flex gap-3">
          <Link href="/admin/blog/comments">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Comments
            </Button>
          </Link>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Post Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h2>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full min-h-[200px] px-4 py-3 bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-white transition-colors resize-y"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Excerpt (short summary)
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full min-h-[80px] px-4 py-3 bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-white transition-colors resize-y"
                    placeholder="Brief summary for listings..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Featured Image
                  </label>
                  <div className="space-y-3">
                    {formData.imageUrl ? (
                      <div className="relative aspect-video bg-zinc-800 border border-zinc-700 overflow-hidden">
                        <img
                          src={formData.imageUrl}
                          alt="Post"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white hover:bg-red-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 hover:border-white/50 cursor-pointer transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="text-zinc-500">Uploading...</div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-600 mb-2" />
                            <span className="text-sm text-zinc-500">Click to upload image</span>
                          </>
                        )}
                      </label>
                    )}
                  </div>
                </div>

                <Input
                  label="Publish Date"
                  type="date"
                  value={formData.publishedAt}
                  onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                />

                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm">Published</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 accent-white"
                    />
                    <span className="text-sm">Pinned to Top</span>
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={isSaving} className="flex-1">
                    {editingPost ? 'Update' : 'Create'} Post
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-zinc-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>No blog posts yet</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Thumbnail */}
                  {post.image_url && (
                    <div className="flex-shrink-0 w-32 h-20 bg-zinc-800 overflow-hidden">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Post Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-bold truncate">{post.title}</h3>
                        <div className="flex gap-2 mt-1 flex-wrap">
                          {post.is_pinned && (
                            <Badge variant="amber">
                              <Pin className="w-3 h-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {post.is_published ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="default">Draft</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePin(post)}
                          title={post.is_pinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className={`w-4 h-4 ${post.is_pinned ? 'text-amber-500' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => startEdit(post)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePost(post.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-sm line-clamp-2 mb-3">
                      {post.excerpt || post.content.substring(0, 150)}...
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                      <span>
                        {post.published_at ? formatDate(post.published_at) : 'Not published'}
                      </span>
                      {post.author && (
                        <span>By {post.author.first_name} {post.author.last_name}</span>
                      )}
                      <button
                        onClick={() => togglePublish(post)}
                        className="text-white hover:underline"
                      >
                        {post.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
