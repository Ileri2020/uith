'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Megaphone } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAppContext } from '@/hooks/useAppContext'

export default function AnnouncementCreator({ refreshData }: { refreshData?: () => void }) {
    const { user } = useAppContext()
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handlePost = async (type: 'post' | 'announcement') => {
        if (!title || !description) return
        setLoading(true)
        try {
            const res = await fetch('/api/dbhandler?model=post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description,
                    type,
                    authorId: user.id
                })
            })
            if (res.ok) {
                toast({ title: `${type === 'announcement' ? 'Announcement' : 'Post'} created!` })
                setTitle('')
                setDescription('')
                if (refreshData) refreshData()
            }
        } catch (error) {
            toast({ title: 'Error creating post' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="shadow-lg border-none bg-indigo-900 text-white overflow-hidden">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5" /> Create Announcement / Post
                </CardTitle>
                <CardDescription className="text-indigo-200">Share updates with patients and colleagues</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    placeholder="Title"
                    className="bg-white/10 border-white/20 text-white placeholder:text-indigo-300"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <Textarea
                    placeholder="What's on your mind? (Tips, news, etc.)"
                    className="bg-white/10 border-white/20 text-white placeholder:text-indigo-300 min-h-[100px]"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                />
                <div className="flex gap-3">
                    <Button className="flex-1 bg-white text-indigo-900 hover:bg-slate-100 font-bold" disabled={loading} onClick={() => handlePost('announcement')}>
                        Post Announcement
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10" disabled={loading} onClick={() => handlePost('post')}>
                        Regular Post
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
