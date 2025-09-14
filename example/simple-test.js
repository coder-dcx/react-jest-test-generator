// Simple test to verify import works
import React from 'react';
import CustDxTreeDataV1 from './CustDxTreeDataV1';

console.log('✅ Import test:');
console.log('  - React imported:', typeof React);
console.log('  - CustDxTreeDataV1 imported:', typeof CustDxTreeDataV1);
console.log('  - CustDxTreeDataV1 defined:', CustDxTreeDataV1 !== undefined);

if (typeof CustDxTreeDataV1 === 'function') {
    console.log('✅ SUCCESS: Component imported correctly!');
} else {
    console.log('❌ FAIL: Component is not a function:', CustDxTreeDataV1);
}