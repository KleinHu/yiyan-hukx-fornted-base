/* eslint-disable no-shadow */
export enum SecretLevel {
  '公开' = 10,
  '普通商密' = 20,
  // '受控' = 30,
  '核心商密' = 40,
  '内部' = 50,
  '秘密' = 60,
  '机密' = 70,
}

export enum UserSecretLevel {
  '非涉密' = 50,
  '一般涉密' = 60,
  '重要涉密' = 70,
  '核心涉密' = 80,
}
