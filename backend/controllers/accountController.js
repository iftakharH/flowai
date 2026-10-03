const Account = require('../models/Account.js');
const { listAccounts } = require('../services/accountService.js');

const getAccounts = async (req, res, next) => { try { res.json(await listAccounts(req.user._id)); } catch (error) { next(error); } };
const createAccount = async (req, res, next) => { try { res.status(201).json(await Account.create({ ...req.body, user: req.user._id })); } catch (error) { next(error); } };
const updateAccount = async (req, res, next) => { try { const account = await Account.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, { new: true, runValidators: true }); if (!account) return res.status(404).json({ message: 'Account not found' }); res.json(account); } catch (error) { next(error); } };
const deleteAccount = async (req, res, next) => { try { await Account.deleteOne({ _id: req.params.id, user: req.user._id }); res.json({ message: 'Account removed' }); } catch (error) { next(error); } };

module.exports = { getAccounts, createAccount, updateAccount, deleteAccount };
