// TextEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { useEffect } from 'react';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onEnter?: () => void;
  onBackspace?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const TextEditor = ({
  content,
  onChange,
  onEnter,
  onBackspace,
  onFocus,
  onBlur
}: TextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none'
      },
      handleKeyDown: (view, event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          onEnter?.();
          return true;
        }
        if (event.key === 'Backspace' && view.state.doc.textContent === '') {
          onBackspace?.();
          return true;
        }
        return false;
      }
    }
  });

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML();
      if (content !== currentContent) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  return (
    <EditorContent
      editor={editor}
      onFocus={onFocus}
      onBlur={onBlur}
      className="w-full"
    />
  );
};

export default TextEditor;