export enum AuthEnum {
  HASH_ALGORITHM = 'sha512',
  SALT_ROUND = parseInt(process.env.HASH_SALT_ROUND),
  EXP_TIME_RESET_PASSWD = '0.2 * 60000', // 30 min
}
