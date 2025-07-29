import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { BookOpen, Plus, Calendar } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

interface JournalEntry {
  id: number
  title: string
  content: string
  created_at: string
}

const JournalPage = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    try {
      const response = await axios.get(`${API_URL}/journal`)
      setEntries(response.data)
    } catch (error) {
      console.error('Failed to fetch journal entries:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please fill in both title and content')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(`${API_URL}/journal`, {
        title: newTitle,
        content: newContent
      })
      
      setEntries(prev => [response.data, ...prev])
      setNewTitle('')
      setNewContent('')
      setShowNewEntry(false)
      toast.success('Journal entry created!')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create entry')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journal</h1>
            <p className="text-gray-600 mt-2">
              Capture your thoughts, feelings, and reflections in your personal journal.
            </p>
          </div>
          <Button
            onClick={() => setShowNewEntry(!showNewEntry)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Entry</span>
          </Button>
        </div>

        {showNewEntry && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>New Journal Entry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createEntry} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What's on your mind today?"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <textarea
                    id="content"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Write your thoughts here..."
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Entry'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewEntry(false)
                      setNewTitle('')
                      setNewContent('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No journal entries yet</h3>
                <p className="text-gray-600 mb-4">
                  Start writing your first journal entry to capture your thoughts and feelings.
                </p>
                <Button onClick={() => setShowNewEntry(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{entry.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(entry.created_at)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {entries.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              You have {entries.length} journal {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default JournalPage
