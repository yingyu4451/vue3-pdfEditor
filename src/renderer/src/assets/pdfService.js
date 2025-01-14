import { getDocument } from 'pdfjs-dist'
const pdfService = {
  async loadPdf(url) {
    console.log("loadPdf",url)
    return await getDocument(url).promise
  },
  async getPage(pdf, pageNum) {
    console.log(pdf)
    return await pdf.getPage("getPage",pageNum)
  }
}
export default pdfService
