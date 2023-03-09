import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";
import { pipeline } from "stream";
import { promisify } from "util";
import { getPDFWritableStream } from "./fs-tools.js";

export const blogPostToPDF = async (blogPost) => {
  const coverURLToBase64 = await imageToBase64(blogPost.cover);

  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };
  const printer = new PdfPrinter(fonts);

  const docDefinition = {
    content: [
      {
        image: `data:image/jpeg;base64,${coverURLToBase64}`,
        width: 350,
        alignment: "center",
      },
      {
        text: [blogPost.title],
        bold: true,
        margin: [0, 20],
        fontSize: 24,
      },
      {
        text: [blogPost.content],
        fontSize: 16,
      },
    ],
    defaultStyle: {
      font: "Helvetica",
      alignment: "left",
    },
  };

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {});
  pdfReadableStream.end();

  return pdfReadableStream;
};

export const blogPostToPDFAsync = async (blogPost) => {
  const source = await blogPostToPDF();
  const destination = getPDFWritableStream();
  const promiseBasedPipeline = promisify(pipeline);
  await promiseBasedPipeline(source, destination);
};
