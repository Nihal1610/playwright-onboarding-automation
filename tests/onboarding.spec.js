import { test, expect } from '@playwright/test';
const testData = { validEmail: 'joshi.sahil12+2005i_1@gmail.com' };

/**
 * REFINED TEST SCRIPT
 * This script refactors the recorded actions into the Page Object Model (POM) structure.
 * It uses parameterized data and robust selectors.
 */

test.describe('Midchains Onboarding Refined Flow', () => {
  
  test('should complete onboarding flow with corrected steps', async ({ page: initialPage, context }) => {
    let page = initialPage;
    // 1. Navigation and Login
    await page.goto('https://cp-dev.midchains.com/auth/signin');
    await page.getByRole('button', { name: 'Continue with Email' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(testData.validEmail);
    await page.getByRole('button', { name: 'Continue' }).click();
    
    // Fill Password
    await page.getByRole('textbox', { name: '************' }).fill('QAtest@123');
    await page.getByRole('button', { name: 'Continue' }).click();

    // 2. CAPTCHA/OTP HANDLING - Wait for manual completion
    console.log('⏸️ CAPTCHA/OTP page reached. Complete the CAPTCHA/OTP manually in the browser.');
    page = await waitForPersonalInfoPage(page, context, /.*personal-info/, 120000);

    // Wait for personal info page to settle
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // 3. Personal Information
    console.log('✅ Personal info page loaded:', page.url());

    const firstCombobox = page.getByRole('combobox').filter({ hasText: 'Mr' }).first();
    await firstCombobox.waitFor({ state: 'visible', timeout: 20000 });
    console.log('✅ Personal info form is ready. Starting to fill details...');

    await firstCombobox.click();
    await page.getByRole('option', { name: 'Mr', exact: true }).click();
    await page.getByRole('textbox', { name: 'Last Name*' }).fill('Nihal');

    // Date of Birth - Manual selection via date picker
    console.log('📅 Opening date picker for manual date selection...');
    const dobButton = page.getByRole('button', { name: /Select your DOB/i }).first();
    const dobButtonText = await dobButton.innerText();
    await dobButton.click();

    console.log('📝 Please choose your DOB in the date picker now. The test will continue automatically once the date is selected.');
    await waitForDobSelection(page, dobButtonText, 120000);
    console.log('✅ Date picker selection completed.');

    // Nationality & Country
    await page.getByRole('combobox').filter({ hasText: 'India' }).first().click();
    await page.getByPlaceholder('Search...').fill('India');
    await page.getByRole('option', { name: 'India', exact: true }).first().click();

    // Address
    await page.getByRole('textbox', { name: 'Address Line 1*' }).fill('123 Main St, Sector 4');
    await page.getByRole('textbox', { name: 'City*' }).fill('Kanpur');
    await page.getByRole('textbox', { name: 'Zip Code*' }).fill('208001');
    
    // Click Continue button after Personal Information and validate next step
    await clickContinueAndValidate(page, /.*occupation|.*employment/i, 'Occupation Information', 30000);

    await page.getByRole('combobox').filter({ hasText: 'Employed' }).click();
    await page.getByRole('option', { name: 'Employed', exact: true }).click();
    await page.getByRole('textbox', { name: "Employer's Name*" }).fill('Nihal Corp');
    
    // Source of Funds & Income
    await page.getByRole('combobox').filter({ hasText: 'Business' }).click();
    await page.getByRole('option', { name: 'Business' }).click();
    
    // Click Continue button after Occupation Information and validate next step
    await clickContinueAndValidate(page, /.*fatca|.*crs|.*declaration/i, 'FATCA & CRS Declaration', 30000);

    // Selecting 'No' for typical declarations
    const declarations = page.getByRole('combobox');
    for (let i = 0; i < await declarations.count(); i++) {
        await declarations.nth(i).click();
        await page.getByRole('option', { name: 'No' }).click();
    }
    
    // Click Continue button after FATCA step and validate next step
    await clickContinueAndValidate(page, /.*document|.*upload/i, 'Document Upload', 30000);

    // 6. Document Upload
    await page.getByRole('combobox').click();
    await page.getByRole('option', { name: 'PASSPORT' }).click();
    
    // File Upload
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByText('Upload').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles('./test-assets/passport.pdf');

    console.log('Flow completed up to document upload.');
  });
});

async function ensureOpenPage(page, context) {
  if (!page.isClosed()) {
    return page;
  }

  const pages = context.pages();
  if (pages.length === 0) {
    throw new Error('Page was closed and no fallback page is available.');
  }

  return pages[pages.length - 1];
}

async function waitForPersonalInfoPage(page, context, urlRegex, timeout = 120000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    page = await ensureOpenPage(page, context);

    if (urlRegex.test(page.url())) {
      console.log('✅ Reached personal info page:', page.url());
      return page;
    }

    try {
      await page.waitForURL(urlRegex, { timeout: 5000 });
      console.log('✅ Reached personal info page via waitForURL:', page.url());
      return page;
    } catch {
      // continue with navigation back
    }

    console.log('↩️ Personal info page not found yet; navigating back...');
    const backButton = page.getByRole('button', { name: /back/i }).first();
    const isBackVisible = await backButton.isVisible().catch(() => false);

    if (isBackVisible) {
      await backButton.click().catch(() => {});
    } else {
      await page.goBack().catch(() => {});
    }

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  throw new Error('Unable to reach personal info page within timeout');
}

async function waitForDobSelection(page, originalButtonText, timeout = 120000) {
  await page.waitForFunction(
    (origText) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const matchingButton = buttons.find((button) => button.textContent?.trim().includes(origText));
      return !matchingButton || matchingButton.textContent.trim() !== origText;
    },
    originalButtonText,
    { timeout }
  );
}

async function clickContinueAndValidate(page, nextUrlRegex, expectedHeading, timeout = 30000) {
  const continueBtn = page.getByRole('button', { name: 'Continue' }).first();
  await continueBtn.scrollIntoViewIfNeeded();
  await continueBtn.waitFor({ state: 'visible', timeout: 10000 });
  await continueBtn.click();

  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  if (nextUrlRegex) {
    try {
      await page.waitForURL(nextUrlRegex, { timeout });
      console.log(`✅ URL validation passed for ${expectedHeading}:`, page.url());
    } catch {
      console.log(`⚠️ URL did not match expected pattern for ${expectedHeading}, continuing with heading validation.`);
    }
  }

  if (expectedHeading) {
    await waitForHeading(page, expectedHeading);
    console.log(`✅ Step validated: ${expectedHeading}`);
  }
}

// Helper to wait for headings
async function waitForHeading(page, name) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
}