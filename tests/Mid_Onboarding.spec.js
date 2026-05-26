import { test, expect } from '@playwright/test';

const testData = {
  validEmail: 'joshi.sahil12+2005i_1@gmail.com',
  password: 'QAtest@123'
};

test('Midchains Full Onboarding E2E Flow (Single File)', async ({ page, context }) => {
  test.setTimeout(180000);

  // ===============================
  // 1. LOGIN FLOW
  // ===============================
  await page.goto('https://cp-dev.midchains.com/auth/signin');

  await page.getByRole('button', { name: 'Continue with Email' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill(testData.validEmail);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: '************' }).fill(testData.password);
  await page.getByRole('button', { name: 'Continue' }).click();

  console.log('⏸️ Complete CAPTCHA / OTP manually...');

  // Wait until the auth redirect settles on any onboarding page
  await page.waitForURL(/onboarding|personal-info|dashboard|document|pep|declaration/, { timeout: 180000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  // ===============================
  // 2. WAIT FOR FINAL STEP, THEN NAVIGATE BACK TO PERSONAL INFO
  // ===============================
  page = await waitForFinalStepThenNavigateToPersonalInfo(page, context);


  // ===============================
  // 3. STEP 1 - PERSONAL INFO
  // ===============================
  await expectStep(page, 'personal-info', 'Personal Information');

  await selectCombobox(page, 'Mr', 'Mr');
  await page.getByRole('textbox', { name: 'Last Name*' }).fill('Nihal');

  await selectDOB(page, '16');

  await selectCombobox(page, 'India', 'India');
  await page.getByRole('textbox', { name: 'Address Line 1*' }).fill('123 Main St');
  await page.getByRole('textbox', { name: 'City*' }).fill('Kanpur');
  await page.getByRole('textbox', { name: 'Zip Code*' }).fill('208001');

  await clickContinue(page);


  // ===============================
  // 4. STEP 2 - OCCUPATION
  // ===============================
  await expectStep(page, 'occupation', 'Occupation Information');

  await selectCombobox(page, 'Employed', 'Employed');
  await page.getByRole('textbox', { name: "Employer's Name*" }).fill('Nihal Corp');
  await selectCombobox(page, 'Business', 'Business');

  await clickContinue(page);


  // ===============================
  // 5. STEP 3 - FATCA
  // ===============================
  await expectStep(page, 'fatca', 'FATCA & CRS Declaration');

  const dropdowns = page.getByRole('combobox');
  const count = await dropdowns.count();

  for (let i = 0; i < count; i++) {
    await dropdowns.nth(i).click();
    await page.getByRole('option', { name: 'No' }).click();
  }

  await clickContinue(page);


  // ===============================
  // 6. STEP 4 - DOCUMENT UPLOAD
  // ===============================
  await expectStep(page, 'document', 'Document Upload');

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'PASSPORT' }).click();

  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Upload').click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles('./test-assets/passport.pdf');

  console.log('🎉 Onboarding flow completed till document upload');
});


// ===============================
// 🔥 HELPERS (ALL-IN-ONE)
// ===============================

async function ensureOpenPage(page, context) {
  if (!page.isClosed()) {
    return page;
  }

  const pages = context.pages();
  if (pages.length === 0) {
    throw new Error('Page was closed and no stable page is available.');
  }

  return pages[pages.length - 1];
}

async function waitForPersonalInfo(page, context) {
  console.log('🔁 Waiting for stable /personal-info page after auth redirect...');

  const start = Date.now();
  const timeout = 120000;

  while (Date.now() - start < timeout) {
    page = await ensureOpenPage(page, context);

    const url = page.url();
    console.log(`Current URL: ${url}`);

    if (url.includes('/personal-info')) {
      console.log('⚠️ Personal info found, waiting briefly to ensure it does not redirect immediately.');
      await page.waitForTimeout(2000);
      page = await ensureOpenPage(page, context);
      if (page.url().includes('/personal-info')) {
        console.log('✅ Stable Personal Info page confirmed:', page.url());
        return page;
      }
      console.log('↩️ Personal info page was transient; continuing back-navigation.');
    }

    console.log('↩️ Navigating back to find Personal Info...');
    const backButton = page.getByRole('button', { name: /back/i }).first();
    const isBackVisible = await backButton.isVisible().catch(() => false);

    if (isBackVisible) {
      await backButton.click().catch(() => {});
    } else {
      await page.goBack().catch(() => {});
    }

    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000).catch(() => {});
  }

  throw new Error('❌ Failed to reach stable Personal Info page after auth redirect');
}


async function expectStep(page, urlPart, heading) {
  await expect(page).toHaveURL(new RegExp(urlPart));
  await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}


async function clickContinue(page) {
  const btn = page.getByRole('button', { name: 'Continue' });
  await btn.scrollIntoViewIfNeeded();
  await btn.waitFor({ state: 'enabled', timeout: 10000 });
  await btn.click();
}


async function selectCombobox(page, visibleText, option) {
  const combo = page.getByRole('combobox').filter({ hasText: visibleText }).first();
  await combo.click();
  await page.getByRole('option', { name: option, exact: true }).click();
}


async function selectDOB(page, day = '16') {
  await page.getByRole('button', { name: /dob|date of birth/i }).click();

  console.log(`📅 Selecting DOB: ${day}`);

  const option = page.getByRole('button', { name: new RegExp(`^${day}$`) });

  if (await option.count() > 0) {
    await option.first().click();
    return;
  }

  const fallback = page.getByText(day, { exact: true });
  if (await fallback.count() > 0) {
    await fallback.first().click();
    return;
  }

  console.log('⚠️ DOB selection fallback used');
}