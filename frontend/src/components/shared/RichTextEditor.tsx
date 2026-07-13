import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  maxLength?: number;
}

export function RichTextEditor({ value, onChange, maxLength = 10000 }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const charCount = editor?.getText().length ?? 0;

  return (
    <div style={{ border: '1px solid #d1d5db', borderRadius: '6px' }}>
      <div style={{ padding: '10px', minHeight: '120px' }}>
        <EditorContent editor={editor} />
      </div>
      <div style={{
        borderTop: '1px solid #e5e7eb', padding: '6px 10px', fontSize: '0.75rem',
        color: charCount > maxLength ? '#dc2626' : '#6b7280', textAlign: 'right',
      }}>
        {charCount} / {maxLength}
      </div>
    </div>
  );
}