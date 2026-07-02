interface PDFTextItem {
  str: string;
}

interface PDFPage {
  getTextContent: () => Promise<{ items: PDFTextItem[] }>;
}

interface PDFDocument {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PDFPage>;
}

interface PDFJS {
  getDocument: (args: { data: Uint8Array }) => { promise: Promise<PDFDocument> };
  GlobalWorkerOptions: { workerSrc: string };
}

export async function extractTextFromPdf(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (!event.target?.result) {
        reject(new Error("File result is empty"));
        return;
      }
      const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
      
      try {
        // Load pdfjs dynamically from CDN to avoid huge bundle issues and node-canvas build errors
        const globalWindow = window as unknown as Record<string, PDFJS | undefined>;
        const pdfjsLib = globalWindow["pdfjs-dist/build/pdf"];
        
        if (!pdfjsLib) {
          // Dynamically load the library script if not already on the page
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
          document.head.appendChild(script);
          
          script.onload = async () => {
            // Configure worker
            const pdfjsLibLoaded = globalWindow["pdfjs-dist/build/pdf"];
            if (!pdfjsLibLoaded) {
              reject(new Error("Failed to load PDF library script."));
              return;
            }
            pdfjsLibLoaded.GlobalWorkerOptions.workerSrc = 
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
            
            try {
              const text = await parsePdfData(typedArray, pdfjsLibLoaded);
              resolve(text);
            } catch (err) {
              reject(err);
            }
          };
          script.onerror = () => {
            reject(new Error("Failed to load PDF parsing library from CDN."));
          };
        } else {
          const text = await parsePdfData(typedArray, pdfjsLib);
          resolve(text);
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

async function parsePdfData(typedArray: Uint8Array, pdfjsLib: PDFJS): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({ data: typedArray });
  const pdf = await loadingTask.promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
