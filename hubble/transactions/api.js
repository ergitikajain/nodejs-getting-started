// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./firestore');

const router = express.Router();

// Automatically parse request body as JSON
router.use(bodyParser.json());

/**
 * GET /api/transactions
 *
 * Retrieve a page of transactions (up to ten at a time).
 */
router.get('/', async (req, res) => {
  const {transactions, nextPageToken} = await db.list(10, req.query.pageToken);
  res.json({
    items: transactions,
    nextPageToken,
  });
});

/**
 * POST /api/transactions
 *
 * Create a new book.
 */
router.post('/', async (req, res) => {
  const book = await db.create(req.body);
  res.json(book);
});

/**
 * GET /api/transactions/:id
 *
 * Retrieve a book.
 */
router.get('/:book', async (req, res) => {
  const book = await db.read(req.params.book);
  res.json(book);
});

/**
 * PUT /api/transactions/:id
 *
 * Update a book.
 */
router.put('/:book', async (req, res) => {
  const book = await db.update(req.params.book, req.body);
  res.json(book);
});

/**
 * DELETE /api/transactions/:id
 *
 * Delete a book.
 */
router.delete('/:book', async (req, res) => {
  await db.delete(req.params.book);
  res.status(200).send('OK');
});

module.exports = router;
