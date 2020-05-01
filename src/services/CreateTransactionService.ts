import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const categoryRepository = getRepository(Category);
    const transactionRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Insufficient Fund');
    }

    let categoryFind = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryFind) {
      categoryFind = categoryRepository.create({ title: category });

      await categoryRepository.save(categoryFind);
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: categoryFind.id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
