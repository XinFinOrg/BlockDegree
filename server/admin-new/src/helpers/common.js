import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const fileExtension = ".xlsx";

export const AoaToSheet = (aoa, fileName) => {
  let worksheet = XLSX.utils.aoa_to_sheet(aoa);
  let new_workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(new_workbook, worksheet, "SheetJS");
  const excelBuffer = XLSX.write(new_workbook, {
    bookType: "xlsx",
    type: "array",
  });
  const blobData = new Blob([excelBuffer], { type: fileType });
  saveAs(blobData, fileName + fileExtension);
};
