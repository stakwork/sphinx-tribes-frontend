import { generatePlaywrightTest } from '../utils/staktrakUtils';

export const staktrakService = {
  /**
   * @param url
   * @param trackingData
   * @returns
   */
  generateTest(url: string, trackingData: any): string {
    return generatePlaywrightTest(url, trackingData);
  }
};
