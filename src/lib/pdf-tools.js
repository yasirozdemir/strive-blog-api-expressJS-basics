import PdfPrinter from "pdfmake";

export const blogPostToPDF = (blogPost) => {
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
