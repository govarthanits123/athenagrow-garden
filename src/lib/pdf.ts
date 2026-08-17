export type ExtractResult = {
  name: string;
  text: string;
};

const MAX_CHARS = 60000;

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  const workerUrl = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buffer) }).promise;
  const chunks: string[] = [];
  for (let page = 1; page <= doc.numPages; page++) {
    const p = await doc.getPage(page);
    const content = await p.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (pageText) chunks.push(pageText);
  }
  await doc.cleanup();
  return chunks.join("\n").slice(0, MAX_CHARS);
}

export async function extractFile(file: File): Promise<ExtractResult> {
  const lower = file.name.toLowerCase();
  const isPdf = lower.endsWith(".pdf") || file.type === "application/pdf";
  const isText =
    lower.endsWith(".txt") || lower.endsWith(".md") || file.type.startsWith("text/");

  if (!isPdf && !isText) {
    throw new Error(`"${file.name}" is not supported. Please upload a PDF or TXT file.`);
  }

  if (isPdf) {
    let text = "";
    try {
      text = await extractTextFromPdf(file);
    } catch {
      throw new Error(
        "Unable to read this PDF. Please try another PDF or paste the syllabus text.",
      );
    }
    if (text.replace(/\s/g, "").length < 40) {
      throw new Error(
        "Unable to read this PDF. Please try another PDF or paste the syllabus text.",
      );
    }
    return { name: file.name, text };
  }

  const text = (await file.text()).slice(0, MAX_CHARS);
  if (text.trim().length < 10) {
    throw new Error(`"${file.name}" looks empty. Please choose another file.`);
  }
  return { name: file.name, text };
}
