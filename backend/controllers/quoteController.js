const Quote = require('../models/Quote.js');

const fallbackQuotes = [
  { text: 'Small choices become a quiet kind of freedom.', author: 'FlowAI' },
  { text: 'A budget is not a restriction. It is a plan for what matters.', author: 'FlowAI' },
  { text: 'Clarity is a better goal than perfection.', author: 'FlowAI' },
  { text: 'Save first for the life you want to keep.', author: 'FlowAI' },
  { text: 'Your future self deserves a little room today.', author: 'FlowAI' },
  { text: 'A number is useful when it helps you choose.', author: 'FlowAI' },
  { text: 'Progress is often one ordinary decision repeated.', author: 'FlowAI' },
  { text: 'Spend with intention. Save with patience.', author: 'FlowAI' },
  { text: 'The best financial plan is one you can understand.', author: 'FlowAI' },
  { text: 'Make money a tool, not a source of noise.', author: 'FlowAI' },
];

const listQuotes = async (req, res, next) => {
  try {
    const quotes = await Quote.find({ active: true }).sort({ createdAt: 1 }).lean();
    res.json(quotes.length ? quotes : fallbackQuotes);
  } catch (error) { next(error); }
};

const createQuote = async (req, res, next) => {
  try { res.status(201).json(await Quote.create(req.body)); } catch (error) { next(error); }
};
const updateQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (error) { next(error); }
};
const deleteQuote = async (req, res, next) => {
  try { await Quote.findByIdAndDelete(req.params.id); res.json({ message: 'Quote removed' }); } catch (error) { next(error); }
};

module.exports = { listQuotes, createQuote, updateQuote, deleteQuote };
