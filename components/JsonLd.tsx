/** Renders a JSON-LD <script> tag. Safe from XSS because the payload is
 *  always a JSON.stringify() of structured data we constructed ourselves —
 *  never raw user/admin input passed through unescaped. */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
