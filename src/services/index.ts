export * from './httpClient';
export { authService } from './authService';
export { metaService } from './metaService';
export { testService } from './testService';
export { questionService } from './questionService';

import { authService } from './authService';
import { metaService } from './metaService';
import { testService } from './testService';
import { questionService } from './questionService';

// Backwards-compatibility wrapper
export const apiService = {
  ...authService,
  ...metaService,
  ...testService,
  ...questionService,
};
