import { readFileSync, writeFileSync } from 'fs';

// Read the JSON file
const filePath = './base/mark.json';
const fileContent = readFileSync(filePath, 'utf-8');
const data = JSON.parse(fileContent);

// Fix each record's key property by replacing ' with {}
const fixedData = data.map((record: any) => {
  if (record.key && typeof record.key === 'string') {
    return {
      ...record,
      key: record.key.replace(/'/g, '{}')
    };
  }
  return record;
});

// Write the fixed data back to the file
writeFileSync(filePath, JSON.stringify(fixedData, null, 2));

console.log('Successfully fixed all key properties in mark.json');