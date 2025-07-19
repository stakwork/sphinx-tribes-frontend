/**
 * @param {string} url
 * @param {Object} trackingData
 * @returns {string}
 */
export function generatePlaywrightTest(url: string, trackingData: any): string {
  const safeTrackingData = {
    clicks: trackingData.clicks || { clickCount: 0, clickDetails: [] },
    keyboardActivities: trackingData.keyboardActivities || [],
    inputChanges: trackingData.inputChanges || [],
    focusChanges: trackingData.focusChanges || [],
    assertions: trackingData.assertions || [],
    userInfo: trackingData.userInfo || { windowSize: [window.innerWidth, window.innerHeight] },
    time: trackingData.time || { startTime: 0, stopTime: 0 }
  };

  const { clicks, inputChanges, focusChanges, assertions, userInfo } = safeTrackingData;

  const hasInteractions =
    (clicks.clickDetails && clicks.clickDetails.length > 0) ||
    (inputChanges && inputChanges.length > 0) ||
    (assertions && assertions.length > 0);

  if (!hasInteractions) {
    return generateEmptyTest(url);
  }

  const testCode = `import { test, expect } from '@playwright/test';

test('User interaction replay', async ({ page }) => {
  // Navigate to the page
  await page.goto('${url}');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Set viewport size to match recorded session
  await page.setViewportSize({
    width: ${userInfo?.windowSize?.[0] || window.innerWidth},
    height: ${userInfo?.windowSize?.[1] || window.innerHeight}
  });

${generateUserInteractions(clicks, inputChanges, focusChanges, assertions)}

  await page.waitForTimeout(2500);
});`;

  return testCode;
}

/**
 * @param {Object} clicks
 * @param {Array} inputChanges
 * @param {Array} focusChanges
 * @param {Array} assertions
 * @returns {string}
 */
function generateUserInteractions(
  clicks: any,
  inputChanges: any[],
  focusChanges: any[],
  assertions: any[] = []
): string {
  console.log('Generating interactions from:', { clicks, inputChanges, focusChanges, assertions });

  const allEvents: any[] = [];

  if (clicks && clicks.clickDetails && clicks.clickDetails.length > 0) {
    console.log('Processing click details:', clicks.clickDetails);
    clicks.clickDetails.forEach((clickDetail: any) => {
      const [x, y, selector, timestamp] = clickDetail;
      allEvents.push({
        type: 'click',
        x,
        y,
        selector,
        timestamp
      });
    });
  }

  const inputEvents: any[] = [];
  if (inputChanges && inputChanges.length > 0) {
    console.log('Processing input changes:', inputChanges);

    const latestInputsBySelector = new Map();

    const arrayInputs = inputChanges.filter((change) => Array.isArray(change));
    arrayInputs.forEach((change) => {
      if (Array.isArray(change) && change.length >= 3) {
        const selector = change[0];
        const value = change[1];
        const timestamp = change[2];

        latestInputsBySelector.set(selector, {
          type: 'input',
          selector,
          value,
          timestamp
        });
      }
    });

    const objectInputs = inputChanges.filter(
      (change) => !Array.isArray(change) && typeof change === 'object'
    );
    objectInputs.forEach((change) => {
      if (change.elementSelector && change.value !== undefined) {
        latestInputsBySelector.set(change.elementSelector, {
          type: 'input',
          selector: change.elementSelector,
          value: change.value,
          timestamp: change.timestamp || 0
        });
      }
    });

    inputEvents.push(...Array.from(latestInputsBySelector.values()));
    allEvents.push(...inputEvents);
  }

  if (assertions && assertions.length > 0) {
    console.log('Processing assertions:', assertions);
    assertions.forEach((assertion) => {
      allEvents.push({
        type: 'assertion',
        assertionType: assertion.type,
        selector: assertion.selector,
        value: assertion.value,
        timestamp: assertion.timestamp
      });
    });
  }

  allEvents.sort((a, b) => a.timestamp - b.timestamp);
  console.log('All events sorted by timestamp:', allEvents);

  let actionsCode = '';
  let previousTimestamp: number | null = null;
  const generatedSelectors = new Set();

  allEvents.forEach((event, index) => {
    if (previousTimestamp !== null) {
      const delay = event.timestamp - previousTimestamp;
      if (delay > 100 && event.type !== 'assertion') {
        actionsCode += `
  // Wait ${delay}ms (matching user timing)
  await page.waitForTimeout(${delay});
`;
      }
    }

    if (event.type === 'click') {
      const playwrightSelector = convertToPlaywrightSelector(event.selector);
      const comment = `Click ${index + 1}: ${playwrightSelector}`;

      actionsCode += `
  // ${comment}
  const element${index + 1} = page.locator('${playwrightSelector}');
  await element${index + 1}.waitFor({ state: 'visible' });
  await element${index + 1}.click();
`;
    } else if (event.type === 'input') {
      const playwrightSelector = convertToPlaywrightSelector(event.selector);
      if (!generatedSelectors.has(playwrightSelector)) {
        const comment = `Input ${index + 1}: Type "${event.value}" into ${playwrightSelector}`;

        if (playwrightSelector.startsWith('text=')) {
          actionsCode += `
  // ${comment}
  const inputElement${index + 1} = page.locator('${playwrightSelector}');
  await inputElement${index + 1}.waitFor({ state: 'visible' });
  await inputElement${index + 1}.click();
  await page.keyboard.insertText('${event.value.replace(/'/g, "\\'")}');
`;
        } else if (
          playwrightSelector.includes('placeholder=') ||
          playwrightSelector.includes('[placeholder="')
        ) {
          actionsCode += `
  // ${comment}
  const inputElement${index + 1} = page.locator('${playwrightSelector}');
  await inputElement${index + 1}.waitFor({ state: 'visible' });
  await inputElement${index + 1}.click();
  await inputElement${index + 1}.fill('${event.value.replace(/'/g, "\\'")}');
`;
        } else {
          actionsCode += `
  // ${comment}
  await page.locator('${playwrightSelector}').fill('${event.value.replace(/'/g, "\\'")}');
`;
        }

        generatedSelectors.add(playwrightSelector);
      }
    } else if (event.type === 'assertion') {
      const playwrightSelector = convertToPlaywrightSelector(event.selector);
      let assertionCode = '';

      switch (event.assertionType) {
        case 'hasText':
          assertionCode = `await expect(page.locator('${playwrightSelector}')).toHaveText('${event.value.replace(
            /'/g,
            "\\'"
          )}');`;
          break;
        case 'containsText':
          assertionCode = `await expect(page.locator('${playwrightSelector}')).toContainText('${event.value.replace(
            /'/g,
            "\\'"
          )}');`;
          break;
        case 'isVisible':
          assertionCode = `await expect(page.locator('${playwrightSelector}')).toBeVisible();`;
          break;
        case 'hasValue':
          assertionCode = `await expect(page.locator('${playwrightSelector}')).toHaveValue('${event.value.replace(
            /'/g,
            "\\'"
          )}');`;
          break;
        default:
          assertionCode = `await expect(page.locator('${playwrightSelector}')).toBeVisible();`;
      }

      actionsCode += `
  // Assert that ${playwrightSelector} ${event.assertionType}: "${event.value || ''}"
  ${assertionCode}
`;
    }

    previousTimestamp = event.timestamp;
  });

  return actionsCode;
}

