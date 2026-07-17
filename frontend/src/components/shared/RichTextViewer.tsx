interface RichTextViewerProps {
  html: string;
}

export function RichTextViewer({ html }: RichTextViewerProps) {
  return (
    <div
      style={{ lineHeight: 1.6, color: '#1f2937' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}