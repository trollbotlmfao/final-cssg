"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

interface User {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
}

interface UserMentionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export default function UserMentionsInput({
  value,
  onChange,
  placeholder = "Write a caption...",
  className = "",
  rows = 3,
}: UserMentionsInputProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  
  // Calculate the mention query and cursor position based on input value
  useEffect(() => {
    if (!inputRef.current) return;
    
    const cursorPos = inputRef.current.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Find if we're in a mention
    const textBeforeCursor = value.substring(0, cursorPos);
    const mentionMatch = /@([a-zA-Z0-9_]*)$/.exec(textBeforeCursor);
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1]);
      setShowSuggestions(true);
    } else {
      setMentionQuery("");
      setShowSuggestions(false);
    }
  }, [value, cursorPosition]);
  
  // Fetch users when mentionQuery changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (mentionQuery.length < 1) {
        setSuggestedUsers([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, full_name')
        .ilike('username', `${mentionQuery}%`)
        .limit(5);
        
      if (!error && data) {
        setSuggestedUsers(data as User[]);
      } else {
        setSuggestedUsers([]);
      }
    };
    
    fetchUsers();
  }, [mentionQuery, supabase]);
  
  const insertMention = (username: string) => {
    if (!inputRef.current) return;
    
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    // Replace the partial @mention with the full username
    const mentionMatch = /@([a-zA-Z0-9_]*)$/.exec(textBeforeCursor);
    if (mentionMatch) {
      const mentionStart = textBeforeCursor.lastIndexOf('@');
      const newTextBeforeCursor = textBeforeCursor.substring(0, mentionStart);
      const newValue = `${newTextBeforeCursor}@${username} ${textAfterCursor}`;
      onChange(newValue);
      
      // Set cursor position after the inserted mention
      const newCursorPos = newTextBeforeCursor.length + username.length + 2; // +2 for @ and space
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    
    setShowSuggestions(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle keyboard navigation through suggestions
    if (showSuggestions && suggestedUsers.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault(); // Prevent cursor movement in textarea
      } else if (e.key === 'Enter' && suggestedUsers.length > 0) {
        e.preventDefault(); // Prevent new line in textarea
        insertMention(suggestedUsers[0].username);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };
  
  // Format the text with styled mentions
  const getFormattedText = () => {
    // This would be implemented for a display version, not the input itself
    return value.replace(/@(\w+)/g, '<span class="text-primary">@$1</span>');
  };
  
  return (
    <div className={`relative ${className}`}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          // Delay hiding suggestions to allow for clicks
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-background px-3 py-2 text-sm`}
        rows={rows}
      />
      
      {showSuggestions && suggestedUsers.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-background border rounded-md shadow-lg">
          {suggestedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer border-b last:border-0"
              onClick={() => insertMention(user.username)}
            >
              <div className="h-8 w-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10 text-xs font-medium text-primary">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">{user.username}</div>
                {user.full_name && (
                  <div className="text-xs text-muted-foreground">{user.full_name}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-1 text-xs text-muted-foreground">
        Type @ to mention users
      </div>
    </div>
  );
} 