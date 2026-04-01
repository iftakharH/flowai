const fs = require('fs');
const csv = require('csv-parser');
const { insertManyTransactions } = require('../services/transactionService.js');

const previewCsv = (req, res, next) => {
  if (!req.file) {
    res.status(400);
    return next(new Error('Please upload a CSV file'));
  }

  const results = [];
  const filePath = req.file.path;

  // Just read first 5-10 rows and returning column names
  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      // Remove file after reading (or keep it if your flow requires storing it until import)
      // Since this is a preview, we can just send the columns and a few rows
      const columns = results.length > 0 ? Object.keys(results[0]) : [];
      const previewRows = results.slice(0, 5);

      // Optionally delete the file to save space if the frontend sends the whole parsed data back
      // Since standard flow maps columns and sends data back, we can delete the server file
      fs.unlinkSync(filePath);

      res.json({
        columns,
        previewRows,
        fullData: results, // Sending full data to frontend so it can map and return
      });
    })
    .on('error', (err) => {
      next(err);
    });
};

const importCsv = async (req, res, next) => {
  try {
    const { mappedData } = req.body;
    
    if (!mappedData || !Array.isArray(mappedData)) {
      res.status(400);
      throw new Error('Invalid data format');
    }

    const inserted = await insertManyTransactions(req.user._id, mappedData);
    res.status(201).json({ message: 'Import successful', count: inserted.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewCsv,
  importCsv,
};
