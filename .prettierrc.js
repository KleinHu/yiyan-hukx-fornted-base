module.exports = {
  // 使用 2 个空格缩进
  tabWidth: 2,
  // 行尾需要有分号
  semi: true,
  // 一行最多 80 字符
  printWidth: 80,
  // 使用单引号
  singleQuote: true,
  // 对象的 key 仅在必要时用引号
  quoteProps: 'as-needed',
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // css:根据显示样式决定 html 要不要折行(display=inline尖括号换行, block不换行)
  // strict: 所有空格都是有意义的(会导致后尖括号换行)
  // ignore: 所有空格都无意义
  htmlWhitespaceSensitivity: 'css',
  // vue 文件中的 script 和 style 内缩进
  vueIndentScriptAndStyle: true,
  // 换行符使用 lf
  endOfLine: 'auto',
};
