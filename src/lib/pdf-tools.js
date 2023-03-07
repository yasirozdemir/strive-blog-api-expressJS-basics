import imageToBase64 from "image-to-base64";
import PdfPrinter from "pdfmake";

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
        width: 250,
        height: 200,
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
