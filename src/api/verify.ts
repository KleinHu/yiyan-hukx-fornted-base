import request from '@/utils/request/requestJpaas';

interface CaptchaReq {
  captchaType: 'blockPuzzle' | 'clickWord';
}

interface CaptchaCheckReq {
  captchaType: 'blockPuzzle' | 'clickWord';
  pointJson: string;
  token: string;
}
// 获取验证码
export function getCaptcha(data: CaptchaReq) {
  return request.post('/api/oauth/captcha/get', data);
}

// 校验验证码
export function checkCaptcha(data: CaptchaCheckReq) {
  return request.post('/api/oauth/captcha/check', data);
}
