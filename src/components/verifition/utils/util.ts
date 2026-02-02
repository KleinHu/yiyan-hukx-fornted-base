export function resetSize(vm: any) {
  let imgWidth = 0;
  let imgHeight = 0;
  let barWidth = 0;
  let barHeight = 0; // 图片的宽度、高度，移动条的宽度、高度

  const theWindow = window as any;
  const parentWidth = vm.$el.parentNode.offsetWidth || theWindow.offsetWidth;
  const parentHeight = vm.$el.parentNode.offsetHeight || theWindow.offsetHeight;
  if (vm.imgSize.width.indexOf('%') !== -1) {
    imgWidth = (Number(vm.imgSize.width) / 100) * parentWidth;
  } else {
    // 形如'100px'
    imgWidth = Number(vm.imgSize.width.replace('px', ''));
  }

  if (vm.imgSize.height.indexOf('%') !== -1) {
    imgHeight = (Number(vm.imgSize.height) / 100) * parentHeight;
  } else {
    imgHeight = Number(vm.imgSize.height.replace('px', ''));
  }

  if (vm.barSize.width.indexOf('%') !== -1) {
    barWidth = (Number(vm.barSize.width) / 100) * parentWidth;
  } else {
    barWidth = Number(vm.barSize.width.replace('px', ''));
  }

  if (vm.barSize.height.indexOf('%') !== -1) {
    barHeight = (Number(vm.barSize.height) / 100) * parentHeight;
  } else {
    barHeight = Number(vm.barSize.height.replace('px', ''));
  }

  return {
    imgWidth,
    imgHeight,
    barWidth,
    barHeight,
  };
}

export const CODE_CHARS =
  '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// export const _code_chars = [
//   1,
//   2,
//   3,
//   4,
//   5,
//   6,
//   7,
//   8,
//   9,
//   'a',
//   'b',
//   'c',
//   'd',
//   'e',
//   'f',
//   'g',
//   'h',
//   'i',
//   'j',
//   'k',
//   'l',
//   'm',
//   'n',
//   'o',
//   'p',
//   'q',
//   'r',
//   's',
//   't',
//   'u',
//   'v',
//   'w',
//   'x',
//   'y',
//   'z',
//   'A',
//   'B',
//   'C',
//   'D',
//   'E',
//   'F',
//   'G',
//   'H',
//   'I',
//   'J',
//   'K',
//   'L',
//   'M',
//   'N',
//   'O',
//   'P',
//   'Q',
//   'R',
//   'S',
//   'T',
//   'U',
//   'V',
//   'W',
//   'X',
//   'Y',
//   'Z',
// ];
export const CODE_COLOR1 = ['#fffff0', '#f0ffff', '#f0fff0', '#fff0f0'];
export const CODE_COLOR2 = [
  '#FF0033',
  '#006699',
  '#993366',
  '#FF9900',
  '#66CC66',
  '#FF33CC',
];
