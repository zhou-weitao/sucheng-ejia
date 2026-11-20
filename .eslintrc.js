module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    wx: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    Behavior: 'readonly'
  },
  rules: {
    // 错误级别 - 必须修复
    'no-undef': 'error',
    'no-unused-vars': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-empty': 'error',
    'no-extra-semi': 'error',
    'no-func-assign': 'error',
    'no-unreachable': 'error',
    'use-isnan': 'error',
    'valid-typeof': 'error',
    
    // 警告级别 - 建议修复
    'no-console': 'warn',
    'no-debugger': 'warn',
    'no-alert': 'warn',
    'no-eval': 'warn',
    
    // 代码风格
    'indent': ['warn', 2],
    'quotes': ['warn', 'single'],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'no-trailing-spaces': 'warn',
    'key-spacing': 'warn',
    'comma-spacing': 'warn'
  }
};
