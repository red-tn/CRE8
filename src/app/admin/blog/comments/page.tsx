'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { MessageSquare, Check, X, Trash2, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
interface CommentWithRelations {
  id: string
  post_id: string
  member_id?: string
  guest_name?: string
  guest_email?: string
  content: string
  is_approved: boolean
  created_at: string
  member?: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  post?: {
    id: string
    title: string
    slug: string
  }
}

export default function AdminBlogCommentsPage() {
  const [comments, setComments] = useState<CommentWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'all'>('pending')

  useEffect(() => {
    fetchComments()
  }, [filter])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/admin/blog/comments?pending=${filter === 'pending'}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const approveComment = async (id: string) => {
    try {
      await fetch('/api/admin/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: true }),
      })
      fetchComments()
    } catch (error) {
      console.error('Error approving comment:', error)
    }
  }

  const rejectComment = async (id: string) => {
    try {
      await fetch('/api/admin/blog/comments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: false }),
      })
      fetchComments()
    } catch (error) {
      console.error('Error rejecting comment:', error)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      await fetch(`/api/admin/blog/comments?id=${id}`, {
        method: 'DELETE',
      })
      fetchComments()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const getAuthorName = (comment: CommentWithRelations) => {
    if (comment.member) {
      return `${comment.member.first_name} ${comment.member.last_name}`
    }
    return comment.guest_name || 'Anonymous'
  }

  const getAuthorEmail = (comment: CommentWithRelations) => {
    if (comment.member) {
      return comment.member.email
    }
    return comment.guest_email || ''
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/blog">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
          <h1 className="text-3xl font-black">
            <span className="text-white">COMMENTS</span>
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'pending' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-zinc-500">Loading...</div>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-zinc-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p>{filter === 'pending' ? 'No pending comments' : 'No comments yet'}</p>
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-bold text-white">{getAuthorName(comment)}</span>
                      {comment.member ? (
                        <Badge variant="success">Member</Badge>
                      ) : (
                        <Badge variant="default">Guest</Badge>
                      )}
                      {comment.is_approved ? (
                        <Badge variant="success">Approved</Badge>
                      ) : (
                        <Badge variant="amber">Pending</Badge>
                      )}
                    </div>
                    {getAuthorEmail(comment) && (
                      <p className="text-sm text-zinc-500">{getAuthorEmail(comment)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!comment.is_approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => approveComment(comment.id)}
                        title="Approve"
                      >
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                    )}
                    {comment.is_approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectComment(comment.id)}
                        title="Unapprove"
                      >
                        <X className="w-4 h-4 text-amber-500" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteComment(comment.id)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <p className="text-zinc-300 mb-3">{comment.content}</p>

                <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                  <span>{formatDate(comment.created_at)}</span>
                  {comment.post && (
                    <span>
                      On: <Link href={`/blog/${comment.post.slug}`} className="text-white hover:underline">{comment.post.title}</Link>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
