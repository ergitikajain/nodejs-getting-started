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
 * Create a new transaction.
 */
router.post('/', async (req, res) => {
  const transaction = await db.create(req.body);
  res.json(transaction);
});

/**
 * GET /api/transactions/:id
 *
 * Retrieve a transaction.
 */
router.get('/:transaction', async (req, res) => {
  const transaction = await db.read(req.params.transaction);
  res.json(transaction);
});

/**
 * PUT /api/transactions/:id
 *
 * Update a transaction.
 */
router.put('/:transaction', async (req, res) => {
  const transaction = await db.update(req.params.transaction, req.body);
  res.json(transaction);
});

/**
 * DELETE /api/transactions/:id
 *
 * Delete a transaction.
 */
router.delete('/:transaction', async (req, res) => {
  await db.delete(req.params.transaction);
  res.status(200).send('OK');
});

module.exports = router;
