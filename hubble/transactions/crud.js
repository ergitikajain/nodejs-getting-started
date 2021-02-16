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
const images = require('../lib/images');
const db = require('./firestore');

const router = express.Router();

// Automatically parse request body as form data
router.use(bodyParser.urlencoded({extended: false}));

// Set Content-Type for all responses for these routes
router.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

/**
 * GET /transactions
 *
 * Display a page of transactions (up to ten at a time).
 */
router.get('/', async (req, res) => {
  let {transactions, nextPageToken} = await db.list(10, req.query.pageToken);
  res.render('transactions/list.pug', {
    transactions,
    nextPageToken,
  });
});

/**
 * GET /transactions/add
 *
 * Display a form for creating a transaction.
 */
router.get('/add', (req, res) => {
  res.render('transactions/form.pug', {
    transaction: {},
    action: 'Add',
  });
});

/**
 * POST /transactions/add
 *
 * Create a transaction.
 */
// [START add]
router.post(
  '/add',
  images.multer.single('image'),
  images.sendUploadToGCS,
  async (req, res) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
    const savedData = await db.create(data);
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  }
);
// [END add]

/**
 * GET /transactions/:id/edit
 *
 * Display a transaction for editing.
 */
router.get('/:transaction/edit', async (req, res) => {
  const transaction = await db.read(req.params.transaction);
  res.render('transactions/form.pug', {
    transaction,
    action: 'Edit',
  });
});

/**
 * POST /transactions/:id/edit
 *
 * Update a transaction.
 */
router.post(
  '/:transaction/edit',
  images.multer.single('image'),
  images.sendUploadToGCS,
  async (req, res) => {
    let data = req.body;

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      req.body.imageUrl = req.file.cloudStoragePublicUrl;
    }

    const savedData = await db.update(req.params.transaction, data);
    res.redirect(`${req.baseUrl}/${savedData.id}`);
  }
);

/**
 * GET /transactions/:id
 *
 * Display a transaction.
 */
router.get('/:transaction', async (req, res) => {
  const transaction = await db.read(req.params.transaction);
  res.render('transactions/view.pug', {
    transaction,
  });
});

/**
 * GET /transactions/:id/delete
 *
 * Delete a transaction.
 */
router.get('/:transaction/delete', async (req, res) => {
  await db.delete(req.params.transaction);
  res.redirect(req.baseUrl);
});

module.exports = router;
