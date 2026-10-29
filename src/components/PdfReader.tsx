import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "./ui/button";

export function PdfReader({ url }: { url: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [page, setPage] = useState(1); const [count, setCount] = useState(0); const [zoom, setZoom] = useState(1); const [error, setError] = useState(""); const [busy, setBusy] = useState(true);
  const [document, setDocument] = useState<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  useEffect(() => {
    let cancelled = false;
    let task: import("pdfjs-dist").PDFDocumentLoadingTask | undefined;
    setPage(1); setError(""); setBusy(true); setDocument(null);
    import("pdfjs-dist").then(async pdf => {
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      if (cancelled) return;
      pdf.GlobalWorkerOptions.workerSrc = worker.default;
      task = pdf.getDocument({ url, isEvalSupported: false });
      const doc = await task.promise;
      if (!cancelled) { setDocument(doc); setCount(doc.numPages); }
    }).catch(() => { if (!cancelled) { setError("This PDF could not be opened. It may be damaged or password-protected."); setBusy(false); } });
    return () => { cancelled = true; void task?.destroy(); };
  }, [url]);
  useEffect(() => {
    if (!document) return;
    let cancelled = false;
    let render: import("pdfjs-dist").RenderTask | undefined;
    setBusy(true);
    document.getPage(page).then(pdfPage => {
      const el = canvas.current;
      if (cancelled || !el) return;
      const view = pdfPage.getViewport({ scale: 1.4 * zoom });
      el.width = view.width; el.height = view.height;
      render = pdfPage.render({ canvas: el, viewport: view });
      return render.promise;
    }).then(() => { if (!cancelled) setBusy(false); }).catch(() => { if (!cancelled) { setError("Could not render this page."); setBusy(false); } });
    return () => { cancelled = true; render?.cancel(); };
  }, [document, page, zoom]);
  return <div>
    <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center justify-center gap-2 bg-card py-2">
      <Button variant="ghost" size="icon" title="Previous page" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft /></Button>
      <span className="text-sm">Page {page} of {count || "…"}</span>
      <Button variant="ghost" size="icon" title="Next page" aria-label="Next page" disabled={page >= count} onClick={() => setPage(p => p + 1)}><ChevronRight /></Button>
      <Button variant="ghost" size="icon" title="Zoom out" aria-label="Zoom out" disabled={zoom <= .6} onClick={() => setZoom(z => z - .2)}><ZoomOut /></Button>
      <Button variant="ghost" size="icon" title="Zoom in" aria-label="Zoom in" disabled={zoom >= 2} onClick={() => setZoom(z => z + .2)}><ZoomIn /></Button>
    </div>
    {error ? <p role="alert" className="text-destructive">{error}</p> : <><div className="overflow-auto"><canvas ref={canvas} aria-label={`PDF page ${page}`} className="mx-auto max-w-none" /></div>{busy && <Loader2 aria-label="Loading PDF" className="mx-auto mt-4 animate-spin text-primary" />}</>}
  </div>;
}