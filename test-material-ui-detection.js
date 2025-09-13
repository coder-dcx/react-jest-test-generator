// Test the dynamic Material-UI version detection
// This is a simple test to verify the logic works correctly

const testPackageJsonV4 = {
  dependencies: {
    "react": "^16.14.0",
    "@material-ui/core": "^4.12.4",
    "@material-ui/icons": "^4.11.3"
  },
  devDependencies: {
    "enzyme": "^3.11.0"
  }
};

const testPackageJsonV5 = {
  dependencies: {
    "react": "^18.0.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0"
  },
  devDependencies: {
    "enzyme": "^3.11.0"
  }
};

const testPackageJsonNoMaterialUI = {
  dependencies: {
    "react": "^18.0.0"
  },
  devDependencies: {
    "enzyme": "^3.11.0"
  }
};

function detectMaterialUIVersion(packageJson) {
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  if (dependencies['@mui/material']) {
    return 'mui';
  } else if (dependencies['@material-ui/core']) {
    return 'material-ui';
  }
  return null;
}

// Test cases
console.log('Testing Material-UI v4 detection:', detectMaterialUIVersion(testPackageJsonV4)); // Should return 'material-ui'
console.log('Testing Material-UI v5 detection:', detectMaterialUIVersion(testPackageJsonV5)); // Should return 'mui'
console.log('Testing no Material-UI detection:', detectMaterialUIVersion(testPackageJsonNoMaterialUI)); // Should return null

// Expected output:
// Testing Material-UI v4 detection: material-ui
// Testing Material-UI v5 detection: mui
// Testing no Material-UI detection: null