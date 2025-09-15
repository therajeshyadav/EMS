const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const {
  generateAttendanceReport,
} = require("../Services/attendanceReportService");
const stream = require("stream");

const exportAttendanceReport = async (req, res) => {
  try {
    console.log("format:", req.params.format);
    console.log("body:", req.body);
    const { startDate, endDate, departmentId } = req.body;
    const { format } = req.params; // csv, excel, pdf

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const { series } = await generateAttendanceReport({
      startDate,
      endDate,
      departmentId,
    });

    // ---- CSV Export ----
    if (format === "csv") {
      const fields = ["date", "Present", "Absent", "Late", "Total"];
      const parser = new Parser({ fields });
      const csv = parser.parse(series);

      res.header("Content-Type", "text/csv");
      res.attachment(`attendance_report_${startDate}_to_${endDate}.csv`);
      return res.send(csv);
    }

    // ---- Excel Export ----
    if (format === "excel") {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      sheet.columns = [
        { header: "Date", key: "date", width: 15 },
        { header: "Present", key: "Present", width: 10 },
        { header: "Absent", key: "Absent", width: 10 },
        { header: "Late", key: "Late", width: 10 },
        { header: "Total", key: "Total", width: 10 },
      ];

      sheet.addRows(series);

      res.header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.attachment(`attendance_report_${startDate}_to_${endDate}.xlsx`);

      return workbook.xlsx.write(res).then(() => res.end());
    }

    // ---- PDF Export ----
    if (format === "pdf") {
      const doc = new PDFDocument();
      res.header("Content-Type", "application/pdf");
      res.attachment(`attendance_report_${startDate}_to_${endDate}.pdf`);

      doc.pipe(res);

      doc.fontSize(18).text("Attendance Report", { align: "center" });
      doc.moveDown();

      // Table header
      doc.fontSize(12).text("Date     Present   Absent   Late   Total");

      series.forEach((row) => {
        doc.text(
          `${row.date}   ${row.Present}   ${row.Absent}   ${row.Late}   ${row.Total}`
        );
      });

      doc.end();
      return;
    }

    return res.status(400).json({
      success: false,
      message: "Invalid format. Use csv | excel | pdf",
    });
  } catch (error) {
    console.error("Export error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Export failed", error: error.message });
  }
};

module.exports = { exportAttendanceReport };