/**
 * @param {string} cssSelector
 * @returns {string}
 */
export function convertToPlaywrightSelector(cssSelector: string): string {
  if (!cssSelector) return 'body';

  if (cssSelector.startsWith('text=')) {
    return cssSelector;
  }

  if (cssSelector.includes('[placeholder="')) {
    const placeholderMatch = cssSelector.match(/\[placeholder="([^"]+)"\]/);
    if (placeholderMatch) {
      return `[placeholder="${placeholderMatch[1]}"]`;
    }
  }

  if (cssSelector.includes('[data-testid="')) {
    const testIdMatch = cssSelector.match(/\[data-testid="([^"]+)"\]/);
    if (testIdMatch) {
      return `[data-testid="${testIdMatch[1]}"]`;
    }
  }

  if (cssSelector.toLowerCase().includes('textarea')) {
    if (cssSelector.includes('.')) {
      return cssSelector;
    }
    return 'textarea';
  }

  if (cssSelector.toLowerCase().includes('input')) {
    if (cssSelector.includes('.') || cssSelector.includes('[')) {
      return cssSelector;
    }
    return 'input';
  }

  if (cssSelector.includes(' > ')) {
    const parts = cssSelector.split(' > ');

    for (const part of parts) {
      if (part.includes('#')) {
        const idMatch = part.match(/#([^.#[\s>]+)/);
        if (idMatch) {
          return `#${idMatch[1]}`;
        }
      }
    }

    for (const part of parts) {
      if (part.includes('[placeholder="')) {
        const placeholderMatch = part.match(/\[placeholder="([^"]+)"\]/);
        if (placeholderMatch) {
          return `[placeholder="${placeholderMatch[1]}"]`;
        }
      }
    }

    for (const part of parts) {
      if (part.includes('[data-')) {
        const dataAttrMatch = part.match(/\[data-[^\]]+\]/);
        if (dataAttrMatch) {
          return dataAttrMatch[0];
        }
      }
    }

    for (const part of parts) {
      if (
        part.includes('button') ||
        part.includes('tab') ||
        part.includes('TabButton') ||
        part.includes('input') ||
        part.includes('textarea')
      ) {
        if (part.includes('.')) {
          return part;
        }
      }
    }

    return parts[parts.length - 1];
  }

  let selector = cssSelector;

  selector = selector.replace(/^html>body>/, '');

  selector = selector.replace(/body\.staktrak-selection-active/, 'body');
  selector = selector.replace(/\.staktrak-selection-active/, '');

  if (
    /^(p|h[1-6]|div|span|button|a|li|ul|ol|table|tr|td|th|input|textarea|select|form|label)$/i.test(
      selector
    )
  ) {
    return selector;
  }

  if (selector.startsWith('#') && !selector.includes(' ') && !selector.includes('>')) {
    return selector;
  }

  selector = selector.replace(/\.([^.#[]+)/g, '.$1');

  selector = selector.replace(/#([^.#[]+)/g, '#$1');

  const idMatch = selector.match(/#[^.#[\s>]+/);
  if (idMatch) {
    return idMatch[0];
  }

  return selector;
}

/**
 * @param {string} url
 * @returns {string}
 */
function generateEmptyTest(url: string): string {
  return `import { test } from '@playwright/test';

test('User interaction replay (no interactions recorded)', async ({ page }) => {
  // Navigate to the page
  await page.goto('${url}');

  // Wait for page to load
  await page.waitForLoadState('networkidle');

  // Set viewport size
  await page.setViewportSize({
    width: ${window.innerWidth},
    height: ${window.innerHeight}
  });

  console.log('No user interactions were recorded. Add interactions to create a test.');
});`;
}
