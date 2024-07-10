var express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse');
const { writeToPath } = require('@fast-csv/format');

var app = express();

fs.createReadStream('./example.csv');
const data = [];
// Regex patterns for transformations
const pattern1 = /(?<=\w),(?=\w)/g; // Add newline after comma with value before and after
const pattern2 = /,(?!\w)/g; // Remove comma without value after
const pattern3 = /(?<!\w),/g; // Remove comma without value before

app.get('/', async function (req, res) {
  fs.createReadStream('./example.csv')
    .pipe(
      parse({
        delimiter: ',',
        columns: true,
        ltrim: true,
      })
    )
    .on('data', function (row) {
      // This will push the object row into the array
      let modifiedObject= {}
      for (const key in row) {
        if (row[key].includes(',')) {
          let result = row[key]
            .replace(pattern1, ',\n')
            .replace(pattern2, '')
            .replace(pattern3, '');
          modifiedObject[key] = result;
        } else {
          modifiedObject[key] = row[key] ? row[key].trim() : '';
        }
      }
      data.push(modifiedObject);
    })
    .on('error', function (error) {
      console.log(error.message);
    })
    .on('end', function () {
      const path = `${__dirname}/people.csv`;
      const options = { headers: true, quoteColumns: true };

      writeToPath(path, data, options)
        .on('error', (err) => console.error(err))
        .on('finish', () => console.log('Done writing.'));
      console.log(data);
    });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
