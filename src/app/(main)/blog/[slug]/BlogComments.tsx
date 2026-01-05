'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
import { MessageSquare, User } from 'lucide-react'

interface Comment {
  id: string
  content: string
  guest_name?: string
  created_at: string
  member?: {
    id: string
    first_name: string
    last_name: string
    profile_photo_url?: string
  }
}

interface BlogCommentsProps {
  postSlug: string
  initialComments: Comment[]
}

export default function BlogComments({ postSlug, initialComments }: BlogCommentsProps) {
  const { member } = useAuthStore()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [content, setContent] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) return

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch(`/api/blog/${postSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setContent('')
        setGuestName('')
        setGuestEmail('')
        setMessage('Your comment has been submitted and is awaiting approval.')
      } else {
        setMessage(data.error || 'Failed to submit comment')
      }
    } catch (error) {
      setMessage('Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <MessageSquare className="w-6 h-6" />
        Comments ({comments.length})
      </h2>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-zinc-500 mb-8">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-6 mb-8">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-zinc-900 border border-zinc-800 p-4">
              <div className="flex items-start gap-3">
                {comment.member?.profile_photo_url ? (
                  <img
                    src={comment.member.profile_photo_url}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-zinc-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white">
                      {comment.member
                        ? `${comment.member.first_name} ${comment.member.last_name}`
                        : comment.guest_name || 'Anonymous'}
                    </span>
                    <span className="text-sm text-zinc-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-zinc-300">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Form */}
      <div className="bg-zinc-900 border border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Leave a Comment</h3>

        {message && (
          <div className={`p-3 mb-4 text-sm ${message.includes('awaiting') ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!member && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                placeholder="Your name"
              />
              <Input
                label="Email (optional)"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
          )}

          {member && (
            <p className="text-sm text-zinc-500">
              Commenting as <span className="text-white font-medium">{member.first_name} {member.last_name}</span>
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Comment
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[120px] px-4 py-3 bg-black border border-zinc-700 text-white focus:outline-none focus:border-white transition-colors resize-y"
              placeholder="Share your thoughts..."
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Comments are moderated and will appear after approval.
            </p>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Comment
            </Button>
          </div>
        </form>
      </div>
    </section>
  )
}
