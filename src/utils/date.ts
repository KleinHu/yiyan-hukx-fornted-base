import dayjs from 'dayjs';

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式，默认 YYYY-MM-DD HH:mm:ss
 */
export function formatDate(
  date?: string | Date | number,
  format = 'YYYY-MM-DD HH:mm:ss'
) {
  if (!date) return '-';
  return dayjs(date).format(format);
}

/**
 * 格式化日期
 * @param date 日期
 */
export function formatDateOnly(date?: string | Date | number) {
  return formatDate(date, 'YYYY-MM-DD');
}
