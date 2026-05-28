"use client";
import React, { useState } from 'react'
import { Citation } from '@/types';
import { Button } from '../ui/button';
import { BookOpen, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';

const CitationsList = (
    { citations = [] }: { citations?: Citation[] }
) => {
    const [openCitations, setOpenCitations] = useState<boolean>(false)
    
    if (citations.length === 0) return null;

    return (
        <div>
            <Button variant="ghost" size="sm" className="my-4 text-primary border border-primary/30 hover:bg-sidebar-accent hover:text-primary hover:cursor-pointer" onClick={() => setOpenCitations(!openCitations)}>
                <BookOpen />{`Sources (${citations.length})`}{openCitations ? <ChevronUp /> : <ChevronDown />}
            </Button>
            {openCitations && <div className='ml-1'>
                {citations.map((citation, index) => (
                    <div key={index} className="flex gap-2 items-start ml-2.5 pt-2 text-xs text-muted-foreground">
                        <CornerDownRight size={12} className="shrink-0" />{citation.source}
                    </div>
                ))}
            </div>
            }
        </div>
    )
}

export default CitationsList