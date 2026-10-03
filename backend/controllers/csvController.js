const fs = require('fs');
const csv = require('csv-parser');
const { transactionArraySchema } = require('../utils/validators.js');
const { insertManyTransactions } = require('../services/transactionService.js');

const MAX_CSV_ROWS = 5000;

// Ensures the uploaded temp file is always removed, including on error.
const removeUpload = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (cleanupError) {
    console.error(`Failed to remove temp CSV file: ${cleanupError.message}`);
  }
};

const previewCsv = (req, res, next) => {
  if (!req.file) {
    res.status(400);
    return next(new Error('Please upload a CSV file'));
  }

  const results = [];
  const filePath = req.file.path;
  let settled = false;

  const fail = (error) => {
    if (settled) return;
    settled = true;
    removeUpload(filePath);
    next(error);
  };

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        if (results.length < MAX_CSV_ROWS) {
          results.push(data);
        }
      })
      .on('end', () => {
        if (settled) return;
        settled = true;
        removeUpload(filePath);

        const columns = results.length > 0 ? Object.keys(results[0]) : [];

        res.json({
          columns,
          previewRows: results.slice(0, 5),
          // Frontend maps columns and sends the parsed rows back on import.
          fullData: results,
        });
      })
      .on('error', fail);
  } catch (error) {
    fail(error);
  }
};

const importCsv = async (req, res, next) => {
  try {
    const { mappedData } = req.body;

    if (!mappedData || !Array.isArray(mappedData)) {
      res.status(400);
      throw new Error('Invalid data format');
    }

    // Validate every row before it reaches the database.
    const parsed = transactionArraySchema.safeParse(mappedData);
    if (!parsed.success) {
      res.status(400);
      const firstIssue = parsed.error.issues[0];
      const path = firstIssue.path.length ? ` (row ${firstIssue.path.join('.')})` : '';
      throw new Error(`Invalid CSV data${path}: ${firstIssue.message}`);
    }

    const inserted = await insertManyTransactions(req.user._id, parsed.data);
    res.status(201).json({ message: 'Import successful', count: inserted.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewCsv,
  importCsv,
};
