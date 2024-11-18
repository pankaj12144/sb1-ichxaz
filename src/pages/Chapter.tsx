import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Chapter } from '../types';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ChapterPage() {
  const { novelId, chapterId } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<any>(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [nextChapter, setNextChapter] = useState<string | null>(null);
  const [prevChapter, setPrevChapter] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!novelId || !chapterId) return;

      try {
        // Fetch novel data
        const { data: novelData, error: novelError } = await supabase
          .from('Novels')
          .select('*')
          .eq('novel_id', novelId)
          .single();

        if (novelError) throw novelError;
        setNovel(novelData);

        // Fetch chapter data
        const { data: chapterData, error: chapterError } = await supabase
          .from('Chapters')
          .select('*')
          .eq('chapter_id', chapterId)
          .single();

        if (chapterError) throw chapterError;
        setChapter(chapterData);

        // Fetch adjacent chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('Chapters')
          .select('chapter_id, chapter_number')
          .eq('novel_id', novelId)
          .order('chapter_number', { ascending: true });

        if (chaptersError) throw chaptersError;

        const currentIndex = chaptersData.findIndex(ch => ch.chapter_id === chapterId);
        if (currentIndex > 0) {
          setPrevChapter(chaptersData[currentIndex - 1].chapter_id);
        }
        if (currentIndex < chaptersData.length - 1) {
          setNextChapter(chaptersData[currentIndex + 1].chapter_id);
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [novelId, chapterId]);

  useEffect(() Continuing the Chapter.tsx file content from where we left off:

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || hasReachedBottom) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if (isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        // Increment chapter views only when user reaches the bottom
        if (novelId && chapterId) {
          supabase.rpc('increment_chapter_views', { chapter_id: chapterId });
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasReachedBottom, novelId, chapterId]);

  const isAuthor = userProfile?.user_id === novel?.upload_by;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Chapter {chapter.chapter_number}</h1>
          {isAuthor && (
            <button
              onClick={() => navigate(`/write/chapter/${chapterId}/edit`)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
            >
              <Edit className="h-5 w-5" />
              Edit Chapter
            </button>
          )}
        </div>
        <h2 className="text-xl text-gray-600 mb-8">{chapter.title}</h2>
        
        <div 
          ref={contentRef} 
          className="prose max-w-none overflow-y-auto max-h-[70vh] mb-8"
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex justify-between items-center mt-8">
          {prevChapter ? (
            <button
              onClick={() => navigate(`/novel/${novelId}/chapter/${prevChapter}`)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
            >
              <ChevronLeft className="h-5 w-5" />
              Previous Chapter
            </button>
          ) : (
            <div />
          )}
          
          {nextChapter && (
            <button
              onClick={() => navigate(`/novel/${novelId}/chapter/${nextChapter}`)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
            >
              Next Chapter
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}