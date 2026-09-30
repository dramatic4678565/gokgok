import "@mosaic/mosaic/index.css";

/**
 * The editor's stylesheet is loaded here rather than inside `MosaicEditor` so
 * it is guaranteed to be present before the client-only editor chunk mounts,
 * and so it is scoped to the board route rather than the whole app.
 */
export default function BoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
