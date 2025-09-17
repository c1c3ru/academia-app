const { device, expect, element, by, waitFor } = require('detox');

beforeAll(async () => {
  await device.launchApp();
});

beforeEach(async () => {
  await device.reloadReactNative();
});

afterAll(async () => {
  await device.terminateApp();
});

// Global test helpers
global.loginAsAdmin = async () => {
  await element(by.id('email-input')).typeText('admin@test.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();
  await waitFor(element(by.id('admin-dashboard'))).toBeVisible().withTimeout(10000);
};

global.loginAsStudent = async () => {
  await element(by.id('email-input')).typeText('student@test.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();
  await waitFor(element(by.id('student-dashboard'))).toBeVisible().withTimeout(10000);
};

global.loginAsInstructor = async () => {
  await element(by.id('email-input')).typeText('instructor@test.com');
  await element(by.id('password-input')).typeText('password123');
  await element(by.id('login-button')).tap();
  await waitFor(element(by.id('instructor-dashboard'))).toBeVisible().withTimeout(10000);
};

global.logout = async () => {
  await element(by.id('profile-menu')).tap();
  await element(by.id('logout-button')).tap();
  await waitFor(element(by.id('login-screen'))).toBeVisible().withTimeout(5000);
};

global.navigateToScreen = async (screenId) => {
  await waitFor(element(by.id(screenId))).toBeVisible().withTimeout(5000);
};

global.fillForm = async (formData) => {
  for (const [fieldId, value] of Object.entries(formData)) {
    await element(by.id(fieldId)).typeText(value);
  }
};

global.expectToastMessage = async (message) => {
  await waitFor(element(by.text(message))).toBeVisible().withTimeout(3000);
};
