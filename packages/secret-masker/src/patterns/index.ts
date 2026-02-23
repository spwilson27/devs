import { AWS_PATTERNS } from './aws';
import { GCP_PATTERNS } from './gcp';
import { GITHUB_PATTERNS } from './github';
import { PEM_PATTERNS } from './pem';
import { JWT_PATTERNS } from './jwt';
import { DATABASE_PATTERNS } from './database';
import { GENERIC_PATTERNS } from './generic';
import { TOKENS_PATTERNS } from './tokens';
import { SSH_HEX_PATTERNS } from './ssh_hex';
import { BULK_PATTERNS } from './bulk';

export const PATTERNS = [
  ...AWS_PATTERNS,
  ...GCP_PATTERNS,
  ...GITHUB_PATTERNS,
  ...PEM_PATTERNS,
  ...JWT_PATTERNS,
  ...DATABASE_PATTERNS,
  ...GENERIC_PATTERNS,
  ...TOKENS_PATTERNS,
  ...SSH_HEX_PATTERNS,
  ...BULK_PATTERNS,
];
